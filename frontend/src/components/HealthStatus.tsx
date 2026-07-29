import { healthApiMode } from "../api/health-api";
import { useHealth } from "../hooks/useHealth";
import type { HealthResponse } from "../types/api";

interface HealthStatusProps {
  loadHealth?: () => Promise<HealthResponse>;
}

export function HealthStatus({ loadHealth }: HealthStatusProps) {
  const health = useHealth(loadHealth);

  if (health.status === "loading") {
    return (
      <div
        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
        role="status"
        aria-label="Đang kiểm tra dịch vụ"
      >
        <span className="size-11 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
        <span className="flex-1">
          <span className="block h-3 w-28 animate-pulse rounded-full bg-slate-100" />
          <span className="mt-2 block h-2.5 w-44 animate-pulse rounded-full bg-slate-100" />
        </span>
      </div>
    );
  }

  if (health.status === "error") {
    return (
      <div
        className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700"
            aria-hidden="true"
          >
            <span className="icon-alert" />
          </span>
          <div>
            <p className="font-bold text-red-950">Chưa thể kết nối dịch vụ</p>
            <p className="mt-1 text-sm text-red-800">{health.error}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={health.retry}
          className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-800 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (health.data.message.trim().length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4" role="status">
        <p className="font-bold text-amber-950">Dịch vụ chưa gửi trạng thái</p>
        <p className="mt-1 text-sm text-amber-800">
          Kết nối thành công nhưng chưa có thông điệp. Bạn có thể thử kiểm tra lại.
        </p>
        <button
          type="button"
          onClick={health.retry}
          className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
        >
          Kiểm tra lại
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
      role="status"
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
        aria-hidden="true"
      >
        <span className="icon-check icon-check-lg" />
      </span>
      <div>
        <p className="font-bold text-emerald-950">Dịch vụ sẵn sàng</p>
        <p className="mt-0.5 text-sm text-emerald-800">
          {health.data.message} · Nguồn: {healthApiMode === "mock" ? "mock" : "API thật"}
        </p>
      </div>
    </div>
  );
}
