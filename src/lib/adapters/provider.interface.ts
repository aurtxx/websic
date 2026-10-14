import { ProviderCapabilities, ProviderType, Track, LyricsData } from "../types/music";

export interface SearchFilter {
  query: string;
  genre?: string;
  limit?: number;
}

export interface MusicProvider {
  readonly id: ProviderType;
  readonly name: string;
  readonly capabilities: ProviderCapabilities;

  search(options: SearchFilter): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
  getLyrics(trackId: string): Promise<LyricsData | null>;
  getDownloadUrl(trackId: string): Promise<string | null>;
}
