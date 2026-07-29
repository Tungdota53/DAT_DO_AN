import { type FormEvent, useRef, useState } from "react";

import { foodgoApi } from "../api/foodgo-api";
import { toApiRequestError } from "../api/http-client";
import { EmptyState } from "../components/common/ResourceStates";
import { OrderDetails } from "../components/order/OrderDetails";
import type { Order } from "../types/api";

export function OrderLookupPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    const numericId = Number(orderId);
    const normalizedPhone = phone.replace(/[\s.-]/g, "");
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setError("Mã đơn phải là số nguyên dương.");
      return;
    }
    if (!/^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
      setError("Số điện thoại Việt Nam không hợp lệ.");
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const response = await foodgoApi.getOrder(numericId, normalizedPhone);
      setOrder(response.data);
    } catch (lookupError) {
      setError(toApiRequestError(lookupError).message);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Theo dõi đơn hàng</span>
        <h1>Tra cứu trạng thái giao món</h1>
        <p>Nhập mã đơn và đúng số điện thoại đã dùng khi checkout.</p>
      </div>

      <form
        className="lookup-form mt-8"
        onSubmit={(event) => void onSubmit(event)}
      >
        <label className="form-field">
          <span>Mã đơn</span>
          <input
            inputMode="numeric"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Ví dụ: 2"
          />
        </label>
        <label className="form-field">
          <span>Số điện thoại</span>
          <input
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0909999999"
          />
        </label>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Đang tra cứu..." : "Tra cứu đơn"}
        </button>
      </form>

      <div className="mt-9" aria-live="polite">
        {error ? (
          <EmptyState title="Chưa tìm thấy đơn" message={error} />
        ) : null}
        {order ? <OrderDetails order={order} /> : null}
      </div>
    </section>
  );
}
