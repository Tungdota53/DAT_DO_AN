import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the MVP introduction and documented service state", async () => {
    const { container } = render(
      <HomePage
        loadHealth={() =>
          Promise.resolve({
            success: true,
            message: "API is running"
          })
        }
      />
    );

    expect(
      screen.getByRole("heading", { name: /Món ngon gần bạn, giao tận nơi/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Khám phá FoodGo" })).toHaveAttribute(
      "href",
      "#discover"
    );
    expect(
      screen.getByRole("heading", {
        name: "Ít thao tác hơn, nhiều thời gian thưởng thức hơn."
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Từ lựa chọn đầu tiên đến lúc xác nhận đơn."
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Không cần đăng nhập").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Một nhà hàng mỗi giỏ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Thanh toán COD").length).toBeGreaterThan(0);
    expect(await screen.findByText("Dịch vụ sẵn sàng")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
