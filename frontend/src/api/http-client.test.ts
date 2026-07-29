import type { AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { HealthResponse } from "../types/api";
import { httpClient, request } from "./http-client";

describe("http client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns envelope data from the configured client", async () => {
    const response: HealthResponse = {
      success: true,
      message: "API is running",
    };
    vi.spyOn(httpClient, "request").mockResolvedValueOnce({
      data: response,
    } as AxiosResponse<HealthResponse>);

    await expect(
      request<HealthResponse>({ method: "GET", url: "/health" }),
    ).resolves.toEqual(response);
  });

  it("does not leak transport details to the user", async () => {
    vi.spyOn(httpClient, "request").mockRejectedValueOnce(
      new Error("socket details should not leak"),
    );

    await expect(
      request({ method: "GET", url: "/health" }),
    ).rejects.toMatchObject({
      response: {
        success: false,
        message: "Không thể kết nối đến FoodGo. Vui lòng thử lại.",
        errorCode: "INTERNAL_SERVER_ERROR",
      },
    });
  });
});
