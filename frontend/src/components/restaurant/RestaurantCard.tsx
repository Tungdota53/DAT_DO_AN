import { Link } from "../../routes/router";
import type { Restaurant } from "../../types/api";
import { formatCurrency } from "../../utils/format";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const initials = restaurant.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_18px_50px_rgba(124,45,18,0.07)] transition hover:-translate-y-1 hover:border-orange-200">
      <div className={`food-visual food-visual-${(restaurant.id % 3) + 1}`}>
        <span aria-hidden="true">{initials}</span>
        <div className="visual-ring" aria-hidden="true" />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
              {restaurant.availableFoodCount} món đang bán
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-950">
              {restaurant.name}
            </h2>
          </div>
          <span className="icon-arrow-circle" aria-hidden="true">
            <span className="icon-arrow" />
          </span>
        </div>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
          {restaurant.description ??
            "Thực đơn được cập nhật trực tiếp từ nhà hàng."}
        </p>
        <p className="mt-4 text-sm font-semibold text-slate-700">
          {restaurant.address}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span className="text-slate-500">
            Từ{" "}
            <strong className="text-slate-950">
              {restaurant.minPrice === null
                ? "Đang cập nhật"
                : formatCurrency(restaurant.minPrice)}
            </strong>
          </span>
          <span className="font-bold text-orange-600">
            Phí {formatCurrency(restaurant.deliveryFee)}
          </span>
        </div>
        <Link
          to={`/restaurants/${restaurant.id}`}
          className="secondary-button mt-5 w-full"
          aria-label={`Xem thực đơn ${restaurant.name}`}
        >
          Xem thực đơn
        </Link>
      </div>
    </article>
  );
}
