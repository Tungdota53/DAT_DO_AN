const highlights = [
  {
    title: "Không cần tài khoản",
    description:
      "Bắt đầu hành trình đặt món ngay, không phải ghi nhớ thêm tên đăng nhập hay mật khẩu.",
    icon: "feature-icon-user",
    className:
      "bg-[linear-gradient(145deg,#f97316,#ea580c)] text-white sm:col-span-2 lg:col-span-7"
  },
  {
    title: "Một giỏ, một nhà hàng",
    description: "Giỏ hàng luôn nhất quán để bạn dễ kiểm tra trước khi xác nhận.",
    icon: "feature-icon-bag",
    className: "bg-slate-950 text-white sm:col-span-1 lg:col-span-5"
  },
  {
    title: "Thanh toán COD",
    description: "Thanh toán khi nhận hàng, đúng với phạm vi MVP hiện tại của FoodGo.",
    icon: "feature-icon-card",
    className: "bg-amber-100 text-slate-950 sm:col-span-1 lg:col-span-5"
  },
  {
    title: "Thoải mái trên mọi màn hình",
    description:
      "Bố cục thích ứng liền mạch từ điện thoại, máy tính bảng đến màn hình desktop.",
    icon: "feature-icon-device",
    className: "bg-[#fffaf4] text-slate-950 sm:col-span-2 lg:col-span-7"
  }
];

export function LandingHighlights() {
  return (
    <section id="discover" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <div>
            <p className="section-eyebrow">Trải nghiệm FoodGo</p>
            <h2 className="text-balance mt-4 max-w-2xl text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Ít thao tác hơn, nhiều thời gian thưởng thức hơn.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end">
            Mọi quyết định thiết kế đều xoay quanh một mục tiêu: giúp hành trình từ lúc
            chọn món đến khi xác nhận đơn luôn dễ hiểu và nhất quán.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(250px,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {highlights.map((highlight, index) => (
            <article
              key={highlight.title}
              className={`bento-card landing-reveal relative isolate overflow-hidden rounded-[2rem] border border-black/5 p-7 sm:p-8 ${highlight.className}`}
              style={{ "--delay": `${index * 80 + 100}ms` } as CSSProperties}
            >
              <div className="bento-halo" aria-hidden="true" />
              <span
                className={`feature-icon ${highlight.icon} relative z-10`}
                aria-hidden="true"
              />
              <div className="relative z-10 mt-16 max-w-md">
                <h3 className="text-2xl font-black tracking-[-0.035em]">
                  {highlight.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 opacity-75">
                  {highlight.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
import type { CSSProperties } from "react";
