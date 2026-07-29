import { Router } from "express";

import {
  createAdminCategory,
  createAdminFood,
  createAdminRestaurant,
  deleteAdminCategory,
  deleteAdminFood,
  deleteAdminRestaurant,
  getAdminDashboard,
  listAdminCategories,
  listAdminCustomers,
  listAdminFoods,
  listAdminOrders,
  listAdminRestaurants,
  updateAdminCategory,
  updateAdminCustomer,
  updateAdminFood,
  updateAdminOrderStatus,
  updateAdminRestaurant,
  verifyAdminSession,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/admin-auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  adminCategorySchema,
  adminCustomerSchema,
  adminFoodSchema,
  adminFoodsQuerySchema,
  adminIdParamsSchema,
  adminOrdersQuerySchema,
  adminOrderStatusSchema,
  adminRestaurantSchema,
} from "../validation/schemas.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);
adminRouter.post("/session", verifyAdminSession);
adminRouter.get("/dashboard", getAdminDashboard);

adminRouter.get("/restaurants", listAdminRestaurants);
adminRouter.post(
  "/restaurants",
  validate({ body: adminRestaurantSchema }),
  createAdminRestaurant,
);
adminRouter.patch(
  "/restaurants/:id",
  validate({ params: adminIdParamsSchema, body: adminRestaurantSchema }),
  updateAdminRestaurant,
);
adminRouter.delete(
  "/restaurants/:id",
  validate({ params: adminIdParamsSchema }),
  deleteAdminRestaurant,
);

adminRouter.get("/categories", listAdminCategories);
adminRouter.post(
  "/categories",
  validate({ body: adminCategorySchema }),
  createAdminCategory,
);
adminRouter.patch(
  "/categories/:id",
  validate({ params: adminIdParamsSchema, body: adminCategorySchema }),
  updateAdminCategory,
);
adminRouter.delete(
  "/categories/:id",
  validate({ params: adminIdParamsSchema }),
  deleteAdminCategory,
);

adminRouter.get(
  "/foods",
  validate({ query: adminFoodsQuerySchema }),
  listAdminFoods,
);
adminRouter.post(
  "/foods",
  validate({ body: adminFoodSchema }),
  createAdminFood,
);
adminRouter.patch(
  "/foods/:id",
  validate({ params: adminIdParamsSchema, body: adminFoodSchema }),
  updateAdminFood,
);
adminRouter.delete(
  "/foods/:id",
  validate({ params: adminIdParamsSchema }),
  deleteAdminFood,
);

adminRouter.get(
  "/orders",
  validate({ query: adminOrdersQuerySchema }),
  listAdminOrders,
);
adminRouter.patch(
  "/orders/:id/status",
  validate({ params: adminIdParamsSchema, body: adminOrderStatusSchema }),
  updateAdminOrderStatus,
);

adminRouter.get("/customers", listAdminCustomers);
adminRouter.patch(
  "/customers/:id",
  validate({ params: adminIdParamsSchema, body: adminCustomerSchema }),
  updateAdminCustomer,
);
