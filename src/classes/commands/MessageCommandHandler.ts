import type { Message } from "discord.js";
import type Client from "../Client";
import type { MessageCommand } from "./MessageComamnd";

export async function handleMessageCommand(
  client: Client,
  message: Message,
  command: MessageCommand,
  prefix: string,
  rawArgs: string,
): Promise<void> {
  const result = await command.parse(client, message, rawArgs);

  if (!result.success) {
    const errorList = result.errors
      .map((error) => `• ${error.message}`)
      .join("\n");
    await message.reply(`${errorList}\n\n${command.help(prefix)}`);
    return;
  }

  await command.execute(client, message, result.args);
}
