import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";

describe("order boundary validation", () => {
  it("rejects client supplied price fields before reaching the database", async () => {
    const response = await request(createApp())
      .post("/api/orders")
      .send({
        restaurantId: 1,
        customer: {
          fullName: "Khách kiểm thử",
          phone: "0909999999",
          deliveryAddress: "123 Nguyễn Trãi, Quận 1",
        },
        paymentMethod: "COD",
        items: [{ foodId: 1, quantity: 1, price: 1 }],
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      errorCode: "VALIDATION_ERROR",
    });
  });

  it("rejects invalid restaurant identifiers", async () => {
    const response = await request(createApp()).get(
      "/api/restaurants/not-an-id",
    );
    const body = response.body as unknown as { errorCode: string };
    expect(response.status).toBe(400);
    expect(body.errorCode).toBe("VALIDATION_ERROR");
  });
});
