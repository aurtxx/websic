import type { Metadata } from "next";
import "./globals.css";
import { PrivacyProvider } from "../context/PrivacyContext";
import { AuthProvider } from "../context/AuthContext";
import { MusicProviderComponent } from "../context/MusicContext";
import { PlayerBar } from "../components/player/PlayerBar";
import { LyricsView } from "../components/player/LyricsView";
import { AudioVisualizer } from "../components/player/AudioVisualizer";
import { YouTubeEmbedPlayer } from "../components/player/YouTubeEmbedPlayer";
import { PrivacyConsentModal } from "../components/modals/PrivacyConsentModal";
import { AuthModal } from "../components/modals/AuthModal";

export const metadata: Metadata = {
  title: "Websic - Privacy-First Music Application",
  description: "A modern, privacy-preserving music streaming application with live synchronized lyrics, real-time audio visualizer, playlists, and compliant playback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface-200 text-white min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <PrivacyProvider>
          <AuthProvider>
            <MusicProviderComponent>
              <div className="flex-1 flex flex-col pb-28">
                {children}
              </div>

              {/* Persistent Bottom Player Bar */}
              <PlayerBar />

              {/* Interactive Overlays & Modals */}
              <LyricsView />
              <AudioVisualizer />
              <YouTubeEmbedPlayer />
              <PrivacyConsentModal />
              <AuthModal />
            </MusicProviderComponent>
          </AuthProvider>
        </PrivacyProvider>
      </body>
    </html>
  );
}
