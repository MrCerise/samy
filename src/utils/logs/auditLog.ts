import {
  PermissionFlagsBits,
  type AuditLogEvent,
  type Guild,
  type PartialUser,
  type User,
} from "discord.js";

const LOOKUP_WINDOW_MS = 5000;

export interface AuditLogLookup {
  executor: User | PartialUser | null;
  reason: string | null;
}

export async function findAuditLogExecutor(
  guild: Guild,
  type: AuditLogEvent,
  targetId: string,
): Promise<AuditLogLookup | null> {
  const botMember = guild.members.me;

  if (!botMember?.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
    return null;
  }

  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 5 });

    const entry = logs.entries.find(
      (candidate) =>
        candidate.targetId === targetId &&
        Date.now() - candidate.createdTimestamp < LOOKUP_WINDOW_MS,
    );

    if (!entry) return null;

    return { executor: entry.executor, reason: entry.reason };
  } catch {
    return null;
  }
}
