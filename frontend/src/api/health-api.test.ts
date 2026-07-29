import { describe, expect, it, vi } from "vitest";

import type { HealthResponse } from "../types/api";
import { createHealthApi } from "./health-api";

const apiResponse: HealthResponse = {
  success: true,
  message: "Real API"
};

const mockResponse: HealthResponse = {
  success: true,
  message: "Mock API"
};

describe("createHealthApi", () => {
  it("uses the mock loader when the data source is mock", async () => {
    const apiLoader = vi.fn().mockResolvedValue(apiResponse);
    const mockLoader = vi.fn().mockResolvedValue(mockResponse);
    const healthApi = createHealthApi({
      dataSource: "mock",
      apiLoader,
      mockLoader
    });

    await expect(healthApi.getHealth()).resolves.toEqual(mockResponse);
    expect(mockLoader).toHaveBeenCalledOnce();
    expect(apiLoader).not.toHaveBeenCalled();
  });

  it("uses the HTTP loader when the data source is api", async () => {
    const apiLoader = vi.fn().mockResolvedValue(apiResponse);
    const mockLoader = vi.fn().mockResolvedValue(mockResponse);
    const healthApi = createHealthApi({
      dataSource: "api",
      apiLoader,
      mockLoader
    });

    await expect(healthApi.getHealth()).resolves.toEqual(apiResponse);
    expect(apiLoader).toHaveBeenCalledOnce();
    expect(mockLoader).not.toHaveBeenCalled();
  });
});
