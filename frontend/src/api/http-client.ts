import axios, { type AxiosRequestConfig } from "axios";

import type { ApiError } from "../types/api";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" }
});

export class ApiRequestError extends Error {
  readonly response: ApiError;
  readonly status?: number;

  constructor(response: ApiError, status?: number) {
    super(response.message);
    this.name = "ApiRequestError";
    this.response = response;
    this.status = status;
  }
}

function isApiError(value: unknown): value is ApiError {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.success === false &&
    typeof candidate.message === "string" &&
    typeof candidate.errorCode === "string"
  );
}

export function toApiRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (axios.isAxiosError(error) && isApiError(error.response?.data)) {
    return new ApiRequestError(error.response.data, error.response.status);
  }

  return new ApiRequestError({
    success: false,
    message: "Không thể kết nối đến FoodGo. Vui lòng thử lại.",
    errorCode: "INTERNAL_SERVER_ERROR"
  });
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw toApiRequestError(error);
  }
}
