import type { LastFMTrack } from "./tracks";
import type { LastFMUser } from "./user";

export interface LastFMNow {
  username: string;
  profile: LastFMUser;
  track: LastFMTrack;

  artistScrobbles: number;
  albumScrobbles: number;
  trackScrobbles: number;
  totalScrobbles: number;
}
