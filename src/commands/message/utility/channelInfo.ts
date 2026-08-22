import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { ChannelInfo } from "@/commands/shared/channelInfo";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "channelinfo",
  description: "View information about a channel",
  category: "Utility",
  aliases: ["ci"],
  guildOnly: true,
  arguments: [
    {
      name: "channel",
      description: "The channel to get information about",
      aliases: ["c"],
      type: "channel",
      required: false,
    },
  ],

  async execute(client, message, args) {
    const target = args.getChannel("channel") ?? message.channel;
    const channel = message.guild?.channels.cache.get(target.id);

    if (!channel) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.channelinfo.not_found"))],
      });
      return;
    }

    try {
      const container = ChannelInfo(client, channel);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch channel info", {
        error,
        channel: channel.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(client.i18n.t("commands.channelinfo.fetch_error")),
        ],
      });
    }
  },
});
