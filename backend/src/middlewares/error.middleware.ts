import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next: unknown,
) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      errorCode: "VALIDATION_ERROR",
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
    return;
  }

  response.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi nội bộ",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
