// lib/guest-identity.ts
// Physics-themed anonymous identity system for guest commenters

const ADJECTIVES = [
  "Curious", "Wandering", "Silent", "Brave", "Quantum",
  "Hidden", "Restless", "Drifting", "Spinning", "Orbiting",
  "Vibrant", "Radiant", "Steady", "Swift", "Luminous",
  "Charged", "Resonant", "Harmonic", "Kinetic", "Thermal",
];

const NOUNS = [
  "Photon", "Muon", "Neutron", "Quark", "Lepton",
  "Boson", "Fermion", "Gluon", "Meson", "Tachyon",
  "Proton", "Electron", "Neutrino", "Baryon", "Positron",
  "Pion", "Kaon", "Graviton", "Magnon", "Phonon",
];

const STORAGE_KEY = "physova_guest";

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `guest_${id}`;
}

function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

export interface GuestIdentity {
  guestId: string;
  displayName: string;
}

/**
 * Gets or creates a persistent guest identity from localStorage.
 * Returns null if localStorage is not available (SSR).
 */
export function getGuestIdentity(): GuestIdentity | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as GuestIdentity;
      if (parsed.guestId && parsed.displayName) {
        return parsed;
      }
    }
  } catch {
    // Corrupted data, regenerate
  }

  const identity: GuestIdentity = {
    guestId: generateId(),
    displayName: generateDisplayName(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // localStorage full or blocked
  }

  return identity;
}

/**
 * Gets completed article slugs from localStorage (for guests).
 */
export function getGuestCompletedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("physova_completed");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Marks an article as completed in localStorage (for guests).
 */
export function markGuestArticleCompleted(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getGuestCompletedSlugs();
    if (!existing.includes(slug)) {
      existing.push(slug);
      localStorage.setItem("physova_completed", JSON.stringify(existing));
    }
  } catch {
    // localStorage full or blocked
  }
}
