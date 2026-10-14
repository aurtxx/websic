"use client";

import React, { useState } from "react";
import { Track } from "../../lib/types/music";
import { useMusic } from "../../context/MusicContext";
import { Play, Pause, Heart, Plus, Download, MoreHorizontal, Check } from "lucide-react";

interface TrackRowProps {
  track: Track;
  index?: number;
  tracksContext?: Track[];
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, tracksContext }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLikeTrack, isLiked, addToQueue, playlists, addTrackToPlaylist, downloadTrack } = useMusic();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const isCurrent = currentTrack?.id === track.id;

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracksContext);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await downloadTrack(track);
    setDownloadMsg(res.message);
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between p-2.5 md:p-3 rounded-xl border transition cursor-pointer select-none ${
        isCurrent
          ? "bg-indigo-600/10 border-indigo-500/30 shadow-md"
          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
      }`}
    >
      {/* Left: Index / Play status + Track Info */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        {index !== undefined && (
          <span className="w-5 text-center text-xs font-mono text-gray-500 group-hover:hidden">
            {index + 1}
          </span>
        )}

        <div className="relative flex-shrink-0">
          <img
            src={track.thumbnailUrl}
            alt={track.title}
            className="w-11 h-11 rounded-lg object-cover border border-white/5"
          />
          <div
            className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity ${
              isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 text-indigo-400 fill-current" />
            ) : (
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            )}
          </div>
        </div>

        <div className="truncate">
          <p
            className={`text-sm font-semibold truncate ${
              isCurrent ? "text-indigo-400" : "text-white group-hover:text-indigo-200"
            }`}
          >
            {track.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 truncate">{track.artist}</span>
            {track.album && (
              <>
                <span className="text-gray-600 text-xs">&bull;</span>
                <span className="text-xs text-gray-500 truncate hidden sm:inline">{track.album}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Provider & Licensing */}
      <div className="hidden md:flex items-center gap-2 px-4">
        <span
          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
            track.provider === "open-audio"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : track.provider === "youtube"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-sky-500/10 text-sky-400 border-sky-500/20"
          }`}
        >
          {track.provider}
        </span>
        {track.license && (
          <span className="text-[10px] text-gray-500 truncate max-w-[130px] hidden lg:inline">
            {track.license}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleLikeTrack(track)}
          className={`p-2 rounded-lg transition ${
            isLiked(track.id) ? "text-rose-500" : "text-gray-500 hover:text-white"
          }`}
          title="Save to Liked Songs"
        >
          <Heart className={`w-4 h-4 ${isLiked(track.id) ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={() => addToQueue(track)}
          className="p-2 text-gray-500 hover:text-white rounded-lg transition"
          title="Add to Queue"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={handleDownload}
          className={`p-2 rounded-lg transition ${
            track.isDownloadable
              ? "text-gray-500 hover:text-white"
              : "text-gray-600 hover:text-gray-400"
          }`}
          title={
            track.isDownloadable
              ? "Download track"
              : "Download unavailable (policy restricted)"
          }
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Playlist Adder dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
            className="p-2 text-gray-500 hover:text-white rounded-lg transition"
            title="Add to Playlist"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showPlaylistMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-50 border border-white/10 rounded-xl p-1.5 shadow-2xl z-30 space-y-1">
              <div className="text-[10px] uppercase font-semibold text-gray-500 px-2 py-1">
                Add to Playlist
              </div>
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => {
                    addTrackToPlaylist(pl.id, track);
                    setShowPlaylistMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span className="truncate">{pl.name}</span>
                  {pl.tracks.some((t) => t.id === track.id) && (
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {downloadMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-surface-50 border border-white/10 text-xs text-white shadow-xl">
          {downloadMsg}
        </div>
      )}
    </div>
  );
};
