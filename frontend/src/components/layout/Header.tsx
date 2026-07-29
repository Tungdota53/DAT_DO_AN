import { useEffect, useRef, useState } from "react";

import { usePathname } from "../../routes/history";
import { Link } from "../../routes/router";
import { useCartStore, useCartUiStore } from "../../stores/cart-store";
import { Brand } from "./Brand";

const navigation = [
  { label: "Trang chủ", to: "/" },
  { label: "Nhà hàng", to: "/restaurants" },
  { label: "Tra cứu đơn", to: "/orders/lookup" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previousItemCount = useRef<number | null>(null);
  const { pathname } = usePathname();
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const openCart = useCartUiStore((state) => state.open);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (previousItemCount.current === null) {
      previousItemCount.current = itemCount;
      return;
    }
    const wasIncreased = itemCount > previousItemCount.current;
    previousItemCount.current = itemCount;
    if (!wasIncreased) return;

    setIsCartBumping(true);
    const timer = window.setTimeout(() => setIsCartBumping(false), 520);
    return () => window.clearTimeout(timer);
  }, [itemCount]);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
        isScrolled ? "is-scrolled" : ""
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
        >
          <Brand />
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Điều hướng chính"
        >
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname === item.to ? "page" : undefined}
              className={`nav-link inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                pathname === item.to
                  ? "bg-orange-50 text-orange-700"
                  : "text-slate-600 hover:bg-white/80 hover:text-orange-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`cart-button ${isCartBumping ? "is-bumping" : ""}`}
            data-cart-target="true"
            aria-label={`Mở giỏ hàng, ${itemCount} món`}
            onClick={openCart}
          >
            <span className="icon-cart" aria-hidden="true" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="cart-count" aria-live="polite">
              {itemCount}
            </span>
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button mobile-menu-button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            <span
              className={isMenuOpen ? "icon-close" : "icon-menu"}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Điều hướng di động"
        hidden={!isMenuOpen}
        className="border-t border-orange-100 bg-[#fffaf4] px-4 py-4 shadow-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-7xl gap-1">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname === item.to ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
              className={`rounded-xl px-4 py-3 font-bold ${
                pathname === item.to
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-700 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
