import { timingSafeEqual } from "node:crypto";

import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

const safelyMatches = (provided: string, expected: string) => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
};
export const requireAdmin: RequestHandler = (request, _response, next) => {
  const provided = request.header("x-admin-key") ?? "";
  if (!safelyMatches(provided, env.ADMIN_API_KEY)) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Khóa quản trị không hợp lệ hoặc đã hết hiệu lực",
    );
  }
  next();
};
