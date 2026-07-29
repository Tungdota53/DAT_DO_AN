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

export const env = envSchema.parse(process.env);
