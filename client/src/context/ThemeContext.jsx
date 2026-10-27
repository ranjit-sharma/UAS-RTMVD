import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'glass', name: 'Glassmorphism', icon: '✨' },
  { id: 'neu', name: 'Neumorphism', icon: '🌑' },
  { id: 'clay', name: 'Claymorphism', icon: '☁️' },
  { id: 'material', name: 'Material Design', icon: '📱' },
  { id: 'bento', name: 'Bento UI', icon: '🍱' },
];

export function ThemeProvider({ children }) {
  const [uiStyle, setUiStyle] = useState(() => {
    return localStorage.getItem('uas_ui_style') || localStorage.getItem('uass_ui_style') || 'neu';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('uas_dark_mode') || localStorage.getItem('uass_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-style', uiStyle);
    localStorage.setItem('uas_ui_style', uiStyle);
  }, [uiStyle]);

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', isDarkMode.toString());
    localStorage.setItem('uas_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const changeStyle = (newStyle) => {
    setUiStyle(newStyle);
  };

  return (
    <ThemeContext.Provider value={{ uiStyle, changeStyle, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
