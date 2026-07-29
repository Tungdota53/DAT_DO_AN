import "dotenv/config";
import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  ADMIN_API_KEY: z.string().min(16).optional(),
  DB_SERVER: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(1433),
  DB_NAME: z.string().default("DatDoAnOnline"),
  DB_USER: z.string().default(""),
  DB_PASSWORD: z.string().default(""),
  DB_TRUSTED_CONNECTION: booleanFromEnv.default(false),
  DB_ODBC_DRIVER: z.string().min(1).default("ODBC Driver 18 for SQL Server"),
  DB_ENCRYPT: booleanFromEnv.default(false),
  DB_TRUST_SERVER_CERTIFICATE: booleanFromEnv.default(true),
});

const localAdminKey = "foodgo-admin-local-key";
const parsedEnv = envSchema.parse(process.env);

if (
  parsedEnv.NODE_ENV === "production" &&
  (!parsedEnv.ADMIN_API_KEY ||
    parsedEnv.ADMIN_API_KEY === localAdminKey ||
    parsedEnv.ADMIN_API_KEY === "foodgo-admin-local")
) {
  throw new Error(
    "ADMIN_API_KEY must be set to a private value before starting FoodGo in production",
  );
}

export const env = {
  ...parsedEnv,
  ADMIN_API_KEY: parsedEnv.ADMIN_API_KEY ?? localAdminKey,
};
