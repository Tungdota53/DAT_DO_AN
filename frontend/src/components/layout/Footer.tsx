import { Link } from "../../routes/router";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white" aria-label="Chân trang">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_0.75fr_0.75fr] lg:px-8 lg:py-16">
        <div>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
          >
            <Brand inverse />
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Nền tảng đặt món trực tuyến kết nối trải nghiệm chọn món, giỏ hàng,
            thanh toán COD và theo dõi đơn trong một hành trình liền mạch.
          </p>
          <span className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            FoodGo API đang kết nối
          </span>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
            Khám phá
          </h2>
          <nav
            className="mt-5 grid gap-4 text-sm text-slate-400"
            aria-label="Khám phá FoodGo"
          >
            <Link
              to="/"
              className="inline-flex min-h-11 w-fit items-center rounded-lg transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Trang chủ
            </Link>
            <Link
              to="/restaurants"
              className="inline-flex min-h-11 w-fit items-center rounded-lg transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Danh sách nhà hàng
            </Link>
            <Link
              to="/checkout"
              className="inline-flex min-h-11 w-fit items-center rounded-lg transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Thanh toán
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
            Đơn hàng
          </h2>
          <nav
            className="mt-5 grid gap-4 text-sm text-slate-400"
            aria-label="Hỗ trợ đơn hàng"
          >
            <Link
              to="/orders/lookup"
              className="inline-flex min-h-11 w-fit items-center rounded-lg transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Tra cứu trạng thái
            </Link>
            <span>Thanh toán khi nhận hàng</span>
            <span>Không cần đăng nhập</span>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} FoodGo</span>
          <span>Thiết kế cho trải nghiệm đặt món nhanh, rõ ràng và an tâm.</span>
        </div>
      </div>
    </footer>
  );
}
