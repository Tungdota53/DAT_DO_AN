import type { OrderStatus } from "../types/domain.js";

const allowedOrderTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
  "Đã xác nhận": ["Đang xử lý", "Đã hủy"],
  "Đang xử lý": ["Hoàn thành", "Đã hủy"],
  "Hoàn thành": [],
  "Đã hủy": [],
};

export const isOrderStatusTransitionAllowed = (
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) =>
  currentStatus === nextStatus ||
  allowedOrderTransitions[currentStatus].includes(nextStatus);
