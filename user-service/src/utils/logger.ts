import { createLogger, format, transports } from "winston";
import config from "../config";

const { combine, timestamp, errors, splat, json, colorize, simple } = format;

const logger = createLogger({
    level: config.logLevel || "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss"}),
        errors({ stack: true }),
        splat(),
        json()
    ),
    defaultMeta: { service: "e-wallet-api" },
    transports: [
        new transports.File({ filename: "error.log", level: "error" }),
        new transports.File({ filename: "combined.log" })
    ]
});

if (config.nodeENV !== "production") {
    logger.add(
        new transports.Console({
            format: combine(
                colorize(),
                simple()
            )
        })
    )
};

export default logger;
