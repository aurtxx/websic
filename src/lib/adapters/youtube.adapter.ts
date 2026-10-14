import { MusicProvider, SearchFilter } from "./provider.interface";
import { ProviderCapabilities, Track, LyricsData } from "../types/music";

const SAMPLE_YOUTUBE_TRACKS: Track[] = [
  {
    id: "yt-jfKfPfyJRdk",
    provider: "youtube",
    title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
    artist: "Lofi Girl",
    album: "Live Stream Series",
    duration: 3600,
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    embedId: "jfKfPfyJRdk",
    license: "Standard YouTube License (Official Embed Only)",
    isDownloadable: false,
  },
  {
    id: "yt-5qap5aO4i9A",
    provider: "youtube",
    title: "Lofi Hip Hop - Beats to Sleep/Chill to",
    artist: "Lofi Girl",
    album: "Nightly Sessions",
    duration: 3600,
    thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    embedId: "5qap5aO4i9A",
    license: "Standard YouTube License (Official Embed Only)",
    isDownloadable: false,
  },
  {
    id: "yt-DWcJFNfaw9c",
    provider: "youtube",
    title: "Synthwave Radio - Chill synth / retro beats",
    artist: "Lofi Girl Synth",
    album: "Outrun Series",
    duration: 3600,
    thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    embedId: "DWcJFNfaw9c",
    license: "Standard YouTube License (Official Embed Only)",
    isDownloadable: false,
  }
];

export class YouTubeProvider implements MusicProvider {
  readonly id = "youtube" as const;
  readonly name = "YouTube (Official Embed)";
  readonly capabilities: ProviderCapabilities = {
    search: true,
    metadata: true,
    directPlayback: false,       // Compliant: No stream extraction or proxying
    embedPlayback: true,         // Plays via official IFrame API
    waveformVisualization: false,// Blocked by browser cross-origin policy
    lyrics: false,               // Not provided by YouTube Data API
    download: false,             // Strictly prohibited by policy
    requiresConsent: true,       // Third-party embed requires user privacy consent
  };

  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY || null;
  }

  async search(options: SearchFilter): Promise<Track[]> {
    const q = options.query.toLowerCase().trim();

    // If an official API key is provided, query YouTube Data API v3
    if (this.apiKey && q) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=${
          options.limit || 10
        }&q=${encodeURIComponent(q)}&key=${this.apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return data.items.map((item: any) => ({
            id: `yt-${item.id.videoId}`,
            provider: "youtube",
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            duration: 0,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            embedId: item.id.videoId,
            license: "Standard YouTube License",
            isDownloadable: false,
          }));
        }
      } catch (err) {
        console.warn("YouTube API search failed, falling back to curated library:", err);
      }
    }

    // Default curated fallback search
    if (!q) return SAMPLE_YOUTUBE_TRACKS;
    return SAMPLE_YOUTUBE_TRACKS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }

  async getTrack(id: string): Promise<Track | null> {
    const cleanId = id.startsWith("yt-") ? id : `yt-${id}`;
    const found = SAMPLE_YOUTUBE_TRACKS.find((t) => t.id === cleanId);
    if (found) return found;

    // If API key is available, fetch track metadata
    if (this.apiKey) {
      try {
        const videoId = cleanId.replace("yt-", "");
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${this.apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const item = data.items?.[0];
          if (item) {
            return {
              id: cleanId,
              provider: "youtube",
              title: item.snippet.title,
              artist: item.snippet.channelTitle,
              duration: 0,
              thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
              embedId: videoId,
              license: "Standard YouTube License",
              isDownloadable: false,
            };
          }
        }
      } catch (err) {
        console.warn("YouTube API video detail failed:", err);
      }
    }

    return null;
  }

  async getLyrics(trackId: string): Promise<LyricsData | null> {
    // YouTube Data API does not provide licensed lyrics
    return null;
  }

  async getDownloadUrl(trackId: string): Promise<string | null> {
    // Downloading from YouTube is strictly prohibited
    return null;
  }
}
