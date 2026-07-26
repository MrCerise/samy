import type { LastFM } from "../client";
import { request } from "../request";

export class TrackMethods {
  constructor(private readonly client: LastFM) {}
}
