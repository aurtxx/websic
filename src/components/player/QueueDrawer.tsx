"use client";

import React from "react";
import { useMusic } from "../../context/MusicContext";
import { ListMusic, Trash2, Play, Music, X } from "lucide-react";

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const { queue, queueIndex, playTrack, removeFromQueue, clearQueue, currentTrack } = useMusic();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-100 border-l border-white/10 shadow-2xl flex flex-col p-6 animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Playback Queue</h2>
          <span className="text-xs text-gray-500 font-mono">({queue.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition px-2 py-1 rounded-md hover:bg-white/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2 no-scrollbar">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <Music className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">The queue is currently empty.</p>
            <p className="text-xs text-gray-600 mt-1">Add tracks from search or your playlists.</p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = idx === queueIndex;
            return (
              <div
                key={`${track.id}-${idx}`}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  isCurrent
                    ? "bg-indigo-600/10 border-indigo-500/30"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                }`}
              >
                <div
                  onClick={() => playTrack(track)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="truncate">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? "text-indigo-400" : "text-white"
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                    {track.provider}
                  </span>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
