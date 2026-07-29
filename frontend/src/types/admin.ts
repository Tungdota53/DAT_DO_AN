import type {
  FoodStatus,
  OrderStatus,
  Restaurant,
} from "./api";

export interface AdminCategory {
  id: number;
  name: string;
  foodCount: number;
}

export interface AdminFood {
  id: number;
  restaurantId: number;
  restaurantName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string | null;
  price: number;
  status: FoodStatus;
}

export interface AdminOrder {
  id: number;
  createdAt: string;
  status: OrderStatus;
  restaurantId: number;
  restaurantName: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  itemCount: number;
  total: number;
}

export interface AdminOrderPage {
  items: AdminOrder[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCustomer {
  id: number;
  name: string;
  phone: string;
  deliveryAddress: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export interface AdminDashboard {
  restaurantCount: number;
  foodCount: number;
  customerCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedRevenue: number;
  recentOrders: AdminOrder[];
}

export type AdminRestaurant = Restaurant;

export interface RestaurantMutation {
  name: string;
  address: string;
  phone: string;
  description: string | null;
  deliveryFee: number;
}

export interface CategoryMutation {
  name: string;
}

export interface FoodMutation {
  restaurantId: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: number;
  status: FoodStatus;
}

export interface CustomerMutation {
  name: string;
  phone: string;
  deliveryAddress: string;
}
