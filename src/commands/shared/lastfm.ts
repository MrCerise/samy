import lastfm from "@/libs/lastfm";
import { randomUUID } from "node:crypto";

export const LastFMCommand = {
  name: "lastfm",
  description:
    "View your Last.fm profile, recent tracks, and overall statistics",
  category: "Utility",
};

async function LastFMNow(user: string) {}

export async function LastFMLink(userId: string) {}
