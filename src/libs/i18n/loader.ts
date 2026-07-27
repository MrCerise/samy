import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { LocaleIdentifier, TranslationDictionary } from "./types";

const defaultLocalesDirectory = fileURLToPath(
  new URL("../../locales", import.meta.url),
);

export class TranslationLoader {
  private cache = new Map<LocaleIdentifier, TranslationDictionary>();
  private loading?: Promise<
    ReadonlyMap<LocaleIdentifier, TranslationDictionary>
  >;

  constructor(private readonly localesDirectory = defaultLocalesDirectory) {}

  load(): Promise<ReadonlyMap<LocaleIdentifier, TranslationDictionary>> {
    this.loading ??= this.loadAll();
    return this.loading;
  }

  private async loadAll(): Promise<
    ReadonlyMap<LocaleIdentifier, TranslationDictionary>
  > {
    const entries = await readdir(this.localesDirectory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const locale = entry.name;
      const dictionary = await this.loadLocale(
        join(this.localesDirectory, locale),
      );
      this.cache.set(locale, dictionary);
    }

    return this.cache;
  }

  private async loadLocale(
    localeDirectory: string,
  ): Promise<TranslationDictionary> {
    const entries = await readdir(localeDirectory, { withFileTypes: true });
    const dictionary: Record<string, TranslationDictionary> = {};

    for (const entry of entries) {
      if (!entry.isFile() || extname(entry.name).toLowerCase() !== ".json")
        continue;

      const contents = await readFile(
        join(localeDirectory, entry.name),
        "utf8",
      );
      const parsed: unknown = JSON.parse(contents);

      if (!isTranslationDictionary(parsed)) {
        throw new TypeError(
          `Locale file ${join(localeDirectory, entry.name)} must contain only strings and nested objects.`,
        );
      }

      dictionary[basename(entry.name, ".json")] = parsed;
    }

    return dictionary;
  }
}

function isTranslationDictionary(
  value: unknown,
): value is TranslationDictionary {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (entry) => typeof entry === "string" || isTranslationDictionary(entry),
  );
}
