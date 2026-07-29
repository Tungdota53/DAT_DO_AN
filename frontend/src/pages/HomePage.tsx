import { HealthStatus } from "../components/HealthStatus";
import type { HealthResponse } from "../types/api";

const steps = [
  {
    number: "01",
    title: "Chọn nhà hàng",
    description: "Khám phá danh sách nhà hàng khi endpoint nghiệp vụ sẵn sàng."
  },
  {
    number: "02",
    title: "Thêm món vào giỏ",
    description: "Mỗi giỏ chỉ chứa món từ một nhà hàng để đơn luôn rõ ràng."
  },
  {
    number: "03",
    title: "Đặt món bằng COD",
    description: "Xác nhận thông tin giao hàng và thanh toán khi nhận món."
  }
];

interface HomePageProps {
  loadHealth?: () => Promise<HealthResponse>;
}

export function HomePage({ loadHealth }: HomePageProps) {
  return (
    <>
      <section className="surface-grid relative isolate overflow-hidden">
        <div
          className="absolute -left-32 top-12 -z-10 size-80 rounded-full bg-orange-200/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -right-36 bottom-0 -z-10 size-96 rounded-full bg-amber-100 blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700 shadow-sm">
              <span className="size-2 rounded-full bg-orange-500" aria-hidden="true" />
              FoodGo customer MVP
            </p>
            <h1 className="text-balance mt-6 text-5xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
              Món ngon gần bạn,{" "}
              <span className="relative whitespace-nowrap text-orange-500">
                giao tận nơi.
                <svg
                  className="absolute -bottom-3 left-0 h-3 w-full text-orange-300"
                  viewBox="0 0 280 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C70 2 170 2 278 7"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              FoodGo đang xây dựng trải nghiệm đặt món gọn gàng: chọn nhà hàng, thêm món
              và thanh toán COD — không cần tài khoản.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
              >
                Xem cách hoạt động
                <span className="icon-arrow" aria-hidden="true" />
              </a>
              <a
                href="#service-status"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:border-orange-200 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
              >
                Kiểm tra dịch vụ
              </a>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
              {["Không cần đăng nhập", "Một nhà hàng mỗi giỏ", "Thanh toán COD"].map(
                (benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <span
                      className="grid size-5 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700"
                      aria-hidden="true"
                    >
                      <span className="icon-check" />
                    </span>
                    {benefit}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-lg" aria-label="Minh họa luồng đặt món">
            <div
              className="absolute -inset-5 -z-10 rotate-3 rounded-[2.5rem] bg-orange-200/70"
              aria-hidden="true"
            />
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white p-4 shadow-[0_30px_80px_rgba(125,65,16,0.16)] sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Hành trình của bạn
                  </p>
                  <p className="mt-1 text-lg font-black tracking-tight text-slate-950">
                    Một đơn hàng, ba bước
                  </p>
                </div>
                <span className="grid size-11 place-items-center rounded-2xl bg-orange-50 text-2xl">
                  <span className="icon-utensils" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  { label: "Nhà hàng", caption: "Tìm nơi phù hợp", color: "bg-orange-500" },
                  { label: "Món ăn", caption: "Chọn món còn bán", color: "bg-amber-400" },
                  { label: "Giao hàng", caption: "Xác nhận bằng COD", color: "bg-emerald-500" }
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-orange-200 hover:bg-orange-50/50"
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl text-sm font-black text-white shadow-sm ${item.color}`}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block font-black text-slate-900">{item.label}</span>
                      <span className="mt-0.5 block text-sm text-slate-500">{item.caption}</span>
                    </span>
                    <span
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500"
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
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
                  COD
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                Nền tảng khách hàng
              </p>
              <h2 className="text-balance mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Một nền tảng rõ ràng cho toàn bộ luồng đặt món
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
              Shell responsive, lớp API và mock contract là nền móng cho các màn hình nhà
              hàng, giỏ hàng, checkout và tra cứu đơn tiếp theo.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Responsive", "Tối ưu mobile, tablet và desktop."],
              ["Dễ truy cập", "Focus rõ ràng và hỗ trợ bàn phím cơ bản."],
              ["Contract-first", "Type và mock bám theo OpenAPI hiện có."],
              ["Đổi nguồn data", "Mock hoặc API thật mà không sửa component."]
            ].map(([title, description], index) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 bg-[#fffaf4] p-6 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-950/5"
              >
                <span className="text-sm font-black text-orange-500" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 className="mt-8 text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-orange-100 bg-orange-50/60 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
              Cách hoạt động
            </p>
            <h2 className="text-balance mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Từ lựa chọn đến đặt món trong ba bước
            </h2>
          </div>

          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.number}
                className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-7 shadow-sm"
              >
                <span className="absolute -right-2 -top-5 text-8xl font-black text-orange-50">
                  {step.number}
                </span>
                <span className="relative text-sm font-black text-orange-500">{step.number}</span>
                <h3 className="relative mt-10 text-xl font-black text-slate-950">{step.title}</h3>
                <p className="relative mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="service-status" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-[0.85fr_1.15fr] md:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Kết nối hệ thống
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">
              Trạng thái FoodGo
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Kiểm tra endpoint <code className="font-bold text-slate-800">GET /health</code>{" "}
              theo đúng nguồn dữ liệu đang cấu hình.
            </p>
          </div>
          <HealthStatus loadHealth={loadHealth} />
        </div>
      </section>
    </>
  );
}
