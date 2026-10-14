import { LyricLine } from "../types/music";

/**
 * Parses standard LRC format: [mm:ss.xx] Lyric text
 */
export function parseLRC(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split("\n");
  const result: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;

  for (const line of lines) {
    const match = regex.exec(line.trim());
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();

      if (text) {
        result.push({ time: totalSeconds, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Finds the index of the currently active lyric line given playback time in seconds.
 */
export function getActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0) return -1;
  let activeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return activeIndex;
}
