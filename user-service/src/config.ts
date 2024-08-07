import * as dotenv from "dotenv";
import path from "path";
import { Config } from "./types/config.types";

dotenv.config({ path: path.resolve(__dirname, '../.env')});

// console.log("Environment Variables: ", process.env);

const config: Config = {
    port: parseInt(process.env.PORT || "3001", 10),
    mongoURI: process.env.MONGO_URI || "",
    jwtSecret: process.env.JWT_SECRET || "",
    logLevel: process.env.LOG_LEVEL || "",
    nodeENV: process.env.NODE_ENV || ""
};

if (!config.mongoURI) {
    throw new Error("Missing environment variable: MONGO_URI");
}

if (!config.jwtSecret) {
    throw new Error("Missing environment variable: JWT_SECRET");
}

export default config;