"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Track, Playlist, LyricsData, LyricLine } from "../lib/types/music";
import { providerRegistry } from "../lib/adapters";
import { getActiveLyricIndex } from "../lib/audio/lrc-parser";
import { usePrivacy } from "./PrivacyContext";

interface MusicContextType {
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
  lyrics: LyricsData | null;
  activeLyricIndex: number;
  isLyricsOpen: boolean;
  isVisualizerOpen: boolean;
  analyserNode: AnalyserNode | null;
  playlists: Playlist[];
  likedTracks: Track[];
  pendingConsentTrack: Track | null;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleLyrics: () => void;
  toggleVisualizer: () => void;
  toggleLikeTrack: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, description?: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  downloadTrack: (track: Track) => Promise<{ success: boolean; message: string }>;
  confirmConsentAndPlay: () => void;
  cancelConsent: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const PLAYLISTS_STORAGE_KEY = "websic_playlists_v1";
const LIKES_STORAGE_KEY = "websic_likes_v1";

export const MusicProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, grantEmbedConsent } = usePrivacy();

  // Audio elements & Web Audio API
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");
  const [isShuffled, setIsShuffled] = useState(false);

  // Lyrics & Visualizer views
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);

  // Playlists & Likes
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [pendingConsentTrack, setPendingConsentTrack] = useState<Track | null>(null);

  // Initialize audio element and Web Audio API
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Load persisted playlists and likes
    try {
      const savedPlaylists = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      } else {
        // Initial sample playlist
        setPlaylists([
          {
            id: "pl-chill",
            userId: "guest",
            name: "Lofi & Chill Vibes",
            description: "Relaxing licensed sounds for work and study.",
            tracks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]);
      }

      const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
      if (savedLikes) {
        setLikedTracks(JSON.parse(savedLikes));
      }
    } catch (e) {
      console.warn("Storage restore error:", e);
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, []);

  // Web Audio Context setup (must be triggered by user gesture)
  const ensureAudioContext = () => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass && audioRef.current) {
          const ctx = new AudioContextClass();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;

          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioContextRef.current = ctx;
          analyserRef.current = analyser;
          sourceNodeRef.current = source;
        }
      } catch (err) {
        console.warn("Web Audio API initialization prevented:", err);
      }
    }

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume().catch((e) => console.warn(e));
    }
  };

  // Sync lyrics index as current time advances
  useEffect(() => {
    if (lyrics?.lines && lyrics.isSynced) {
      const idx = getActiveLyricIndex(lyrics.lines, currentTime);
      setActiveLyricIndex(idx);
    }
  }, [currentTime, lyrics]);

  // Persist playlists
  const savePlaylists = (newPls: Playlist[]) => {
    setPlaylists(newPls);
    try {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(newPls));
    } catch (e) {
      console.warn(e);
    }
  };

  // Persist likes
  const saveLikes = (newLikes: Track[]) => {
    setLikedTracks(newLikes);
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(newLikes));
    } catch (e) {
      console.warn(e);
    }
  };

  // Play track with capability and consent verification
  const playTrack = async (track: Track, newQueue?: Track[]) => {
    // Check if provider requires third-party embed consent (e.g. YouTube)
    const caps = providerRegistry.getCapabilities(track.provider);
    if (caps.requiresConsent && !preferences.allowThirdPartyEmbeds) {
      setPendingConsentTrack(track);
      return;
    }

    ensureAudioContext();

    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([track]);
      setQueueIndex(0);
    }

    setCurrentTrack(track);
    setCurrentTime(0);

    // Fetch lyrics asynchronously
    try {
      const lyricsData = await providerRegistry.getLyrics(track.provider, track.id);
      setLyrics(lyricsData);
    } catch (err) {
      setLyrics(null);
    }

    // Direct audio playback vs embed playback
    if (caps.directPlayback && track.audioUrl && audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay was prevented by browser policy:", err);
      });
      setIsPlaying(true);
    } else {
      // Third-party embed (e.g. YouTube IFrame)
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(true);
    }
  };

  const confirmConsentAndPlay = () => {
    if (pendingConsentTrack) {
      grantEmbedConsent();
      const track = pendingConsentTrack;
      setPendingConsentTrack(null);
      playTrack(track);
    }
  };

  const cancelConsent = () => {
    setPendingConsentTrack(null);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    ensureAudioContext();

    const caps = providerRegistry.getCapabilities(currentTrack.provider);
    if (caps.directPlayback && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.warn);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    const caps = currentTrack ? providerRegistry.getCapabilities(currentTrack.provider) : null;
    if (caps?.directPlayback && audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.volume = 0;
        setIsMuted(true);
      } else {
        audioRef.current.volume = volume;
        setIsMuted(false);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleTrackEnd = () => {
    if (repeatMode === "one") {
      seek(0);
      togglePlay();
      return;
    }
    nextTrack();
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;

    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === "all") {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIdx);
    playTrack(queue[nextIdx]);
  };

  const prevTrack = () => {
    if (currentTime > 3) {
      seek(0);
      return;
    }
    if (queue.length === 0) return;
    const prevIdx = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIdx);
    playTrack(queue[prevIdx]);
  };

  const toggleShuffle = () => setIsShuffled(!isShuffled);

  const cycleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index === queueIndex) {
      nextTrack();
    } else if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(0);
  };

  const toggleLikeTrack = (track: Track) => {
    const exists = likedTracks.some((t) => t.id === track.id);
    const updated = exists
      ? likedTracks.filter((t) => t.id !== track.id)
      : [...likedTracks, track];
    saveLikes(updated);
  };

  const isLiked = (trackId: string) => likedTracks.some((t) => t.id === trackId);

  const createPlaylist = (name: string, description?: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      userId: "user",
      name,
      description: description || "",
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePlaylists([...playlists, newPl]);
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        const alreadyHas = pl.tracks.some((t) => t.id === track.id);
        return {
          ...pl,
          tracks: alreadyHas ? pl.tracks : [...pl.tracks, track],
          updatedAt: new Date().toISOString(),
        };
      }
      return pl;
    });
    savePlaylists(updated);
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
          updatedAt: new Date().toISOString(),
        };
      }
      return pl;
    });
    savePlaylists(updated);
  };

  const deletePlaylist = (playlistId: string) => {
    savePlaylists(playlists.filter((p) => p.id !== playlistId));
  };

  const downloadTrack = async (track: Track): Promise<{ success: boolean; message: string }> => {
    const caps = providerRegistry.getCapabilities(track.provider);
    if (!caps.download) {
      return {
        success: false,
        message: `Downloads are not permitted for ${caps.embedPlayback ? "third-party video embeds (policy restricted)" : "this track"}. Only licensed or user-owned audio can be downloaded.`,
      };
    }

    const downloadUrl = await providerRegistry.getDownloadUrl(track.provider, track.id);
    if (!downloadUrl) {
      return {
        success: false,
        message: "Download URL is not available for this track.",
      };
    }

    try {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${track.artist} - ${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: `Starting download of "${track.title}"` };
    } catch (err: any) {
      return { success: false, message: `Download failed: ${err.message}` };
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        queueIndex,
        repeatMode,
        isShuffled,
        lyrics,
        activeLyricIndex,
        isLyricsOpen,
        isVisualizerOpen,
        analyserNode: analyserRef.current,
        playlists,
        likedTracks,
        pendingConsentTrack,
        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        nextTrack,
        prevTrack,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleLyrics: () => setIsLyricsOpen(!isLyricsOpen),
        toggleVisualizer: () => setIsVisualizerOpen(!isVisualizerOpen),
        toggleLikeTrack,
        isLiked,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        downloadTrack,
        confirmConsentAndPlay,
        cancelConsent,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProviderComponent");
  return ctx;
};
