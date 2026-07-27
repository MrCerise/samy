import Client from "@/classes/client";
import Logger from "@/classes/Logger";
import { CheckEnvs } from "@/utils/env";

CheckEnvs(["DISCORD_TOKEN"]);

const logger = new Logger();
const client = new Client(logger);

client.connect();

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason as any);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);
  await client.destroy();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
