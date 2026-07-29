import { Router } from "express";

import {
  getRestaurant,
  listRestaurantCategories,
  listRestaurantFoods,
  listRestaurants,
} from "../controllers/restaurant.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  foodListQuerySchema,
  paginationQuerySchema,
  restaurantParamsSchema,
} from "../validation/schemas.js";

export const restaurantRouter = Router();

restaurantRouter.get(
  "/",
  validate({ query: paginationQuerySchema }),
  listRestaurants,
);
restaurantRouter.get(
  "/:restaurantId",
  validate({ params: restaurantParamsSchema }),
  getRestaurant,
);
restaurantRouter.get(
  "/:restaurantId/categories",
  validate({ params: restaurantParamsSchema }),
  listRestaurantCategories,
);
restaurantRouter.get(
  "/:restaurantId/foods",
  validate({ params: restaurantParamsSchema, query: foodListQuerySchema }),
  listRestaurantFoods,
);
