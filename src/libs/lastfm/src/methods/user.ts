import type { LastFM } from "../client";
import { request } from "../request";

export class UserMethods {
  constructor(private readonly client: LastFM) {}

  async getInfo(user: string) {
    return request(this.client, "user.getInfo", {
      user,
    });
  }

  async getRecentTracks(user: string) {
    return request(this.client, "user.getRecentTracks", {
      user,
    });
  }
}
