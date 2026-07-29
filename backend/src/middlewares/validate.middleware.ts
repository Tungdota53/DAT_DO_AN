import type { RequestHandler } from "express";
import type { ZodType } from "zod";

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (request, _response, next) => {
    request.validated = {};
    if (schemas.params) {
      request.validated.params = schemas.params.parse(request.params);
    }
    if (schemas.query) {
      request.validated.query = schemas.query.parse(request.query);
    }
    if (schemas.body) {
      request.validated.body = schemas.body.parse(request.body as unknown);
    }
    next();
  };
