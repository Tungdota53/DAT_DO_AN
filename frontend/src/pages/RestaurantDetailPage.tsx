import { type FormEvent, useCallback, useState } from "react";

import { RestaurantSwitchModal } from "../components/cart/RestaurantSwitchModal";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/common/ResourceStates";
import { FoodCard } from "../components/food/FoodCard";
import { useRestaurantMenu } from "../hooks/useFoodgoData";
import { useCartStore, useCartUiStore } from "../stores/cart-store";
import type { Food } from "../types/api";
import { formatCurrency } from "../utils/format";

export function RestaurantDetailPage({
  restaurantId,
}: {
  restaurantId: number;
}) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [pendingFood, setPendingFood] = useState<Food | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const menu = useRestaurantMenu(restaurantId, search, categoryId);
  const addItem = useCartStore((state) => state.addItem);
  const replaceCartAndAdd = useCartStore((state) => state.replaceCartAndAdd);
  const currentRestaurant = useCartStore((state) => state.restaurant);
  const openCart = useCartUiStore((state) => state.open);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearch(input.trim());
  };

  const cancelSwitch = useCallback(() => setPendingFood(null), []);

  if (menu.status === "loading") {
    return (
      <section className="page-section">
        <LoadingState label="Đang tải thực đơn" />
      </section>
    );
  }
  if (menu.status === "error") {
    return (
      <section className="page-section">
        <ErrorState message={menu.error} onRetry={menu.retry} />
      </section>
    );
  }

  const { restaurant, categories, foods } = menu.data;
  const onAdd = (food: Food) => {
    const result = addItem(restaurant, food);
    if (result === "different-restaurant") {
      setPendingFood(food);
      return;
    }
    if (result === "added") {
      setAnnouncement(`Đã thêm ${food.name} vào giỏ`);
    }
  };

  const confirmSwitch = () => {
    if (!pendingFood) return;
    replaceCartAndAdd(restaurant, pendingFood);
    setAnnouncement(`Đã đổi giỏ và thêm ${pendingFood.name}`);
    setPendingFood(null);
  };

  return (
    <section>
      <div className="restaurant-banner">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="eyebrow">Thực đơn đang phục vụ</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
            {restaurant.name}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            {restaurant.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
            <span className="trust-chip">{restaurant.address}</span>
            <span className="trust-chip">
              Phí giao {formatCurrency(restaurant.deliveryFee)}
            </span>
            <button type="button" className="trust-chip" onClick={openCart}>
              Mở giỏ hàng
            </button>
          </div>
        </div>
      </div>

      <div className="page-section">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <form className="search-bar" role="search" onSubmit={onSearch}>
            <label htmlFor="food-search" className="sr-only">
              Tìm món ăn
            </label>
            <span className="icon-search" aria-hidden="true" />
            <input
              id="food-search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tìm món trong thực đơn..."
            />
            <button type="submit">Tìm món</button>
          </form>
          <div className="flex flex-wrap gap-2" aria-label="Lọc loại món">
            <button
              type="button"
              className={`filter-chip ${categoryId === undefined ? "active" : ""}`}
              onClick={() => setCategoryId(undefined)}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`filter-chip ${categoryId === category.id ? "active" : ""}`}
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
        <div className="mt-8">
          {foods.length === 0 ? (
            <EmptyState
              title="Không có món phù hợp"
              message="Thử từ khóa hoặc loại món khác."
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {foods.map((food) => (
                <FoodCard key={food.id} food={food} onAdd={onAdd} />
              ))}
            </div>
          )}
        </div>
      </div>

      {pendingFood && currentRestaurant ? (
        <RestaurantSwitchModal
          currentRestaurant={currentRestaurant.name}
          nextRestaurant={restaurant.name}
          onCancel={cancelSwitch}
          onConfirm={confirmSwitch}
        />
      ) : null}
    </section>
  );
}
