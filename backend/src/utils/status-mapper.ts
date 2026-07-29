import type { FoodStatus, OrderStatus } from "../types/domain.js";

const orderStatusMap = {
  "Cho xac nhan": "Chờ xác nhận",
  "Da xac nhan": "Đã xác nhận",
  "Dang xu ly": "Đang xử lý",
  "Da hoan thanh": "Hoàn thành",
  "Da huy": "Đã hủy",
} as const satisfies Record<string, OrderStatus>;

export const toOrderStatus = (value: string): OrderStatus => {
  const mapped = orderStatusMap[value as keyof typeof orderStatusMap];
  return mapped ?? "Chờ xác nhận";
};

export const toFoodStatus = (value: string): FoodStatus =>
  value === "Ngung ban" ? "NGUNG_BAN" : "CON_BAN";
