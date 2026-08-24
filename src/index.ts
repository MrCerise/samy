import * as Discord from "discord.js";
import { CheckEnvs } from "@/utils/env";
import Logger from "@/classes/Logger";
import API from "./classes/API";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

CheckEnvs(["DISCORD_TOKEN"]);

const logger = new Logger();

const __dirname = dirname(fileURLToPath(import.meta.url));

const manager = new Discord.ShardingManager(join(__dirname, "bot.ts"), {
  token: process.env.DISCORD_TOKEN,
  totalShards: process.env.TOTAL_SHARDS ? Number(process.env.TOTAL_SHARDS) : "auto",
  mode: "process",
  respawn: true,
});

manager.on("shardCreate", (shard) => {
  logger.info(`Launched shard ${shard.id}`);

  shard.on("ready", () => logger.info(`Shard ${shard.id} is ready`));
  shard.on("death", () => logger.warn(`Shard ${shard.id} died`));
});

const api = new API(manager, logger);
api.start(Number(process.env.PORT ?? 4000));

manager.spawn({ timeout: -1 }).catch((err) => {
  logger.error(`Failed to spawn shards: ${err?.stack ?? err}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);

  manager.shards.forEach((shard) => shard.kill());
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
