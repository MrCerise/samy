import { TokenKind } from "../../common/Token";
import { Tokenizer } from "../../common/Tokenizer";
import { ScriptError } from "../../common/ScriptError";
import { parseArgumentList, TokenCursor } from "../../common/value/parseValue";
import type { AnyEmbedNode, EmbedScript } from "../ast/EmbedNode";
import { getEmbedParameter } from "../registry";

export class EmbedParser {
  parse(source: string): EmbedScript {
    const trimmed = source.trim();
    if (trimmed.length === 0) {
      throw new ScriptError("EMPTY_SCRIPT", "Embed script is empty.");
    }

    const tokens = new Tokenizer(trimmed).tokenize();
    const cursor = new TokenCursor(tokens);
    const nodes: AnyEmbedNode[] = [];

    cursor.skipWhitespaceText();

    while (!cursor.isAtEnd()) {
      nodes.push(this.parseParameter(cursor));
      cursor.skipWhitespaceText();

      if (cursor.isAtEnd()) break;

      if (cursor.check(TokenKind.Sibling)) {
        cursor.advance();
        cursor.skipWhitespaceText();

        if (cursor.isAtEnd()) break;
        continue;
      }

      throw new ScriptError(
        "SYNTAX",
        "Expected $v between embed parameters.",
        cursor.current,
      );
    }

    if (nodes.length === 0) {
      throw new ScriptError("EMPTY_SCRIPT", "Embed script has no parameters.");
    }

    return { type: "embed", nodes };
  }

  private parseParameter(cursor: TokenCursor): AnyEmbedNode {
    const open = cursor.expect(
      TokenKind.LBrace,
      "Expected { to start an embed parameter.",
    );

    cursor.skipWhitespaceText();

    if (!cursor.check(TokenKind.Text)) {
      throw new ScriptError(
        "SYNTAX",
        "Expected a parameter name after {.",
        cursor.current,
      );
    }

    const nameToken = cursor.advance();
    const rawName = nameToken.value.trim();
    const nameMatch = rawName.match(
      /^([A-Za-z_][A-Za-z0-9_]*)(?:\s+([\s\S]+))?$/,
    );

    if (!nameMatch) {
      throw new ScriptError(
        "SYNTAX",
        `Invalid parameter name "${rawName}".`,
        nameToken,
      );
    }

    const name = nameMatch[1]!;
    const trailing = nameMatch[2];

    if (trailing !== undefined) {
      throw new ScriptError(
        "SYNTAX",
        `Unexpected text after parameter name "${name}". Did you mean {${name}: ${trailing}}?`,
        nameToken,
      );
    }

    if (name.length === 0) {
      throw new ScriptError("SYNTAX", "Parameter name cannot be empty.", open);
    }

    cursor.skipWhitespaceText();

    let args: ReturnType<typeof parseArgumentList> = [];
    if (cursor.check(TokenKind.Colon)) {
      cursor.advance();
      args = parseArgumentList(cursor);
    } else if (!cursor.check(TokenKind.RBrace)) {
      throw new ScriptError(
        "SYNTAX",
        `Expected : or } after parameter name "${name}".`,
        cursor.current,
      );
    }

    cursor.expect(TokenKind.RBrace, `Expected } to close {${name}}.`);

    const definition = getEmbedParameter(name);
    if (!definition) {
      throw new ScriptError(
        "UNKNOWN_PARAMETER",
        `Unknown embed parameter "${name}".`,
        nameToken,
      );
    }

    return definition.create(nameToken, args);
  }
}

export function parseEmbedScript(source: string): EmbedScript {
  return new EmbedParser().parse(source);
}
