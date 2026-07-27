import { ActionRowBuilder, type AnyComponentBuilder } from "discord.js";

export function ActionRow(...components: AnyComponentBuilder[]) {
  return new ActionRowBuilder<AnyComponentBuilder>().addComponents(
    ...components,
  );
}
