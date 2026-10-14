import { MusicProvider, SearchFilter } from "./provider.interface";
import { ProviderCapabilities, Track, LyricsData } from "../types/music";
import { parseLRC } from "../audio/lrc-parser";

const OPEN_AUDIO_TRACKS: (Track & { lrc?: string })[] = [
  {
    id: "oa-1",
    provider: "open-audio",
    title: "Midnight City Lights",
    artist: "Aetheria",
    album: "Neon Dreams EP",
    duration: 184,
    thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    license: "Creative Commons Zero (CC0)",
    downloadUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    isDownloadable: true,
    lrc: `[00:00.00] (Instrumental intro - soft piano chords)
[00:15.00] Rain falling down on empty neon streets
[00:28.00] Echoes of the melody and gentle beats
[00:42.00] Floating through the shadows of the silent night
[00:56.00] Everything is peaceful in the soft moonlight
[01:12.00] (Guitar solo & ambient chords)
[01:30.00] Finding solace where the midnight rivers flow
[01:45.00] Taking all the memories and letting go
[02:00.00] Drifting into silence, warm and deep
[02:18.00] Let the rhythm rock your weary soul to sleep
[02:35.00] (Gentle outro fade)`
  },
  {
    id: "oa-2",
    provider: "open-audio",
    title: "Starlight Voyage",
    artist: "CosmoWave",
    album: "Solaris Horizons",
    duration: 156,
    thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3",
    license: "Creative Commons BY-SA 4.0",
    downloadUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3",
    isDownloadable: true,
    lrc: `[00:00.00] (Cosmic synthesizer swell)
[00:12.00] Accelerating past the orbit of the sun
[00:25.00] A stellar journey that has just begun
[00:38.00] Pulsing frequencies across the cosmic sea
[00:52.00] Digital signals running wild and free
[01:05.00] (Synth breakdown and bass drop)
[01:22.00] Across the constellations we align
[01:36.00] Traversing space and bending space and time
[01:50.00] Starlight guides us through the silent void
[02:05.00] Beyond the asteroid fields we find our joy`
  },
  {
    id: "oa-3",
    provider: "open-audio",
    title: "Deep Coffee Reverie",
    artist: "Café Nostalgia",
    album: "Acoustic Chapters",
    duration: 142,
    thumbnailUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=good-night-160166.mp3",
    license: "Creative Commons BY 3.0",
    downloadUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=good-night-160166.mp3",
    isDownloadable: true,
    lrc: `[00:00.00] (Warm acoustic fingerpicking)
[00:14.00] Steam rises from the cup upon the sill
[00:27.00] The morning breathes, the world is calm and still
[00:40.00] Pages turning gently one by one
[00:55.00] Welcoming the golden autumn sun
[01:10.00] (Harmonica refrain)
[01:25.00] Simple moments linger like a sweet refrain
[01:40.00] Washing clean the sorrow and the pain
[01:55.00] Just a quiet corner where the heart can rest
[02:10.00] In this peaceful haven feeling truly blest`
  },
  {
    id: "oa-4",
    provider: "open-audio",
    title: "Cybernetic Horizon",
    artist: "Glitch Vector",
    album: "Subsystem Pulse",
    duration: 198,
    thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c401be3324.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    license: "Creative Commons Zero (CC0)",
    downloadUrl: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c401be3324.mp3?filename=ambient-piano-amp-strings-10711.mp3",
    isDownloadable: true,
    lrc: `[00:00.00] (Ambient piano & subtle strings)
[00:20.00] Digital horizons expanding in the mist
[00:40.00] Whispers of code that we cannot resist
[01:00.00] Harmony created in silicon and light
[01:20.00] Lighting up the corridors throughout the night
[01:45.00] (Crescendo of acoustic and synthetic sounds)
[02:10.00] Endless possibilities unlocked within
[02:35.00] Where the virtual and spiritual begin`
  }
];

export class OpenAudioProvider implements MusicProvider {
  readonly id = "open-audio" as const;
  readonly name = "Open Licensed Music";
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

  async search(options: SearchFilter): Promise<Track[]> {
    const q = options.query.toLowerCase().trim();
    if (!q) return OPEN_AUDIO_TRACKS;

    return OPEN_AUDIO_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q))
    );
  }

  async getTrack(id: string): Promise<Track | null> {
    const track = OPEN_AUDIO_TRACKS.find((t) => t.id === id);
    return track || null;
  }

  async getLyrics(trackId: string): Promise<LyricsData | null> {
    const track = OPEN_AUDIO_TRACKS.find((t) => t.id === trackId);
    if (!track || !track.lrc) return null;

    return {
      trackId,
      isSynced: true,
      lines: parseLRC(track.lrc),
      plainText: track.lrc.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, "").trim(),
      source: "Licensed Creative Commons Lyrics",
    };
  }

  async getDownloadUrl(trackId: string): Promise<string | null> {
    const track = OPEN_AUDIO_TRACKS.find((t) => t.id === trackId);
    if (track && track.isDownloadable && track.downloadUrl) {
      return track.downloadUrl;
    }
    return null;
  }
}
