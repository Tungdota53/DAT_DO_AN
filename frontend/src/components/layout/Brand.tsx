export function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="FoodGo">
      <span className="brand-mark" aria-hidden="true">
        <span className="icon-utensils" />
      </span>
      <span className="text-xl font-black tracking-[-0.04em] text-slate-950">
        Food<span className="text-orange-500">Go</span>
      </span>
    </span>
  );
}
