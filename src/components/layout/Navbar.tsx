"use client";

import React, { useState } from "react";
import { Search, Shield, User, Sparkles, Filter } from "lucide-react";
import { usePrivacy } from "../../context/PrivacyContext";
import { useAuth } from "../../context/AuthContext";
import { ProviderType } from "../../lib/types/music";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedProvider: ProviderType | "all";
  onProviderChange: (p: ProviderType | "all") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedProvider,
  onProviderChange,
}) => {
  const { openConsentModal, preferences } = usePrivacy();
  const { openAuthModal, user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-surface-200/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-extrabold text-lg tracking-tighter">W</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              Websic
              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Privacy Music
              </span>
            </h1>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tracks, artists, albums across licensed & online sources..."
              className="w-full pl-10 pr-24 py-2 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/10 focus:border-indigo-500/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
            />
            {/* Filter pills dropdown / toggle */}
            <div className="absolute right-2 flex items-center gap-1">
              <select
                value={selectedProvider}
                onChange={(e) => onProviderChange(e.target.value as any)}
                className="bg-surface-50 text-[11px] font-medium text-gray-300 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="open-audio">Open / CC Music</option>
                <option value="youtube">YouTube (Embed)</option>
                <option value="local">Local Files</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Actions: Privacy Controls & Account */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={openConsentModal}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            title="Privacy & Consent Settings"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Privacy</span>
            {preferences.allowThirdPartyEmbeds ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
            )}
          </button>

          <button
            onClick={openAuthModal}
            className="p-1.5 pr-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="hidden md:inline max-w-[100px] truncate">
              {isAuthenticated && user ? user.name : "Sign In"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
