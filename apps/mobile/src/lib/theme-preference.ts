import AsyncStorage from '@react-native-async-storage/async-storage';
import { Uniwind } from 'uniwind';

const THEME_KEY = 'ivy-theme-pref';

export type ThemePreference = 'light' | 'dark' | 'system';

export async function loadStoredThemePreference(): Promise<void> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    Uniwind.setTheme(stored);
    return;
  }
  Uniwind.setTheme('light');
  await AsyncStorage.setItem(THEME_KEY, 'light');
}

export async function setThemePreference(pref: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, pref);
  Uniwind.setTheme(pref);
}

export async function getThemePreference(): Promise<ThemePreference> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'light';
}
