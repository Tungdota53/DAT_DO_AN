import type { Order } from "../../types/api";
import { formatCurrency, formatDateTime } from "../../utils/format";

export function OrderDetails({ order }: { order: Order }) {
  const cancelled = order.status === "Đã hủy";
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="content-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Đơn hàng #{order.id}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {order.restaurant.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <span className={`status-badge ${cancelled ? "cancelled" : ""}`}>
            {order.status}
          </span>
        </div>

        <ul className="mt-6 divide-y divide-slate-100">
          {order.items.map((item) => (
            <li key={item.foodId} className="flex justify-between gap-4 py-4">
              <div>
                <strong className="text-slate-950">{item.foodName}</strong>
                <p className="mt-1 text-sm text-slate-500">
                  {item.quantity} × {formatCurrency(item.orderedPrice)}
                </p>
              </div>
              <strong>{formatCurrency(item.lineTotal)}</strong>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-3 border-t border-slate-200 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Tiền món</dt>
            <dd className="font-bold">{formatCurrency(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Phí giao hàng</dt>
            <dd className="font-bold">{formatCurrency(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between text-lg">
            <dt className="font-black">Tổng cộng</dt>
            <dd className="font-black text-orange-600">
              {formatCurrency(order.total)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="space-y-6">
        <section className="content-card">
          <h2 className="text-xl font-black text-slate-950">Trạng thái đơn</h2>
          <ol className="order-timeline mt-6">
            {order.timeline.map((event, index) => (
              <li key={`${event.status}-${event.occurredAt}`}>
                <span
                  className={cancelled ? "cancelled" : ""}
                  aria-hidden="true"
                >
                  <i className="icon-check" />
                </span>
                <div>
                  <strong>{event.status}</strong>
                  <time dateTime={event.occurredAt}>
                    {formatDateTime(event.occurredAt)}
                  </time>
                </div>
                {index < order.timeline.length - 1 ? (
                  <i aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="content-card">
          <h2 className="text-xl font-black text-slate-950">Giao đến</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Người nhận</dt>
              <dd className="mt-1 font-bold">{order.recipient.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Số điện thoại</dt>
              <dd className="mt-1 font-bold">{order.recipient.phone}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Địa chỉ</dt>
              <dd className="mt-1 font-bold">
                {order.recipient.deliveryAddress}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Thanh toán</dt>
              <dd className="mt-1 font-bold">Tiền mặt khi nhận hàng (COD)</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
