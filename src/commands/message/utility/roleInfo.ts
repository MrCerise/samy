import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { RoleInfo } from "@/commands/shared/roleInfo";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "roleinfo",
  description: "View information about a role",
  category: "Utility",
  aliases: ["ri"],
  guildOnly: true,
  arguments: [
    {
      name: "role",
      description: "The role to get information about",
      aliases: ["r"],
      type: "role",
      required: true,
    },
  ],

  async execute(client, message, args) {
    const role = args.getRole("role");

    if (!role) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.roleinfo.provide_role"))],
      });
      return;
    }

    try {
      const container = RoleInfo(client, role);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch role info", {
        error,
        role: role.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.roleinfo.fetch_error"))],
      });
    }
  },
});
