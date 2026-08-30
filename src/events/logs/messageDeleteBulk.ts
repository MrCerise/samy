import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

const PREVIEW_LIMIT = 10;
const PREVIEW_CHAR_LIMIT = 1000;

export default new Event({
  name: "messageDeleteBulk",

  async execute(client, messages, channel) {
    if (!channel.guild) return;

    const nonPartial = [...messages.values()].filter(
      (message) => !message.partial && !message.author?.bot,
    );

    const preview = nonPartial
      .slice(0, PREVIEW_LIMIT)
      .map(
        (message) =>
          `**${message.author?.tag ?? "Unknown"}:** ${
            message.content || "*no text content*"
          }`,
      )
      .join("\n")
      .slice(0, PREVIEW_CHAR_LIMIT);

    const container = buildLogEntry({
      category: "messages",
      title: "Bulk message delete",
      description: `**${messages.size}** messages deleted in <#${channel.id}>`,
      fields: preview
        ? [
            {
              name: `Preview (first ${Math.min(PREVIEW_LIMIT, nonPartial.length)})`,
              value: preview,
            },
          ]
        : undefined,
      footer: `Channel ID: ${channel.id}`,
    });

    await sendLog(client, {
      guildId: channel.guild.id,
      category: "messages",
      sourceChannelId: channel.id,
      ignoreTargets: [channel.id],
      container,
    });
  },
});
