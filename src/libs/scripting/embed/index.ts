import { ScriptError, isScriptError } from "../common/ScriptError";
import type { EmbedScript } from "./ast/EmbedNode";
import { parseEmbedScript } from "./parser/EmbedParser";
import { validateEmbedScript } from "./validator/EmbedValidator";
import {
  renderEmbedScript,
  type EmbedRenderOptions,
  type EmbedRenderResult,
} from "./renderer/EmbedRenderer";

export type { EmbedScript, EmbedNode, AnyEmbedNode } from "./ast/EmbedNode";
export { EmbedParser, parseEmbedScript } from "./parser/EmbedParser";
export { EmbedValidator, validateEmbedScript } from "./validator/EmbedValidator";
export {
  EmbedRenderer,
  renderEmbedScript,
  type EmbedRenderOptions,
  type EmbedRenderResult,
} from "./renderer/EmbedRenderer";
export { getEmbedParameter, listEmbedParameters } from "./registry";

export type EmbedCompileResult =
  | { success: true; result: EmbedRenderResult; script: EmbedScript }
  | { success: false; error: ScriptError };

export function compileEmbedScript(
  source: string,
  options?: EmbedRenderOptions,
): EmbedCompileResult {
  try {
    const script = parseEmbedScript(source);
    validateEmbedScript(script);
    const result = renderEmbedScript(script, options);
    return { success: true, result, script };
  } catch (error) {
    if (isScriptError(error)) {
      return { success: false, error };
    }

    return {
      success: false,
      error: new ScriptError(
        "SYNTAX",
        error instanceof Error
          ? error.message
          : "Failed to compile embed script.",
      ),
    };
  }
}
