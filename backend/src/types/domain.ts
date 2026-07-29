export type FoodStatus = "CON_BAN" | "NGUNG_BAN";

export type OrderStatus =
  | "Chờ xác nhận"
  | "Đã xác nhận"
  | "Đang xử lý"
  | "Hoàn thành"
  | "Đã hủy";

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  deliveryFee: number;
  availableFoodCount: number;
  minPrice: number | null;
}

export interface FoodCategory {
  id: number;
  name: string;
}

export interface Food {
  id: number;
  restaurantId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string | null;
  price: number;
  status: FoodStatus;
}

export interface OrderItem {
  foodId: number;
  foodName: string;
  quantity: number;
  orderedPrice: number;
  lineTotal: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  occurredAt: string;
}

export interface Order {
  id: number;
  createdAt: string;
  status: OrderStatus;
  restaurant: {
    id: number;
    name: string;
    phone: string;
  };
  recipient: {
    fullName: string;
    phone: string;
    deliveryAddress: string;
  };
  note: string | null;
  paymentMethod: "COD";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  timeline: OrderTimelineEvent[];
}

export interface CreateOrderInput {
  restaurantId: number;
  customer: {
    fullName: string;
    phone: string;
    deliveryAddress: string;
  };
  note?: string | undefined;
  paymentMethod: "COD";
  items: Array<{
    foodId: number;
    quantity: number;
  }>;
}
