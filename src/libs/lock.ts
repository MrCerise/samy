import { Client } from "pg";

let client: Client | null = null;
const LOCK_KEY = 1234567890;

export async function acquireLock(logger: { info: (msg: string) => void }) {
  client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  while (true) {
    const result = await client.query<{ pg_try_advisory_lock: boolean }>(
      "SELECT pg_try_advisory_lock($1)",
      [LOCK_KEY],
    );

    if (result.rows[0]?.pg_try_advisory_lock) return;

    logger.info("Another instance holds the shard lock, waiting...");
    await new Promise((r) => setTimeout(r, 2000));
  }
}

export async function releaseLock() {
  if (!client) return;
  await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
  await client.end();
  client = null;
}
