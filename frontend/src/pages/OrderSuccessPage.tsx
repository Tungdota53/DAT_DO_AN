import { useCallback } from "react";

import { foodgoApi } from "../api/foodgo-api";
import { ApiRequestError } from "../api/http-client";
import { ErrorState, LoadingState } from "../components/common/ResourceStates";
import { OrderDetails } from "../components/order/OrderDetails";
import { useResource } from "../hooks/useResource";
import { Link } from "../routes/router";
import type { Order } from "../types/api";

const readSavedOrder = (orderId: number): Order | null => {
  try {
    const raw = window.sessionStorage.getItem("foodgo:last-order");
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Order>;
    return value.id === orderId ? (value as Order) : null;
  } catch {
    return null;
  }
};

export function OrderSuccessPage({ orderId }: { orderId: number }) {
  const loader = useCallback(async () => {
    const saved = readSavedOrder(orderId);
    if (saved) return saved;
    const phone = window.sessionStorage.getItem("foodgo:last-order-phone");
    if (!phone) {
      throw new ApiRequestError({
        success: false,
        message:
          "Phiên đặt món đã kết thúc. Hãy dùng mã đơn và số điện thoại để tra cứu.",
        errorCode: "ORDER_NOT_FOUND",
      });
    }
    return (await foodgoApi.getOrder(orderId, phone)).data;
  }, [orderId]);
  const order = useResource(loader);

  return (
    <section className="page-section">
      <div className="success-heading">
        <span className="success-mark" aria-hidden="true">
          <i className="icon-check" />
        </span>
        <span className="eyebrow">Backend đã xác nhận</span>
        <h1>Đặt món thành công</h1>
        <p>Mã đơn của bạn là #{orderId}. Hãy lưu mã này để tra cứu.</p>
      </div>

      <div className="mt-9">
        {order.status === "loading" ? (
          <LoadingState label="Đang tải đơn hàng" />
        ) : null}
        {order.status === "error" ? (
          <ErrorState message={order.error} onRetry={order.retry} />
        ) : null}
        {order.status === "success" ? (
          <OrderDetails order={order.data} />
        ) : null}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/restaurants" className="secondary-button">
          Đặt thêm món
        </Link>
        <Link to="/orders/lookup" className="primary-button">
          Tra cứu đơn
        </Link>
      </div>
    </section>
  );
}
