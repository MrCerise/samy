import { MessageFlags } from "discord.js";

import Event from "@/classes/Event";
import {
  buildCategoryView,
  buildCommandView,
  buildOverview,
  buildSubcommandView,
} from "@/ui/help";
import errorUI from "@/ui/error";

export default new Event({
  name: "interactionCreate",

  async execute(client, interaction) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith("help::")) return;

    const parts = interaction.customId.split("::");
    const [, action, ...rest] = parts;
    const invokerId = rest.pop();

    if (!action || !invokerId) return;

    if (interaction.user.id !== invokerId) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [errorUI(client.i18n.t("errors.not_your_menu"))],
      });
      return;
    }

    if (action === "noop") return;

    const selected = interaction.isStringSelectMenu()
      ? interaction.values[0]
      : undefined;

    let container: ReturnType<typeof buildOverview> | null = null;

    switch (action) {
      case "home": {
        const page = Number(rest[0] ?? 0);
        container = buildOverview(client, invokerId, page);
        break;
      }

      case "categories": {
        if (!selected) return;
        container = buildCategoryView(client, invokerId, selected, 0);
        break;
      }

      case "category": {
        const [category, page] = rest;
        if (!category) return;
        container = buildCategoryView(
          client,
          invokerId,
          category,
          Number(page ?? 0),
        );
        break;
      }

      case "commands": {
        const [category, page] = rest;
        if (!category || !selected) return;
        container = buildCommandView(
          client,
          invokerId,
          category,
          selected,
          Number(page ?? 0),
        );
        break;
      }

      case "command": {
        const [category, commandName, categoryPage, subPage] = rest;
        if (!category || !commandName) return;
        container = buildCommandView(
          client,
          invokerId,
          category,
          commandName,
          Number(categoryPage ?? 0),
          Number(subPage ?? 0),
        );
        break;
      }

      case "subcommands": {
        const [category, commandName, categoryPage, subPage] = rest;
        if (!category || !commandName || !selected) return;
        container = buildSubcommandView(
          client,
          invokerId,
          category,
          commandName,
          selected,
          Number(categoryPage ?? 0),
          Number(subPage ?? 0),
        );
        break;
      }

      default:
        return;
    }

    if (!container) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          errorUI(client.i18n.t("commands.help.not_found", { command: "" })),
        ],
      });
      return;
    }

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
