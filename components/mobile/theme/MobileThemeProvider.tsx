"use client";

import React, { createContext, useState, useEffect, useContext } from "react";

export type AppTheme = "dark" | "light";
export type ArabicFontSize = "normal" | "large" | "xlarge";
export type CardDensity = "spacious" | "compact";

interface MobileThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  arabicFontSize: ArabicFontSize;
  setArabicFontSize: (size: ArabicFontSize) => void;
  density: CardDensity;
  setDensity: (density: CardDensity) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const MobileThemeContext = createContext<MobileThemeContextType | undefined>(undefined);

export const MobileThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>("dark");
  const [arabicFontSize, setArabicFontSizeState] = useState<ArabicFontSize>("normal");
  const [density, setDensityState] = useState<CardDensity>("spacious");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("ar_pwa_theme");
      const storedArabic = localStorage.getItem("ar_pwa_arabic_size") as ArabicFontSize;
      const storedDensity = localStorage.getItem("ar_pwa_density") as CardDensity;

      if (storedTheme && storedTheme !== "sepia")
        setThemeState(storedTheme as AppTheme);
      if (storedArabic) setArabicFontSizeState(storedArabic);
      if (storedDensity) setDensityState(storedDensity);
    } catch {
      // localStorage may fail in SSR or restricted iframe
    }
  }, []);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem("ar_pwa_theme", t);
    } catch {}
  };

  const setArabicFontSize = (s: ArabicFontSize) => {
    setArabicFontSizeState(s);
    try {
      localStorage.setItem("ar_pwa_arabic_size", s);
    } catch {}
  };

  const setDensity = (d: CardDensity) => {
    setDensityState(d);
    try {
      localStorage.setItem("ar_pwa_density", d);
    } catch {}
  };

  return (
    <MobileThemeContext.Provider
      value={{
        theme,
        setTheme,
        arabicFontSize,
        setArabicFontSize,
        density,
        setDensity,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </MobileThemeContext.Provider>
  );
};

export function useMobileTheme() {
  const context = useContext(MobileThemeContext);
  if (!context) {
    return {
      theme: "dark" as AppTheme,
      setTheme: () => {},
      arabicFontSize: "normal" as ArabicFontSize,
      setArabicFontSize: () => {},
      density: "spacious" as CardDensity,
      setDensity: () => {},
      isModalOpen: false,
      setIsModalOpen: () => {},
    };
  }
  return context;
}
