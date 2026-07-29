import { useEffect, useRef, useState } from "react";

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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-orange-100/80 bg-[#fffaf4]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
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
              className="rounded-lg text-sm font-bold text-slate-600 transition hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cart-button"
            aria-label={`Mở giỏ hàng, ${itemCount} món`}
            onClick={openCart}
          >
            <span className="icon-cart" aria-hidden="true" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            <span className="cart-count">{itemCount}</span>
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
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-3 font-bold text-slate-700 hover:bg-orange-100 hover:text-orange-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
