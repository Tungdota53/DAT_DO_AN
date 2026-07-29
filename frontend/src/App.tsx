import { useEffect } from "react";

import { AppShell } from "./components/layout/AppShell";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderLookupPage } from "./pages/OrderLookupPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { RestaurantDetailPage } from "./pages/RestaurantDetailPage";
import { RestaurantsPage } from "./pages/RestaurantsPage";
import { usePathname } from "./routes/history";

function resolvePage(pathname: string) {
  if (pathname === "/admin") return <AdminPage />;
  if (pathname === "/") return <HomePage />;
  if (pathname === "/restaurants") return <RestaurantsPage />;
  if (pathname === "/checkout") return <CheckoutPage />;
  if (pathname === "/orders/lookup") return <OrderLookupPage />;

  const restaurantMatch = /^\/restaurants\/(\d+)$/.exec(pathname);
  if (restaurantMatch?.[1]) {
    return <RestaurantDetailPage restaurantId={Number(restaurantMatch[1])} />;
  }

  const successMatch = /^\/order-success\/(\d+)$/.exec(pathname);
  if (successMatch?.[1]) {
    return <OrderSuccessPage orderId={Number(successMatch[1])} />;
  }

  return <NotFoundPage />;
}

export default function App() {
  const { pathname } = usePathname();

  useEffect(() => {
    document.title =
      pathname === "/"
        ? "FoodGo · Đặt món giao tận nơi"
        : pathname === "/admin"
          ? "FoodGo Admin · Quản trị"
          : "FoodGo";
  }, [pathname]);

  if (pathname === "/admin") return <AdminPage />;

  return <AppShell>{resolvePage(pathname)}</AppShell>;
}
