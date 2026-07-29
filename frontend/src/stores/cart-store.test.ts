import { beforeEach, describe, expect, it } from "vitest";

import type { Food, Restaurant } from "../types/api";
import { parseStoredCart, useCartStore } from "./cart-store";

const restaurant: Restaurant = {
  id: 1,
  name: "Bếp Việt",
  address: "Quận 1",
  phone: "0901000001",
  description: null,
  deliveryFee: 15000,
  availableFoodCount: 2,
  minPrice: 25000,
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

describe("cart store", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("adds, increments and never decrements quantity below one", () => {
    expect(useCartStore.getState().addItem(restaurant, food)).toBe("added");
    useCartStore.getState().increment(food.id);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    useCartStore.getState().decrement(food.id);
    useCartStore.getState().decrement(food.id);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
  });

  it("requires confirmation for another restaurant and blocks unavailable food", () => {
    useCartStore.getState().addItem(restaurant, food);
    expect(
      useCartStore.getState().addItem(
        { ...restaurant, id: 2, name: "Pizza House" },
        {
          ...food,
          id: 2,
          restaurantId: 2,
        },
      ),
    ).toBe("different-restaurant");
    expect(
      useCartStore
        .getState()
        .addItem(restaurant, { ...food, status: "NGUNG_BAN" }),
    ).toBe("unavailable");
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("falls back safely when localStorage data is corrupt", () => {
    expect(parseStoredCart("{broken")).toEqual({ restaurant: null, items: [] });
    expect(parseStoredCart(JSON.stringify({ restaurant, items: [] }))).toEqual({
      restaurant: null,
      items: [],
    });
  });
});
