export function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="FoodGo">
      <span
        className="grid size-10 place-items-center rounded-[14px] bg-orange-500 text-white shadow-[0_8px_24px_rgba(249,115,22,0.3)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-6" fill="none">
          <path
            d="M9.25 7.5v6.25m3.5-6.25v6.25M11 7.5v7.25a4.5 4.5 0 0 1-4.5 4.5v5.25M22.5 7.5v17"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M22.5 7.5c-3 1.35-4.5 3.42-4.5 6.2 0 2.65 1.55 4.3 4.5 4.3"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-xl font-black tracking-[-0.04em] text-slate-950">
        Food<span className="text-orange-500">Go</span>
      </span>
    </span>
  );
}
