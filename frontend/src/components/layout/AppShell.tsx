import type { PropsWithChildren } from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div id="top" className="min-h-screen bg-[#fffaf4] text-slate-900">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition focus:translate-y-0"
      >
        Bỏ qua đến nội dung chính
      </a>
      <Header />
      <main id="main-content" className="pt-[76px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
