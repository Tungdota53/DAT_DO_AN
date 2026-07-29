import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Header } from "./Header";

describe("Header", () => {
  it("opens the mobile navigation and closes it with Escape", () => {
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: "Mở menu" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("navigation", { name: "Điều hướng di động" })
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
  });

  it("closes the mobile navigation after choosing an item", () => {
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: "Mở menu" });
    fireEvent.click(menuButton);
    const mobileNavigation = screen.getByRole("navigation", {
      name: "Điều hướng di động"
    });
    fireEvent.click(
      within(mobileNavigation).getByRole("link", {
        name: "Cách hoạt động"
      })
    );

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
