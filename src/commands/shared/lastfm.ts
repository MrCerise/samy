import type Client from "@/classes/client";
import lastfm from "@/libs/lastfm";

import type { LastFMNow as LastFMNowResponse } from "@/libs/lastfm/src/types/now";

export const LastFMCommand = {
  name: "lastfm",
  description:
    "View your Last.fm profile, recent tracks, and overall statistics",
  category: "Utility",
};

export async function LastFMProfile(username: string) {
  const user = await lastfm.user.getInfo(username);

  if (!user?.name) {
    throw new Error("Private or unavailable Last.fm profile");
  }

  return user;
}

export async function LastFMNow(
  client: Client,
  userId: string,
): Promise<LastFMNowResponse | null> {
  const linkedUser = await client.lastFm.getUser(userId);

  if (!linkedUser) {
    throw new Error("No Last.fm account linked");
  }

  return LastFMNowUsername(linkedUser.username);
}

export async function LastFMNowUsername(
  username: string,
): Promise<LastFMNowResponse | null> {
  const [profile, recentTracks] = await Promise.all([
    lastfm.user.getInfo(username),
    lastfm.user.getRecentTracks(username),
  ]);

  if (!recentTracks?.track) {
    throw new Error(
      `Last.fm getRecentTracks(${username}) returned an unexpected response`,
    );
  }

  const track = recentTracks.track[0];

  if (!track) {
    return null;
  }

  const artistName = track.artist?.["#text"];
  const albumName = track.album?.["#text"];

  const [trackInfo, artistInfo, albumInfo] = await Promise.all([
    lastfm.track.getInfo({
      artist: artistName,
      track: track.name,
      username,
    }),

    lastfm.artist.getInfo(artistName, username),

    albumName
      ? lastfm.album.getInfo({
          artist: artistName,
          album: albumName,
          username,
        })
      : Promise.resolve(null),
  ]);

  return {
    username,
    profile,
    track,

    artistScrobbles: Number(artistInfo?.stats?.userplaycount ?? 0),

    albumScrobbles: Number(albumInfo?.userplaycount ?? 0),

    trackScrobbles: Number(trackInfo?.userplaycount ?? 0),

    totalScrobbles: Number(profile.playcount ?? 0),
  };
}

export async function LastFMLink(
  client: Client,
  userId: string,
  username: string,
) {
  const profile = await LastFMProfile(username);

  await client.lastFm.setUser(userId, profile.name);

  return profile;
}
