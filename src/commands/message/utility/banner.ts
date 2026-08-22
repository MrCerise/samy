import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { Banner } from "@/commands/shared/banner";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "banner",
  description: "Replies with a user's banner",
  category: "Utility",
  aliases: ["bn"],
  arguments: [
    {
      name: "user",
      description: "The user to get the banner from",
      aliases: ["u"],
      type: "user",
    },
  ],

  async execute(client, message, args) {
    const target = args.getUser("user") ?? message.author;
    const member = message.guild?.members.cache.get(target.id);

    try {
      const container = await Banner(client, target, member);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch banner", {
        error,
        user: target.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.banner.fetch_error"))],
      });
    }
  },
});
