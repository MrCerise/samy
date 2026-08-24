import Client from "@/classes/client";
import Logger from "@/classes/Logger";
import { CheckEnvs } from "@/utils/env";

import API from "./classes/API";

CheckEnvs(["DISCORD_TOKEN"]);

const logger = new Logger();
const client = new Client(logger);
const api = new API(client, logger);

client.connect();
api.start(Number(process.env.PORT ?? 4000));

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);

  await client.destroy();

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
