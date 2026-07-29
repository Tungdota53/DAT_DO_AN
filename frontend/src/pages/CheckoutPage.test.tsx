import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { foodgoApi } from "../api/foodgo-api";
import { useCartStore } from "../stores/cart-store";
import type { Food, Order, Restaurant } from "../types/api";
import { CheckoutPage } from "./CheckoutPage";

const restaurant: Restaurant = {
  id: 1,
  name: "Bếp Việt",
  address: "12 Nguyễn Trãi",
  phone: "0901000001",
  description: null,
  deliveryFee: 15000,
  availableFoodCount: 1,
  minPrice: 45000,
};
const food: Food = {
  id: 1,
  restaurantId: 1,
  categoryId: 1,
  categoryName: "Món chính",
  name: "Cơm gà",
  description: null,
  price: 45000,
  status: "CON_BAN",
};
const order: Order = {
  id: 9,
  createdAt: new Date().toISOString(),
  status: "Chờ xác nhận",
  restaurant: { id: 1, name: "Bếp Việt", phone: "0901000001" },
  recipient: {
    fullName: "Nguyễn Văn An",
    phone: "0909999999",
    deliveryAddress: "123 Nguyễn Trãi, Quận 1",
  },
  note: null,
  paymentMethod: "COD",
  items: [
    {
      foodId: 1,
      foodName: "Cơm gà",
      quantity: 1,
      orderedPrice: 45000,
      lineTotal: 45000,
    },
  ],
  subtotal: 45000,
  deliveryFee: 15000,
  total: 60000,
  timeline: [{ status: "Chờ xác nhận", occurredAt: new Date().toISOString() }],
};

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCartStore.getState().clear();
    useCartStore.getState().addItem(restaurant, food);
  });

  it("validates required customer fields", () => {
    render(<CheckoutPage />);
    fireEvent.click(screen.getByRole("button", { name: "Đặt món COD" }));
    expect(screen.getByText("Vui lòng nhập họ tên.")).toBeInTheDocument();
    expect(
      screen.getByText("Số điện thoại Việt Nam không hợp lệ."),
    ).toBeInTheDocument();
  });

  it("sends no price fields and clears the cart only after success", async () => {
    const createOrder = vi
      .spyOn(foodgoApi, "createOrder")
      .mockResolvedValue({ success: true, data: order });
    render(<CheckoutPage />);

    fireEvent.change(screen.getByLabelText("Họ và tên"), {
      target: { value: "Nguyễn Văn An" },
    });
    fireEvent.change(screen.getByLabelText("Số điện thoại"), {
      target: { value: "0909999999" },
    });
    fireEvent.change(screen.getByLabelText("Địa chỉ giao hàng"), {
      target: { value: "123 Nguyễn Trãi, Quận 1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đặt món COD" }));

    await waitFor(() => expect(createOrder).toHaveBeenCalledOnce());
    const payload = createOrder.mock.calls[0]?.[0];
    expect(JSON.stringify(payload)).not.toMatch(
      /"price"|"subtotal"|"deliveryFee"|"total"|"status"/,
    );
    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(0));
  });
});
