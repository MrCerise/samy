import Elysia from "elysia";
import type Client from "@/classes/client";
import type { Guild } from "discord.js";

interface SerializedServer {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
}

function serializeServer(guild: Guild): SerializedServer {
  return {
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({ size: 128 }),
    memberCount: guild.memberCount,
  };
}

export default (client: Client) =>
  new Elysia({ prefix: "/servers" }).get("/", async () => {
    const application = await client.application?.fetch();

    if (!application) {
      return {
        servers: [],
        totalServers: 0,
        totalMembers: 0,
        userInstallCount: 0,
      };
    }

    const servers = [...client.guilds.cache.values()]
      .sort((a, b) => b.memberCount - a.memberCount)
      .map(serializeServer);

    const totalMembers = servers.reduce(
      (total, server) => total + server.memberCount,
      0,
    );

    return {
      servers,
      totalServers: servers.length,
      totalMembers,
      userInstallCount: application.approximateUserInstallCount ?? 0,
    };
  });
