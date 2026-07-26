import type { LastFMNow } from "@/libs/lastfm/src/types/now";
import { Container, Text } from "../components";

export default function LastFMNowUI(data: LastFMNow) {
  const {
    username,
    track,
    artistScrobbles,
    albumScrobbles,
    trackScrobbles,
    totalScrobbles,
    profile,
  } = data;

  const isPlaying = track["@attr"]?.nowplaying === "true";

  const image =
    track.image?.find((image) => image.size === "extralarge")?.["#text"] ||
    track.image?.at(-1)?.["#text"];

  return new Container().addSectionComponents((section) => {
    section.addTextDisplayComponents(
      Text(
        `${isPlaying ? "**Now Playing**" : "**Last Played**"} for **[${username}](${profile.url})**\n\n` +
          `**${track.name}**\n` +
          `**${track.artist["#text"]}** • ${track.album?.["#text"] || "Unknown Album"}\n\n` +
          `-# ${artistScrobbles.toLocaleString()} artist scrobbles · ` +
          `${albumScrobbles.toLocaleString()} album scrobbles · ` +
          `${trackScrobbles.toLocaleString()} track scrobbles\n` +
          `-# ${totalScrobbles.toLocaleString()} total scrobbles`,
      ),
    );

    if (image) {
      section.setThumbnailAccessory((thumbnail) => thumbnail.setURL(image));
    }

    return section;
  });
}
