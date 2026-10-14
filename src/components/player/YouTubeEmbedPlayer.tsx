"use client";

import React, { useState } from "react";
import { useMusic } from "../../context/MusicContext";
import { usePrivacy } from "../../context/PrivacyContext";
import { Tv, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

export const YouTubeEmbedPlayer: React.FC = () => {
  const { currentTrack } = useMusic();
  const { preferences } = usePrivacy();
  const [isExpanded, setIsExpanded] = useState(false);

  if (
    !currentTrack ||
    currentTrack.provider !== "youtube" ||
    !currentTrack.embedId ||
    !preferences.allowThirdPartyEmbeds
  ) {
    return null;
  }

  return (
    <div
      className={`fixed right-6 bottom-28 z-40 transition-all duration-300 rounded-xl overflow-hidden bg-surface-100 border border-white/10 shadow-2xl ${
        isExpanded ? "w-80 md:w-96" : "w-64"
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface-50 border-b border-white/10 text-xs">
        <div className="flex items-center gap-1.5 text-gray-300 font-medium truncate">
          <Tv className="w-3.5 h-3.5 text-red-500" />
          <span className="truncate">Official YouTube Embed</span>
        </div>
        <div className="flex items-center gap-1">
          <span title="Privacy Protected" className="text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Official YouTube IFrame */}
      <div className={`relative bg-black ${isExpanded ? "aspect-video" : "h-36"}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${currentTrack.embedId}?autoplay=1&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
          title={currentTrack.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      <div className="px-3 py-1.5 bg-surface-50 text-[10px] text-gray-500 truncate text-center">
        Embedded via official YouTube player &bull; No raw stream extraction
      </div>
    </div>
  );
};
