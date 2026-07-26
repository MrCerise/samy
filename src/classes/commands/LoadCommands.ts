import type { Collection } from "discord.js";
import { readdir } from "fs/promises";
import { join } from "path";
import type Client from "../Client";

export async function LoadCommands<T extends { name: string }>(
  client: Client,
  directory: string,
  collection: Collection<string, T>,
) {
  const files = await readdir(join(import.meta.dir, directory), {
    recursive: true,
  });

  const type = directory.split("/").pop();

  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

    const command = (await import(join(import.meta.dir, directory, file)))
      .default as T;

    collection.set(command.name, command);

    client.logger.info(`Loaded ${type} command: ${command.name}`);
  }
}
