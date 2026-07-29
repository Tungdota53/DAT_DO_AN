import { Router } from "express";

import { adminRouter } from "./admin.routes.js";
import { healthRouter } from "./health.routes.js";
import { orderRouter } from "./order.routes.js";
import { restaurantRouter } from "./restaurant.routes.js";

export const apiRouter = Router();

apiRouter.use("/admin", adminRouter);
apiRouter.use("/health", healthRouter);
apiRouter.use("/restaurants", restaurantRouter);
apiRouter.use("/orders", orderRouter);
