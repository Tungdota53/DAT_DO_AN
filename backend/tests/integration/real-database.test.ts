import sql from "mssql/msnodesqlv8.js";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { connectDatabase, databasePool } from "../../src/config/database.js";

const shouldRun = process.env.RUN_DATABASE_TESTS === "true";
const suite = shouldRun ? describe : describe.skip;
const testPhone = "0906666666";
const testName = "FoodGo Database Test";
let createdOrderId: number | null = null;

interface RestaurantListBody {
  data: unknown[];
}

interface CreatedOrderBody {
  data: {
    id: number;
    status: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
}

interface LookupOrderBody {
  data: {
    timeline: unknown[];
  };
}

suite("real SQL Server ordering flow", () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    if (createdOrderId !== null) {
      const transaction = new sql.Transaction(databasePool);
      await transaction.begin();
      try {
        const cleanup = new sql.Request(transaction);
        cleanup.input("orderId", sql.Int, createdOrderId);
        cleanup.input("phone", sql.VarChar(15), testPhone);
        cleanup.input("name", sql.NVarChar(150), testName);
        await cleanup.query(`
          DELETE FROM dbo.LichSuTrangThaiDonHang WHERE MaDon = @orderId;
          DELETE FROM dbo.ChiTietDonHang WHERE MaDon = @orderId;
          DELETE FROM dbo.DonHang WHERE MaDon = @orderId;
          DELETE kh
          FROM dbo.KhachHang AS kh
          WHERE kh.SoDienThoai = @phone
            AND kh.TenKhachHang = @name
            AND NOT EXISTS
            (
              SELECT 1 FROM dbo.DonHang AS dh
              WHERE dh.MaKhachHang = kh.MaKhachHang
            );
        `);
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
    await databasePool.close();
  });

  it("reads catalog data, creates an order and looks it up", async () => {
    const app = createApp();
    const restaurants = await request(app).get("/api/restaurants?limit=10");
    const restaurantsBody = restaurants.body as unknown as RestaurantListBody;
    expect(restaurants.status).toBe(200);
    expect(restaurantsBody.data.length).toBeGreaterThan(0);

    const created = await request(app)
      .post("/api/orders")
      .send({
        restaurantId: 1,
        customer: {
          fullName: testName,
          phone: testPhone,
          deliveryAddress: "789 Đường Kiểm Thử, Quận 1",
        },
        paymentMethod: "COD",
        items: [{ foodId: 1, quantity: 1 }],
      });
    const createdBody = created.body as unknown as CreatedOrderBody;

    expect(created.status).toBe(201);
    expect(createdBody.data).toMatchObject({
      status: "Chờ xác nhận",
      subtotal: 45000,
      deliveryFee: 15000,
      total: 60000,
    });
    createdOrderId = createdBody.data.id;

    const lookup = await request(app).get(
      `/api/orders/${createdOrderId}?phone=${testPhone}`,
    );
    const lookupBody = lookup.body as unknown as LookupOrderBody;
    expect(lookup.status).toBe(200);
    expect(lookupBody.data.timeline).toHaveLength(1);
  });
});
