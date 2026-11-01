import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// useState that loads from / saves to AsyncStorage under `key`.
export default function usePersistentState(key, makeInitial) {
  const [state, setState] = useState(makeInitial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((raw) => { if (!cancelled && raw) setState(JSON.parse(raw)); })
      .catch((e) => console.warn(`Failed to load ${key}`, e))
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(key, JSON.stringify(state)).catch((e) => console.warn(`Failed to save ${key}`, e));
  }, [key, state, loaded]);

  return [state, setState, loaded];
}
