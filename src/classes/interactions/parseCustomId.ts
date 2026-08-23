export function parseCustomId(customId: string) {
  const parts = customId.split("::");
  const namespace = parts[0];
  const action = parts[1];
  const rest = parts.slice(2);
  const invokerId = rest.pop();

  return { namespace, action, params: rest, invokerId };
}
