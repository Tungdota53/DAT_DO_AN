import { useEffect, useRef } from "react";

import { Link } from "../../routes/router";
import {
  cartSubtotal,
  useCartStore,
  useCartUiStore,
} from "../../stores/cart-store";
import { formatCurrency } from "../../utils/format";
import { EmptyState } from "../common/ResourceStates";

export function CartDrawer() {
  const isOpen = useCartUiStore((state) => state.isOpen);
  const close = useCartUiStore((state) => state.close);
  const { restaurant, items, increment, decrement, remove } = useCartStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [close, isOpen]);

  if (!isOpen) return null;
  const subtotal = cartSubtotal(items);

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={close}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="cart-drawer"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
              {restaurant?.name ?? "FoodGo"}
            </p>
            <h2
              id="cart-title"
              className="mt-1 text-xl font-black text-slate-950"
            >
              Giỏ hàng của bạn
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="icon-button"
            aria-label="Đóng giỏ hàng"
            onClick={close}
          >
            <span className="icon-close" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <EmptyState
              title="Giỏ hàng đang trống"
              message="Chọn một nhà hàng và thêm món bạn muốn."
            />
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.food.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">
                        {item.food.name}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-orange-600">
                        {formatCurrency(item.food.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-bold text-slate-500 hover:text-red-600"
                      onClick={() => remove(item.food.id)}
                    >
                      Xóa
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label={`Giảm ${item.food.name}`}
                        onClick={() => decrement(item.food.id)}
                      >
                        <span className="icon-minus" aria-hidden="true" />
                      </button>
                      <output aria-label={`Số lượng ${item.food.name}`}>
                        {item.quantity}
                      </output>
                      <button
                        type="button"
                        aria-label={`Tăng ${item.food.name}`}
                        onClick={() => increment(item.food.id)}
                      >
                        <span className="icon-plus" aria-hidden="true" />
                      </button>
                    </div>
                    <strong>
                      {formatCurrency(item.food.price * item.quantity)}
                    </strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && restaurant ? (
          <div className="border-t border-slate-200 bg-white px-5 py-5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tạm tính</span>
              <strong className="text-slate-950">
                {formatCurrency(subtotal)}
              </strong>
            </div>
            <div className="mt-2 flex justify-between text-sm text-slate-600">
              <span>Phí giao hàng dự kiến</span>
              <strong className="text-slate-950">
                {formatCurrency(restaurant.deliveryFee)}
              </strong>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Backend sẽ xác nhận giá và tổng tiền cuối cùng khi tạo đơn.
            </p>
            <Link
              to="/checkout"
              onClick={close}
              className="primary-button mt-4 w-full"
            >
              Tiếp tục thanh toán
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
