const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const swaggerSpec = require("./docs/swagger");

const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");
const contactRoutes = require("./routes/contact");
const analyticsRoutes = require("./routes/analytics");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: "*" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../", env.uploadsDir)));

const frontendPath = path.resolve(__dirname, env.frontendDir);
app.use(express.static(frontendPath));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  return next();
});

app.use(errorHandler);

module.exports = app;
