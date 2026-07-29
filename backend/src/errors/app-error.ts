export type ErrorCode =
  | "VALIDATION_ERROR"
  | "RESTAURANT_NOT_FOUND"
  | "FOOD_NOT_FOUND"
  | "FOOD_UNAVAILABLE"
  | "DIFFERENT_RESTAURANT"
  | "CUSTOMER_NOT_FOUND"
  | "ORDER_NOT_FOUND"
  | "INVALID_ORDER_STATUS"
  | "ORDER_CANNOT_BE_CANCELLED"
  | "DATABASE_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;

  public constructor(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
