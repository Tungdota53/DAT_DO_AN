import { type FormEvent, useRef, useState } from "react";

import { foodgoApi } from "../api/foodgo-api";
import { toApiRequestError } from "../api/http-client";
import { EmptyState } from "../components/common/ResourceStates";
import { navigate } from "../routes/history";
import { Link } from "../routes/router";
import { cartSubtotal, useCartStore } from "../stores/cart-store";
import { formatCurrency } from "../utils/format";

interface FormValues {
  fullName: string;
  phone: string;
  deliveryAddress: string;
  note: string;
}

type FormErrors = Partial<Record<keyof FormValues | "cart", string>>;

const validateCheckout = (
  values: FormValues,
  itemCount: number,
): FormErrors => {
  const errors: FormErrors = {};
  if (values.fullName.trim().length < 2)
    errors.fullName = "Vui lòng nhập họ tên.";
  const phone = values.phone.replace(/[\s.-]/g, "");
  if (!/^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/.test(phone)) {
    errors.phone = "Số điện thoại Việt Nam không hợp lệ.";
  }
  if (values.deliveryAddress.trim().length < 8) {
    errors.deliveryAddress = "Địa chỉ cần ít nhất 8 ký tự.";
  }
  if (values.note.length > 500) errors.note = "Ghi chú tối đa 500 ký tự.";
  if (itemCount === 0) errors.cart = "Giỏ hàng đang trống.";
  return errors;
};

export function CheckoutPage() {
  const { restaurant, items, clear } = useCartStore();
  const [values, setValues] = useState<FormValues>({
    fullName: "",
    phone: "",
    deliveryAddress: "",
    note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  if (!restaurant || items.length === 0) {
    return (
      <section className="page-section">
        <EmptyState
          title="Chưa có món để thanh toán"
          message="Hãy chọn món từ một nhà hàng trước."
          action={
            <Link to="/restaurants" className="primary-button">
              Chọn nhà hàng
            </Link>
          }
        />
      </section>
    );
  }

  const subtotal = cartSubtotal(items);
  const temporaryTotal = subtotal + restaurant.deliveryFee;

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const validationErrors = validateCheckout(values, items.length);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const note = values.note.trim();
      const response = await foodgoApi.createOrder({
        restaurantId: restaurant.id,
        customer: {
          fullName: values.fullName.trim(),
          phone: values.phone.replace(/[\s.-]/g, ""),
          deliveryAddress: values.deliveryAddress.trim(),
        },
        ...(note ? { note } : {}),
        paymentMethod: "COD",
        items: items.map((item) => ({
          foodId: item.food.id,
          quantity: item.quantity,
        })),
      });
      window.sessionStorage.setItem(
        "foodgo:last-order",
        JSON.stringify(response.data),
      );
      window.sessionStorage.setItem(
        "foodgo:last-order-phone",
        response.data.recipient.phone,
      );
      clear();
      navigate(`/order-success/${response.data.id}`);
    } catch (error) {
      const apiError = toApiRequestError(error);
      setSubmitError(
        apiError.response.errorCode === "FOOD_UNAVAILABLE"
          ? "Một món trong giỏ đã ngừng bán. Vui lòng quay lại thực đơn để cập nhật giỏ."
          : apiError.message,
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Bước cuối cùng</span>
        <h1>Xác nhận giao hàng</h1>
        <p>Giỏ hàng chỉ được xóa sau khi Backend tạo đơn thành công.</p>
      </div>

      <form
        className="mt-9 grid gap-7 lg:grid-cols-[1fr_0.8fr]"
        onSubmit={(event) => void onSubmit(event)}
        noValidate
      >
        <div className="content-card">
          <h2 className="text-xl font-black">Thông tin người nhận</h2>
          <div className="mt-6 grid gap-5">
            <label className="form-field">
              <span>Họ và tên</span>
              <input
                value={values.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName ? (
                <small role="alert">{errors.fullName}</small>
              ) : null}
            </label>
            <label className="form-field">
              <span>Số điện thoại</span>
              <input
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone ? <small role="alert">{errors.phone}</small> : null}
            </label>
            <label className="form-field">
              <span>Địa chỉ giao hàng</span>
              <textarea
                rows={3}
                value={values.deliveryAddress}
                onChange={(event) =>
                  updateField("deliveryAddress", event.target.value)
                }
                autoComplete="street-address"
                aria-invalid={Boolean(errors.deliveryAddress)}
              />
              {errors.deliveryAddress ? (
                <small role="alert">{errors.deliveryAddress}</small>
              ) : null}
            </label>
            <label className="form-field">
              <span>Ghi chú cho nhà hàng (không bắt buộc)</span>
              <textarea
                rows={3}
                maxLength={500}
                value={values.note}
                onChange={(event) => updateField("note", event.target.value)}
              />
            </label>
          </div>
        </div>

        <aside className="content-card h-fit">
          <p className="eyebrow">{restaurant.name}</p>
          <h2 className="mt-2 text-xl font-black">Tóm tắt đơn hàng</h2>
          <ul className="mt-5 divide-y divide-slate-100">
            {items.map((item) => (
              <li
                key={item.food.id}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <span>
                  {item.food.name} × {item.quantity}
                </span>
                <strong>
                  {formatCurrency(item.food.price * item.quantity)}
                </strong>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Tạm tính</dt>
              <dd className="font-bold">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Phí giao dự kiến</dt>
              <dd className="font-bold">
                {formatCurrency(restaurant.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between text-lg">
              <dt className="font-black">Tổng dự kiến</dt>
              <dd className="font-black text-orange-600">
                {formatCurrency(temporaryTotal)}
              </dd>
            </div>
          </dl>
          <div className="cod-box mt-5">
            <span className="icon-cash" aria-hidden="true" />
            <div>
              <strong>Thanh toán COD</strong>
              <small>Thanh toán bằng tiền mặt khi nhận món</small>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Tổng cuối cùng được lấy từ phản hồi Backend, không gửi giá từ trình
            duyệt.
          </p>
          {submitError ? (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {submitError}
            </p>
          ) : null}
          <button
            type="submit"
            className="primary-button mt-5 w-full"
            disabled={submitting}
          >
            {submitting ? "Đang tạo đơn..." : "Đặt món COD"}
          </button>
        </aside>
      </form>
    </section>
  );
}
