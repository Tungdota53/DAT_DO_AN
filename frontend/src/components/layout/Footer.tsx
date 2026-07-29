import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white" aria-label="Chân trang">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <a
            href="#top"
            className="inline-flex rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
          >
            <Brand />
          </a>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            Đặt món gọn, nhận món tại cửa và thanh toán COD. FoodGo ưu tiên trải nghiệm
            rõ ràng, dễ sử dụng trên mọi thiết bị.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900">
            Khám phá
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li>
              <a className="transition hover:text-orange-600" href="#discover">
                Trải nghiệm FoodGo
              </a>
            </li>
            <li>
              <a className="transition hover:text-orange-600" href="#how-it-works">
                Cách hoạt động
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900">
            Hệ thống
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li>
              <a className="transition hover:text-orange-600" href="#service-status">
                Trạng thái dịch vụ
              </a>
            </li>
            <li>Thanh toán khi nhận hàng (COD)</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FoodGo. Đồ án đặt đồ ăn trực tuyến.</p>
          <p>MVP khách hàng · Không đăng nhập · COD</p>
        </div>
      </div>
    </footer>
  );
}
