import { ChannelType, type GuildBasedChannel } from "discord.js";

import type Client from "@/classes/client";
import { Container, Text } from "@/ui/components";

const TYPE_LABELS: Partial<Record<ChannelType, string>> = {
  [ChannelType.GuildText]: "Text",
  [ChannelType.GuildVoice]: "Voice",
  [ChannelType.GuildCategory]: "Category",
  [ChannelType.GuildAnnouncement]: "Announcement",
  [ChannelType.GuildStageVoice]: "Stage",
  [ChannelType.GuildForum]: "Forum",
  [ChannelType.PublicThread]: "Thread",
  [ChannelType.PrivateThread]: "Private Thread",
};

export function ChannelInfo(client: Client, channel: GuildBasedChannel) {
  const lines = [
    `**${client.i18n.t("commands.channelinfo.title", { name: channel.name })}**`,
    client.i18n.t("commands.channelinfo.details", {
      id: channel.id,
      type: TYPE_LABELS[channel.type] ?? "Unknown",
      category:
        channel.parent?.name ?? client.i18n.t("commands.channelinfo.none"),
      position: "position" in channel ? channel.position : "N/A",
      created: `<t:${Math.floor((channel.createdTimestamp as number) / 1000)}:D>`,
    }),
  ];

  if (channel.isTextBased() && "topic" in channel && channel.topic) {
    lines.push(
      client.i18n.t("commands.channelinfo.topic", { topic: channel.topic }),
    );
  }

  if ("nsfw" in channel && channel.nsfw) {
    lines.push(client.i18n.t("commands.channelinfo.nsfw"));
  }

  if ("rateLimitPerUser" in channel && channel.rateLimitPerUser) {
    lines.push(
      client.i18n.t("commands.channelinfo.slowmode", {
        seconds: channel.rateLimitPerUser,
      }),
    );
  }

  return new Container().text(Text(lines.join("\n")));
}
