import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiRequestError } from "../api/http-client";
import type { HealthResponse } from "../types/api";
import { HealthStatus } from "./HealthStatus";

function createDeferred<T>() {
  let resolvePromise: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return { promise, resolve: resolvePromise };
}

describe("HealthStatus", () => {
  it("shows loading before rendering a successful response", async () => {
    const deferred = createDeferred<HealthResponse>();

    render(<HealthStatus loadHealth={() => deferred.promise} />);

    expect(
      screen.getByRole("status", { name: "Đang kiểm tra dịch vụ" })
    ).toBeInTheDocument();

    deferred.resolve({ success: true, message: "API is running" });

    expect(await screen.findByText("Dịch vụ sẵn sàng")).toBeInTheDocument();
    expect(screen.getByText(/API is running/)).toBeInTheDocument();
  });

  it("renders an empty state when the response has no message", async () => {
    render(
      <HealthStatus
        loadHealth={() =>
          Promise.resolve({
            success: true,
            message: ""
          })
        }
      />
    );

    expect(await screen.findByText("Dịch vụ chưa gửi trạng thái")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kiểm tra lại" })).toBeInTheDocument();
  });

  it("keeps a safe error message and retries the request", async () => {
    const loadHealth = vi
      .fn<() => Promise<HealthResponse>>()
      .mockRejectedValueOnce(
        new ApiRequestError({
          success: false,
          message: "Dịch vụ đang bảo trì.",
          errorCode: "INTERNAL_SERVER_ERROR"
        })
      )
      .mockResolvedValueOnce({
        success: true,
        message: "API is running"
      });

    render(<HealthStatus loadHealth={loadHealth} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Dịch vụ đang bảo trì.");

    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    expect(await screen.findByText("Dịch vụ sẵn sàng")).toBeInTheDocument();
    expect(loadHealth).toHaveBeenCalledTimes(2);
  });
});
