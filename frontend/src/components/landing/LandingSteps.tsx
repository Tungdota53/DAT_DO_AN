const steps = [
  {
    number: "01",
    title: "Chọn nhà hàng",
    description: "Bắt đầu từ danh sách nhà hàng khi endpoint nghiệp vụ sẵn sàng.",
    accent: "bg-orange-500"
  },
  {
    number: "02",
    title: "Thêm món còn bán",
    description: "Chọn số lượng phù hợp và giữ giỏ hàng trong cùng một nhà hàng.",
    accent: "bg-amber-400"
  },
  {
    number: "03",
    title: "Xác nhận giao hàng",
    description: "Kiểm tra thông tin nhận món rồi hoàn tất đơn bằng COD.",
    accent: "bg-emerald-500"
  }
];

export function LandingSteps() {
  return (
    <section
      id="how-it-works"
      className="landing-steps scroll-mt-24 overflow-hidden border-y border-orange-100 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow">Ba bước liền mạch</p>
          <h2 className="text-balance mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
            Từ lựa chọn đầu tiên đến lúc xác nhận đơn.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Luồng khách hàng MVP được sắp xếp theo đúng thứ tự, không chen thêm đăng nhập
            hay phương thức thanh toán ngoài COD.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-5 md:grid-cols-3">
          <span
            className="absolute left-[16.66%] right-[16.66%] top-8 hidden border-t-2 border-dashed border-orange-200 md:block"
            aria-hidden="true"
          />
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="landing-step-card landing-reveal relative rounded-[2rem] border border-white/80 bg-white/80 p-7 backdrop-blur-xl"
              style={{ "--delay": `${index * 110 + 120}ms` } as CSSProperties}
            >
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className={`grid size-16 place-items-center rounded-2xl text-sm font-black text-white shadow-lg ${step.accent}`}
                >
                  {step.number}
                </span>
                <span className="h-px w-14 bg-slate-200 md:hidden" aria-hidden="true" />
              </div>
              <h3 className="mt-10 text-xl font-black tracking-[-0.025em] text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
import type { CSSProperties } from "react";
