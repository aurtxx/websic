import { MusicProvider, SearchFilter } from "./provider.interface";
import { ProviderCapabilities, Track, LyricsData } from "../types/music";
import { parseLRC } from "../audio/lrc-parser";

interface LocalTrackEntry {
  track: Track;
  lrcContent?: string;
  blob?: Blob;
}

export class LocalLibraryProvider implements MusicProvider {
  readonly id = "local" as const;
  readonly name = "User Local Library";
  readonly capabilities: ProviderCapabilities = {
    search: true,
    metadata: true,
    directPlayback: true,
    embedPlayback: false,
    waveformVisualization: true,
    lyrics: true,
    download: true,
    requiresConsent: false,
  };

  private tracks: Map<string, LocalTrackEntry> = new Map();

  addLocalTrack(file: File, lrcFile?: File): Promise<Track> {
    return new Promise((resolve) => {
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const objectUrl = URL.createObjectURL(file);
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      const newTrack: Track = {
        id,
        provider: "local",
        title: fileNameWithoutExt,
        artist: "Local User Audio",
        album: "Personal Library",
        duration: 0,
        thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
        audioUrl: objectUrl,
        license: "User-Owned Local Media",
        downloadUrl: objectUrl,
        isDownloadable: true,
      };

      if (lrcFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const lrcContent = e.target?.result as string;
          this.tracks.set(id, { track: newTrack, lrcContent, blob: file });
          resolve(newTrack);
        };
        reader.readAsText(lrcFile);
      } else {
        this.tracks.set(id, { track: newTrack, blob: file });
        resolve(newTrack);
      }
    });
  }

  async search(options: SearchFilter): Promise<Track[]> {
    const list = Array.from(this.tracks.values()).map((e) => e.track);
    const q = options.query.toLowerCase().trim();
    if (!q) return list;
    return list.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
  }

  async getTrack(id: string): Promise<Track | null> {
    const entry = this.tracks.get(id);
    return entry ? entry.track : null;
  }

  async getLyrics(trackId: string): Promise<LyricsData | null> {
    const entry = this.tracks.get(trackId);
    if (!entry || !entry.lrcContent) return null;

    return {
      trackId,
      isSynced: true,
      lines: parseLRC(entry.lrcContent),
      plainText: entry.lrcContent.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, "").trim(),
      source: "User Uploaded LRC File",
    };
  }

  async getDownloadUrl(trackId: string): Promise<string | null> {
    const entry = this.tracks.get(trackId);
    return entry?.track.downloadUrl || null;
  }
}
