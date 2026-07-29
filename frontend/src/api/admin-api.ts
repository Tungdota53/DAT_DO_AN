import type { ApiSuccess, OrderStatus } from "../types/api";
import type {
  AdminCategory,
  AdminCustomer,
  AdminDashboard,
  AdminFood,
  AdminOrder,
  AdminOrderPage,
  AdminRestaurant,
  CategoryMutation,
  CustomerMutation,
  FoodMutation,
  RestaurantMutation,
} from "../types/admin";
import { request } from "./http-client";

const auth = (key: string) => ({ "x-admin-key": key });

export interface AdminOrderListQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export const adminApi = {
  verifySession: (key: string) =>
    request<ApiSuccess<{ authenticated: true }>>({
      method: "POST",
      url: "/admin/session",
      headers: auth(key),
    }),

  getDashboard: (key: string) =>
    request<ApiSuccess<AdminDashboard>>({
      method: "GET",
      url: "/admin/dashboard",
      headers: auth(key),
    }),

  listRestaurants: (key: string) =>
    request<ApiSuccess<AdminRestaurant[]>>({
      method: "GET",
      url: "/admin/restaurants",
      headers: auth(key),
    }),

  createRestaurant: (key: string, data: RestaurantMutation) =>
    request<ApiSuccess<AdminRestaurant>>({
      method: "POST",
      url: "/admin/restaurants",
      headers: auth(key),
      data,
    }),

  updateRestaurant: (
    key: string,
    id: number,
    data: RestaurantMutation,
  ) =>
    request<ApiSuccess<AdminRestaurant>>({
      method: "PATCH",
      url: `/admin/restaurants/${id}`,
      headers: auth(key),
      data,
    }),

  deleteRestaurant: (key: string, id: number) =>
    request<void>({
      method: "DELETE",
      url: `/admin/restaurants/${id}`,
      headers: auth(key),
    }),

  listCategories: (key: string) =>
    request<ApiSuccess<AdminCategory[]>>({
      method: "GET",
      url: "/admin/categories",
      headers: auth(key),
    }),

  createCategory: (key: string, data: CategoryMutation) =>
    request<ApiSuccess<AdminCategory>>({
      method: "POST",
      url: "/admin/categories",
      headers: auth(key),
      data,
    }),

  updateCategory: (key: string, id: number, data: CategoryMutation) =>
    request<ApiSuccess<AdminCategory>>({
      method: "PATCH",
      url: `/admin/categories/${id}`,
      headers: auth(key),
      data,
    }),

  deleteCategory: (key: string, id: number) =>
    request<void>({
      method: "DELETE",
      url: `/admin/categories/${id}`,
      headers: auth(key),
    }),

  listFoods: (key: string, restaurantId?: number) =>
    request<ApiSuccess<AdminFood[]>>({
      method: "GET",
      url: "/admin/foods",
      headers: auth(key),
      params: restaurantId ? { restaurantId } : undefined,
    }),

  createFood: (key: string, data: FoodMutation) =>
    request<ApiSuccess<AdminFood>>({
      method: "POST",
      url: "/admin/foods",
      headers: auth(key),
      data,
    }),

  updateFood: (key: string, id: number, data: FoodMutation) =>
    request<ApiSuccess<AdminFood>>({
      method: "PATCH",
      url: `/admin/foods/${id}`,
      headers: auth(key),
      data,
    }),

  deleteFood: (key: string, id: number) =>
    request<void>({
      method: "DELETE",
      url: `/admin/foods/${id}`,
      headers: auth(key),
    }),

  listOrders: (key: string, query?: AdminOrderListQuery) =>
    request<ApiSuccess<AdminOrderPage>>({
      method: "GET",
      url: "/admin/orders",
      headers: auth(key),
      params: query,
    }),

  updateOrderStatus: (key: string, id: number, status: OrderStatus) =>
    request<ApiSuccess<AdminOrder>>({
      method: "PATCH",
      url: `/admin/orders/${id}/status`,
      headers: auth(key),
      data: { status },
    }),

  listCustomers: (key: string) =>
    request<ApiSuccess<AdminCustomer[]>>({
      method: "GET",
      url: "/admin/customers",
      headers: auth(key),
    }),

  updateCustomer: (key: string, id: number, data: CustomerMutation) =>
    request<ApiSuccess<AdminCustomer>>({
      method: "PATCH",
      url: `/admin/customers/${id}`,
      headers: auth(key),
      data,
    }),
};
