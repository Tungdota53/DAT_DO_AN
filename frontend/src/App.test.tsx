import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import App from "./App";

describe("admin route", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("renders the admin login outside the customer application shell", () => {
    window.history.replaceState(null, "", "/admin");

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Đăng nhập quản trị" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
