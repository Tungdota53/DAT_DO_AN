import { type FormEvent, useState } from "react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/common/ResourceStates";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";
import { useRestaurants } from "../hooks/useFoodgoData";

export function RestaurantsPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const restaurants = useRestaurants(search);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSearch(input.trim());
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Khám phá thực đơn</span>
        <h1>Chọn nhà hàng bạn yêu thích</h1>
        <p>
          Dữ liệu nhà hàng và phí giao hàng được đọc trực tiếp từ SQL Server.
        </p>
      </div>

      <form className="search-bar mt-8" role="search" onSubmit={onSubmit}>
        <label htmlFor="restaurant-search" className="sr-only">
          Tìm nhà hàng
        </label>
        <span className="icon-search" aria-hidden="true" />
        <input
          id="restaurant-search"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tìm theo tên hoặc địa chỉ..."
        />
        <button type="submit">Tìm kiếm</button>
      </form>

      <div className="mt-9">
        {restaurants.status === "loading" ? <LoadingState /> : null}
        {restaurants.status === "error" ? (
          <ErrorState message={restaurants.error} onRetry={restaurants.retry} />
        ) : null}
        {restaurants.status === "success" &&
        restaurants.data.data.length === 0 ? (
          <EmptyState
            title="Không tìm thấy nhà hàng"
            message="Thử tên hoặc khu vực khác."
            action={
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setInput("");
                  setSearch("");
                }}
              >
                Xóa tìm kiếm
              </button>
            }
          />
        ) : null}
        {restaurants.status === "success" &&
        restaurants.data.data.length > 0 ? (
          <>
            <p className="mb-5 text-sm font-semibold text-slate-500">
              {restaurants.data.pagination.totalItems} nhà hàng
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.data.data.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
