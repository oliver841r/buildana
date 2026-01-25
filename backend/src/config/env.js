const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  frontendDir: process.env.FRONTEND_DIR || "../",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:4000",
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "buildana",
    port: Number(process.env.DB_PORT || 3306),
  },
  email: {
    from: process.env.EMAIL_FROM || "no-reply@buildana.com",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  uploadsDir: process.env.UPLOADS_DIR || "uploads",
};

module.exports = env;
