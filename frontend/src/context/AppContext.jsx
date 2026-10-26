import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { TRANSLATIONS } from "@/lib/translations";
import { PASSPORT } from "@/lib/mockData";
import { getCurrentSession, logoutUser } from "@/lib/api";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("lumina_theme") === "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("lumina_lang") || "en");
  const [passport, setPassport] = useState(PASSPORT);
  const [authStatus, setAuthStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("lumina_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => { localStorage.setItem("lumina_lang", lang); }, [lang]);

  useEffect(() => {
    let active = true;
    getCurrentSession().then(({ response, data }) => {
      if (!active) return;
      if (response.ok && data?.data?.user) {
        setUser(data.data.user);
        setCsrfToken(data.data.csrfToken || "");
        setAuthStatus("authenticated");
      } else {
        setAuthStatus("unauthenticated");
      }
    }).catch(() => {
      if (active) setAuthStatus("unauthenticated");
    });
    return () => { active = false; };
  }, []);

  const establishSession = useCallback((authenticatedUser, token) => {
    setUser(authenticatedUser);
    setCsrfToken(token);
    setAuthStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      const { response } = await logoutUser(csrfToken);
      if (response.status === 204 || response.status === 401) {
        setUser(null);
        setCsrfToken("");
        setAuthStatus("unauthenticated");
        window.location.assign("/login");
        return true;
      }
    } catch { /* Do not claim logout if the server could not invalidate the session. */ }
    return false;
  }, [csrfToken]);

  const t = useCallback(
    (key) => (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key,
    [lang]
  );

  const value = {
    dark, setDark, toggleDark: () => setDark((d) => !d),
    lang, setLang, t,
    authStatus, user, csrfToken, establishSession, logout,
    passport, setPassport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
