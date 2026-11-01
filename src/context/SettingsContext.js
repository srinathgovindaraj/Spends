import React, { createContext, useContext, useMemo } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { DEFAULT_CURRENCY } from '../constants/theme';
import { setCurrency } from '../utils/format';

const SettingsContext = createContext(null);
const DEFAULTS = { currency: DEFAULT_CURRENCY };

export function SettingsProvider({ children }) {
  const [stored, setStored, loaded] = usePersistentState('@money_manager/settings', () => DEFAULTS);
  const settings = { ...DEFAULTS, ...stored };

  // Runs before children render, so formatMoney always uses the current currency.
  setCurrency(settings.currency);

  const value = useMemo(
    () => ({
      settings,
      loaded,
      setCurrencyCode: (code) => setStored((s) => ({ ...s, currency: code })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stored, loaded]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
