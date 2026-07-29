/**
 * Public API types copied from docs/openapi.yaml.
 * Do not add display-only fields to these contract types.
 */
export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedSuccess<T> extends ApiSuccess<T[]> {
  pagination: Pagination;
}

export interface HealthResponse {
  success: true;
  message: string;
}

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

export interface CreateOrderRequest {
  restaurantId: number;
  customer: {
    fullName: string;
    phone: string;
    deliveryAddress: string;
  };
  note?: string;
  paymentMethod: "COD";
  items: Array<{
    foodId: number;
    quantity: number;
  }>;
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
