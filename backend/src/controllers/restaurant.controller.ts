import type { RequestHandler } from "express";

import { restaurantService } from "../services/restaurant.service.js";
import type {
  FoodListQuery,
  RestaurantListQuery,
  RestaurantParams,
} from "../validation/schemas.js";

export const listRestaurants: RequestHandler = async (request, response) => {
  const query = request.validated.query as RestaurantListQuery;
  const result = await restaurantService.list(query);
  response.json({ success: true, ...result });
};

export const getRestaurant: RequestHandler = async (request, response) => {
  const { restaurantId } = request.validated.params as RestaurantParams;
  const data = await restaurantService.getById(restaurantId);
  response.json({ success: true, data });
};

export const listRestaurantCategories: RequestHandler = async (
  request,
  response,
) => {
  const { restaurantId } = request.validated.params as RestaurantParams;
  const data = await restaurantService.listCategories(restaurantId);
  response.json({ success: true, data });
};

export const listRestaurantFoods: RequestHandler = async (
  request,
  response,
) => {
  const { restaurantId } = request.validated.params as RestaurantParams;
  const query = request.validated.query as FoodListQuery;
  const result = await restaurantService.listFoods({ restaurantId, ...query });
  response.json({ success: true, ...result });
};
