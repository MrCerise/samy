export * as common from "./common";
export * as embed from "./embed";
export * as cv2 from "./cv2";

export { compileEmbedScript } from "./embed";
export { compileCv2Script } from "./cv2";
export { ScriptError, isScriptError } from "./common/ScriptError";
export { extractRawScript } from "./extractRawScript";
export {
  detectScriptKind,
  mergeMessageContent,
  extractDeleteDirective,
} from "./detectScriptKind";
export type { DetectedScript } from "./detectScriptKind";
export { scheduleMessageDeletion } from "./scheduleMessageDeletion";
