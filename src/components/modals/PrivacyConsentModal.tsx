"use client";

import React from "react";
import { usePrivacy } from "../../context/PrivacyContext";
import { useMusic } from "../../context/MusicContext";
import { Shield, Lock, EyeOff, Check, X, ExternalLink } from "lucide-react";

export const PrivacyConsentModal: React.FC = () => {
  const {
    isConsentModalOpen,
    closeConsentModal,
    preferences,
    updatePreferences,
    clearAllUserData,
  } = usePrivacy();
  const { pendingConsentTrack, confirmConsentAndPlay, cancelConsent } = useMusic();

  const isOpen = isConsentModalOpen || !!pendingConsentTrack;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface-50 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Privacy & Consent Controls</h2>
              <p className="text-xs text-gray-400">Transparent disclosures and data boundaries</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (pendingConsentTrack) cancelConsent();
              closeConsentModal();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative description */}
        {pendingConsentTrack ? (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="text-sm font-semibold text-indigo-200">
              Third-Party Player Embed Consent Required
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              You selected <strong className="text-white">"{pendingConsentTrack.title}"</strong> from{" "}
              <strong>YouTube</strong>. To comply with platform terms and preserve security, Websic plays this
              through the official YouTube embedded player. Loading this embed may set Google/YouTube
              cookies according to Google's privacy policy.
            </p>
          </div>
        ) : null}

        {/* Privacy Preferences List */}
        <div className="space-y-4">
          <div className="flex items-start justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="pr-4">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Allow Official Third-Party Embeds (YouTube)
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enables official embedded players for YouTube tracks. When disabled, only royalty-free and
                local tracks are played with zero external network requests.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={preferences.allowThirdPartyEmbeds}
                onChange={(e) => updatePreferences({ allowThirdPartyEmbeds: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="pr-4">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-sky-400" />
                Local-Only Data Retention
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Your playlists, favorites, and search history remain strictly on your local browser. No data
                is sold or sent to ad-networks.
              </p>
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">Active</div>
          </div>
        </div>

        {/* Clear Data Action */}
        <div className="pt-2 flex justify-between items-center text-xs text-gray-500">
          <span>Need a clean slate?</span>
          <button
            onClick={clearAllUserData}
            className="text-red-400 hover:text-red-300 hover:underline transition"
          >
            Clear Local Data & Cache
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          {pendingConsentTrack ? (
            <>
              <button
                onClick={cancelConsent}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmConsentAndPlay}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Consent & Play
              </button>
            </>
          ) : (
            <button
              onClick={closeConsentModal}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
