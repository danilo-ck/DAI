// utils/logger.js
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      level: process.env.IN === "production" ? "info" : "debug",
      format: format.combine(format.colorize(), format.simple())
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/app.log" })
  ]
});

// Nivel custom para morgan
logger.http = (msg) => logger.log({ level: "http", message: msg });

export default logger;
