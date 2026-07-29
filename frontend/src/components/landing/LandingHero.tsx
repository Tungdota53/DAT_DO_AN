const journey = [
  {
    number: "01",
    label: "Chọn nhà hàng",
    caption: "Bắt đầu từ nơi bạn muốn đặt"
  },
  {
    number: "02",
    label: "Thêm món",
    caption: "Chỉ chọn những món còn bán"
  },
  {
    number: "03",
    label: "Xác nhận COD",
    caption: "Thanh toán khi món được giao"
  }
];

const assurances = ["Không cần đăng nhập", "Một nhà hàng mỗi giỏ", "Thanh toán COD"];

export function LandingHero() {
  return (
    <section className="landing-hero surface-grid relative isolate overflow-hidden">
      <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
      <div className="hero-glow hero-glow-left" aria-hidden="true" />
      <div className="hero-glow hero-glow-right" aria-hidden="true" />

      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
        <div className="landing-reveal max-w-2xl [--delay:80ms]">
          <p className="glass-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700">
            <span className="status-pulse" aria-hidden="true" />
            Đặt món theo cách gọn hơn
          </p>

          <h1 className="text-balance mt-7 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-[4.75rem]">
            Món ngon gần bạn,{" "}
            <span className="hero-highlight relative inline-block text-orange-500">
              giao tận nơi.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            FoodGo kết nối toàn bộ hành trình đặt món trong một trải nghiệm rõ ràng:
            chọn nơi phù hợp, thêm món và thanh toán khi nhận hàng.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#discover"
              className="landing-primary-button inline-flex min-h-13 items-center justify-center gap-3 rounded-full px-7 py-3.5 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
            >
              Khám phá FoodGo
              <span className="icon-arrow" aria-hidden="true" />
            </a>
            <a
              href="#how-it-works"
              className="landing-secondary-button inline-flex min-h-13 items-center justify-center rounded-full px-7 py-3.5 text-sm font-black text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
            >
              Xem cách đặt món
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
            {assurances.map((assurance) => (
              <li key={assurance} className="flex items-center gap-2.5">
                <span
                  className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-700"
                  aria-hidden="true"
                >
                  <span className="icon-check" />
                </span>
                {assurance}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="hero-stage landing-reveal relative mx-auto w-full max-w-lg [--delay:220ms]"
          aria-label="Minh họa hành trình đặt món FoodGo"
        >
          <div className="floating-note floating-note-top" aria-hidden="true">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <span className="icon-check" />
            </span>
            <span>
              <strong>Sẵn sàng</strong>
              <small>Thanh toán COD</small>
            </span>
          </div>

          <div className="hero-panel relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/92 p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                  Hành trình FoodGo
                </p>
                <p className="mt-1.5 text-xl font-black tracking-[-0.03em] text-slate-950">
                  Một đơn hàng, ba bước
                </p>
              </div>
              <span
                className="grid size-12 place-items-center rounded-2xl bg-orange-50"
                aria-hidden="true"
              >
                <span className="icon-utensils" />
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2" aria-hidden="true">
              <span className="h-1.5 flex-1 rounded-full bg-orange-500" />
              <span className="h-1.5 flex-1 rounded-full bg-amber-400" />
              <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
            </div>

            <div className="mt-5 grid gap-3">
              {journey.map((item, index) => (
                <div
                  key={item.number}
                  className="journey-row group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5"
                  style={{ "--row-delay": `${index * 100 + 380}ms` } as CSSProperties}
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white"
                    aria-hidden="true"
                  >
                    {item.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-black text-slate-950">{item.label}</span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">
                      {item.caption}
                    </span>
                  </span>
                  <span
                    className="text-slate-300 transition duration-300 ease-out group-hover:translate-x-1 group-hover:text-orange-500"
                    aria-hidden="true"
                  >
                    <span className="icon-arrow icon-arrow-muted" />
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-950 p-4 text-white">
              <div>
                <p className="text-xs font-semibold text-slate-400">Phương thức MVP</p>
                <p className="mt-1 font-black">Thanh toán khi nhận hàng</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black">
                COD
              </span>
            </div>
          </div>

          <div className="floating-note floating-note-bottom" aria-hidden="true">
            <span className="feature-icon feature-icon-bag feature-icon-compact" />
            <span>
              <strong>Giỏ hàng rõ ràng</strong>
              <small>Một nhà hàng mỗi giỏ</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
import type { CSSProperties } from "react";
