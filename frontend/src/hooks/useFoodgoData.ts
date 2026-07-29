import { useCallback } from "react";

import { foodgoApi } from "../api/foodgo-api";
import type { FoodStatus } from "../types/api";
import { useResource } from "./useResource";

export function useRestaurants(search = "", limit = 12) {
  const loader = useCallback(
    () => foodgoApi.listRestaurants({ page: 1, limit, search }),
    [limit, search],
  );
  return useResource(loader);
}

export function useRestaurantMenu(
  restaurantId: number,
  search: string,
  categoryId?: number,
  status?: FoodStatus,
) {
  const loader = useCallback(
    () =>
      Promise.all([
        foodgoApi.getRestaurant(restaurantId),
        foodgoApi.listRestaurantCategories(restaurantId),
        foodgoApi.listRestaurantFoods(restaurantId, {
          page: 1,
          limit: 50,
          search,
          ...(categoryId ? { categoryId } : {}),
          ...(status ? { status } : {}),
        }),
      ]).then(([restaurant, categories, foods]) => ({
        restaurant: restaurant.data,
        categories: categories.data,
        foods: foods.data,
        pagination: foods.pagination,
      })),
    [categoryId, restaurantId, search, status],
  );
  return useResource(loader);
}
