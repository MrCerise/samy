import Elysia from "elysia";
import type { ShardingManager } from "discord.js";

interface StatusEntry {
  latency: number;
  member_count: number;
  server_count: number;
  uptime: number;
  is_ready: boolean;
  last_updated: string;
}

export default (manager: ShardingManager) =>
  new Elysia({ prefix: "/status" }).get("/", async () => {
    try {
      const statuses = (await manager.broadcastEval((client) => {
        const guilds = [...client.guilds.cache.values()];

        return {
          latency: client.ws.ping,
          member_count: guilds.reduce(
            (total, guild) => total + (guild.memberCount ?? 0),
            0,
          ),
          server_count: guilds.length,
          uptime: client.uptime ?? 0,
          is_ready: client.isReady(),
        };
      })) as StatusEntry[];

      return statuses;
    } catch (error) {
      console.error("Failed to gather status from shards", error);

      return [];
    }
  });
