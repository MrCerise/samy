import prisma from "@/libs/prisma";

const LOCK_KEY = 7825551234n;

type LockResult = { pg_try_advisory_lock: boolean };

export async function acquireLock(logger: { info: (msg: string) => void }) {
  while (true) {
    const result = await prisma.$queryRaw<
      LockResult[]
    >`SELECT pg_try_advisory_lock(${LOCK_KEY})`;

    const row = result[0];
    if (!row) throw new Error("pg_try_advisory_lock returned no rows");

    if (row.pg_try_advisory_lock) return;

    logger.info("Another instance holds the shard lock, waiting...");
    await new Promise((r) => setTimeout(r, 2000));
  }
}

export async function releaseLock() {
  await prisma.$executeRaw`SELECT pg_advisory_unlock(${LOCK_KEY})`;
}
