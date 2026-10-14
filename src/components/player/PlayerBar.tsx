"use client";

import React, { useState } from "react";
import { useMusic } from "../../context/MusicContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Mic2,
  Activity,
  ListMusic,
  Heart,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { QueueDrawer } from "./QueueDrawer";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    cycleRepeat,
    toggleLyrics,
    toggleVisualizer,
    isLyricsOpen,
    isVisualizerOpen,
    toggleLikeTrack,
    isLiked,
    downloadTrack,
  } = useMusic();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!currentTrack) return null;

  const handleDownload = async () => {
    const res = await downloadTrack(currentTrack);
    setDownloadNotice(res.message);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-100/90 backdrop-blur-2xl border-t border-white/10 px-4 md:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Track Info & Likes */}
          <div className="flex items-center gap-3.5 min-w-0 w-1/4">
            <div className="relative group flex-shrink-0">
              <img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="absolute -top-1.5 -left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-600/90 text-white shadow">
                {currentTrack.provider === "open-audio"
                  ? "Open"
                  : currentTrack.provider === "youtube"
                  ? "YT"
                  : "Local"}
              </span>
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">{currentTrack.artist}</p>
            </div>

            <button
              onClick={() => toggleLikeTrack(currentTrack)}
              className={`p-2 rounded-lg transition ${
                isLiked(currentTrack.id)
                  ? "text-rose-500 hover:text-rose-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked(currentTrack.id) ? "fill-current" : ""}`}
              />
            </button>
          </div>

          {/* Middle: Controls & Progress Bar */}
          <div className="flex flex-col items-center flex-1 max-w-xl">
            {/* Control buttons */}
            <div className="flex items-center gap-3 md:gap-5 mb-1.5">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-lg transition ${
                  isShuffled ? "text-indigo-400" : "text-gray-400 hover:text-white"
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevTrack}
                className="p-1.5 text-gray-300 hover:text-white transition"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-white text-black hover:scale-105 shadow-lg shadow-white/10 transition"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-1.5 text-gray-300 hover:text-white transition"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-1.5 rounded-lg transition ${
                  repeatMode !== "off" ? "text-indigo-400" : "text-gray-400 hover:text-white"
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Time Slider */}
            <div className="flex items-center gap-2.5 w-full text-[11px] text-gray-400 font-mono select-none">
              <span className="w-9 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 relative group py-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500 group-hover:h-1.5 transition-all"
                />
              </div>
              <span className="w-9">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Actions, Lyrics, Visualizer, Volume */}
          <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4">
            {/* Lyrics Button */}
            <button
              onClick={toggleLyrics}
              className={`p-2 rounded-lg transition ${
                isLyricsOpen
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            {/* Visualizer Button */}
            <button
              onClick={toggleVisualizer}
              className={`p-2 rounded-lg transition ${
                isVisualizerOpen
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Audio Visualizer"
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              title={
                currentTrack.isDownloadable
                  ? "Download Track"
                  : "Download not permitted for this provider"
              }
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Download policy alert toast */}
      {downloadNotice && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-surface-50 border border-white/10 shadow-2xl text-xs text-gray-200 flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
};
