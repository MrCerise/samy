import { MessageFlags, type User, type Snowflake } from "discord.js";
import { MessageCommand } from "@/classes/Command";
import { Container, Text } from "@/ui/components";
import { msToHuman } from "@/utils/duration";
import type Client from "@/classes/client";

function getSnowflakeTimestamp(snowflake: Snowflake): number {
  const DISCORD_EPOCH = 1420070400000n;
  const id = BigInt(snowflake);

  return Number((id >> 22n) + DISCORD_EPOCH);
}

export default new MessageCommand({
  name: "timediff",
  description:
    "Calculate the time difference between two Discord snowflake IDs.",
  category: "Settings",

  arguments: [
    {
      name: "id1",
      type: "string",
      description: "First snowflake ID.",
      required: true,
    },
    {
      name: "id2",
      type: "string",
      description: "Second snowflake ID.",
      required: true,
    },
  ],

  async execute(client, message, args) {
    const id1 = args.getString("id1");
    const id2 = args.getString("id2");

    if (!id1 || !id2) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(client.i18n.t("commands.timediff.provide_ids")),
          ),
        ],
      });

      return;
    }

    const timestamp1 = getSnowflakeTimestamp(id1);
    const timestamp2 = getSnowflakeTimestamp(id2);

    if (isNaN(timestamp1) || isNaN(timestamp2)) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(client.i18n.t("commands.timediff.invalid")),
          ),
        ],
      });

      return;
    }

    const earlierTimestamp = Math.min(timestamp1, timestamp2);
    const laterTimestamp = Math.max(timestamp1, timestamp2);

    const earlierId = timestamp1 <= timestamp2 ? id1 : id2;
    const laterId = timestamp1 <= timestamp2 ? id2 : id1;

    const diff = laterTimestamp - earlierTimestamp;

    let target: User | null = null;

    try {
      target = await client.users.fetch(laterId).catch(() => null);
    } catch {
      target = null;
    }

    const targetDisplay = target
      ? `**${target.tag}**\n\`${target.id}\``
      : `\`${laterId}\``;

    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container().text(
          Text(
            client.i18n.t("commands.timediff.result", {
              id1: earlierId,
              target: targetDisplay,
              duration: msToHuman(diff),
              earlier: Math.floor(earlierTimestamp / 1000),
              later: Math.floor(laterTimestamp / 1000),
            }),
          ),
        ),
      ],
    });
  },
});
