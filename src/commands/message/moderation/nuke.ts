import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  MessageFlags,
  SeparatorBuilder,
  type TextChannel,
} from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { Container, Text } from "@/ui/components";
import { checkPermissions } from "@/utils/permission";
import type Client from "@/classes/client";

export default new MessageCommand({
  name: "nuke",
  description: "Deletes and recreates the current channel.",
  category: "Moderation",
  guildOnly: true,
  userPermissions: ["ManageChannels"],
  botPermissions: ["ManageChannels"],

  arguments: [
    {
      name: "channel",
      description: "The channel to nuke.",
      type: "channel",
    },
  ],

  async execute(client, message, args) {
    const channel = args.getChannel("channel") ?? message.channel;

    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildAnnouncement
    ) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text("This command can only be used in a text channel."),
          ),
        ],
      });

      return;
    }

    const guild = message.guild!;
    const oldChannel = channel as TextChannel;

    if (
      guild.rulesChannelId === oldChannel.id ||
      guild.publicUpdatesChannelId === oldChannel.id ||
      guild.systemChannelId === oldChannel.id
    ) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text("This is a protected Community channel and cannot be nuked."),
          ),
        ],
      });

      return;
    }

    if (!checkPermissions(message.member!, oldChannel, ["ManageChannels"])) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text("You do not have permission to nuke this channel."),
          ),
        ],
      });

      return;
    }

    const nukeButton = new ButtonBuilder()
      .setCustomId(`nuke:${oldChannel.id}`)
      .setLabel("Nuke")
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId(`cancel:${oldChannel.id}`)
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      cancelButton,
      nukeButton,
    );
    const confirmation = await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container()
          .text(
            Text(
              `You are about to delete ${oldChannel}.\n\n` +
                "All messages will be permanently deleted.",
            ),
          )
          .separator(new SeparatorBuilder().setDivider(true))
          .actionRow(row),
      ],
    });

    try {
      const interaction = await confirmation.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30_000,
        filter: (i) =>
          i.user.id === message.author.id &&
          (i.customId === `nuke:${oldChannel.id}` ||
            i.customId === `cancel:${oldChannel.id}`),
      });

      if (interaction.customId === `cancel:${oldChannel.id}`) {
        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text("The channel nuke operation was cancelled."),
            ),
          ],
        });

        return;
      }

      const member = await guild.members.fetch(interaction.user.id);

      if (!checkPermissions(member, oldChannel, ["ManageChannels"])) {
        await interaction.reply({
          ephemeral: true,
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text("You no longer have permission to nuke this channel."),
            ),
          ],
        });

        return;
      }

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(
              `Confirmed by ${interaction.user}.\n\n` +
                `Recreating ${oldChannel}...`,
            ),
          ),
        ],
      });
      const clone = await oldChannel.clone({
        name: oldChannel.name,
        reason: `Channel nuked by ${interaction.user.tag}`,
      });

      await clone.setPosition(oldChannel.position);

      await oldChannel.delete(`Channel nuked by ${interaction.user.tag}`);

      await migrateChannelData(client, oldChannel.id, clone.id);

      await clone.send({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(`This channel has been nuked by ${interaction.user}.`),
          ),
        ],
      });
    } catch {
      await confirmation.edit({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text("The confirmation timed out after 30 seconds."),
          ),
        ],
      });
    }
  },
});

async function migrateChannelData(
  client: Client,
  oldChannelId: string,
  cloneId: string,
) {
  await client.prisma.welcome.updateMany({
    where: {
      channelId: oldChannelId,
    },
    data: {
      channelId: cloneId,
    },
  });
}
