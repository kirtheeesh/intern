import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const mongodbUri = process.env["MONGODB_URI"];

if (!mongodbUri) {
  throw new Error("MONGODB_URI environment variable is required");
}

mongoose
  .connect(mongodbUri)
  .then(() => {
    logger.info("Connected to MongoDB");
    app.listen(port, () => {
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Error connecting to MongoDB");
    process.exit(1);
  });
