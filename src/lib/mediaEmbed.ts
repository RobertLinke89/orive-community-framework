export type MediaEmbed = {
  provider: "youtube" | "vimeo";
  id: string;
  title?: string;
  url: string;
};

const YT =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d{6,})/i;

export function extractMediaEmbed(
  ...sources: Array<string | null | undefined>
): MediaEmbed | null {
  for (const raw of sources) {
    const text = String(raw || "");
    if (!text) continue;
    const yt = text.match(YT);
    if (yt?.[1]) {
      return {
        provider: "youtube",
        id: yt[1],
        url: `https://www.youtube.com/embed/${yt[1]}`,
      };
    }
    const vimeo = text.match(VIMEO);
    if (vimeo?.[1]) {
      return {
        provider: "vimeo",
        id: vimeo[1],
        url: `https://player.vimeo.com/video/${vimeo[1]}`,
      };
    }
  }
  return null;
}

export function embedSrc(embed: MediaEmbed): string {
  return embed.url;
}
