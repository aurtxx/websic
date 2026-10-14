"use client";

import React from "react";
import { Compass, Heart, ListMusic, FileAudio, ShieldCheck, Plus, Sparkles } from "lucide-react";
import { useMusic } from "../../context/MusicContext";

export type NavTab = "discover" | "liked" | "playlists" | "local";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { playlists, likedTracks, createPlaylist } = useMusic();

  const handleCreatePlaylist = () => {
    const name = prompt("Enter a name for your new playlist:");
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-surface-100/50 border-r border-white/10 p-4 space-y-6 select-none">
      {/* Primary Navigation */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-3 py-1">
          Menu
        </div>
        <button
          onClick={() => onTabChange("discover")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
            activeTab === "discover"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => onTabChange("liked")}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
            activeTab === "liked"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4" />
            <span>Liked Songs</span>
          </div>
          {likedTracks.length > 0 && (
            <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.5 rounded-md bg-white/10">
              {likedTracks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange("local")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
            activeTab === "local"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <FileAudio className="w-4 h-4" />
          <span>Local Library</span>
        </button>
      </div>

      {/* Playlists Section */}
      <div className="flex-1 min-h-0 flex flex-col space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            Playlists
          </span>
          <button
            onClick={handleCreatePlaylist}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition"
            title="Create new playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => onTabChange("playlists")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left truncate ${
                activeTab === "playlists"
                  ? "bg-white/[0.06] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <ListMusic className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{pl.name}</span>
              </div>
              <span className="text-[10px] text-gray-600 font-mono flex-shrink-0">
                {pl.tracks.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Badge Card */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Zero Ad-Tracking
        </div>
        <p className="text-[10px] text-gray-500 leading-normal">
          Websic does not track your playback or sell listener data. Audio streams and embeds are kept isolated.
        </p>
      </div>
    </aside>
  );
};
