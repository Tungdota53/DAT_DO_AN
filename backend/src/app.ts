import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({ origin: env.CORS_ORIGIN.split(",").map((value) => value.trim()) }),
  );
  app.use(express.json());
  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
