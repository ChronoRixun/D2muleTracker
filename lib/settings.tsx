/**
 * App settings store — motion, density.
 *
 * Persisted to a JSON file on disk via expo-file-system. Kept deliberately
 * tiny — no zustand, no AsyncStorage. If more settings grow here, this is
 * still the right shape: one context, one writer, one reader.
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

export type Motion = 'subtle' | 'full';
export type Density = 'comfortable' | 'dense';

export interface Settings {
  motion: Motion;
  density: Density;
  tutorialCompleted: boolean;
}

const DEFAULTS: Settings = {
  motion: 'subtle',
  density: 'comfortable',
  tutorialCompleted: false,
};

const SETTINGS_FILENAME = 'ember-settings.json';

interface SettingsContextValue extends Settings {
  loaded: boolean;
  setMotion: (m: Motion) => void;
  setDensity: (d: Density) => void;
  setTutorialCompleted: (completed: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readSettings(): Settings {
  try {
    const file = new File(Paths.document, SETTINGS_FILENAME);
    if (!file.exists) return DEFAULTS;
    const raw = file.textSync();
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      motion: parsed.motion === 'full' ? 'full' : 'subtle',
      density: parsed.density === 'dense' ? 'dense' : 'comfortable',
      tutorialCompleted: parsed.tutorialCompleted === true,
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

  useEffect(() => {
    setState(readSettings());
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      writeSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...state,
      loaded,
      setMotion: (motion) => update({ motion }),
      setDensity: (density) => update({ density }),
      setTutorialCompleted: (tutorialCompleted) => update({ tutorialCompleted }),
    }),
    [state, loaded, update],
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
