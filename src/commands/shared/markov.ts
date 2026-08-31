import type Client from "@/classes/client";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";

export function MarkovGenerateResult(client: Client, sentence: string) {
  return new Container().text(
    Text(client.i18n.t("commands.markov.result", { sentence })),
  );
}

export function MarkovNoChainError(client: Client) {
  return errorUI(client.i18n.t("commands.markov.no_chain"));
}

export function MarkovSeedNotFoundError(client: Client, seed: string) {
  return errorUI(client.i18n.t("commands.markov.seed_not_found", { seed }));
}
