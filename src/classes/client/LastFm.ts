import prisma from "@/libs/prisma";
import { Collection } from "discord.js";

interface CachedLastFMUser {
  username: string;
  cachedAt: number;
}

export default class ClientLastFM {
  public readonly users = new Collection<string, CachedLastFMUser>();

  async getUser(userId: string) {
    const cached = this.users.get(userId);

    if (cached) {
      return cached;
    }

    const user = await prisma.lastFM.findUnique({
      where: {
        userId,
      },
    });

    if (!user) {
      return null;
    }

    const cachedUser = {
      username: user.username,
      cachedAt: Date.now(),
    };

    this.users.set(userId, cachedUser);

    return cachedUser;
  }

  async setUser(userId: string, username: string) {
    await prisma.user.upsert({
      where: {
        id: userId,
      },
      create: {
        id: userId,
        lastfm: {
          create: {
            username,
          },
        },
      },
      update: {
        lastfm: {
          upsert: {
            create: {
              username,
            },
            update: {
              username,
              connectedAt: new Date(),
            },
          },
        },
      },
    });

    this.users.set(userId, {
      username,
      cachedAt: Date.now(),
    });
  }

  async deleteUser(userId: string) {
    await prisma.lastFM.deleteMany({
      where: {
        userId,
      },
    });

    this.users.delete(userId);
  }
}
