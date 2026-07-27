export type LocaleIdentifier = string;

export type TranslationValue = string | TranslationDictionary;

export interface TranslationDictionary {
  readonly [key: string]: TranslationValue;
}

export type TranslationVariables = Record<string, string | number>;

export interface LocaleResolutionOptions {
  userLocale?: LocaleIdentifier | null;
  guildLocale?: LocaleIdentifier | null;
  interactionLocale?: LocaleIdentifier | null;
}
