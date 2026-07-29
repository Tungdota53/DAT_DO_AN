import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useCartStore } from "../../stores/cart-store";
import { Header } from "./Header";

describe("Header", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("opens mobile navigation and closes it with Escape", () => {
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: "Mở menu" });
    fireEvent.click(menuButton);

    const navigation = screen.getByRole("navigation", {
      name: "Điều hướng di động",
    });
    expect(
      within(navigation).getByRole("link", { name: "Nhà hàng" }),
    ).toHaveAttribute("href", "/restaurants");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
  });
});
