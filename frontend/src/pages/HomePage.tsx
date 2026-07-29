import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../components/common/ResourceStates";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";
import { useRestaurants } from "../hooks/useFoodgoData";
import { Link } from "../routes/router";

export function HomePage() {
  const restaurants = useRestaurants("", 3);

  return (
    <>
      <section className="surface-grid overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <span className="eyebrow">Đặt món trực tiếp từ nhà hàng</span>
            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-black leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl">
              Món ngon gần bạn,{" "}
              <span className="relative text-orange-600">
                đặt trong vài phút.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Chọn nhà hàng, thêm món vào giỏ và thanh toán khi nhận hàng. Giá
              và trạng thái món được lấy trực tiếp từ FoodGo API.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/restaurants" className="primary-button">
                Chọn món ngay
                <span className="icon-arrow ml-2" aria-hidden="true" />
              </Link>
              <Link to="/orders/lookup" className="secondary-button">
                Tra cứu đơn hàng
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
              <span className="trust-chip">
                <span className="icon-check" aria-hidden="true" /> Không cần
                đăng nhập
              </span>
              <span className="trust-chip">
                <span className="icon-check" aria-hidden="true" /> Thanh toán
                COD
              </span>
            </div>
          </div>

          <div
            className="hero-order-board"
            aria-label="Quy trình đặt món FoodGo"
          >
            <div className="hero-order-glow" aria-hidden="true" />
            {[
              ["01", "Chọn nhà hàng", "Xem thực đơn và giá đang bán"],
              ["02", "Thêm vào giỏ", "Một giỏ, một nhà hàng"],
              ["03", "Nhận món tại cửa", "Thanh toán COD an toàn"],
            ].map(([number, title, text]) => (
              <div key={number} className="hero-order-row">
                <span>{number}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
                <i className="icon-check" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">Đang phục vụ</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Nhà hàng nổi bật
            </h2>
          </div>
          <Link
            to="/restaurants"
            className="text-sm font-black text-orange-600"
          >
            Xem tất cả <span className="icon-arrow ml-2" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8">
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
              {restaurants.data.data.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
