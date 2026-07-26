import type { LastFMArtist, LastFMAlbum, LastFMImage } from "./common";

export interface LastFMTrack {
  name: string;
  mbid?: string;

  artist: LastFMArtist;

  // Last.fm sometimes omits album entirely on recent tracks (e.g. singles
  // scrobbled without album tags), so this must be optional.
  album?: LastFMAlbum;

  url: string;

  image: LastFMImage[];

  date?: {
    uts: string;
    "#text": string;
  };

  "@attr"?: {
    nowplaying: "true";
  };
}

export interface LastFMTrackInfo {
  name: string;

  artist: {
    name: string;
    mbid?: string;
    url: string;
  };

  album?: {
    title: string;
    artist: string;
    url: string;
  };

  userplaycount?: string;
  playcount?: string;

  url: string;

  image: LastFMImage[];
}

// This is the shape of `response.recenttracks` AFTER UserMethods.getRecentTracks
// unwraps the top-level Last.fm envelope — it does not have another
// "recenttracks" key inside it.
export interface LastFMRecentTracks {
  track: LastFMTrack[];

  "@attr": {
    user: string;
    total: string;
    page: string;
    perPage: string;
    totalPages: string;
  };
}
