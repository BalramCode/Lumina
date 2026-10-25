import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { TRANSLATIONS } from "@/lib/translations";
import { USER, PASSPORT } from "@/lib/mockData";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("lumina_theme") === "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("lumina_lang") || "en");
  const [passport, setPassport] = useState(PASSPORT);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("lumina_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => { localStorage.setItem("lumina_lang", lang); }, [lang]);

  const logout = useCallback(() => {
    window.location.assign("/login");
  }, []);

  const t = useCallback(
    (key) => (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key,
    [lang]
  );

  const value = {
    dark, setDark, toggleDark: () => setDark((d) => !d),
    lang, setLang, t,
    logout,
    user: USER,
    passport, setPassport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
