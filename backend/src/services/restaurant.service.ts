import { AppError } from "../errors/app-error.js";
import {
  restaurantRepository,
  type ListFoodsInput,
  type ListRestaurantsInput,
} from "../repositories/restaurant.repository.js";

const paginationFor = (page: number, limit: number, totalItems: number) => ({
  page,
  limit,
  totalItems,
  totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
});

export class RestaurantService {
  public async list(input: ListRestaurantsInput) {
    const result = await restaurantRepository.list(input);
    return {
      data: result.items,
      pagination: paginationFor(input.page, input.limit, result.totalItems),
    };
  }

  public async getById(restaurantId: number) {
    const restaurant = await restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new AppError(
        404,
        "RESTAURANT_NOT_FOUND",
        "Không tìm thấy nhà hàng",
      );
    }
    return restaurant;
  }

  public async listCategories(restaurantId: number) {
    await this.getById(restaurantId);
    return restaurantRepository.listCategories(restaurantId);
  }

  public async listFoods(input: ListFoodsInput) {
    await this.getById(input.restaurantId);
    const result = await restaurantRepository.listFoods(input);
    return {
      data: result.items,
      pagination: paginationFor(input.page, input.limit, result.totalItems),
    };
  }
}

export const restaurantService = new RestaurantService();
