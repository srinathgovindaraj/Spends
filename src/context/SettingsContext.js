import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { DEFAULT_CURRENCY, applyTheme } from '../constants/theme';
import { setCurrency } from '../utils/format';
import { getTranslation } from '../utils/i18n';

const SettingsContext = createContext(null);
const DEFAULTS = {
  currency: DEFAULT_CURRENCY,
  appearance: 'light',
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

  const t = useMemo(() => getTranslation(settings.language), [settings.language]);

  const value = useMemo(
    () => ({
      settings,
      loaded,
      themeVersion,
      t,
      setCurrencyCode: (code) => setStored((s) => ({ ...s, currency: code })),
      setAppearance: (appearance) => setStored((s) => ({ ...s, appearance })),
      setLanguage: (language) => setStored((s) => ({ ...s, language })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stored, loaded, themeVersion, settings.language, settings.appearance, settings.currency]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
