import {
  type CSSProperties,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/common/ResourceStates";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";
import { useRestaurants } from "../hooks/useFoodgoData";
import { Link } from "../routes/router";

const orderJourney = [
  {
    number: "01",
    title: "Chọn nhà hàng",
    text: "Khám phá thực đơn và giá bán hiện tại.",
  },
  {
    number: "02",
    title: "Tạo đơn dễ dàng",
    text: "Thêm món, nhập địa chỉ và xác nhận.",
  },
  {
    number: "03",
    title: "Nhận món tận nơi",
    text: "Theo dõi trạng thái và thanh toán COD.",
  },
];

const projectFeatures = [
  {
    icon: "feature-icon-user",
    eyebrow: "Nhanh gọn",
    title: "Không cần tài khoản",
    text: "Bắt đầu đặt món ngay, không có form đăng ký hay mật khẩu làm gián đoạn trải nghiệm.",
    className: "bg-orange-600 text-white lg:col-span-2",
  },
  {
    icon: "feature-icon-bag",
    eyebrow: "Rõ ràng",
    title: "Giỏ hàng thông minh",
    text: "Mỗi đơn thuộc một nhà hàng để phí giao, món ăn và tổng tiền luôn minh bạch.",
    className: "bg-[#fffaf4] text-slate-950",
  },
  {
    icon: "feature-icon-card",
    eyebrow: "An tâm",
    title: "Thanh toán COD",
    text: "Chỉ thanh toán khi nhận món. Không cần nhập hay lưu thông tin thẻ.",
    className: "bg-amber-100 text-slate-950",
  },
  {
    icon: "feature-icon-device",
    eyebrow: "Đồng bộ",
    title: "Dữ liệu theo thời gian thực",
    text: "Thực đơn, giá bán và trạng thái món được kết nối trực tiếp với FoodGo API.",
    className: "bg-slate-950 text-white lg:col-span-2",
  },
];

function Reveal({
  children,
  className = "",
  delay = 0,
}: PropsWithChildren<{ className?: string; delay?: number }>) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function HomePage() {
  const restaurants = useRestaurants("", 3);

  return (
    <>
      <section className="landing-hero relative isolate overflow-hidden">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="hero-glow hero-glow-left" aria-hidden="true" />
        <div className="hero-glow hero-glow-right" aria-hidden="true" />

        <div className="mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <div className="relative z-10">
            <div
              className="landing-reveal glass-badge inline-flex min-h-10 items-center gap-2.5 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700"
              style={{ "--delay": "40ms" } as CSSProperties}
            >
              <span className="status-pulse" aria-hidden="true" />
              Nền tảng đặt món trực tuyến
            </div>

            <h1
              className="landing-reveal mt-7 max-w-3xl text-balance text-[clamp(3rem,6.4vw,5.5rem)] font-black leading-[0.96] tracking-[-0.065em] text-slate-950"
              style={{ "--delay": "130ms" } as CSSProperties}
            >
              Món ngon gần bạn,{" "}
              <span className="hero-highlight relative whitespace-nowrap text-orange-600">
                chạm là có.
              </span>
            </h1>

            <p
              className="landing-reveal mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl"
              style={{ "--delay": "220ms" } as CSSProperties}
            >
              FoodGo kết nối bạn với nhà hàng, thực đơn và hành trình đơn hàng
              trong một trải nghiệm liền mạch — từ lúc chọn món đến khi nhận
              hàng.
            </p>

            <div
              className="landing-reveal mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ "--delay": "310ms" } as CSSProperties}
            >
              <Link
                to="/restaurants"
                className="landing-primary-button inline-flex min-h-14 items-center justify-center rounded-2xl px-7 text-base font-black text-white outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
              >
                Chọn món ngay
                <span className="icon-arrow ml-3" aria-hidden="true" />
              </Link>
              <Link
                to="/orders/lookup"
                className="landing-secondary-button inline-flex min-h-14 items-center justify-center rounded-2xl px-7 text-base font-black text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
              >
                Tra cứu đơn hàng
              </Link>
            </div>

            <div
              className="landing-reveal mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-orange-100 pt-6"
              style={{ "--delay": "400ms" } as CSSProperties}
              aria-label="Ưu điểm nổi bật"
            >
              {[
                ["0", "bước đăng ký"],
                ["3", "bước đặt món"],
                ["COD", "thanh toán"],
              ].map(([value, label]) => (
                <div key={label}>
                  <strong className="block text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    {value}
                  </strong>
                  <span className="mt-1 block text-xs font-bold text-slate-500 sm:text-sm">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-stage landing-reveal relative z-10 lg:pl-8">
            <div className="hero-panel relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/90 p-4 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                    Hành trình FoodGo
                  </p>
                  <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-950">
                    Mọi thứ trong một luồng
                  </h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Sẵn sàng
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {orderJourney.map((step, index) => (
                  <div
                    key={step.number}
                    className="journey-row group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-slate-100 bg-[#fffaf4] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50"
                    style={
                      {
                        "--row-delay": `${430 + index * 50}ms`,
                      } as CSSProperties
                    }
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xs font-black text-orange-600 shadow-sm">
                      {step.number}
                    </span>
                    <div>
                      <strong className="block text-sm font-black text-slate-950 sm:text-base">
                        {step.title}
                      </strong>
                      <small className="mt-1 block text-xs leading-5 text-slate-500 sm:text-sm">
                        {step.text}
                      </small>
                    </div>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <span className="icon-check" aria-hidden="true" />
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span
                    className="feature-icon feature-icon-bag feature-icon-compact"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="block text-xs text-slate-400">
                      Trải nghiệm
                    </span>
                    <strong className="text-sm font-black">
                      Nhanh · Rõ · An tâm
                    </strong>
                  </div>
                </div>
                <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black">
                  FoodGo
                </span>
              </div>
            </div>

            <div className="floating-note floating-note-top" aria-hidden="true">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <span className="icon-check" />
              </span>
              <div>
                <strong>Thanh toán COD</strong>
                <small>Trả tiền khi nhận món</small>
              </div>
            </div>

            <div
              className="floating-note floating-note-bottom"
              aria-hidden="true"
            >
              <span
                className="feature-icon feature-icon-device feature-icon-compact"
                aria-hidden="true"
              />
              <div>
                <strong>Menu đồng bộ</strong>
                <small>Giá và trạng thái mới nhất</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-y border-orange-100 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Một trải nghiệm trọn vẹn</span>
            <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Đặt món đơn giản ở bên ngoài, vận hành chặt chẽ ở bên trong.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              FoodGo tập trung vào những gì người dùng thực sự cần: chọn đúng
              món, biết đúng giá, hoàn tất nhanh và luôn theo dõi được đơn hàng.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {projectFeatures.map((feature, index) => (
              <Reveal
                key={feature.title}
                delay={index * 50}
                className={`bento-card relative overflow-hidden rounded-[2rem] border border-black/5 p-7 sm:p-8 ${feature.className}`}
              >
                <span className="bento-halo" aria-hidden="true" />
                <div className="relative z-10 flex h-full flex-col">
                  <span
                    className={`feature-icon ${feature.icon}`}
                    aria-hidden="true"
                  />
                  <span className="mt-8 text-xs font-black uppercase tracking-[0.16em] opacity-70">
                    {feature.eyebrow}
                  </span>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 opacity-75 sm:text-base">
                    {feature.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf4] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="section-eyebrow">Khám phá ngay</span>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
                Nhà hàng nổi bật
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Thực đơn và mức giá được lấy trực tiếp từ hệ thống FoodGo.
              </p>
            </div>
            <Link
              to="/restaurants"
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-2 text-sm font-black text-orange-600 outline-none transition hover:gap-3 hover:text-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 sm:self-auto"
            >
              Xem tất cả nhà hàng
              <span className="icon-arrow" aria-hidden="true" />
            </Link>
          </Reveal>

          <div className="mt-10">
            {restaurants.status === "loading" ? <LoadingState /> : null}
            {restaurants.status === "error" ? (
              <ErrorState
                message={restaurants.error}
                onRetry={restaurants.retry}
              />
            ) : null}
            {restaurants.status === "success" &&
            restaurants.data.data.length === 0 ? (
              <EmptyState
                title="Chưa có nhà hàng"
                message="Danh sách sẽ xuất hiện khi Backend có dữ liệu."
              />
            ) : null}
            {restaurants.status === "success" &&
            restaurants.data.data.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.data.data.map((restaurant, index) => (
                  <Reveal key={restaurant.id} delay={index * 50}>
                    <RestaurantCard restaurant={restaurant} />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="landing-steps border-y border-orange-100 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Cách FoodGo hoạt động</span>
            <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Từ “hôm nay ăn gì?” đến món ngon trước cửa.
            </h2>
          </Reveal>

          <div className="relative mt-12 grid gap-5 lg:grid-cols-3">
            <div
              className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent lg:block"
              aria-hidden="true"
            />
            {orderJourney.map((step, index) => (
              <Reveal
                key={step.number}
                delay={index * 50}
                className="landing-step-card relative rounded-[2rem] border border-orange-100 bg-white p-7 sm:p-8"
              >
                <div className="relative z-10">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-orange-400 shadow-xl shadow-slate-950/10">
                    {step.number}
                  </span>
                  <h3 className="mt-7 text-2xl font-black tracking-tight text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {step.text}
                  </p>
                  {index < orderJourney.length - 1 ? (
                    <span className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-orange-600 lg:hidden">
                      Tiếp theo
                      <span className="icon-arrow" aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="status-stage relative isolate grid overflow-hidden rounded-[2.25rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-16 lg:py-16">
            <div className="status-grid" aria-hidden="true" />
            <div className="status-glow" aria-hidden="true" />

            <div>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                Luôn nắm được hành trình
              </span>
              <h2 className="mt-5 text-balance text-4xl font-black tracking-[-0.045em] sm:text-5xl">
                Tra cứu đơn hàng bất cứ lúc nào.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Chỉ cần mã đơn và số điện thoại, bạn có thể xem lại món đã đặt,
                tổng thanh toán và từng mốc trạng thái của đơn hàng.
              </p>
              <Link
                to="/orders/lookup"
                className="mt-8 inline-flex min-h-13 items-center justify-center rounded-2xl bg-white px-6 text-sm font-black text-slate-950 outline-none transition duration-300 hover:-translate-y-1 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
              >
                Kiểm tra đơn của tôi
                <span className="icon-arrow ml-3" aria-hidden="true" />
              </Link>
            </div>

            <div className="status-glass mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-xl sm:p-6 lg:mt-0">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-xs font-bold text-slate-400">
                    Đơn hàng #FG1024
                  </span>
                  <strong className="mt-1 block text-lg font-black">
                    Trạng thái đơn hàng
                  </strong>
                </div>
                <span className="rounded-full bg-orange-500/15 px-3 py-2 text-xs font-black text-orange-300">
                  Đang xử lý
                </span>
              </div>

              <ol className="mt-6 grid gap-5" aria-label="Minh họa trạng thái đơn">
                {[
                  ["Đã tiếp nhận", "Nhà hàng đã nhận thông tin đơn", true],
                  ["Đang chuẩn bị", "Món ngon đang được hoàn thiện", true],
                  ["Giao đến bạn", "Sẵn sàng cho chặng cuối", false],
                ].map(([title, text, completed]) => (
                  <li
                    key={String(title)}
                    className="grid grid-cols-[auto_1fr] gap-3"
                  >
                    <span
                      className={`mt-0.5 grid h-8 w-8 place-items-center rounded-full ${
                        completed
                          ? "bg-emerald-500 text-white"
                          : "border border-white/15 bg-white/5 text-slate-500"
                      }`}
                    >
                      {completed ? (
                        <span className="icon-check" aria-hidden="true" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </span>
                    <div>
                      <strong className="block text-sm font-black">
                        {title}
                      </strong>
                      <span className="mt-1 block text-xs leading-5 text-slate-400">
                        {text}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-orange-600 py-20 text-white sm:py-24">
        <div
          className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_32%),radial-gradient(circle_at_85%_75%,#fef08a_0,transparent_28%)]"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-100">
            Bữa ngon bắt đầu từ đây
          </span>
          <h2 className="mt-5 text-balance text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            Sẵn sàng chọn món bạn yêu thích?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-orange-50 sm:text-lg">
            Khám phá nhà hàng, thêm món vào giỏ và để FoodGo dẫn bạn qua toàn bộ
            hành trình đặt món.
          </p>
          <Link
            to="/restaurants"
            className="mt-9 inline-flex min-h-14 items-center justify-center rounded-2xl bg-slate-950 px-8 text-base font-black text-white shadow-2xl shadow-orange-950/20 outline-none transition duration-300 hover:-translate-y-1 hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-orange-600"
          >
            Khám phá thực đơn
            <span className="icon-arrow ml-3" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
