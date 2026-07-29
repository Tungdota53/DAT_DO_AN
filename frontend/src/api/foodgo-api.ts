import type {
  ApiSuccess,
  CreateOrderRequest,
  Food,
  FoodCategory,
  FoodStatus,
  Order,
  PaginatedSuccess,
  Restaurant,
} from "../types/api";
import { request } from "./http-client";

export interface RestaurantListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FoodListParams extends RestaurantListParams {
  categoryId?: number;
  status?: FoodStatus;
}

export const foodgoApi = {
  listRestaurants: (params: RestaurantListParams = {}) =>
    request<PaginatedSuccess<Restaurant>>({
      method: "GET",
      url: "/restaurants",
      params,
    }),

  getRestaurant: (restaurantId: number) =>
    request<ApiSuccess<Restaurant>>({
      method: "GET",
      url: `/restaurants/${restaurantId}`,
    }),

  listRestaurantCategories: (restaurantId: number) =>
    request<ApiSuccess<FoodCategory[]>>({
      method: "GET",
      url: `/restaurants/${restaurantId}/categories`,
    }),

  listRestaurantFoods: (restaurantId: number, params: FoodListParams = {}) =>
    request<PaginatedSuccess<Food>>({
      method: "GET",
      url: `/restaurants/${restaurantId}/foods`,
      params,
    }),

  createOrder: (body: CreateOrderRequest) =>
    request<ApiSuccess<Order>>({
      method: "POST",
      url: "/orders",
      data: body,
    }),

  getOrder: (orderId: number, phone: string) =>
    request<ApiSuccess<Order>>({
      method: "GET",
      url: `/orders/${orderId}`,
      params: { phone },
    }),
};
