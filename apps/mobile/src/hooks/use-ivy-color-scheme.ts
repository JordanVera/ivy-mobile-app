import { useColorScheme } from 'react-native';

/**
 * Effective scheme after Uniwind / Appearance updates (`Uniwind.setTheme` drives `useColorScheme`).
 */
export function useIvyColorScheme(): 'light' | 'dark' {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
