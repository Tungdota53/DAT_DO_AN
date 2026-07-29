import sql from "mssql/msnodesqlv8.js";

import { databasePool } from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderTimelineEvent,
} from "../types/domain.js";
import { toOrderStatus } from "../utils/status-mapper.js";

interface LockedFoodRow {
  MaMon: number;
  MaNhaHang: number;
  DonGia: number;
  TrangThai: string;
}

interface OrderRow {
  MaDon: number;
  NgayDat: Date;
  TrangThai: string;
  MaNhaHang: number;
  TenNhaHang: string;
  SoDienThoaiNhaHang: string;
  TenNguoiNhan: string;
  SoDienThoaiGiaoHang: string;
  DiaChiGiaoHang: string;
  GhiChu: string | null;
  TienMon: number;
  PhiGiaoHang: number;
  TongTien: number;
}

interface OrderItemRow {
  MaMon: number;
  TenMon: string;
  SoLuong: number;
  DonGiaTaiThoiDiemDat: number;
  ThanhTien: number;
}

interface TimelineRow {
  TrangThai: string;
  ThoiDiem: Date;
}

const mapOrderItem = (row: OrderItemRow): OrderItem => ({
  foodId: row.MaMon,
  foodName: row.TenMon,
  quantity: row.SoLuong,
  orderedPrice: Number(row.DonGiaTaiThoiDiemDat),
  lineTotal: Number(row.ThanhTien),
});

const mapTimeline = (row: TimelineRow): OrderTimelineEvent => ({
  status: toOrderStatus(row.TrangThai),
  occurredAt: row.ThoiDiem.toISOString(),
});

export class OrderRepository {
  public async create(input: CreateOrderInput): Promise<Order> {
    const transaction = new sql.Transaction(databasePool);
    let transactionFinished = false;
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      const restaurantResult = await new sql.Request(transaction).input(
        "restaurantId",
        sql.Int,
        input.restaurantId,
      ).query<{ PhiGiaoHang: number }>(`
          SELECT PhiGiaoHang
          FROM dbo.NhaHang WITH (UPDLOCK, HOLDLOCK)
          WHERE MaNhaHang = @restaurantId;
        `);

      const restaurant = restaurantResult.recordset[0];
      if (!restaurant) {
        throw new AppError(
          404,
          "RESTAURANT_NOT_FOUND",
          "Không tìm thấy nhà hàng",
        );
      }

      const foodRequest = new sql.Request(transaction);
      const foodParameters = input.items.map((item, index) => {
        const parameter = `foodId${index}`;
        foodRequest.input(parameter, sql.Int, item.foodId);
        return `@${parameter}`;
      });
      const foodsResult = await foodRequest.query<LockedFoodRow>(`
        SELECT MaMon, MaNhaHang, DonGia, TrangThai
        FROM dbo.MonAn WITH (UPDLOCK, HOLDLOCK)
        WHERE MaMon IN (${foodParameters.join(", ")});
      `);

      if (foodsResult.recordset.length !== input.items.length) {
        throw new AppError(404, "FOOD_NOT_FOUND", "Có món ăn không tồn tại");
      }
      if (
        foodsResult.recordset.some(
          (food) => food.MaNhaHang !== input.restaurantId,
        )
      ) {
        throw new AppError(
          409,
          "DIFFERENT_RESTAURANT",
          "Tất cả món phải thuộc cùng nhà hàng",
        );
      }
      if (foodsResult.recordset.some((food) => food.TrangThai !== "Con ban")) {
        throw new AppError(409, "FOOD_UNAVAILABLE", "Có món ăn đã ngừng bán");
      }

      const existingCustomer = await new sql.Request(transaction)
        .input("phone", sql.VarChar(15), input.customer.phone)
        .input("fullName", sql.NVarChar(150), input.customer.fullName).query<{
        MaKhachHang: number;
      }>(`
          SELECT TOP (1) MaKhachHang
          FROM dbo.KhachHang WITH (UPDLOCK, HOLDLOCK)
          WHERE SoDienThoai = @phone AND TenKhachHang = @fullName
          ORDER BY MaKhachHang DESC;
        `);

      let customerId = existingCustomer.recordset[0]?.MaKhachHang;
      if (customerId) {
        await new sql.Request(transaction)
          .input("customerId", sql.Int, customerId)
          .input(
            "deliveryAddress",
            sql.NVarChar(300),
            input.customer.deliveryAddress,
          ).query(`
            UPDATE dbo.KhachHang
            SET DiaChiGiaoHang = @deliveryAddress
            WHERE MaKhachHang = @customerId;
          `);
      } else {
        const customerResult = await new sql.Request(transaction)
          .input("fullName", sql.NVarChar(150), input.customer.fullName)
          .input(
            "deliveryAddress",
            sql.NVarChar(300),
            input.customer.deliveryAddress,
          )
          .input("phone", sql.VarChar(15), input.customer.phone).query<{
          MaKhachHang: number;
        }>(`
            INSERT INTO dbo.KhachHang
              (TenKhachHang, DiaChiGiaoHang, SoDienThoai)
            OUTPUT inserted.MaKhachHang
            VALUES (@fullName, @deliveryAddress, @phone);
          `);
        customerId = customerResult.recordset[0]?.MaKhachHang;
      }

      if (!customerId) {
        throw new AppError(
          500,
          "DATABASE_ERROR",
          "Không thể lưu thông tin người nhận",
        );
      }

      const orderResult = await new sql.Request(transaction)
        .input("customerId", sql.Int, customerId)
        .input("restaurantId", sql.Int, input.restaurantId)
        .input("fullName", sql.NVarChar(150), input.customer.fullName)
        .input("phone", sql.VarChar(15), input.customer.phone)
        .input(
          "deliveryAddress",
          sql.NVarChar(300),
          input.customer.deliveryAddress,
        )
        .input("note", sql.NVarChar(500), input.note || null)
        .input("deliveryFee", sql.Decimal(18, 2), restaurant.PhiGiaoHang)
        .query<{ MaDon: number }>(`
          INSERT INTO dbo.DonHang
          (
            NgayDat, MaKhachHang, MaNhaHang, TrangThai, TongTien,
            TenNguoiNhan, SoDienThoaiGiaoHang, DiaChiGiaoHang, GhiChu,
            PhuongThucThanhToan, TienMon, PhiGiaoHang
          )
          VALUES
          (
            SYSDATETIME(), @customerId, @restaurantId, N'Cho xac nhan',
            @deliveryFee, @fullName, @phone, @deliveryAddress, @note,
            'COD', 0, @deliveryFee
          );
          SELECT CONVERT(INT, SCOPE_IDENTITY()) AS MaDon;
        `);
      const orderId = orderResult.recordset[0]?.MaDon;
      if (!orderId) {
        throw new AppError(500, "DATABASE_ERROR", "Không thể tạo đơn hàng");
      }

      const foodById = new Map(
        foodsResult.recordset.map((food) => [food.MaMon, food]),
      );
      for (const item of input.items) {
        const food = foodById.get(item.foodId);
        if (!food) {
          throw new AppError(404, "FOOD_NOT_FOUND", "Có món ăn không tồn tại");
        }
        await new sql.Request(transaction)
          .input("orderId", sql.Int, orderId)
          .input("foodId", sql.Int, item.foodId)
          .input("quantity", sql.Int, item.quantity)
          .input("orderedPrice", sql.Decimal(18, 2), food.DonGia).query(`
            INSERT INTO dbo.ChiTietDonHang
              (MaDon, MaMon, SoLuong, DonGiaTaiThoiDiemDat)
            VALUES (@orderId, @foodId, @quantity, @orderedPrice);
          `);
      }

      await transaction.commit();
      transactionFinished = true;
      const created = await this.findByIdAndPhone(
        orderId,
        input.customer.phone,
      );
      if (!created) {
        throw new AppError(500, "DATABASE_ERROR", "Không thể đọc đơn vừa tạo");
      }
      return created;
    } catch (error) {
      if (!transactionFinished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  public async findByIdAndPhone(
    orderId: number,
    phone: string,
  ): Promise<Order | null> {
    const orderResult = await databasePool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("phone", sql.VarChar(15), phone).query<OrderRow>(`
        SELECT
          dh.MaDon, dh.NgayDat, dh.TrangThai,
          nh.MaNhaHang, nh.TenNhaHang,
          nh.SoDienThoai AS SoDienThoaiNhaHang,
          COALESCE(dh.TenNguoiNhan, kh.TenKhachHang) AS TenNguoiNhan,
          COALESCE(dh.SoDienThoaiGiaoHang, kh.SoDienThoai) AS SoDienThoaiGiaoHang,
          COALESCE(dh.DiaChiGiaoHang, kh.DiaChiGiaoHang) AS DiaChiGiaoHang,
          dh.GhiChu, dh.TienMon, dh.PhiGiaoHang, dh.TongTien
        FROM dbo.DonHang AS dh
        INNER JOIN dbo.NhaHang AS nh ON nh.MaNhaHang = dh.MaNhaHang
        INNER JOIN dbo.KhachHang AS kh ON kh.MaKhachHang = dh.MaKhachHang
        WHERE dh.MaDon = @orderId
          AND COALESCE(dh.SoDienThoaiGiaoHang, kh.SoDienThoai) = @phone;
      `);
    const row = orderResult.recordset[0];
    if (!row) {
      return null;
    }

    const [itemsResult, timelineResult] = await Promise.all([
      databasePool.request().input("orderId", sql.Int, orderId)
        .query<OrderItemRow>(`
          SELECT
            ct.MaMon, ma.TenMon, ct.SoLuong,
            ct.DonGiaTaiThoiDiemDat, ct.ThanhTien
          FROM dbo.ChiTietDonHang AS ct
          INNER JOIN dbo.MonAn AS ma ON ma.MaMon = ct.MaMon
          WHERE ct.MaDon = @orderId
          ORDER BY ct.MaMon;
        `),
      databasePool.request().input("orderId", sql.Int, orderId)
        .query<TimelineRow>(`
          SELECT TrangThai, ThoiDiem
          FROM dbo.LichSuTrangThaiDonHang
          WHERE MaDon = @orderId
          ORDER BY ThoiDiem, MaLichSu;
        `),
    ]);

    return {
      id: row.MaDon,
      createdAt: row.NgayDat.toISOString(),
      status: toOrderStatus(row.TrangThai),
      restaurant: {
        id: row.MaNhaHang,
        name: row.TenNhaHang,
        phone: row.SoDienThoaiNhaHang,
      },
      recipient: {
        fullName: row.TenNguoiNhan,
        phone: row.SoDienThoaiGiaoHang,
        deliveryAddress: row.DiaChiGiaoHang,
      },
      note: row.GhiChu,
      paymentMethod: "COD",
      items: itemsResult.recordset.map(mapOrderItem),
      subtotal: Number(row.TienMon),
      deliveryFee: Number(row.PhiGiaoHang),
      total: Number(row.TongTien),
      timeline: timelineResult.recordset.map(mapTimeline),
    };
  }
}

export const orderRepository = new OrderRepository();
