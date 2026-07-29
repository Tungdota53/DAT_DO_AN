import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  _error,
  _request,
  response,
  _next: unknown
) => {
  response.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi nội bộ",
    errorCode: "INTERNAL_SERVER_ERROR"
  });
};
