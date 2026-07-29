import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("provides landmarks and a keyboard skip link", () => {
    render(
      <AppShell>
        <h1>Nội dung kiểm thử</h1>
      </AppShell>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { name: "Nội dung kiểm thử" }),
    );
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Bỏ qua đến nội dung chính" }),
    ).toHaveAttribute("href", "#main-content");
  });
});
