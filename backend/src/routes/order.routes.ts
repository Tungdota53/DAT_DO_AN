import { Router } from "express";

import { createOrder, getOrder } from "../controllers/order.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  orderLookupParamsSchema,
  orderLookupQuerySchema,
} from "../validation/schemas.js";

export const orderRouter = Router();

orderRouter.post("/", validate({ body: createOrderSchema }), createOrder);
orderRouter.get(
  "/:orderId",
  validate({
    params: orderLookupParamsSchema,
    query: orderLookupQuerySchema,
  }),
  getOrder,
);
