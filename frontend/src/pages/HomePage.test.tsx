import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { foodgoApi } from "../api/foodgo-api";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders restaurants returned by the real API adapter", async () => {
    vi.spyOn(foodgoApi, "listRestaurants").mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: "Bếp Việt",
          address: "12 Nguyễn Trãi, Quận 1",
          phone: "0901000001",
          description: "Cơm nhà Việt Nam.",
          deliveryFee: 15000,
          availableFoodCount: 3,
          minPrice: 25000,
        },
      ],
      pagination: { page: 1, limit: 3, totalItems: 1, totalPages: 1 },
    });

    const { container } = render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /Món ngon gần bạn/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Bếp Việt" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chọn món ngay" })).toHaveAttribute(
      "href",
      "/restaurants",
    );
    expect(container.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
