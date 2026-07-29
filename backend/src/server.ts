import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();

const start = async () => {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`FoodGo API listening on port ${env.PORT}`);
  });
};

start().catch(() => {
  console.error("FoodGo API could not connect to SQL Server.");
  process.exitCode = 1;
});
