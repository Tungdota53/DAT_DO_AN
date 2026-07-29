import { useCallback, useEffect, useState } from "react";

import { healthApi } from "../api/health-api";
import { toApiRequestError } from "../api/http-client";
import type { HealthResponse } from "../types/api";

type HealthState =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: HealthResponse; error: null }
  | { status: "error"; data: null; error: string };

export function useHealth(
  loadHealth: () => Promise<HealthResponse> = healthApi.getHealth
) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<HealthState>({
    status: "loading",
    data: null,
    error: null
  });

  useEffect(() => {
    let isActive = true;

    setState({ status: "loading", data: null, error: null });

    void loadHealth()
      .then((data) => {
        if (isActive) {
          setState({ status: "success", data, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            status: "error",
            data: null,
            error: toApiRequestError(error).message
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [attempt, loadHealth]);

  const retry = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  return { ...state, retry };
}
