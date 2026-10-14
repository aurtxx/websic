"use client";

import React, { useRef, useState } from "react";
import { providerRegistry } from "../../lib/adapters";
import { useMusic } from "../../context/MusicContext";
import { Upload, FileAudio, Check, AlertCircle } from "lucide-react";
import { Track } from "../../lib/types/music";

interface LocalFileUploaderProps {
  onTrackLoaded?: (track: Track) => void;
}

export const LocalFileUploader: React.FC<LocalFileUploaderProps> = ({ onTrackLoaded }) => {
  const { playTrack } = useMusic();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lrcInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedLrc, setSelectedLrc] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedAudio(e.target.files[0]);
    }
  };

  const handleLrcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLrc(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedAudio) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const track = await providerRegistry.localProvider.addLocalTrack(selectedAudio, selectedLrc || undefined);
      setStatusMessage(`Successfully imported "${track.title}"!`);
      if (onTrackLoaded) onTrackLoaded(track);
      playTrack(track);

      // Reset selection
      setSelectedAudio(null);
      setSelectedLrc(null);
    } catch (err: any) {
      setStatusMessage(`Failed to import file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-50 border border-white/10 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Import Your Audio Files</h3>
          <p className="text-xs text-gray-400">
            Play your local MP3, WAV, FLAC files with real-time waveform visualization & optional .LRC lyrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* Audio File Picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/50 hover:bg-white/[0.02] cursor-pointer transition text-center space-y-1.5"
        >
          <FileAudio className="w-6 h-6 text-indigo-400 mx-auto" />
          <div className="text-xs font-semibold text-white">
            {selectedAudio ? selectedAudio.name : "Select Audio File"}
          </div>
          <p className="text-[10px] text-gray-500">Supports .mp3, .wav, .ogg, .flac</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
            className="hidden"
          />
        </div>

        {/* LRC Lyrics Picker */}
        <div
          onClick={() => lrcInputRef.current?.click()}
          className="p-4 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/50 hover:bg-white/[0.02] cursor-pointer transition text-center space-y-1.5"
        >
          <div className="text-indigo-400 text-lg font-mono font-bold leading-none">.LRC</div>
          <div className="text-xs font-semibold text-white">
            {selectedLrc ? selectedLrc.name : "Select Synced Lyrics (Optional)"}
          </div>
          <p className="text-[10px] text-gray-500">Synchronized LRC lyrics file</p>
          <input
            ref={lrcInputRef}
            type="file"
            accept=".lrc,.txt"
            onChange={handleLrcChange}
            className="hidden"
          />
        </div>
      </div>

      {selectedAudio && (
        <button
          onClick={handleImport}
          disabled={isProcessing}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? "Loading audio into memory..." : "Import & Play Track"}
        </button>
      )}

      {statusMessage && (
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-indigo-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
