import { MessageCommand } from "@/classes/Command";
import { compileEmbedScript } from "@/libs/scripting/embed";
import { extractRawScript } from "@/libs/scripting/extractRawScript";
import errorUI from "@/ui/error";
import { MessageFlags } from "discord.js";

export default new MessageCommand({
  name: "embed",
  description: "Build and send a Discord embed from a Bleed-inspired script.",
  category: "Utility",

  arguments: [
    {
      name: "script",
      type: "string",
      description:
        "Embed script, e.g. {title: Hello}$v{description: World}$v{color: #5865F2}",
      required: true,
    },
  ],
  botPermissions: ["EmbedLinks"],

  async execute(client, message) {
    const script = extractRawScript(message.content, client.prefix);

    if (!script) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            "Provide an embed script.\nExample: `,embed {title: Hello}$v{description: World}$v{color: #5865F2}`",
          ),
        ],
      });
      return;
    }

    const compiled = compileEmbedScript(script);

    if (!compiled.success) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(compiled.error.message)],
      });
      return;
    }

    await message.reply({
      content: compiled.result.content,
      embeds: [compiled.result.embed],
      components: compiled.result.components,
    });
  },
});
