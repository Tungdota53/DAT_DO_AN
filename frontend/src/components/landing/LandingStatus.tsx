import type { HealthResponse } from "../../types/api";
import { HealthStatus } from "../HealthStatus";

interface LandingStatusProps {
  loadHealth?: () => Promise<HealthResponse>;
}

export function LandingStatus({ loadHealth }: LandingStatusProps) {
  return (
    <section id="service-status" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="status-stage relative isolate overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="status-grid" aria-hidden="true" />
          <div className="status-glow" aria-hidden="true" />

          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                Kết nối hệ thống
              </p>
              <h2 className="text-balance mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                FoodGo sẵn sàng khi bạn sẵn sàng.
              </h2>
              <p className="mt-5 text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                Trạng thái bên cạnh được lấy từ endpoint{" "}
                <code className="rounded bg-white/10 px-1.5 py-1 font-bold text-white">
                  GET /health
                </code>{" "}
                theo đúng nguồn dữ liệu đang cấu hình.
              </p>
            </div>

            <div className="status-glass rounded-[1.75rem] border border-white/10 bg-white/8 p-3 backdrop-blur-xl sm:p-5">
              <HealthStatus loadHealth={loadHealth} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
