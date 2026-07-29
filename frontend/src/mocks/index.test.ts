import { describe, expect, it } from "vitest";

import { createMockHealthApi } from ".";

describe("health mock contract", () => {
  it("returns the documented success response", async () => {
    const healthApi = createMockHealthApi({ scenario: "success", delayMs: 0 });

    await expect(healthApi.getHealth()).resolves.toEqual({
      success: true,
      message: "API is running"
    });
  });

  it("returns a contract-valid empty response", async () => {
    const healthApi = createMockHealthApi({ scenario: "empty", delayMs: 0 });

    await expect(healthApi.getHealth()).resolves.toEqual({
      success: true,
      message: ""
    });
  });

  it("throws the documented ApiError shape", async () => {
    const healthApi = createMockHealthApi({ scenario: "error", delayMs: 0 });

    await expect(healthApi.getHealth()).rejects.toMatchObject({
      name: "ApiRequestError",
      response: {
        success: false,
        message: "Dịch vụ FoodGo tạm thời chưa sẵn sàng.",
        errorCode: "INTERNAL_SERVER_ERROR"
      }
    });
  });
});
