import { create } from "zustand";

import type { Food, Restaurant } from "../types/api";

const CART_STORAGE_KEY = "foodgo:cart:v1";

export interface CartRestaurant {
  id: number;
  name: string;
  deliveryFee: number;
}

export interface CartItem {
  food: Food;
  quantity: number;
}

interface CartSnapshot {
  restaurant: CartRestaurant | null;
  items: CartItem[];
}

type AddResult = "added" | "different-restaurant" | "unavailable";

interface CartStore extends CartSnapshot {
  addItem: (restaurant: Restaurant, food: Food) => AddResult;
  replaceCartAndAdd: (restaurant: Restaurant, food: Food) => void;
  increment: (foodId: number) => void;
  decrement: (foodId: number) => void;
  remove: (foodId: number) => void;
  clear: () => void;
}

const emptyCart: CartSnapshot = { restaurant: null, items: [] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCartRestaurant = (value: unknown): value is CartRestaurant =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.name === "string" &&
  typeof value.deliveryFee === "number";

const isFood = (value: unknown): value is Food =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.restaurantId === "number" &&
  typeof value.categoryId === "number" &&
  typeof value.categoryName === "string" &&
  typeof value.name === "string" &&
  (typeof value.description === "string" || value.description === null) &&
  typeof value.price === "number" &&
  (value.status === "CON_BAN" || value.status === "NGUNG_BAN");

const isCartItem = (value: unknown): value is CartItem =>
  isRecord(value) &&
  isFood(value.food) &&
  typeof value.quantity === "number" &&
  Number.isInteger(value.quantity) &&
  value.quantity >= 1 &&
  value.quantity <= 99;

export const parseStoredCart = (value: string | null): CartSnapshot => {
  if (!value) return emptyCart;
  try {
    const candidate: unknown = JSON.parse(value);
    const restaurant = isRecord(candidate) ? candidate.restaurant : null;
    if (
      !isRecord(candidate) ||
      !isCartRestaurant(restaurant) ||
      !Array.isArray(candidate.items) ||
      !candidate.items.every(isCartItem) ||
      candidate.items.length === 0 ||
      candidate.items.some((item) => item.food.restaurantId !== restaurant.id)
    ) {
      return emptyCart;
    }
    return {
      restaurant,
      items: candidate.items,
    };
  } catch {
    return emptyCart;
  }
};

const loadCart = () =>
  typeof window === "undefined"
    ? emptyCart
    : parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));

const saveCart = (snapshot: CartSnapshot) => {
  if (typeof window === "undefined") return;
  if (!snapshot.restaurant || snapshot.items.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(snapshot));
};

const cartRestaurantFrom = (restaurant: Restaurant): CartRestaurant => ({
  id: restaurant.id,
  name: restaurant.name,
  deliveryFee: restaurant.deliveryFee,
});

export const useCartStore = create<CartStore>((set, get) => ({
  ...loadCart(),

  addItem: (restaurant, food) => {
    if (food.status === "NGUNG_BAN") return "unavailable";
    const current = get();
    if (current.restaurant && current.restaurant.id !== restaurant.id) {
      return "different-restaurant";
    }
    const existing = current.items.find((item) => item.food.id === food.id);
    const items = existing
      ? current.items.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: Math.min(99, item.quantity + 1) }
            : item,
        )
      : [...current.items, { food, quantity: 1 }];
    const snapshot = {
      restaurant: current.restaurant ?? cartRestaurantFrom(restaurant),
      items,
    };
    saveCart(snapshot);
    set(snapshot);
    return "added";
  },

  replaceCartAndAdd: (restaurant, food) => {
    if (food.status === "NGUNG_BAN") return;
    const snapshot = {
      restaurant: cartRestaurantFrom(restaurant),
      items: [{ food, quantity: 1 }],
    };
    saveCart(snapshot);
    set(snapshot);
  },

  increment: (foodId) => {
    const current = get();
    const snapshot = {
      restaurant: current.restaurant,
      items: current.items.map((item) =>
        item.food.id === foodId
          ? { ...item, quantity: Math.min(99, item.quantity + 1) }
          : item,
      ),
    };
    saveCart(snapshot);
    set(snapshot);
  },

  decrement: (foodId) => {
    const current = get();
    const snapshot = {
      restaurant: current.restaurant,
      items: current.items.map((item) =>
        item.food.id === foodId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    };
    saveCart(snapshot);
    set(snapshot);
  },

  remove: (foodId) => {
    const current = get();
    const items = current.items.filter((item) => item.food.id !== foodId);
    const snapshot = {
      restaurant: items.length === 0 ? null : current.restaurant,
      items,
    };
    saveCart(snapshot);
    set(snapshot);
  },

  clear: () => {
    saveCart(emptyCart);
    set(emptyCart);
  },
}));

interface CartUiStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCartUiStore = create<CartUiStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.food.price * item.quantity, 0);
