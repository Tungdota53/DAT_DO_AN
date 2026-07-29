import sql from "mssql";

import { env } from "./env.js";

const config: sql.config = {
  server: env.DB_SERVER,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  options: {
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE
  }
};

export const databasePool = new sql.ConnectionPool(config);
export const connectDatabase = () => databasePool.connect();
