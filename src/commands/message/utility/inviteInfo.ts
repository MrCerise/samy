import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { InviteInfo } from "@/commands/shared/inviteInfo";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "inviteinfo",
  description: "Get information about a Discord invite.",
  category: "Utility",
  aliases: ["ii"],
  arguments: [
    {
      name: "invite",
      description: "The invite code or link",
      aliases: ["i"],
      type: "string",
      required: true,
    },
  ],

  async execute(client, message, args) {
    const raw = args.getString("invite");

    if (!raw) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(client.i18n.t("commands.inviteinfo.provide_invite")),
        ],
      });
      return;
    }

    try {
      const container = await InviteInfo(client, raw);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch invite info", { error, raw });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.inviteinfo.fetch_error"))],
      });
    }
  },
});
