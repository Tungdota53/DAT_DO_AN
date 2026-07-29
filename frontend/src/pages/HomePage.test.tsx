import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the MVP introduction and documented service state", async () => {
    render(
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
    expect(screen.getByText("Không cần đăng nhập")).toBeInTheDocument();
    expect(screen.getByText("Một nhà hàng mỗi giỏ")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán COD")).toBeInTheDocument();
    expect(await screen.findByText("Dịch vụ sẵn sàng")).toBeInTheDocument();
  });
});
