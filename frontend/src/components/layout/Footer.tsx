import { Link } from "../../routes/router";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer
      className="border-t border-slate-200 bg-white"
      aria-label="Chân trang"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="inline-flex rounded-2xl">
            <Brand />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            Chọn món từ nhà hàng thật, giao tận nơi và thanh toán khi nhận hàng.
          </p>
        </div>
        <div>
          <h2 className="footer-title">Đặt món</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <Link to="/restaurants" className="hover:text-orange-600">
              Danh sách nhà hàng
            </Link>
            <Link to="/checkout" className="hover:text-orange-600">
              Thanh toán
            </Link>
          </div>
        </div>
        <div>
          <h2 className="footer-title">Đơn hàng</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-500">
            <Link to="/orders/lookup" className="hover:text-orange-600">
              Tra cứu trạng thái
            </Link>
            <span>Thanh toán COD</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FoodGo · MVP khách hàng · Không cần đăng
        nhập
      </div>
    </footer>
  );
}
