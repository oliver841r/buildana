const mysql = require("mysql2/promise");
const env = require("../config/env");
const logger = require("../utils/logger");

const pool = mysql.createPool({
  host: env.database.host,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  port: env.database.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on("connection", () => {
  logger.info("MySQL pool connected");
});

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

module.exports = {
  pool,
  query,
};
