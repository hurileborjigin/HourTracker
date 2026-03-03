"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  colors: {
    bg1: string;
    bg2: string;
    bg3: string;
    accent: string;
    accentLight: string;
    accentMuted: string;
    glass: string;
    glassBorder: string;
    glassLight: string;
    glassLightBorder: string;
    gridLine: string;
    scrollTrack: string;
    scrollThumb: string;
    shadow: string;
  };
}

export const themes: Theme[] = [
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    emoji: "🌲",
    colors: {
      bg1: "#052e16",
      bg2: "#14532d",
      bg3: "#0f2e1a",
      accent: "#22c55e",
      accentLight: "#86efac",
      accentMuted: "#166534",
      glass: "rgba(20, 83, 45, 0.4)",
      glassBorder: "rgba(34, 197, 94, 0.15)",
      glassLight: "rgba(255, 255, 255, 0.05)",
      glassLightBorder: "rgba(255, 255, 255, 0.08)",
      gridLine: "rgba(34, 197, 94, 0.03)",
      scrollTrack: "#052e16",
      scrollThumb: "#166534",
      shadow: "rgba(22, 163, 74, 0.3)",
    },
  },
  {
    id: "midnight-ocean",
    name: "Midnight Ocean",
    emoji: "🌊",
    colors: {
      bg1: "#0c1222",
      bg2: "#1e293b",
      bg3: "#0f172a",
      accent: "#38bdf8",
      accentLight: "#7dd3fc",
      accentMuted: "#1e3a5f",
      glass: "rgba(15, 23, 42, 0.6)",
      glassBorder: "rgba(56, 189, 248, 0.15)",
      glassLight: "rgba(255, 255, 255, 0.05)",
      glassLightBorder: "rgba(255, 255, 255, 0.08)",
      gridLine: "rgba(56, 189, 248, 0.03)",
      scrollTrack: "#0c1222",
      scrollThumb: "#1e3a5f",
      shadow: "rgba(56, 189, 248, 0.3)",
    },
  },
  {
    id: "volcanic-ember",
    name: "Volcanic Ember",
    emoji: "🌋",
    colors: {
      bg1: "#1c0a00",
      bg2: "#431407",
      bg3: "#27100a",
      accent: "#f97316",
      accentLight: "#fdba74",
      accentMuted: "#7c2d12",
      glass: "rgba(67, 20, 7, 0.5)",
      glassBorder: "rgba(249, 115, 22, 0.15)",
      glassLight: "rgba(255, 255, 255, 0.05)",
      glassLightBorder: "rgba(255, 255, 255, 0.08)",
      gridLine: "rgba(249, 115, 22, 0.03)",
      scrollTrack: "#1c0a00",
      scrollThumb: "#7c2d12",
      shadow: "rgba(249, 115, 22, 0.3)",
    },
  },
  {
    id: "arctic-aurora",
    name: "Arctic Aurora",
    emoji: "🌌",
    colors: {
      bg1: "#0a0a1a",
      bg2: "#1a1a3e",
      bg3: "#0f0f2e",
      accent: "#a78bfa",
      accentLight: "#c4b5fd",
      accentMuted: "#4c1d95",
      glass: "rgba(26, 26, 62, 0.5)",
      glassBorder: "rgba(167, 139, 250, 0.15)",
      glassLight: "rgba(255, 255, 255, 0.05)",
      glassLightBorder: "rgba(255, 255, 255, 0.08)",
      gridLine: "rgba(167, 139, 250, 0.03)",
      scrollTrack: "#0a0a1a",
      scrollThumb: "#4c1d95",
      shadow: "rgba(167, 139, 250, 0.3)",
    },
  },
  {
    id: "rose-garden",
    name: "Rose Garden",
    emoji: "🌹",
    colors: {
      bg1: "#1a0a10",
      bg2: "#3b0d1e",
      bg3: "#2a0915",
      accent: "#f43f5e",
      accentLight: "#fda4af",
      accentMuted: "#881337",
      glass: "rgba(59, 13, 30, 0.5)",
      glassBorder: "rgba(244, 63, 94, 0.15)",
      glassLight: "rgba(255, 255, 255, 0.05)",
      glassLightBorder: "rgba(255, 255, 255, 0.08)",
      gridLine: "rgba(244, 63, 94, 0.03)",
      scrollTrack: "#1a0a10",
      scrollThumb: "#881337",
      shadow: "rgba(244, 63, 94, 0.3)",
    },
  },
  {
    id: "golden-sunset",
    name: "Golden Sunset",
    emoji: "🌅",
    colors: {
      bg1: "#1a1000",
      bg2: "#422006",
      bg3: "#2c1503",
      accent: "#eab308",
      accentLight: "#fde68a",
      accentMuted: "#854d0e",
      glass: "rgba(66, 32, 6, 0.5)",
      glassBorder: "rgba(234, 179, 8, 0.15)",
      glassLight: "rgba(255, 255, 255, 0.05)",
      glassLightBorder: "rgba(255, 255, 255, 0.08)",
      gridLine: "rgba(234, 179, 8, 0.03)",
      scrollTrack: "#1a1000",
      scrollThumb: "#854d0e",
      shadow: "rgba(234, 179, 8, 0.3)",
    },
  },
];

interface ThemeContextType {
  theme: Theme;
  setThemeById: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes[0],
  setThemeById: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const c = theme.colors;

  root.style.setProperty("--bg1", c.bg1);
  root.style.setProperty("--bg2", c.bg2);
  root.style.setProperty("--bg3", c.bg3);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--accent-light", c.accentLight);
  root.style.setProperty("--accent-muted", c.accentMuted);
  root.style.setProperty("--glass-bg", c.glass);
  root.style.setProperty("--glass-border", c.glassBorder);
  root.style.setProperty("--glass-light-bg", c.glassLight);
  root.style.setProperty("--glass-light-border", c.glassLightBorder);
  root.style.setProperty("--grid-line", c.gridLine);
  root.style.setProperty("--scroll-track", c.scrollTrack);
  root.style.setProperty("--scroll-thumb", c.scrollThumb);
  root.style.setProperty("--shadow", c.shadow);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    const saved = localStorage.getItem("hourtracker-theme");
    if (saved) {
      const found = themes.find((t) => t.id === saved);
      if (found) {
        setTheme(found);
        applyTheme(found);
        return;
      }
    }
    applyTheme(themes[0]);
  }, []);

  function setThemeById(id: string) {
    const found = themes.find((t) => t.id === id);
    if (found) {
      setTheme(found);
      applyTheme(found);
      localStorage.setItem("hourtracker-theme", id);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeById }}>
      {children}
    </ThemeContext.Provider>
  );
}
