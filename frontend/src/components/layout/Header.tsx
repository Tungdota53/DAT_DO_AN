import { useEffect, useRef, useState } from "react";

import { Brand } from "./Brand";

const navigation = [
  { label: "Khám phá", href: "#discover" },
  { label: "Cách hoạt động", href: "#how-it-works" },
  { label: "Trạng thái", href: "#service-status" }
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-orange-100/80 bg-[#fffaf4]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
        >
          <Brand />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg text-sm font-semibold text-slate-600 transition hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#how-it-works"
          className="hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 lg:inline-flex"
        >
          Bắt đầu khám phá
        </a>

        <button
          ref={menuButtonRef}
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-orange-200 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
        >
          {isMenuOpen ? (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Điều hướng di động"
        hidden={!isMenuOpen}
        className="border-t border-orange-100 bg-[#fffaf4] px-4 py-4 shadow-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-7xl gap-1">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-orange-100 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#how-it-works"
            onClick={closeMenu}
            className="mt-2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Bắt đầu khám phá
          </a>
        </div>
      </nav>
    </header>
  );
}
