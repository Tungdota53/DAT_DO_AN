interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function LoadingState({
  label = "Đang tải dữ liệu",
}: {
  label?: string;
}) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label={label}
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-3xl border border-orange-100 bg-white/70"
        />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <span
        className="icon-alert mx-auto block text-red-600"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-xl font-black text-slate-950">
        Chưa thể tải dữ liệu
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {message}
      </p>
      {onRetry ? (
        <button type="button" className="primary-button mt-5" onClick={onRetry}>
          Thử lại
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="icon-empty mx-auto block" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        {message}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
