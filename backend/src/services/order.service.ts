import { AppError } from "../errors/app-error.js";
import { orderRepository } from "../repositories/order.repository.js";
import type { CreateOrderInput } from "../types/domain.js";

export class OrderService {
  public async create(input: CreateOrderInput) {
    const quantities = new Map<number, number>();
    for (const item of input.items) {
      quantities.set(
        item.foodId,
        (quantities.get(item.foodId) ?? 0) + item.quantity,
      );
    }
    const items = [...quantities.entries()].map(([foodId, quantity]) => ({
      foodId,
      quantity,
    }));
    if (items.some((item) => item.quantity > 99)) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Tổng số lượng của một món không được vượt quá 99",
      );
    }
    return orderRepository.create({ ...input, items });
  }

  public async getByIdAndPhone(orderId: number, phone: string) {
    const order = await orderRepository.findByIdAndPhone(orderId, phone);
    if (!order) {
      throw new AppError(
        404,
        "ORDER_NOT_FOUND",
        "Không tìm thấy đơn hàng khớp với số điện thoại",
      );
    }
    return order;
  }
}

export const orderService = new OrderService();
