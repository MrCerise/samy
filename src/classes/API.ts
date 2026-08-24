import { Elysia } from "elysia";
import type Client from "./client";
import type Logger from "./Logger";

import indexRoute from "../routes";
import healthRoute from "../routes/health";
import commandsRoute from "../routes/commands";
import servers from "@/routes/servers";

export default class API {
  public readonly app: Elysia;

  constructor(
    private readonly client: Client,
    private readonly logger: Logger,
  ) {
    this.app = new Elysia();

    this.registerRoutes();

    this.logger.info("API initialized");
  }

  private registerRoutes() {
    this.app
      .use(indexRoute)
      .use(healthRoute)
      .use(commandsRoute(this.client))
      .use(servers(this.client));
  }

  start(port = 3000) {
    this.app.listen(port);

    this.logger.info(`API listening on port ${port}`);

    return this;
  }

  stop() {
    this.app.stop();

    this.logger.info("API stopped");
  }
}
