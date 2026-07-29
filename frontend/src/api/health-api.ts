import type { HealthResponse } from "../types/api";
import { request } from "./http-client";

export interface HealthApi {
  getHealth: () => Promise<HealthResponse>;
}

export const healthApi: HealthApi = {
  getHealth: () =>
    request<HealthResponse>({
      method: "GET",
      url: "/health",
    }),
};
