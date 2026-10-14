export interface PrivacyPreferences {
  allowThirdPartyEmbeds: boolean; // e.g. YouTube IFrame embed playback
  allowAnonymousMetrics: boolean; // Zero trackers, completely optional
  storeHistoryLocally: boolean;   // Keep playback history in local browser storage only
  hasConsentedToPolicy: boolean;
}

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  allowThirdPartyEmbeds: false, // Default to strict privacy until user consents
  allowAnonymousMetrics: false,
  storeHistoryLocally: true,
  hasConsentedToPolicy: false,
};
