import { describe, expect, it } from "vitest";

import { isOrderStatusTransitionAllowed } from "../../src/utils/order-transitions.js";

describe("admin order status transitions", () => {
  it("allows the operational order flow and cancellation", () => {
    expect(
      isOrderStatusTransitionAllowed("Chờ xác nhận", "Đã xác nhận"),
    ).toBe(true);
    expect(
      isOrderStatusTransitionAllowed("Đã xác nhận", "Đang xử lý"),
    ).toBe(true);
    expect(
      isOrderStatusTransitionAllowed("Đang xử lý", "Hoàn thành"),
    ).toBe(true);
    expect(isOrderStatusTransitionAllowed("Đang xử lý", "Đã hủy")).toBe(
      true,
    );
  });

  it("keeps terminal orders closed and prevents skipped states", () => {
    expect(isOrderStatusTransitionAllowed("Hoàn thành", "Đang xử lý")).toBe(
      false,
    );
    expect(isOrderStatusTransitionAllowed("Đã hủy", "Chờ xác nhận")).toBe(
      false,
    );
    expect(isOrderStatusTransitionAllowed("Chờ xác nhận", "Hoàn thành")).toBe(
      false,
    );
  });

  it("allows an idempotent update without creating a new state transition", () => {
    expect(isOrderStatusTransitionAllowed("Đã xác nhận", "Đã xác nhận")).toBe(
      true,
    );
  });
});
