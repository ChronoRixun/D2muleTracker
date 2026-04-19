/**
 * App settings store — motion intensity, density.
 *
 * Persisted to a JSON file on disk via expo-file-system. Kept deliberately
 * tiny — no zustand, no AsyncStorage. If more settings grow here, this is
 * still the right shape: one context, one writer, one reader.
 *
 * Motion is a three-tier system:
 *   - 'subtle'    — Normal Difficulty: clean, minimal, no particles
 *   - 'nightmare' — Dark · ominous · breathing glow + drifting embers
 *   - 'hellforge' — Maximum: molten glow, forge sparks, edge vignette
 *
 * The reduced-motion accessibility setting forces 'subtle' regardless of the
 * stored preference. `effectiveMotion` reflects the override; `motion` is the
 * raw user choice (so the picker still highlights what they chose).
 *
 * Default for new installs is 'hellforge' so first-launch shows off the forge.
 * Old installs that stored the legacy 'full' value migrate to 'hellforge'.
 */

import { File, Paths } from 'expo-file-system';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo } from 'react-native';

export type Motion = 'subtle' | 'nightmare' | 'hellforge';
export type Density = 'comfortable' | 'dense';
export type DefaultSort = 'rarity' | 'name' | 'added';

export interface Settings {
  motion: Motion;
  density: Density;
  tutorialCompleted: boolean;
  defaultSort: DefaultSort;
  lastBackupAt: string | null;
  lastBackupSize: number | null;
}

const DEFAULTS: Settings = {
  motion: 'hellforge',
  density: 'comfortable',
  tutorialCompleted: false,
  defaultSort: 'rarity',
  lastBackupAt: null,
  lastBackupSize: null,
};

const SETTINGS_FILENAME = 'ember-settings.json';

interface SettingsContextValue extends Settings {
  loaded: boolean;
  effectiveMotion: Motion;
  reducedMotion: boolean;
  setMotion: (m: Motion) => void;
  setDensity: (d: Density) => void;
  setTutorialCompleted: (completed: boolean) => void;
  setDefaultSort: (d: DefaultSort) => void;
  markBackup: (sizeBytes: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function coerceMotion(raw: unknown): Motion {
  if (raw === 'subtle') return 'subtle';
  if (raw === 'nightmare') return 'nightmare';
  if (raw === 'hellforge') return 'hellforge';
  // Legacy migration: the old binary 'full' setting maps to the new max tier.
  if (raw === 'full') return 'hellforge';
  return DEFAULTS.motion;
}

function coerceDefaultSort(raw: unknown): DefaultSort {
  if (raw === 'name' || raw === 'added' || raw === 'rarity') return raw;
  return DEFAULTS.defaultSort;
}

function coerceLastBackupAt(raw: unknown): string | null {
  if (typeof raw === 'string' && !Number.isNaN(Date.parse(raw))) return raw;
  return null;
}

function coerceLastBackupSize(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return raw;
  return null;
}

function readSettings(): Settings {
  try {
    const file = new File(Paths.document, SETTINGS_FILENAME);
    if (!file.exists) return DEFAULTS;
    const raw = file.textSync();
    const parsed = JSON.parse(raw) as Partial<Settings> & { motion?: unknown };
    return {
      motion: coerceMotion(parsed.motion),
      density: parsed.density === 'dense' ? 'dense' : 'comfortable',
      tutorialCompleted: parsed.tutorialCompleted === true,
      defaultSort: coerceDefaultSort(parsed.defaultSort),
      lastBackupAt: coerceLastBackupAt(parsed.lastBackupAt),
      lastBackupSize: coerceLastBackupSize(parsed.lastBackupSize),
    };
  } catch {
    return DEFAULTS;
  }
}

function writeSettings(settings: Settings): void {
  try {
    const file = new File(Paths.document, SETTINGS_FILENAME);
    if (!file.exists) file.create();
    file.write(JSON.stringify(settings));
  } catch {
    // Best-effort persistence; swallow errors so the UI stays responsive.
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setState(readSettings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => {
        if (!cancelled) setReducedMotion(on);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      writeSettings(next);
      return next;
    });
  }, []);

  const effectiveMotion: Motion = reducedMotion ? 'subtle' : state.motion;

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...state,
      loaded,
      effectiveMotion,
      reducedMotion,
      setMotion: (motion) => update({ motion }),
      setDensity: (density) => update({ density }),
      setTutorialCompleted: (tutorialCompleted) => update({ tutorialCompleted }),
      setDefaultSort: (defaultSort) => update({ defaultSort }),
      markBackup: (sizeBytes) =>
        update({
          lastBackupAt: new Date().toISOString(),
          lastBackupSize: sizeBytes,
        }),
    }),
    [state, loaded, update, effectiveMotion, reducedMotion],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Tier config — the knobs every animated component reads.
// ---------------------------------------------------------------------------

export interface MotionTierConfig {
  label: string;
  sub: string;
  desc: string;
  bgIntensity: number;
  ambientParticles: number;
  cinderParticles: number;
  vignettePulse: boolean;
  vignetteOpacity: number;
  headerShimmer: boolean;
  titleMolten: boolean;
  dividerBreathe: boolean;
  forgeSparks: boolean;
  listStagger: boolean;
  itemGlowPulse: boolean;
  statFlicker: boolean;
  accentDotPulse: boolean;
  accentPulseMs: number;
  accentPulseMin: number;
  modalSpring: boolean;
  edgeFlash: boolean;
  mountFadeMs: number;
  /**
   * Back-compat with components written for the old binary motion === 'full'
   * branch — treat anything above subtle as "full motion behavior".
   */
  legacyFull: boolean;
}

export const MOTION_TIERS: Record<Motion, MotionTierConfig> = {
  subtle: {
    label: 'Subtle',
    sub: 'Normal Difficulty',
    desc: 'Clean, minimal. Gentle fades, native scroll physics.',
    bgIntensity: 0.4,
    ambientParticles: 0,
    cinderParticles: 0,
    vignettePulse: false,
    vignetteOpacity: 0,
    headerShimmer: false,
    titleMolten: false,
    dividerBreathe: false,
    forgeSparks: false,
    listStagger: false,
    itemGlowPulse: false,
    statFlicker: false,
    accentDotPulse: true,
    accentPulseMs: 700,
    accentPulseMin: 0.9,
    modalSpring: false,
    edgeFlash: false,
    mountFadeMs: 300,
    legacyFull: false,
  },
  nightmare: {
    label: 'Nightmare',
    sub: 'Dark · Ominous',
    desc: 'Something is watching. Ember drift, heat shimmer, breathing glow.',
    bgIntensity: 0.7,
    ambientParticles: 7,
    cinderParticles: 0,
    vignettePulse: false,
    vignetteOpacity: 0.18,
    headerShimmer: true,
    titleMolten: false,
    dividerBreathe: true,
    forgeSparks: false,
    listStagger: true,
    itemGlowPulse: true,
    statFlicker: false,
    accentDotPulse: true,
    accentPulseMs: 900,
    accentPulseMin: 0.8,
    modalSpring: true,
    edgeFlash: true,
    mountFadeMs: 380,
    legacyFull: true,
  },
  hellforge: {
    label: 'Hellforge',
    sub: 'Maximum Intensity',
    desc: 'Standing too close to molten metal. Embers pool, titles glow molten, sparks burst.',
    bgIntensity: 1.0,
    ambientParticles: 22,
    cinderParticles: 4,
    vignettePulse: true,
    vignetteOpacity: 0.32,
    headerShimmer: true,
    titleMolten: true,
    dividerBreathe: true,
    forgeSparks: true,
    listStagger: true,
    itemGlowPulse: true,
    statFlicker: true,
    accentDotPulse: true,
    accentPulseMs: 800,
    accentPulseMin: 0.6,
    modalSpring: true,
    edgeFlash: true,
    mountFadeMs: 420,
    legacyFull: true,
  },
};

export function useMotionConfig(): MotionTierConfig {
  const { effectiveMotion } = useSettings();
  return MOTION_TIERS[effectiveMotion];
}
