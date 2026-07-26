import { UserMethods } from "./methods/user";

export interface LastFMOptions {
  apiKey: string;
}

export class LastFM {
  public readonly apiKey: string;
  public readonly baseUrl: string;
  public readonly userAgent: string;

  public readonly user: UserMethods;

  constructor(options: LastFMOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = "https://ws.audioscrobbler.com/2.0";
    this.userAgent =
      "@theoldzoom/lastfm (+https://github.com/TheOldZoom/lastfm)";

    this.user = new UserMethods(this);
  }
}
