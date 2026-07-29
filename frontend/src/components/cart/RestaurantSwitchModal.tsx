import { useEffect, useRef } from "react";

export function RestaurantSwitchModal({
  currentRestaurant,
  nextRestaurant,
  onCancel,
  onConfirm,
}: {
  currentRestaurant: string;
  nextRestaurant: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [onCancel]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="switch-cart-title"
        className="modal-card"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="icon-switch mx-auto block" aria-hidden="true" />
        <h2
          id="switch-cart-title"
          className="mt-5 text-2xl font-black text-slate-950"
        >
          Đổi nhà hàng?
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Giỏ hàng đang có món từ <strong>{currentRestaurant}</strong>. Nếu tiếp
          tục với <strong>{nextRestaurant}</strong>, các món hiện tại sẽ bị xóa.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            ref={cancelRef}
            type="button"
            className="secondary-button"
            onClick={onCancel}
          >
            Giữ giỏ hiện tại
          </button>
          <button type="button" className="primary-button" onClick={onConfirm}>
            Xóa giỏ và thêm món
          </button>
        </div>
      </section>
    </div>
  );
}
