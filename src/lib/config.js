// Centralized demo constants and feature flags.
// Single source of truth so pages/components never hardcode these values.

// Simulated video call timing.
export const CALL = {
  BASE_SECONDS: 120, // base visit length
  EXTEND_SECONDS: 60, // seconds added per extension
  MAX_EXTENSIONS: 2, // hard cap on extensions (240s ceiling)
  EXTEND_PROMPT_THRESHOLD: 20, // remaining seconds that triggers the HCP extend prompt
  MAX_EXTEND_PROMPTS: 2, // most times the extend prompt may appear in a call
};

// Reserved for the future API adapter (Phase 8). Unused in the demo today —
// present so the deployment wiring is a config change, not a code hunt.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

// External feedback survey links, surfaced contextually to testers (Profile page)
// and tracked via trackSurveyClick. Replace with real Typeform/Google Forms URLs.
export const SURVEY = {
  urlHcp: process.env.NEXT_PUBLIC_SURVEY_URL_HCP || "https://example.com/survey-hcp",
  urlRep: process.env.NEXT_PUBLIC_SURVEY_URL_REP || "https://example.com/survey-rep",
};

// Shared password for every seeded demo account (login form, src/lib/seed.js
// findByEmail). No real security boundary exists in this client-only demo —
// shown on-screen as a hint rather than hidden.
export const DEMO_PASSWORD = "Demo1234!";
