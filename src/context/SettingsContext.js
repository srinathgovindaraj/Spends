import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { DEFAULT_CURRENCY, applyTheme, colors } from '../constants/theme';
import { setCurrency } from '../utils/format';
import { getTranslation } from '../utils/i18n';

const SettingsContext = createContext(null);
const DEFAULTS = {
  currency: DEFAULT_CURRENCY,
  appearance: 'dark', // Default to Dark mode
  language: 'en',
};

export function SettingsProvider({ children }) {
  const [stored, setStored, loaded] = usePersistentState('@money_manager/settings', () => DEFAULTS);
  const settings = { ...DEFAULTS, ...stored };
  const [themeVersion, setThemeVersion] = useState(0);

  // Runs before children render, so formatMoney always uses the current currency.
  setCurrency(settings.currency);

  useEffect(() => {
    applyTheme(settings.appearance);
    setThemeVersion((v) => v + 1);
  }, [settings.appearance]);

  // Listen to OS system theme changes if user selected 'system'
  useEffect(() => {
    if (settings.appearance !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyTheme('system');
      setThemeVersion((v) => v + 1);
    };
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [settings.appearance]);

  const t = useMemo(() => getTranslation(settings.language), [settings.language]);

  const isDark = useMemo(() => {
    if (settings.appearance === 'dark') return true;
    if (settings.appearance === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [settings.appearance, themeVersion]);

  const value = useMemo(
    () => ({
      settings,
      loaded,
      themeVersion,
      isDark,
      colors,
      t,
      setCurrencyCode: (code) => setStored((s) => ({ ...s, currency: code })),
      setAppearance: (appearance) => setStored((s) => ({ ...s, appearance })),
      setLanguage: (language) => setStored((s) => ({ ...s, language })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stored, loaded, themeVersion, isDark, settings.language, settings.appearance, settings.currency]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

export function useTheme() {
  const { colors: currentColors, isDark, themeVersion, settings } = useSettings();
  return { colors: currentColors, isDark, themeVersion, appearance: settings.appearance };
}

export function useThemedStyles(factory) {
  const { themeVersion } = useSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(colors), [themeVersion]);
}
