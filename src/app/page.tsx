"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar, NavTab } from "../components/layout/Sidebar";
import { TrackRow } from "../components/track/TrackRow";
import { LocalFileUploader } from "../components/library/LocalFileUploader";
import { providerRegistry } from "../lib/adapters";
import { ProviderType, Track } from "../lib/types/music";
import { useMusic } from "../context/MusicContext";
import {
  Sparkles,
  Play,
  Heart,
  ListMusic,
  FileAudio,
  Shield,
  Layers,
  Search as SearchIcon,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function HomePage() {
  const { playTrack, likedTracks, playlists, deletePlaylist } = useMusic();

  const [activeTab, setActiveTab] = useState<NavTab>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | "all">("all");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Discover tracks
  const [openAudioTracks, setOpenAudioTracks] = useState<Track[]>([]);
  const [youtubeTracks, setYoutubeTracks] = useState<Track[]>([]);
  const [localTracks, setLocalTracks] = useState<Track[]>([]);

  // Load initial discover tracks
  useEffect(() => {
    async function loadInitial() {
      const oa = await providerRegistry.getProvider("open-audio").search({ query: "" });
      const yt = await providerRegistry.getProvider("youtube").search({ query: "" });
      const lc = await providerRegistry.localProvider.search({ query: "" });
      setOpenAudioTracks(oa);
      setYoutubeTracks(yt);
      setLocalTracks(lc);
    }
    loadInitial();
  }, []);

  // Search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      const activeProviders =
        selectedProvider === "all" ? undefined : [selectedProvider];
      const results = await providerRegistry.searchAll(
        { query: searchQuery },
        activeProviders
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedProvider]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-200">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 min-w-0 p-4 md:p-8 space-y-8 overflow-y-auto">
          {/* If user is searching, show unified search results */}
          {searchQuery.trim() ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <SearchIcon className="w-5 h-5 text-indigo-400" />
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Found {searchResults.length} track{searchResults.length === 1 ? "" : "s"} across active providers
                  </p>
                </div>
              </div>

              {isSearching ? (
                <div className="py-16 text-center text-gray-500">Searching providers...</div>
              ) : searchResults.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  No matching tracks found. Try broadening your keywords.
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((track, i) => (
                    <TrackRow
                      key={`${track.id}-${i}`}
                      track={track}
                      index={i}
                      tracksContext={searchResults}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "discover" ? (
            <div className="space-y-10">
              {/* Hero Banner */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-surface-100 border border-indigo-500/20 p-6 md:p-10 shadow-2xl">
                <div className="relative z-10 max-w-xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Clean & Privacy-Preserving
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Pure Sound. Zero Trackers. Complete Freedom.
                  </h2>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Stream royalty-free and open music with live synchronized lyrics, real-time audio visualization,
                    and compliant YouTube embeds with explicit consent protection.
                  </p>
                  {openAudioTracks[0] && (
                    <div className="pt-2">
                      <button
                        onClick={() => playTrack(openAudioTracks[0], openAudioTracks)}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/40 transition flex items-center gap-2 hover:scale-105 transform"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Play Featured Track
                      </button>
                    </div>
                  )}
                </div>

                {/* Decorative background glow */}
                <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Open Licensed Music (Full Capabilities) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      Licensed & Open Audio
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Direct HTML5 streams &bull; Waveform visualizer &bull; Synced LRC lyrics &bull; Legal downloads
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Full Features Enabled
                  </span>
                </div>

                <div className="space-y-2">
                  {openAudioTracks.map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={i}
                      tracksContext={openAudioTracks}
                    />
                  ))}
                </div>
              </div>

              {/* YouTube Compliant Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-red-500" />
                      YouTube Music & Streams
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Plays strictly via official embedded player with transparent privacy consent gate
                    </p>
                  </div>
                  <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Official Embed
                  </span>
                </div>

                <div className="space-y-2">
                  {youtubeTracks.map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={i}
                      tracksContext={youtubeTracks}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === "liked" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    Your Liked Songs
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {likedTracks.length} song{likedTracks.length === 1 ? "" : "s"} saved to your local library
                  </p>
                </div>
                {likedTracks.length > 0 && (
                  <button
                    onClick={() => playTrack(likedTracks[0], likedTracks)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play All
                  </button>
                )}
              </div>

              {likedTracks.length === 0 ? (
                <div className="py-24 text-center text-gray-500 space-y-2">
                  <Heart className="w-12 h-12 mx-auto text-gray-600 opacity-40" />
                  <p className="text-sm font-medium">No liked songs yet.</p>
                  <p className="text-xs text-gray-600">
                    Click the heart icon on any track to save it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {likedTracks.map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={i}
                      tracksContext={likedTracks}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "playlists" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-indigo-400" />
                  Your Playlists
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Organize your favorite tracks with cloud and offline sync
                </p>
              </div>

              <div className="space-y-6">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-5 rounded-2xl bg-surface-50 border border-white/5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{pl.name}</h3>
                        {pl.description && (
                          <p className="text-xs text-gray-400">{pl.description}</p>
                        )}
                        <span className="text-[11px] text-gray-500 font-mono">
                          {pl.tracks.length} track{pl.tracks.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {pl.tracks.length > 0 && (
                          <button
                            onClick={() => playTrack(pl.tracks[0], pl.tracks)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Play
                          </button>
                        )}
                        <button
                          onClick={() => deletePlaylist(pl.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {pl.tracks.length === 0 ? (
                      <p className="text-xs text-gray-500 italic py-4 text-center">
                        This playlist is empty. Add songs using the options menu on any track.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pl.tracks.map((t, idx) => (
                          <TrackRow
                            key={`${t.id}-${idx}`}
                            track={t}
                            index={idx}
                            tracksContext={pl.tracks}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileAudio className="w-5 h-5 text-sky-400" />
                  Local Media Library
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Private in-memory playback for your personal audio collection
                </p>
              </div>

              <LocalFileUploader
                onTrackLoaded={(t) => setLocalTracks((prev) => [t, ...prev])}
              />

              {localTracks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-300">Imported Session Tracks</h3>
                  <div className="space-y-2">
                    {localTracks.map((track, i) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={i}
                        tracksContext={localTracks}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
