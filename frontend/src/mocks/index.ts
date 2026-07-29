import { ApiRequestError } from "../api/http-client";
import type { ApiError, HealthResponse } from "../types/api";

export type MockHealthScenario = "success" | "empty" | "error";

interface CreateMockHealthApiOptions {
  scenario?: MockHealthScenario;
  delayMs?: number;
}

const mockHealthError: ApiError = {
  success: false,
  message: "Dịch vụ FoodGo tạm thời chưa sẵn sàng.",
  errorCode: "INTERNAL_SERVER_ERROR"
};

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

/**
 * Mock only models responses currently documented in `docs/openapi.yaml`.
 * Business entities will be added after their schemas exist in the contract.
 */
export function createMockHealthApi({
  scenario = "success",
  delayMs = 320
}: CreateMockHealthApiOptions = {}) {
  return {
    async getHealth(): Promise<HealthResponse> {
      await wait(delayMs);

      if (scenario === "error") {
        throw new ApiRequestError(mockHealthError, 503);
      }

      return {
        success: true,
        message: scenario === "empty" ? "" : "API is running"
      };
    }
  };
}
