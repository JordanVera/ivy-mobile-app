import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

const gold = '#b45309';
const goldDark = '#fbbf24';

/** Navigation chrome aligned with Ivy light surfaces */
export const IvyLightNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: gold,
    background: '#fafafa',
    card: '#ffffff',
    text: '#18181b',
    border: '#e4e4e7',
    notification: gold,
  },
};

/** Navigation chrome aligned with Ivy dark surfaces */
export const IvyDarkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: goldDark,
    background: '#09090b',
    card: '#18181b',
    text: '#fafafa',
    border: '#27272a',
    notification: goldDark,
  },
};
