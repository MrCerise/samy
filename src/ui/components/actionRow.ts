import {
  ActionRowBuilder,
  type MessageActionRowComponentBuilder,
} from "discord.js";

export function ActionRow(...components: MessageActionRowComponentBuilder[]) {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    ...components,
  );
}
