export type DetectedScript =
  | { kind: "embed"; source: string; content?: string }
  | { kind: "cv2"; source: string; content?: string }
  | { kind: "text"; source: string };

export function detectScriptKind(input: string): DetectedScript {
  const trimmed = input.trim();
  const marker = findScriptMarker(trimmed);

  if (!marker) {
    return { kind: "text", source: trimmed };
  }

  const prefix = trimmed.slice(0, marker.index).trim();
  const source = trimmed.slice(marker.index + marker.length).trim();
  const content = prefix.length > 0 ? prefix : undefined;

  return {
    kind: marker.kind,
    source,
    content,
  };
}

function findScriptMarker(
  input: string,
): { kind: "embed" | "cv2"; index: number; length: number } | null {
  const match = /\{(embed|cv2)\}\s*(?:\$v\s*)?/i.exec(input);
  if (!match || match.index === undefined) return null;

  return {
    kind: match[1]!.toLowerCase() as "embed" | "cv2",
    index: match.index,
    length: match[0].length,
  };
}

export function mergeMessageContent(
  ...parts: Array<string | undefined>
): string | undefined {
  const merged = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part && part.length > 0))
    .join("\n");

  return merged.length > 0 ? merged : undefined;
}
