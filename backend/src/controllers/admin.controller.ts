import type { RequestHandler } from "express";

import { adminService } from "../services/admin.service.js";
import type {
  AdminCategoryBody,
  AdminCustomerBody,
  AdminFoodBody,
  AdminFoodsQuery,
  AdminIdParams,
  AdminOrdersQuery,
  AdminOrderStatusBody,
  AdminRestaurantBody,
} from "../validation/schemas.js";

export const verifyAdminSession: RequestHandler = (_request, response) => {
  response.json({
    success: true,
    data: { authenticated: true },
  });
};

export const getAdminDashboard: RequestHandler = async (_request, response) => {
  response.json({ success: true, data: await adminService.getDashboard() });
};

export const listAdminRestaurants: RequestHandler = async (
  _request,
  response,
) => {
  response.json({ success: true, data: await adminService.listRestaurants() });
};

export const createAdminRestaurant: RequestHandler = async (
  request,
  response,
) => {
  const body = request.validated.body as AdminRestaurantBody;
  const data = await adminService.createRestaurant(body);
  response.status(201).json({ success: true, data });
};

export const updateAdminRestaurant: RequestHandler = async (
  request,
  response,
) => {
  const { id } = request.validated.params as AdminIdParams;
  const body = request.validated.body as AdminRestaurantBody;
  response.json({
    success: true,
    data: await adminService.updateRestaurant(id, body),
  });
};

export const deleteAdminRestaurant: RequestHandler = async (
  request,
  response,
) => {
  const { id } = request.validated.params as AdminIdParams;
  await adminService.deleteRestaurant(id);
  response.status(204).send();
};

export const listAdminCategories: RequestHandler = async (
  _request,
  response,
) => {
  response.json({ success: true, data: await adminService.listCategories() });
};

export const createAdminCategory: RequestHandler = async (
  request,
  response,
) => {
  const body = request.validated.body as AdminCategoryBody;
  const data = await adminService.createCategory(body);
  response.status(201).json({ success: true, data });
};

export const updateAdminCategory: RequestHandler = async (
  request,
  response,
) => {
  const { id } = request.validated.params as AdminIdParams;
  const body = request.validated.body as AdminCategoryBody;
  response.json({
    success: true,
    data: await adminService.updateCategory(id, body),
  });
};

export const deleteAdminCategory: RequestHandler = async (
  request,
  response,
) => {
  const { id } = request.validated.params as AdminIdParams;
  await adminService.deleteCategory(id);
  response.status(204).send();
};

export const listAdminFoods: RequestHandler = async (request, response) => {
  const query = request.validated.query as AdminFoodsQuery;
  response.json({
    success: true,
    data: await adminService.listFoods(query.restaurantId),
  });
};

export const createAdminFood: RequestHandler = async (request, response) => {
  const body = request.validated.body as AdminFoodBody;
  const data = await adminService.createFood(body);
  response.status(201).json({ success: true, data });
};

export const updateAdminFood: RequestHandler = async (request, response) => {
  const { id } = request.validated.params as AdminIdParams;
  const body = request.validated.body as AdminFoodBody;
  response.json({
    success: true,
    data: await adminService.updateFood(id, body),
  });
};

export const deleteAdminFood: RequestHandler = async (request, response) => {
  const { id } = request.validated.params as AdminIdParams;
  await adminService.deleteFood(id);
  response.status(204).send();
};

export const listAdminOrders: RequestHandler = async (request, response) => {
  const query = request.validated.query as AdminOrdersQuery;
  response.json({
    success: true,
    data: await adminService.listOrders(query),
  });
};

export const updateAdminOrderStatus: RequestHandler = async (
  request,
  response,
) => {
  const { id } = request.validated.params as AdminIdParams;
  const { status } = request.validated.body as AdminOrderStatusBody;
  response.json({
    success: true,
    data: await adminService.updateOrderStatus(id, status),
  });
};

export const listAdminCustomers: RequestHandler = async (
  _request,
  response,
) => {
  response.json({ success: true, data: await adminService.listCustomers() });
};

export const updateAdminCustomer: RequestHandler = async (
  request,
  response,
) => {
  const { id } = request.validated.params as AdminIdParams;
  const body = request.validated.body as AdminCustomerBody;
  response.json({
    success: true,
    data: await adminService.updateCustomer(id, body),
  });
};

export const deleteAdminCustomer: RequestHandler = async (
  request,
  response,
) => {
  const { id } = request.validated.params as AdminIdParams;
  await adminService.deleteCustomer(id);
  response.status(204).send();
};
