"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { PrivacyPreferences, DEFAULT_PRIVACY_PREFERENCES } from "../lib/types/privacy";

interface PrivacyContextType {
  preferences: PrivacyPreferences;
  isConsentModalOpen: boolean;
  openConsentModal: () => void;
  closeConsentModal: () => void;
  updatePreferences: (newPrefs: Partial<PrivacyPreferences>) => void;
  grantEmbedConsent: () => void;
  revokeEmbedConsent: () => void;
  clearAllUserData: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const STORAGE_KEY = "websic_privacy_preferences_v1";

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<PrivacyPreferences>(DEFAULT_PRIVACY_PREFERENCES);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load privacy preferences:", e);
    }
    setMounted(true);
  }, []);

  const save = (newPrefs: PrivacyPreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (e) {
      console.warn("Could not save privacy preferences:", e);
    }
  };

  const updatePreferences = (newPrefs: Partial<PrivacyPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    save(updated);
  };

  const grantEmbedConsent = () => {
    updatePreferences({ allowThirdPartyEmbeds: true, hasConsentedToPolicy: true });
    setIsConsentModalOpen(false);
  };

  const revokeEmbedConsent = () => {
    updatePreferences({ allowThirdPartyEmbeds: false });
  };

  const clearAllUserData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      save(DEFAULT_PRIVACY_PREFERENCES);
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear user data:", e);
    }
  };

  return (
    <PrivacyContext.Provider
      value={{
        preferences,
        isConsentModalOpen,
        openConsentModal: () => setIsConsentModalOpen(true),
        closeConsentModal: () => setIsConsentModalOpen(false),
        updatePreferences,
        grantEmbedConsent,
        revokeEmbedConsent,
        clearAllUserData,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error("usePrivacy must be used within PrivacyProvider");
  return ctx;
};
