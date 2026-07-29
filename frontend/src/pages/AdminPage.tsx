import {
  type FormEvent,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { adminApi } from "../api/admin-api";
import { ApiRequestError } from "../api/http-client";
import { Brand } from "../components/layout/Brand";
import type { OrderStatus } from "../types/api";
import type {
  AdminCategory,
  AdminCustomer,
  AdminDashboard,
  AdminFood,
  AdminOrder,
  AdminOrderPage,
  AdminRestaurant,
  CategoryMutation,
  CustomerMutation,
  FoodMutation,
  RestaurantMutation,
} from "../types/admin";
import { formatCurrency } from "../utils/format";

const ADMIN_SESSION_KEY = "foodgo:admin-key";
const ADMIN_ORDER_PAGE_SIZE = 20;
const ORDER_STATUSES: OrderStatus[] = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang xử lý",
  "Hoàn thành",
  "Đã hủy",
];

const allowedOrderTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
  "Đã xác nhận": ["Đang xử lý", "Đã hủy"],
  "Đang xử lý": ["Hoàn thành", "Đã hủy"],
  "Hoàn thành": [],
  "Đã hủy": [],
};

const getAvailableOrderStatuses = (currentStatus: OrderStatus) =>
  ORDER_STATUSES.filter(
    (status) =>
      status === currentStatus ||
      allowedOrderTransitions[currentStatus].includes(status),
  );

type AdminTab =
  | "dashboard"
  | "restaurants"
  | "catalog"
  | "orders"
  | "customers";

type EditorState =
  | { kind: "restaurant"; item?: AdminRestaurant }
  | { kind: "category"; item?: AdminCategory }
  | { kind: "food"; item?: AdminFood }
  | { kind: "customer"; item: AdminCustomer }
  | null;

const navigation: Array<{
  id: AdminTab;
  label: string;
  description: string;
}> = [
  { id: "dashboard", label: "Tổng quan", description: "Vận hành hôm nay" },
  { id: "restaurants", label: "Nhà hàng", description: "Đối tác & giao hàng" },
  { id: "catalog", label: "Thực đơn", description: "Danh mục & món ăn" },
  { id: "orders", label: "Đơn hàng", description: "Trạng thái giao dịch" },
  { id: "customers", label: "Khách hàng", description: "Hồ sơ người nhận" },
];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Không thể hoàn tất thao tác";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

function AdminIcon({
  name,
  size = 20,
}: {
  name:
    | AdminTab
    | "plus"
    | "edit"
    | "trash"
    | "refresh"
    | "logout"
    | "external"
    | "search"
    | "shield";
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    restaurants: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    catalog: (
      <>
        <path d="M4 5h16M4 12h16M4 19h16" />
        <circle cx="7" cy="5" r="1" />
        <circle cx="17" cy="12" r="1" />
        <circle cx="9" cy="19" r="1" />
      </>
    ),
    orders: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
    customers: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a4 4 0 0 1 0 8M17 15a6 6 0 0 1 4 6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    edit: (
      <>
        <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
        <path d="m13.5 7.5 3 3" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M19 12a7 7 0 1 0-2 5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H4v14h6M14 8l4 4-4 4M18 12H8" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M18 13v7H4V6h7" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function AdminLogin({
  onAuthenticated,
}: {
  onAuthenticated: (key: string) => void;
}) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await adminApi.verifySession(key.trim());
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, key.trim());
      onAuthenticated(key.trim());
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <div className="admin-login-glow" aria-hidden="true" />
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="flex items-center justify-between gap-4">
          <Brand />
          <span className="admin-secure-chip">
            <AdminIcon name="shield" size={16} />
            Khu vực bảo mật
          </span>
        </div>
        <div className="mt-10">
          <span className="admin-kicker">FoodGo Operations</span>
          <h1
            id="admin-login-title"
            className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950"
          >
            Đăng nhập quản trị
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Nhập khóa quản trị được cấu hình trong biến{" "}
            <code>ADMIN_API_KEY</code> của backend.
          </p>
        </div>
        <form className="mt-8 grid gap-5" onSubmit={submit}>
          <label className="admin-field">
            <span>Khóa quản trị</span>
            <input
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              autoComplete="current-password"
              placeholder="Nhập khóa bảo mật"
              minLength={8}
              required
              autoFocus
            />
          </label>
          {error ? (
            <p className="admin-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="admin-primary-button"
            disabled={isSubmitting}
          >
            <AdminIcon name="shield" />
            {isSubmitting ? "Đang xác thực..." : "Vào trang quản trị"}
          </button>
        </form>
        <a href="/" className="admin-back-link">
          <AdminIcon name="external" size={17} />
          Quay lại website khách hàng
        </a>
      </section>
    </main>
  );
}

function AdminModal({
  title,
  description,
  onClose,
  children,
}: PropsWithChildren<{
  title: string;
  description: string;
  onClose: () => void;
}>) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const animationFrame = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const keepFocusInModal = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", keepFocusInModal);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keepFocusInModal);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        ref={modalRef}
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5 border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id="admin-modal-title"
              className="text-2xl font-black tracking-tight text-slate-950"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="admin-icon-button"
            aria-label="Đóng biểu mẫu"
            onClick={onClose}
          >
            <span className="icon-close" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
      </section>
    </div>
  );
}

function EditorActions({
  isSubmitting,
  onClose,
}: {
  isSubmitting: boolean;
  onClose: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
      <button type="button" className="admin-secondary-button" onClick={onClose}>
        Hủy
      </button>
      <button
        type="submit"
        className="admin-primary-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}

function RestaurantEditor({
  item,
  onClose,
  onSave,
}: {
  item?: AdminRestaurant;
  onClose: () => void;
  onSave: (input: RestaurantMutation) => Promise<void>;
}) {
  const [form, setForm] = useState<RestaurantMutation>({
    name: item?.name ?? "",
    address: item?.address ?? "",
    phone: item?.phone ?? "",
    description: item?.description ?? "",
    deliveryFee: item?.deliveryFee ?? 15000,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        description: form.description?.trim() || null,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="admin-field sm:col-span-2">
          <span>Tên nhà hàng</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            minLength={2}
          />
        </label>
        <label className="admin-field sm:col-span-2">
          <span>Địa chỉ</span>
          <input
            value={form.address}
            onChange={(event) =>
              setForm({ ...form, address: event.target.value })
            }
            required
            minLength={5}
          />
        </label>
        <label className="admin-field">
          <span>Số điện thoại</span>
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
          />
        </label>
        <label className="admin-field">
          <span>Phí giao hàng</span>
          <input
            type="number"
            min="0"
            value={form.deliveryFee}
            onChange={(event) =>
              setForm({ ...form, deliveryFee: Number(event.target.value) })
            }
            required
          />
        </label>
        <label className="admin-field sm:col-span-2">
          <span>Mô tả</span>
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </label>
      </div>
      {error ? (
        <p className="admin-form-error mt-4" role="alert">
          {error}
        </p>
      ) : null}
      <EditorActions isSubmitting={isSubmitting} onClose={onClose} />
    </form>
  );
}

function CategoryEditor({
  item,
  onClose,
  onSave,
}: {
  item?: AdminCategory;
  onClose: () => void;
  onSave: (input: CategoryMutation) => Promise<void>;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSave({ name });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label className="admin-field">
        <span>Tên danh mục</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
          autoFocus
        />
      </label>
      {error ? (
        <p className="admin-form-error mt-4" role="alert">
          {error}
        </p>
      ) : null}
      <EditorActions isSubmitting={isSubmitting} onClose={onClose} />
    </form>
  );
}

function FoodEditor({
  item,
  restaurants,
  categories,
  onClose,
  onSave,
}: {
  item?: AdminFood;
  restaurants: AdminRestaurant[];
  categories: AdminCategory[];
  onClose: () => void;
  onSave: (input: FoodMutation) => Promise<void>;
}) {
  const [form, setForm] = useState<FoodMutation>({
    restaurantId: item?.restaurantId ?? restaurants[0]?.id ?? 0,
    categoryId: item?.categoryId ?? categories[0]?.id ?? 0,
    name: item?.name ?? "",
    description: item?.description ?? "",
    price: item?.price ?? 0,
    status: item?.status ?? "CON_BAN",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSave({
        ...form,
        description: form.description?.trim() || null,
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="admin-field sm:col-span-2">
          <span>Tên món</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            minLength={2}
          />
        </label>
        <label className="admin-field">
          <span>Nhà hàng</span>
          <select
            value={form.restaurantId}
            onChange={(event) =>
              setForm({ ...form, restaurantId: Number(event.target.value) })
            }
            required
          >
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Danh mục</span>
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm({ ...form, categoryId: Number(event.target.value) })
            }
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Đơn giá</span>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(event) =>
              setForm({ ...form, price: Number(event.target.value) })
            }
            required
          />
        </label>
        <label className="admin-field">
          <span>Trạng thái</span>
          <select
            value={form.status}
            onChange={(event) =>
              setForm({
                ...form,
                status: event.target.value as FoodMutation["status"],
              })
            }
          >
            <option value="CON_BAN">Còn bán</option>
            <option value="NGUNG_BAN">Ngừng bán</option>
          </select>
        </label>
        <label className="admin-field sm:col-span-2">
          <span>Mô tả</span>
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </label>
      </div>
      {error ? (
        <p className="admin-form-error mt-4" role="alert">
          {error}
        </p>
      ) : null}
      <EditorActions isSubmitting={isSubmitting} onClose={onClose} />
    </form>
  );
}

function CustomerEditor({
  item,
  onClose,
  onSave,
}: {
  item: AdminCustomer;
  onClose: () => void;
  onSave: (input: CustomerMutation) => Promise<void>;
}) {
  const [form, setForm] = useState<CustomerMutation>({
    name: item.name,
    phone: item.phone,
    deliveryAddress: item.deliveryAddress,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSave(form);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4">
        <label className="admin-field">
          <span>Họ và tên</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        <label className="admin-field">
          <span>Số điện thoại</span>
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
          />
        </label>
        <label className="admin-field">
          <span>Địa chỉ giao hàng</span>
          <textarea
            rows={3}
            value={form.deliveryAddress}
            onChange={(event) =>
              setForm({ ...form, deliveryAddress: event.target.value })
            }
            required
          />
        </label>
      </div>
      {error ? (
        <p className="admin-form-error mt-4" role="alert">
          {error}
        </p>
      ) : null}
      <EditorActions isSubmitting={isSubmitting} onClose={onClose} />
    </form>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone =
    status === "Hoàn thành"
      ? "success"
      : status === "Đã hủy"
        ? "danger"
        : status === "Chờ xác nhận"
          ? "warning"
          : "info";
  return <span className={`admin-status ${tone}`}>{status}</span>;
}

function EmptyAdminState({ message }: { message: string }) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-mark" aria-hidden="true" />
      <strong>Chưa có dữ liệu</strong>
      <p>{message}</p>
    </div>
  );
}

export function AdminPage() {
  const [adminKey, setAdminKey] = useState(
    () => window.sessionStorage.getItem(ADMIN_SESSION_KEY) ?? "",
  );
  const [authState, setAuthState] = useState<
    "checking" | "signed-out" | "authenticated"
  >(() => (adminKey ? "checking" : "signed-out"));
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderPageData, setOrderPageData] = useState<AdminOrderPage | null>(
    null,
  );
  const [orderPage, setOrderPage] = useState(1);
  const [debouncedOrderSearch, setDebouncedOrderSearch] = useState("");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const ordersRequestRef = useRef(0);

  const signOut = useCallback(() => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminKey("");
    setAuthState("signed-out");
    setDashboard(null);
  }, []);

  useEffect(() => {
    if (!adminKey || authState !== "checking") return;
    adminApi
      .verifySession(adminKey)
      .then(() => setAuthState("authenticated"))
      .catch(() => signOut());
  }, [adminKey, authState, signOut]);

  const loadAll = useCallback(async () => {
    if (!adminKey) return;
    setIsLoading(true);
    setPageError("");
    try {
      const [
        dashboardResponse,
        restaurantResponse,
        categoryResponse,
        foodResponse,
        customerResponse,
      ] = await Promise.all([
        adminApi.getDashboard(adminKey),
        adminApi.listRestaurants(adminKey),
        adminApi.listCategories(adminKey),
        adminApi.listFoods(adminKey),
        adminApi.listCustomers(adminKey),
      ]);
      setDashboard(dashboardResponse.data);
      setRestaurants(restaurantResponse.data);
      setCategories(categoryResponse.data);
      setFoods(foodResponse.data);
      setCustomers(customerResponse.data);
    } catch (loadError) {
      if (loadError instanceof ApiRequestError && loadError.status === 401) {
        signOut();
        return;
      }
      setPageError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [adminKey, signOut]);

  const loadOrders = useCallback(async () => {
    if (!adminKey) return;
    const requestId = ++ordersRequestRef.current;
    setIsOrdersLoading(true);
    try {
      const response = await adminApi.listOrders(adminKey, {
        page: orderPage,
        limit: ADMIN_ORDER_PAGE_SIZE,
        search: debouncedOrderSearch || undefined,
      });
      if (requestId !== ordersRequestRef.current) return;
      setOrders(response.data.items);
      setOrderPageData(response.data);
    } catch (loadError) {
      if (requestId !== ordersRequestRef.current) return;
      if (loadError instanceof ApiRequestError && loadError.status === 401) {
        signOut();
        return;
      }
      setPageError(getErrorMessage(loadError));
    } finally {
      if (requestId === ordersRequestRef.current) setIsOrdersLoading(false);
    }
  }, [adminKey, debouncedOrderSearch, orderPage, signOut]);

  useEffect(() => {
    if (authState === "authenticated") void loadAll();
  }, [authState, loadAll]);

  useEffect(() => {
    if (authState !== "authenticated" || activeTab !== "orders") return;
    void loadOrders();
  }, [activeTab, authState, loadOrders]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    const timer = window.setTimeout(() => {
      setOrderPage(1);
      setDebouncedOrderSearch(search);
    }, 240);
    return () => window.clearTimeout(timer);
  }, [activeTab, search]);

  useEffect(() => {
    document.title =
      authState === "authenticated" ? "FoodGo Admin · Quản trị" : "FoodGo Admin";
  }, [authState]);

  const completeMutation = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    await action();
    setEditor(null);
    setNotice(successMessage);
    await loadAll();
    window.setTimeout(() => setNotice(""), 3200);
  };

  const deleteEntity = async (
    message: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    if (!window.confirm(message)) return;
    setPageError("");
    try {
      await action();
      setNotice(successMessage);
      await loadAll();
      window.setTimeout(() => setNotice(""), 3200);
    } catch (deleteError) {
      setPageError(getErrorMessage(deleteError));
    }
  };

  const updateOrderStatus = async (order: AdminOrder, status: OrderStatus) => {
    setUpdatingOrderId(order.id);
    setPageError("");
    try {
      const response = await adminApi.updateOrderStatus(
        adminKey,
        order.id,
        status,
      );
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? response.data : item)),
      );
      setNotice(`Đã cập nhật đơn #${order.id} sang “${status}”`);
      const summary = await adminApi.getDashboard(adminKey);
      setDashboard(summary.data);
      window.setTimeout(() => setNotice(""), 3200);
    } catch (updateError) {
      setPageError(getErrorMessage(updateError));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (authState === "checking") {
    return (
      <main className="admin-login">
        <div className="admin-auth-loading" role="status">
          <span className="admin-spinner" aria-hidden="true" />
          Đang xác thực phiên quản trị...
        </div>
      </main>
    );
  }

  if (authState !== "authenticated") {
    return (
      <AdminLogin
        onAuthenticated={(key) => {
          setAdminKey(key);
          setAuthState("authenticated");
        }}
      />
    );
  }

  const normalizedSearch = search.trim().toLocaleLowerCase("vi");
  const filteredRestaurants = restaurants.filter((restaurant) =>
    [restaurant.name, restaurant.address, restaurant.phone].some((value) =>
      value.toLocaleLowerCase("vi").includes(normalizedSearch),
    ),
  );
  const filteredFoods = foods.filter((food) =>
    [food.name, food.restaurantName, food.categoryName].some((value) =>
      value.toLocaleLowerCase("vi").includes(normalizedSearch),
    ),
  );
  const filteredOrders = orders;
  const filteredCustomers = customers.filter((customer) =>
    [customer.name, customer.phone, customer.deliveryAddress].some((value) =>
      value.toLocaleLowerCase("vi").includes(normalizedSearch),
    ),
  );
  const currentNavigation =
    navigation.find((item) => item.id === activeTab) ?? navigation[0]!;

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Brand inverse />
          <span>Admin</span>
        </div>
        <nav className="admin-navigation" aria-label="Điều hướng quản trị">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeTab === item.id ? "active" : ""}
              aria-current={activeTab === item.id ? "page" : undefined}
              onClick={() => {
                setActiveTab(item.id);
                setSearch("");
                if (item.id === "orders") setOrderPage(1);
              }}
            >
              <span className="admin-nav-icon">
                <AdminIcon name={item.id} />
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/">
            <AdminIcon name="external" />
            Xem website
          </a>
          <button type="button" onClick={signOut}>
            <AdminIcon name="logout" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">FoodGo Control Center</span>
            <h1>{currentNavigation.label}</h1>
            <p>{currentNavigation.description}</p>
          </div>
          <div className="admin-topbar-actions">
            {activeTab !== "dashboard" ? (
              <label className="admin-search">
                <AdminIcon name="search" size={18} />
                <span className="sr-only">Tìm trong trang quản trị</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    activeTab === "orders"
                      ? "Mã đơn, khách, nhà hàng..."
                      : "Tìm nhanh..."
                  }
                />
              </label>
            ) : null}
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Làm mới dữ liệu"
              onClick={() => void loadAll()}
              disabled={isLoading}
            >
              <AdminIcon name="refresh" />
            </button>
          </div>
        </header>

        <main className="admin-content">
          {pageError ? (
            <div className="admin-alert" role="alert">
              <div>
                <strong>Không thể hoàn tất yêu cầu</strong>
                <p>{pageError}</p>
              </div>
              <button type="button" onClick={() => setPageError("")}>
                Đóng
              </button>
            </div>
          ) : null}

          {isLoading && !dashboard ? (
            <div className="admin-loading-grid" aria-label="Đang tải dữ liệu">
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          ) : null}

          {activeTab === "dashboard" && dashboard ? (
            <>
              <section className="admin-kpi-grid" aria-label="Chỉ số tổng quan">
                {[
                  [
                    "Nhà hàng",
                    dashboard.restaurantCount,
                    "Đối tác đang có trên hệ thống",
                    "orange",
                  ],
                  [
                    "Món ăn",
                    dashboard.foodCount,
                    "Toàn bộ thực đơn đang quản lý",
                    "blue",
                  ],
                  [
                    "Đơn cần xử lý",
                    dashboard.pendingOrderCount,
                    `${dashboard.orderCount} đơn hàng tổng cộng`,
                    "amber",
                  ],
                  [
                    "Doanh thu hoàn tất",
                    formatCurrency(dashboard.completedRevenue),
                    `${dashboard.customerCount} hồ sơ khách hàng`,
                    "green",
                  ],
                ].map(([label, value, description, tone]) => (
                  <article key={String(label)} className={`admin-kpi ${tone}`}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{description}</small>
                  </article>
                ))}
              </section>

              <section className="admin-panel mt-6">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-kicker">Hoạt động mới nhất</span>
                    <h2>Đơn hàng gần đây</h2>
                  </div>
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={() => setActiveTab("orders")}
                  >
                    Xem tất cả
                  </button>
                </div>
                {dashboard.recentOrders.length ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Nhà hàng</th>
                          <th>Người nhận</th>
                          <th>Trạng thái</th>
                          <th className="text-right">Tổng tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td data-label="Mã đơn">
                              <strong>#{order.id}</strong>
                              <small>{formatDateTime(order.createdAt)}</small>
                            </td>
                            <td data-label="Nhà hàng">{order.restaurantName}</td>
                            <td data-label="Người nhận">
                              <strong>{order.recipientName}</strong>
                              <small>{order.recipientPhone}</small>
                            </td>
                            <td data-label="Trạng thái">
                              <StatusBadge status={order.status} />
                            </td>
                            <td data-label="Tổng tiền" className="text-right">
                              <strong>{formatCurrency(order.total)}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyAdminState message="Đơn mới sẽ xuất hiện tại đây." />
                )}
              </section>
            </>
          ) : null}

          {activeTab === "restaurants" ? (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-kicker">Đối tác FoodGo</span>
                  <h2>{filteredRestaurants.length} nhà hàng</h2>
                </div>
                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={() => setEditor({ kind: "restaurant" })}
                >
                  <AdminIcon name="plus" />
                  Thêm nhà hàng
                </button>
              </div>
              {filteredRestaurants.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nhà hàng</th>
                        <th>Liên hệ</th>
                        <th>Thực đơn</th>
                        <th>Phí giao</th>
                        <th className="text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRestaurants.map((restaurant) => (
                        <tr key={restaurant.id}>
                          <td data-label="Nhà hàng">
                            <strong>{restaurant.name}</strong>
                            <small>{restaurant.address}</small>
                          </td>
                          <td data-label="Liên hệ">{restaurant.phone}</td>
                          <td data-label="Thực đơn">
                            {restaurant.availableFoodCount} món đang bán
                          </td>
                          <td data-label="Phí giao">
                            {formatCurrency(restaurant.deliveryFee)}
                          </td>
                          <td data-label="Thao tác" className="text-right">
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                aria-label={`Sửa ${restaurant.name}`}
                                onClick={() =>
                                  setEditor({ kind: "restaurant", item: restaurant })
                                }
                              >
                                <AdminIcon name="edit" size={17} />
                              </button>
                              <button
                                type="button"
                                className="danger"
                                aria-label={`Xóa ${restaurant.name}`}
                                onClick={() =>
                                  void deleteEntity(
                                    `Xóa nhà hàng “${restaurant.name}”? Thao tác chỉ thành công khi nhà hàng chưa có món hoặc đơn.`,
                                    () =>
                                      adminApi.deleteRestaurant(
                                        adminKey,
                                        restaurant.id,
                                      ),
                                    "Đã xóa nhà hàng",
                                  )
                                }
                              >
                                <AdminIcon name="trash" size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyAdminState message="Thêm nhà hàng đầu tiên hoặc thử từ khóa khác." />
              )}
            </section>
          ) : null}

          {activeTab === "catalog" ? (
            <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-kicker">Phân loại</span>
                    <h2>Danh mục</h2>
                  </div>
                  <button
                    type="button"
                    className="admin-icon-button"
                    aria-label="Thêm danh mục"
                    onClick={() => setEditor({ kind: "category" })}
                  >
                    <AdminIcon name="plus" />
                  </button>
                </div>
                <ul className="admin-category-list">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <div>
                        <strong>{category.name}</strong>
                        <small>{category.foodCount} món</small>
                      </div>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          aria-label={`Sửa danh mục ${category.name}`}
                          onClick={() =>
                            setEditor({ kind: "category", item: category })
                          }
                        >
                          <AdminIcon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          className="danger"
                          aria-label={`Xóa danh mục ${category.name}`}
                          onClick={() =>
                            void deleteEntity(
                              `Xóa danh mục “${category.name}”?`,
                              () =>
                                adminApi.deleteCategory(adminKey, category.id),
                              "Đã xóa danh mục",
                            )
                          }
                        >
                          <AdminIcon name="trash" size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-kicker">Catalog</span>
                    <h2>{filteredFoods.length} món ăn</h2>
                  </div>
                  <button
                    type="button"
                    className="admin-primary-button"
                    disabled={!restaurants.length || !categories.length}
                    onClick={() => setEditor({ kind: "food" })}
                  >
                    <AdminIcon name="plus" />
                    Thêm món
                  </button>
                </div>
                {filteredFoods.length ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Món ăn</th>
                          <th>Nhà hàng</th>
                          <th>Giá</th>
                          <th>Trạng thái</th>
                          <th className="text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFoods.map((food) => (
                          <tr key={food.id}>
                            <td data-label="Món ăn">
                              <strong>{food.name}</strong>
                              <small>{food.categoryName}</small>
                            </td>
                            <td data-label="Nhà hàng">{food.restaurantName}</td>
                            <td data-label="Giá">
                              <strong>{formatCurrency(food.price)}</strong>
                            </td>
                            <td data-label="Trạng thái">
                              <span
                                className={`admin-status ${
                                  food.status === "CON_BAN"
                                    ? "success"
                                    : "neutral"
                                }`}
                              >
                                {food.status === "CON_BAN"
                                  ? "Còn bán"
                                  : "Ngừng bán"}
                              </span>
                            </td>
                            <td data-label="Thao tác" className="text-right">
                              <div className="admin-row-actions">
                                <button
                                  type="button"
                                  aria-label={`Sửa ${food.name}`}
                                  onClick={() =>
                                    setEditor({ kind: "food", item: food })
                                  }
                                >
                                  <AdminIcon name="edit" size={17} />
                                </button>
                                <button
                                  type="button"
                                  className="danger"
                                  aria-label={`Xóa ${food.name}`}
                                  onClick={() =>
                                    void deleteEntity(
                                      `Xóa món “${food.name}”? Món đã có trong đơn sẽ không thể xóa.`,
                                      () => adminApi.deleteFood(adminKey, food.id),
                                      "Đã xóa món ăn",
                                    )
                                  }
                                >
                                  <AdminIcon name="trash" size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyAdminState message="Thêm món đầu tiên hoặc thử từ khóa khác." />
                )}
              </section>
            </div>
          ) : null}

          {activeTab === "orders" ? (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-kicker">Điều phối</span>
                  <h2>{orderPageData?.total ?? 0} đơn hàng</h2>
                </div>
                <span className="admin-soft-chip">
                  {dashboard?.pendingOrderCount ?? 0} đơn đang hoạt động
                </span>
              </div>
              {isOrdersLoading && !orderPageData ? (
                <div className="admin-loading-grid" aria-label="Đang tải đơn hàng">
                  {Array.from({ length: 3 }, (_, index) => (
                    <span key={index} />
                  ))}
                </div>
              ) : filteredOrders.length ? (
                <>
                  <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Đơn hàng</th>
                        <th>Nhà hàng</th>
                        <th>Người nhận</th>
                        <th>Giá trị</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td data-label="Đơn hàng">
                            <strong>#{order.id}</strong>
                            <small>{formatDateTime(order.createdAt)}</small>
                          </td>
                          <td data-label="Nhà hàng">
                            <strong>{order.restaurantName}</strong>
                            <small>{order.itemCount} món</small>
                          </td>
                          <td data-label="Người nhận">
                            <strong>{order.recipientName}</strong>
                            <small>{order.recipientPhone}</small>
                          </td>
                          <td data-label="Giá trị">
                            <strong>{formatCurrency(order.total)}</strong>
                          </td>
                          <td data-label="Trạng thái">
                            <label className="sr-only" htmlFor={`status-${order.id}`}>
                              Trạng thái đơn #{order.id}
                            </label>
                            <select
                              id={`status-${order.id}`}
                              className="admin-status-select"
                              value={order.status}
                              disabled={
                                updatingOrderId === order.id ||
                                allowedOrderTransitions[order.status].length === 0
                              }
                              onChange={(event) =>
                                void updateOrderStatus(
                                  order,
                                  event.target.value as OrderStatus,
                                )
                              }
                            >
                              {getAvailableOrderStatuses(order.status).map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  {orderPageData && orderPageData.totalPages > 1 ? (
                    <nav className="admin-pagination" aria-label="Phân trang đơn hàng">
                      <button
                        type="button"
                        disabled={orderPageData.page <= 1 || isOrdersLoading}
                        onClick={() => setOrderPage((current) => current - 1)}
                      >
                        Trang trước
                      </button>
                      <span>
                        Trang {orderPageData.page} / {orderPageData.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={
                          orderPageData.page >= orderPageData.totalPages ||
                          isOrdersLoading
                        }
                        onClick={() => setOrderPage((current) => current + 1)}
                      >
                        Trang sau
                      </button>
                    </nav>
                  ) : null}
                </>
              ) : (
                <EmptyAdminState message="Đơn hàng phù hợp sẽ xuất hiện tại đây." />
              )}
            </section>
          ) : null}

          {activeTab === "customers" ? (
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-kicker">CRM cơ bản</span>
                  <h2>{filteredCustomers.length} khách hàng</h2>
                </div>
                <span className="admin-soft-chip">Dữ liệu từ đơn hàng</span>
              </div>
              {filteredCustomers.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Địa chỉ giao</th>
                        <th>Đơn hàng</th>
                        <th>Chi tiêu hoàn tất</th>
                        <th className="text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td data-label="Khách hàng">
                            <strong>{customer.name}</strong>
                            <small>{customer.phone}</small>
                          </td>
                          <td data-label="Địa chỉ giao">
                            {customer.deliveryAddress}
                          </td>
                          <td data-label="Đơn hàng">
                            <strong>{customer.orderCount}</strong>
                            <small>
                              {customer.lastOrderAt
                                ? `Gần nhất ${formatDateTime(customer.lastOrderAt)}`
                                : "Chưa có đơn"}
                            </small>
                          </td>
                          <td data-label="Chi tiêu hoàn tất">
                            <strong>{formatCurrency(customer.totalSpent)}</strong>
                          </td>
                          <td data-label="Thao tác" className="text-right">
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                aria-label={`Sửa ${customer.name}`}
                                onClick={() =>
                                  setEditor({ kind: "customer", item: customer })
                                }
                              >
                                <AdminIcon name="edit" size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyAdminState message="Khách hàng phù hợp sẽ xuất hiện tại đây." />
              )}
            </section>
          ) : null}
        </main>
      </div>

      {notice ? (
        <div className="admin-toast" role="status" aria-live="polite">
          <span className="icon-check" aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      {editor?.kind === "restaurant" ? (
        <AdminModal
          title={editor.item ? "Chỉnh sửa nhà hàng" : "Thêm nhà hàng"}
          description="Thông tin này hiển thị trực tiếp trên website khách hàng."
          onClose={() => setEditor(null)}
        >
          <RestaurantEditor
            item={editor.item}
            onClose={() => setEditor(null)}
            onSave={(input) =>
              completeMutation(
                () =>
                  editor.item
                    ? adminApi.updateRestaurant(
                        adminKey,
                        editor.item.id,
                        input,
                      )
                    : adminApi.createRestaurant(adminKey, input),
                editor.item ? "Đã cập nhật nhà hàng" : "Đã thêm nhà hàng",
              )
            }
          />
        </AdminModal>
      ) : null}

      {editor?.kind === "category" ? (
        <AdminModal
          title={editor.item ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
          description="Danh mục dùng để nhóm món trong thực đơn."
          onClose={() => setEditor(null)}
        >
          <CategoryEditor
            item={editor.item}
            onClose={() => setEditor(null)}
            onSave={(input) =>
              completeMutation(
                () =>
                  editor.item
                    ? adminApi.updateCategory(adminKey, editor.item.id, input)
                    : adminApi.createCategory(adminKey, input),
                editor.item ? "Đã cập nhật danh mục" : "Đã thêm danh mục",
              )
            }
          />
        </AdminModal>
      ) : null}

      {editor?.kind === "food" ? (
        <AdminModal
          title={editor.item ? "Chỉnh sửa món ăn" : "Thêm món ăn"}
          description="Giá và trạng thái sẽ được đồng bộ tới thực đơn khách hàng."
          onClose={() => setEditor(null)}
        >
          <FoodEditor
            item={editor.item}
            restaurants={restaurants}
            categories={categories}
            onClose={() => setEditor(null)}
            onSave={(input) =>
              completeMutation(
                () =>
                  editor.item
                    ? adminApi.updateFood(adminKey, editor.item.id, input)
                    : adminApi.createFood(adminKey, input),
                editor.item ? "Đã cập nhật món ăn" : "Đã thêm món ăn",
              )
            }
          />
        </AdminModal>
      ) : null}

      {editor?.kind === "customer" ? (
        <AdminModal
          title="Chỉnh sửa khách hàng"
          description="Cập nhật hồ sơ người nhận; dữ liệu lịch sử đơn vẫn được giữ nguyên."
          onClose={() => setEditor(null)}
        >
          <CustomerEditor
            item={editor.item}
            onClose={() => setEditor(null)}
            onSave={(input) =>
              completeMutation(
                () =>
                  adminApi.updateCustomer(adminKey, editor.item.id, input),
                "Đã cập nhật khách hàng",
              )
            }
          />
        </AdminModal>
      ) : null}
    </div>
  );
}
