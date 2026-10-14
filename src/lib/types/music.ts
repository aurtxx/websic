export type ProviderType = "open-audio" | "youtube" | "local";

export interface ProviderCapabilities {
  search: boolean;
  metadata: boolean;
  directPlayback: boolean;       // HTML5 audio stream available
  embedPlayback: boolean;        // Official embedded player required (e.g. YouTube)
  waveformVisualization: boolean;// Web Audio API AnalyserNode compatible
  lyrics: boolean;               // Synchronized LRC or plain lyrics available
  download: boolean;             // Authorized content download permitted
  requiresConsent: boolean;      // Third-party embeds/cookies require user consent
}

export interface Track {
  id: string;
  provider: ProviderType;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  audioUrl?: string; // Direct audio stream URL (for open-audio or local)
  embedId?: string;  // Video ID for official embeds (e.g., YouTube)
  license?: string;  // e.g., "Creative Commons BY-SA", "Public Domain", "All Rights Reserved"
  downloadUrl?: string;
  isDownloadable?: boolean;
}

export interface LyricLine {
  time: number; // In seconds
  text: string;
}

export interface LyricsData {
  trackId: string;
  isSynced: boolean;
  lines: LyricLine[];
  plainText?: string;
  source: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  queueIndex: number;
  repeatMode: "off" | "one" | "all";
  isShuffled: boolean;
}
