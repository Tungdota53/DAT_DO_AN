import { AppError } from "../errors/app-error.js";
import { adminRepository } from "../repositories/admin.repository.js";
import type { AdminOrdersQuery } from "../validation/schemas.js";
import type {
  CategoryMutation,
  CustomerMutation,
  FoodMutation,
  RestaurantMutation,
} from "../types/admin.js";
import type { OrderStatus } from "../types/domain.js";

const requireResult = <T>(
  value: T | null,
  errorCode:
    | "RESTAURANT_NOT_FOUND"
    | "CATEGORY_NOT_FOUND"
    | "FOOD_NOT_FOUND"
    | "CUSTOMER_NOT_FOUND"
    | "ORDER_NOT_FOUND",
  message: string,
) => {
  if (!value) throw new AppError(404, errorCode, message);
  return value;
};

export class AdminService {
  public getDashboard() {
    return adminRepository.getDashboard();
  }

  public listRestaurants() {
    return adminRepository.listRestaurants();
  }

  public createRestaurant(input: RestaurantMutation) {
    return adminRepository.createRestaurant(input);
  }

  public async updateRestaurant(id: number, input: RestaurantMutation) {
    return requireResult(
      await adminRepository.updateRestaurant(id, input),
      "RESTAURANT_NOT_FOUND",
      "Không tìm thấy nhà hàng",
    );
  }

  public async deleteRestaurant(id: number) {
    const deleted = await adminRepository.deleteRestaurant(id);
    if (!deleted) {
      throw new AppError(
        404,
        "RESTAURANT_NOT_FOUND",
        "Không tìm thấy nhà hàng",
      );
    }
  }

  public listCategories() {
    return adminRepository.listCategories();
  }

  public createCategory(input: CategoryMutation) {
    return adminRepository.createCategory(input);
  }

  public async updateCategory(id: number, input: CategoryMutation) {
    return requireResult(
      await adminRepository.updateCategory(id, input),
      "CATEGORY_NOT_FOUND",
      "Không tìm thấy danh mục",
    );
  }

  public async deleteCategory(id: number) {
    const deleted = await adminRepository.deleteCategory(id);
    if (!deleted) {
      throw new AppError(
        404,
        "CATEGORY_NOT_FOUND",
        "Không tìm thấy danh mục",
      );
    }
  }

  public listFoods(restaurantId?: number) {
    return adminRepository.listFoods(restaurantId);
  }

  public createFood(input: FoodMutation) {
    return adminRepository.createFood(input);
  }

  public async updateFood(id: number, input: FoodMutation) {
    return requireResult(
      await adminRepository.updateFood(id, input),
      "FOOD_NOT_FOUND",
      "Không tìm thấy món ăn",
    );
  }

  public async deleteFood(id: number) {
    const deleted = await adminRepository.deleteFood(id);
    if (!deleted) {
      throw new AppError(404, "FOOD_NOT_FOUND", "Không tìm thấy món ăn");
    }
  }

  public listOrders(query: AdminOrdersQuery) {
    return adminRepository.listOrders(query);
  }

  public async updateOrderStatus(id: number, status: OrderStatus) {
    return requireResult(
      await adminRepository.updateOrderStatus(id, status),
      "ORDER_NOT_FOUND",
      "Không tìm thấy đơn hàng",
    );
  }

  public listCustomers() {
    return adminRepository.listCustomers();
  }

  public async updateCustomer(id: number, input: CustomerMutation) {
    return requireResult(
      await adminRepository.updateCustomer(id, input),
      "CUSTOMER_NOT_FOUND",
      "Không tìm thấy khách hàng",
    );
  }
}

export const adminService = new AdminService();
