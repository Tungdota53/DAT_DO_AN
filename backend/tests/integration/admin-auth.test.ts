import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { env } from "../../src/config/env.js";

describe("admin authentication boundary", () => {
  it("rejects admin requests without the configured key", async () => {
    const response = await request(createApp()).get("/api/admin/dashboard");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      errorCode: "UNAUTHORIZED",
    });
  });

  it("accepts a valid admin session key", async () => {
    const response = await request(createApp())
      .post("/api/admin/session")
      .set("x-admin-key", env.ADMIN_API_KEY);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { authenticated: true },
    });
  });
});
