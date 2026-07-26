import { UserMethods } from "./methods/user";
import { TrackMethods } from "./methods/track";
import { ArtistMethods } from "./methods/artist";
import { AlbumMethods } from "./methods/album";

export interface LastFMOptions {
  apiKey: string;
}

export class LastFM {
  public readonly apiKey: string;
  public readonly baseUrl: string;
  public readonly userAgent: string;

  public readonly user: UserMethods;
  public readonly track: TrackMethods;
  public readonly artist: ArtistMethods;
  public readonly album: AlbumMethods;

  constructor(options: LastFMOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = "https://ws.audioscrobbler.com/2.0";
    this.userAgent =
      "@theoldzoom/lastfm (+https://github.com/TheOldZoom/lastfm)";

    this.user = new UserMethods(this);
    this.track = new TrackMethods(this);
    this.artist = new ArtistMethods(this);
    this.album = new AlbumMethods(this);
  }
}
