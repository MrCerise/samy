import type {
  LocaleIdentifier,
  TranslationDictionary,
  TranslationValue,
  TranslationVariables,
} from "./types";

export const DEFAULT_LOCALE = "en";

export function translate(
  translations: ReadonlyMap<LocaleIdentifier, TranslationDictionary>,
  locale: string,
  key: string,
  variables?: TranslationVariables,
): string {
  const dictionary = translations.get(locale);
  const fallbackDictionary = translations.get(DEFAULT_LOCALE);

  const value =
    (dictionary ? getNestedValue(dictionary, key) : undefined) ??
    (fallbackDictionary ? getNestedValue(fallbackDictionary, key) : undefined);

  if (typeof value !== "string") return key;

  return value.replace(/\{([^{}]+)\}/g, (placeholder, variableName: string) => {
    const variable = variables?.[variableName];
    return variable === undefined ? placeholder : String(variable);
  });
}

function getNestedValue(
  dictionary: TranslationDictionary,
  key: string,
): TranslationValue | undefined {
  let value: TranslationValue | undefined = dictionary;

  for (const segment of key.split(".")) {
    if (value === undefined || typeof value === "string") return undefined;
    value = value[segment];
  }

  return value;
}
