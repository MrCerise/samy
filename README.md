# Samy

An open source alternative to Bleed-like Discord bots. A modern open source Discord bot built for automation, moderation, and powerful customization.

Built with:

- TypeScript
- Bun
- Discord.js
- Prisma
- PostgreSQL

## Development

> Samy is currently in active development. Features may change, break, or be incomplete.\
> **Support:** https://discord.gg/SBx3mn4r8e \
> You can follow planned features and progress in the [TODO.md](TODO.md) file.\
> Have an idea, suggestion, or feature request? Please create an issue so it can be discussed and tracked.

### Sharding

Samy scales automatically using discord.js `ShardingManager`. `src/index.ts` is the manager: it spawns one bot process per shard (`src/bot.ts`) and runs the HTTP API once in the manager process, aggregating data across shards.

- `TOTAL_SHARDS` (optional): leave unset for Discord's recommended count, or set a fixed number.
- The API exposes `/health`, `/shards` (shard readiness), and `/status` (per-shard `shard_id`, `latency`, `member_count`, `server_count`, `uptime`, `is_ready`, `last_updated`).
- To run a single shard directly (local dev without the manager):

  ```sh
  bun run src/bot.ts
  ```

## Commands

Command docs are generated from source into [`docs/commands`](docs/commands). Run `bun run docs` to regenerate.

## License

Samy is licensed under the [GNU Affero General Public License v3.0](LICENSE).

Any modified versions of Samy must also be released under the AGPL-3.0 license. If you run a modified version of Samy as a service, you must make the source code available to users of that service.
