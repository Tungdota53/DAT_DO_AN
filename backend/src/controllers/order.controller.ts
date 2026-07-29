import type { RequestHandler } from "express";

import { orderService } from "../services/order.service.js";
import type {
  CreateOrderBody,
  OrderLookupParams,
  OrderLookupQuery,
} from "../validation/schemas.js";

export const createOrder: RequestHandler = async (request, response) => {
  const body = request.validated.body as CreateOrderBody;
  const data = await orderService.create(body);
  response.status(201).json({
    success: true,
    message: "Đặt món thành công",
    data,
  });
};

export const getOrder: RequestHandler = async (request, response) => {
  const { orderId } = request.validated.params as OrderLookupParams;
  const { phone } = request.validated.query as OrderLookupQuery;
  const data = await orderService.getByIdAndPhone(orderId, phone);
  response.json({ success: true, data });
};
