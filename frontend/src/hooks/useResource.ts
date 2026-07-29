import { useCallback, useEffect, useState } from "react";

import { toApiRequestError } from "../api/http-client";

type ResourceState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export function useResource<T>(loader: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ResourceState<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", data: null, error: null });
    void loader()
      .then((data) => {
        if (active) setState({ status: "success", data, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: "error",
            data: null,
            error: toApiRequestError(error).message,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [attempt, loader]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
