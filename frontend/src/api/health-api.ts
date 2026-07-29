import { createMockHealthApi, type MockHealthScenario } from "../mocks";
import type { HealthResponse } from "../types/api";
import { ApiRequestError, request } from "./http-client";

export interface HealthApi {
  getHealth: () => Promise<HealthResponse>;
}

export type ApiDataSource = "api" | "mock";

interface CreateHealthApiOptions {
  dataSource: ApiDataSource;
  apiLoader?: () => Promise<HealthResponse>;
  mockLoader?: () => Promise<HealthResponse>;
}

export function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return candidate.success === true && typeof candidate.message === "string";
}

export function parseHealthResponse(value: unknown): HealthResponse {
  if (isHealthResponse(value)) {
    return value;
  }

  throw new ApiRequestError({
    success: false,
    message: "API trả về dữ liệu không hợp lệ. Vui lòng thử lại.",
    errorCode: "INTERNAL_SERVER_ERROR"
  });
}

const getHealthFromApi = async () => {
  const response = await request<unknown>({
    method: "GET",
    url: "/health"
  });

  return parseHealthResponse(response);
};

function getMockScenario(value: string | undefined): MockHealthScenario {
  if (value === "empty" || value === "error") {
    return value;
  }

  return "success";
}

const mockHealthApi = createMockHealthApi({
  scenario: getMockScenario(import.meta.env.VITE_MOCK_HEALTH_SCENARIO)
});

export function createHealthApi({
  dataSource,
  apiLoader = getHealthFromApi,
  mockLoader = mockHealthApi.getHealth
}: CreateHealthApiOptions): HealthApi {
  return {
    getHealth: dataSource === "mock" ? mockLoader : apiLoader
  };
}

export const healthApiMode: ApiDataSource =
  import.meta.env.VITE_USE_MOCK === "true" ? "mock" : "api";

export const healthApi = createHealthApi({ dataSource: healthApiMode });
