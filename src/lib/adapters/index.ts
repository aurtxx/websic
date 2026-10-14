import { MusicProvider, SearchFilter } from "./provider.interface";
import { OpenAudioProvider } from "./open-audio.adapter";
import { YouTubeProvider } from "./youtube.adapter";
import { LocalLibraryProvider } from "./local-library.adapter";
import { ProviderType, Track, LyricsData, ProviderCapabilities } from "../types/music";

class ProviderRegistry {
  private providers: Map<ProviderType, MusicProvider> = new Map();
  public localProvider: LocalLibraryProvider;

  constructor() {
    this.localProvider = new LocalLibraryProvider();
    this.providers.set("open-audio", new OpenAudioProvider());
    this.providers.set("youtube", new YouTubeProvider());
    this.providers.set("local", this.localProvider);
  }

  getProvider(type: ProviderType): MusicProvider {
    const p = this.providers.get(type);
    if (!p) throw new Error(`Unknown provider: ${type}`);
    return p;
  }

  getCapabilities(type: ProviderType): ProviderCapabilities {
    return this.getProvider(type).capabilities;
  }

  async searchAll(filter: SearchFilter, activeProviders?: ProviderType[]): Promise<Track[]> {
    const selected = activeProviders && activeProviders.length > 0
      ? activeProviders
      : Array.from(this.providers.keys());

    const results = await Promise.allSettled(
      selected.map((type) => this.getProvider(type).search(filter))
    );

    const merged: Track[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        merged.push(...r.value);
      }
    }
    return merged;
  }

  async getTrack(provider: ProviderType, id: string): Promise<Track | null> {
    return this.getProvider(provider).getTrack(id);
  }

  async getLyrics(provider: ProviderType, trackId: string): Promise<LyricsData | null> {
    return this.getProvider(provider).getLyrics(trackId);
  }

  async getDownloadUrl(provider: ProviderType, trackId: string): Promise<string | null> {
    return this.getProvider(provider).getDownloadUrl(trackId);
  }
}

export const providerRegistry = new ProviderRegistry();
export type { MusicProvider };
export { OpenAudioProvider, YouTubeProvider, LocalLibraryProvider };
