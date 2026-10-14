"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMusic } from "../../context/MusicContext";
import { providerRegistry } from "../../lib/adapters";
import { BarChart3, Activity, Disc, X, Info } from "lucide-react";

export const AudioVisualizer: React.FC = () => {
  const { analyserNode, isPlaying, currentTrack, isVisualizerOpen, toggleVisualizer } = useMusic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<"bars" | "wave" | "orb">("bars");
  const animationFrameId = useRef<number | null>(null);

  const caps = currentTrack ? providerRegistry.getCapabilities(currentTrack.provider) : null;
  const isCompatible = caps?.waveformVisualization && analyserNode;

  useEffect(() => {
    if (!isVisualizerOpen || !canvasRef.current || !analyserNode || !isCompatible) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameId.current = requestAnimationFrame(render);

      // Handle retina displays
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (mode === "bars") {
        analyserNode.getByteFrequencyData(dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) * 0.75;
        const barSpacing = (width / barCount) * 0.25;

        for (let i = 0; i < barCount; i++) {
          const value = dataArray[i * 2] || 0;
          const percent = value / 255;
          const barHeight = Math.max(4, percent * height * 0.85);
          const x = i * (barWidth + barSpacing) + barSpacing;
          const y = height - barHeight;

          const gradient = ctx.createLinearGradient(0, height, 0, y);
          gradient.addColorStop(0, "#4f46e5");
          gradient.addColorStop(0.5, "#818cf8");
          gradient.addColorStop(1, "#38bdf8");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        }
      } else if (mode === "wave") {
        analyserNode.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#818cf8";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(129, 140, 248, 0.8)";
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (mode === "orb") {
        analyserNode.getByteFrequencyData(dataArray);

        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const radius = Math.min(width, height) * 0.2 + (avg / 255) * 45;

        const centerX = width / 2;
        const centerY = height / 2;

        const radialGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.2,
          centerX,
          centerY,
          radius * 1.5
        );
        radialGradient.addColorStop(0, "rgba(99, 102, 241, 0.9)");
        radialGradient.addColorStop(0.5, "rgba(168, 85, 247, 0.4)");
        radialGradient.addColorStop(1, "rgba(6, 182, 212, 0)");

        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#818cf8";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isVisualizerOpen, analyserNode, mode, isCompatible]);

  if (!isVisualizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col p-6 animate-fadeIn">
      {/* Header controls */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Real-Time Audio Visualizer</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex gap-1">
            <button
              onClick={() => setMode("bars")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                mode === "bars" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Spectrum
            </button>
            <button
              onClick={() => setMode("wave")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                mode === "wave" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Oscilloscope
            </button>
            <button
              onClick={() => setMode("orb")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                mode === "orb" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              Resonance
            </button>
          </div>

          <button
            onClick={toggleVisualizer}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto my-auto relative">
        {isCompatible ? (
          <div className="w-full h-80 flex items-center justify-center relative">
            <canvas
              ref={canvasRef}
              width={750}
              height={320}
              className="w-full h-full rounded-2xl bg-gradient-to-b from-white/[0.02] to-white/[0.05] border border-white/10 shadow-2xl"
            />
          </div>
        ) : (
          <div className="text-center p-8 bg-surface-100 rounded-2xl border border-white/10 max-w-md shadow-2xl">
            <Info className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Visualizer Unavailable</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Real-time Web Audio API waveform analysis requires direct audio stream access.
              Third-party video embeds (such as YouTube) are protected by browser cross-origin boundaries.
            </p>
            <span className="inline-block text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Switch to an Open Audio or Local Track to enable spectrum rendering
            </span>
          </div>
        )}

        {/* Track preview footer */}
        {currentTrack && (
          <div className="mt-8 text-center">
            <h4 className="text-base font-bold text-white">{currentTrack.title}</h4>
            <p className="text-sm text-gray-400">{currentTrack.artist}</p>
          </div>
        )}
      </div>
    </div>
  );
};
