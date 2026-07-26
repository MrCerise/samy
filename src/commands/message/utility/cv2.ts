import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { compileCv2Script } from "@/libs/scripting/cv2";
import { extractRawScript } from "@/libs/scripting/extractRawScript";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "cv2",
  description: "Build and send a Components V2 message.",
  category: "Utility",

  arguments: [
    {
      name: "script",
      type: "string",
      description:
        "CV2 script, e.g. {container}$v{text: Hello}$v{separator}$v{section}$v{text: Welcome}$v{button: Click && https://discord.com}",
      required: true,
    },
  ],

  async execute(client, message) {
    const script = extractRawScript(message.content, client.prefix);

    if (!script) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            "Provide a Components V2 script.\nExample: `,cv2 {container}$v{text: Hello}$v{separator}$v{section}$v{text: Welcome}$v{button: Click && https://discord.com}`",
          ),
        ],
      });
      return;
    }

    const compiled = compileCv2Script(script);

    if (!compiled.success) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(compiled.error.message)],
      });
      return;
    }

    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: compiled.result.components,
    });
  },
});
