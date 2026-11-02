import type { MediaEmbed } from "@/lib/mediaEmbed";

/** Curated public practice films when facilitators have not attached their own. */
export const PRACTICE_VIDEOS: Record<
  string,
  Array<Pick<MediaEmbed, "provider" | "id" | "title"> & { url: string }>
> = {
  breathwork: [
    {
      provider: "youtube",
      id: "97-cLiXcO70",
      title: "Guided breathwork · SOMA Breath",
      url: "https://www.youtube.com/embed/97-cLiXcO70",
    },
    {
      provider: "youtube",
      id: "6saiJYwaOTQ",
      title: "Wim Hof breathwork · 5 rounds",
      url: "https://www.youtube.com/embed/6saiJYwaOTQ",
    },
  ],
  meditation: [
    {
      provider: "youtube",
      id: "67SeR3LxtdI",
      title: "Guided breathing meditation · Kim Eng",
      url: "https://www.youtube.com/embed/67SeR3LxtdI",
    },
  ],
  yoga: [
    {
      provider: "youtube",
      id: "9fEo9my03Ks",
      title: "5-minute calming breathwork",
      url: "https://www.youtube.com/embed/9fEo9my03Ks",
    },
  ],
  cold: [
    {
      provider: "youtube",
      id: "6saiJYwaOTQ",
      title: "Breath prep for cold exposure",
      url: "https://www.youtube.com/embed/6saiJYwaOTQ",
    },
  ],
  sound: [
    {
      provider: "youtube",
      id: "F-2d2vYsHSI",
      title: "Guided breathwork meditation",
      url: "https://www.youtube.com/embed/F-2d2vYsHSI",
    },
  ],
};

export function practiceVideosForTopic(topic: string | null | undefined) {
  if (!topic) return PRACTICE_VIDEOS.meditation;
  return PRACTICE_VIDEOS[topic] || PRACTICE_VIDEOS.meditation;
}
