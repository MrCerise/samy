import { SlashCommand } from "@/classes/Command";
import { Container, Text } from "@/ui/components";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("gay")
    .setDescription("See how gay someone is.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to check."),
    )
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    )
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ),

  category: "Fun",

  async execute(client, interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const percentage = getGay(user.id);

    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        users: [],
      },
      components: [
        new Container().addTextDisplayComponents(
          Text(
            client.i18n.t("commands.gay.result", {
              user: user.username,
              percentage,
            }),
          ),
        ),
      ],
    });
  },
});

function getGay(userId: string): number {
  let hash = 0;

  for (const char of userId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash % 102;
}
