import Event from "@/classes/Event";
import { ensureGuild } from "@/utils/guild";

export default new Event({
  name: "guildCreate",

  async execute(client, guild) {
    await ensureGuild(guild.id);
  },
});
