import { createMockHealthApi, type MockHealthScenario } from "../mocks";
import type { HealthResponse } from "../types/api";
import { request } from "./http-client";

export interface HealthApi {
  getHealth: () => Promise<HealthResponse>;
}

export type ApiDataSource = "api" | "mock";

interface CreateHealthApiOptions {
  dataSource: ApiDataSource;
  apiLoader?: () => Promise<HealthResponse>;
  mockLoader?: () => Promise<HealthResponse>;
}

const getHealthFromApi = () =>
  request<HealthResponse>({
    method: "GET",
    url: "/health"
  });

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
