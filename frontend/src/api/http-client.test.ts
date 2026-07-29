import type { AxiosResponse } from "axios";
import { describe, expect, it, vi } from "vitest";

import type { HealthResponse } from "../types/api";
import { httpClient, request } from "./http-client";

describe("http client", () => {
  it("returns the response data and forwards the request config", async () => {
    const response: HealthResponse = {
      success: true,
      message: "API is running"
    };
    const requestSpy = vi
      .spyOn(httpClient, "request")
      .mockResolvedValueOnce({ data: response } as AxiosResponse<HealthResponse>);

    await expect(
      request<HealthResponse>({
        method: "GET",
        url: "/health"
      })
    ).resolves.toEqual(response);

    expect(requestSpy).toHaveBeenCalledWith({
      method: "GET",
      url: "/health"
    });
    requestSpy.mockRestore();
  });

  it("normalizes unknown transport failures to a safe ApiError", async () => {
    const requestSpy = vi
      .spyOn(httpClient, "request")
      .mockRejectedValueOnce(new Error("socket details should not leak"));

    await expect(request({ method: "GET", url: "/health" })).rejects.toMatchObject({
      response: {
        success: false,
        message: "Không thể kết nối đến FoodGo. Vui lòng thử lại.",
        errorCode: "INTERNAL_SERVER_ERROR"
      }
    });
    requestSpy.mockRestore();
  });
});
