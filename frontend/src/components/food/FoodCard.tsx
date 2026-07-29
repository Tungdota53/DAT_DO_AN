import {
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Food } from "../../types/api";
import { formatCurrency } from "../../utils/format";

export function FoodCard({
  food,
  onAdd,
}: {
  food: Food;
  onAdd: (food: Food, trigger: HTMLButtonElement) => boolean | void;
}) {
  const unavailable = food.status === "NGUNG_BAN";
  const [isAdded, setIsAdded] = useState(false);
  const feedbackTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (feedbackTimer.current !== null) {
        window.clearTimeout(feedbackTimer.current);
      }
    },
    [],
  );

  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    const didAdd = onAdd(food, event.currentTarget);
    if (!didAdd) return;

    setIsAdded(true);
    if (feedbackTimer.current !== null) {
      window.clearTimeout(feedbackTimer.current);
    }
    feedbackTimer.current = window.setTimeout(() => {
      setIsAdded(false);
      feedbackTimer.current = null;
    }, 1100);
  };

  return (
    <article
      className={`rounded-3xl border bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ${
        unavailable ? "border-slate-200 opacity-65" : "border-orange-100"
      }`}
    >
      <div className="flex gap-4">
        <div className={`menu-visual menu-visual-${(food.id % 3) + 1}`}>
          <span aria-hidden="true">{food.name.slice(0, 1).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">
                {food.categoryName}
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                {food.name}
              </h3>
            </div>
            {unavailable ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                Ngừng bán
              </span>
            ) : null}
          </div>
          <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
            {food.description ?? "Món được chế biến mới khi nhận đơn."}
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <strong className="text-lg text-slate-950">
              {formatCurrency(food.price)}
            </strong>
            <button
              type="button"
              className={`add-button ${isAdded ? "is-added" : ""}`}
              disabled={unavailable}
              onClick={handleAdd}
              aria-label={
                unavailable
                  ? `${food.name} không khả dụng`
                  : isAdded
                    ? `Đã thêm ${food.name} vào giỏ`
                    : `Thêm ${food.name} vào giỏ`
              }
            >
              <span
                className={isAdded ? "icon-check" : "icon-plus"}
                aria-hidden="true"
              />
              {unavailable
                ? "Không khả dụng"
                : isAdded
                  ? "Đã thêm"
                  : "Thêm món"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
