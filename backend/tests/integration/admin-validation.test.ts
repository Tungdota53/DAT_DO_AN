import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { env } from "../../src/config/env.js";

describe("admin request validation", () => {
  it("normalizes and validates restaurant phone numbers before database access", async () => {
    const response = await request(createApp())
      .post("/api/admin/restaurants")
      .set("x-admin-key", env.ADMIN_API_KEY)
      .send({
        name: "Nhà hàng thử nghiệm",
        address: "12 Nguyễn Huệ, Quận 1",
        phone: "not-a-phone",
        description: null,
        deliveryFee: 15000,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      errorCode: "VALIDATION_ERROR",
    });
  });

  it("rejects an oversized orders page before querying the database", async () => {
    const response = await request(createApp())
      .get("/api/admin/orders?limit=51")
      .set("x-admin-key", env.ADMIN_API_KEY);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      errorCode: "VALIDATION_ERROR",
    });
  });

  it("validates customer ids on delete before querying the database", async () => {
    const response = await request(createApp())
      .delete("/api/admin/customers/not-a-number")
      .set("x-admin-key", env.ADMIN_API_KEY);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      errorCode: "VALIDATION_ERROR",
    });
  });
});
