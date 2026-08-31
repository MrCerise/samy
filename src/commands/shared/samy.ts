import Client from "@/classes/client";

import {
  ActionRow,
  Button,
  Buttons,
  Container,
  Media,
  Text,
} from "@/ui/components";

export async function SamyResult(client: Client, invokerId: string) {
  const images = await GetSamyImages(client);

  if (images.length === 0) {
    return new Container().text(Text("No Samy images are available."));
  }

  const image = images[Math.floor(Math.random() * images.length)]!;

  return new Container()
    .media(Media(image.url))
    .actionRow(
      ActionRow(Buttons.secondary("Show more", `samy::again::${invokerId}`)),
    );
}

export async function GetSamyImages(
  client: Client,
): Promise<{ url: string }[]> {
  return client.prisma.samyImage.findMany({
    select: {
      url: true,
    },
  });
}
