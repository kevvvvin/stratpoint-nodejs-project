import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env')});

console.log("Environment Variables: ", process.env);

interface Config {
    port: number,
    mongoURI: string,
    jwtSecret: string
}

const config: Config = {
    port: parseInt(process.env.PORT || "3001", 10),
    mongoURI: process.env.MONGO_URI || "",
    jwtSecret: process.env.JWT_SECRET || ""
};

if (!config.mongoURI) {
    throw new Error("Missing environment variable: MONGO_URI");
}

if (!config.jwtSecret) {
    throw new Error("Missing environment variable: JWT_SECRET");
}

export default config;