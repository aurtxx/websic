"use client";

import React, { useEffect, useRef } from "react";
import { useMusic } from "../../context/MusicContext";
import { Mic2, X, Music2 } from "lucide-react";

export const LyricsView: React.FC = () => {
  const { lyrics, activeLyricIndex, isLyricsOpen, toggleLyrics, seek, currentTrack } = useMusic();
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active lyric line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLyricIndex]);

  if (!isLyricsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex flex-col p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between max-w-2xl w-full mx-auto pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Mic2 className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Live Lyrics</h2>
            {currentTrack && (
              <p className="text-xs text-gray-400">
                {currentTrack.title} &bull; {currentTrack.artist}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={toggleLyrics}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lyrics Scrollable Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto max-w-2xl w-full mx-auto py-16 px-4 space-y-6 text-center select-none no-scrollbar"
      >
        {lyrics?.lines && lyrics.lines.length > 0 ? (
          lyrics.lines.map((line, idx) => {
            const isActive = idx === activeLyricIndex;
            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`cursor-pointer transition-all duration-300 transform font-semibold ${
                  isActive
                    ? "text-2xl md:text-3xl text-white font-extrabold scale-105 drop-shadow-[0_0_20px_rgba(129,140,248,0.8)]"
                    : "text-lg md:text-xl text-gray-500 hover:text-gray-300 scale-95"
                }`}
              >
                {line.text}
              </p>
            );
          })
        ) : lyrics?.plainText ? (
          <div className="whitespace-pre-line text-lg text-gray-300 leading-relaxed">
            {lyrics.plainText}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-base text-gray-400 font-medium">No lyrics available for this track.</p>
            <p className="text-xs text-gray-600 mt-1">
              Upload a .lrc file in Local Files to sync your own lyrics.
            </p>
          </div>
        )}
      </div>

      {/* Footer attribution */}
      {lyrics?.source && (
        <div className="text-center pt-3 border-t border-white/5">
          <span className="text-xs text-gray-500">Source: {lyrics.source}</span>
        </div>
      )}
    </div>
  );
};
