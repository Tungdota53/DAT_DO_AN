/**
 * Copied from `components.schemas.ApiError` in `docs/openapi.yaml`.
 * Keep this shape in sync with the shared contract instead of extending it
 * with frontend-only fields.
 */
export interface ApiError {
  success: false;
  message: string;
  errorCode: string;
}

/**
 * Copied from the 200 response of `GET /health` in `docs/openapi.yaml`.
 */
export interface HealthResponse {
  success: true;
  message: string;
}
