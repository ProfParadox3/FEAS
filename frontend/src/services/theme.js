import { cyberTheme, darkTheme, lightTheme } from '../styles/theme';

export const getTheme = (themeName) => {
  switch (themeName) {
    case 'cyber':
      return cyberTheme;
    case 'dark':
      return darkTheme;
    case 'light':
      return lightTheme;
    default:
      return cyberTheme;
  }
};

export const getSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const applyTheme = (themeName) => {
  const theme = getTheme(themeName);
  
  // Apply CSS variables
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    if (typeof value === 'string' && !key.includes('Pattern')) {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    }
  });
  
  // Store theme preference
  localStorage.setItem('theme', themeName);
  
  return theme;
};

// Initialize theme
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = getSystemTheme();
  
  if (savedTheme) {
    return applyTheme(savedTheme);
  }
  
  return applyTheme(systemTheme);
};

// Theme utilities
export const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const darkenColor = (hexColor, percent) => {
  const num = parseInt(hexColor.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

export const lightenColor = (hexColor, percent) => {
  const num = parseInt(hexColor.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  
  return `#${(
    0x1000000 +
    (R > 255 ? 255 : R) * 0x10000 +
    (G > 255 ? 255 : G) * 0x100 +
    (B > 255 ? 255 : B)
  )
    .toString(16)
    .slice(1)}`;
};

// Theme cycling
export const cycleTheme = (currentTheme) => {
  const themes = ['cyber', 'dark', 'light'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  
  return themes[nextIndex];
};