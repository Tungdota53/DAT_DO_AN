import sql from "mssql/msnodesqlv8.js";

import { env } from "./env.js";

const server = env.DB_TRUSTED_CONNECTION
  ? env.DB_SERVER
  : `${env.DB_SERVER},${env.DB_PORT}`;
const escapeOdbcCredential = (value: string) =>
  `{${value.replaceAll("}", "}}")}}`;
const credentials = env.DB_TRUSTED_CONNECTION
  ? "Trusted_Connection=Yes"
  : `Uid=${escapeOdbcCredential(env.DB_USER)};Pwd=${escapeOdbcCredential(env.DB_PASSWORD)}`;
const connectionString = [
  `Driver={${env.DB_ODBC_DRIVER}}`,
  `Server=${server}`,
  `Database=${env.DB_NAME}`,
  credentials,
  env.DB_ENCRYPT ? "Encrypt=Yes" : null,
  `TrustServerCertificate=${env.DB_TRUST_SERVER_CERTIFICATE ? "Yes" : "No"}`,
]
  .filter((value): value is string => value !== null)
  .join(";")
  .concat(";");

// @types/mssql does not yet expose the msnodesqlv8-only connectionString key.
const driverConfig = {
  connectionString,
  options: { useUTC: false },
} as unknown as sql.config;

export const databasePool = new sql.ConnectionPool(driverConfig);
export const connectDatabase = () => databasePool.connect();
