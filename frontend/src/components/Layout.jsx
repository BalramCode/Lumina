import React, { useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { SECTIONS } from "@/lib/sections";
import { useApp } from "@/context/AppContext";
import { LuminaLogo } from "@/components/LuminaLogo";
import { LANGUAGES } from "@/lib/translations";
import { NOTIFICATIONS, SEARCH_INDEX } from "@/lib/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sun, Moon, Bell, Search, Settings, Globe, User as UserIcon, LogOut,
  MessageSquare, BookOpen, CalendarClock, Users,
} from "lucide-react";

const notifIcons = { MessageSquare, BookOpen, CalendarClock, Users };

function NavItems({ onNavigate }) {
  const { t } = useApp();
  return (
    <>
      {SECTIONS.map((s) => (
        <NavLink
          key={s.id}
          to={s.path}
          onClick={onNavigate}
          data-testid={`nav-${s.id}`}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors duration-300 ${
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`
          }
          style={({ isActive }) => (isActive ? { backgroundColor: s.tint } : {})}
        >
          {({ isActive }) => (
            <>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300"
                style={{ backgroundColor: isActive ? s.color : `${s.color}22`, color: isActive ? "#fff" : s.color }}
              >
                <s.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              {t(s.labelKey)}
            </>
          )}
        </NavLink>
      ))}
    </>
  );
}

function LanguageMenu() {
  const { lang, setLang } = useApp();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" data-testid="language-toggle" aria-label="Change language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} data-testid={`lang-${l.code}`} onClick={() => setLang(l.code)}
            className={lang === l.code ? "bg-accent font-semibold" : ""}>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const { t } = useApp();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" data-testid="notifications-toggle" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ backgroundColor: "#E08A6E" }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("common.notifications")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NOTIFICATIONS.map((n) => {
          const Icon = notifIcons[n.icon] || Bell;
          return (
            <DropdownMenuItem key={n.id} data-testid={`notif-${n.id}`} className="items-start gap-3 py-3">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm">{n.text}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GlobalSearch() {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const results = useMemo(() => {
    if (!q.trim()) return [];
    return SEARCH_INDEX.filter((r) => r.label.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  }, [q]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        data-testid="global-search-input"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={t("common.search")}
        className="h-11 rounded-full pl-9"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border bg-popover shadow-lg" data-testid="search-results">
          {results.map((r, i) => (
            <button
              key={i}
              data-testid={`search-result-${i}`}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-accent"
              onMouseDown={() => { navigate(r.to); setQ(""); setOpen(false); }}
            >
              <span className="text-sm font-medium">{r.label}</span>
              <span className="text-xs text-muted-foreground">{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function userInitials(user) {
  return user?.name?.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "L";
}

function ProfileMenu({ user }) {
  const { t, logout } = useApp();
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 transition-colors duration-300 hover:bg-muted" data-testid="profile-menu">
          <Avatar className="h-9 w-9">
            <AvatarFallback style={{ backgroundColor: "#E08A6E", color: "#fff" }}>{userInitials(user)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{t("dash.role")}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="menu-profile" onClick={() => navigate("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" /> {t("nav.profile")}
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="menu-settings" onClick={() => navigate("/profile")}>
          <Settings className="mr-2 h-4 w-4" /> {t("nav.settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="menu-logout" onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout({ children }) {
  const { t, dark, toggleDark, user } = useApp();
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r bg-card lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <LuminaLogo />
          <div>
            <p className="text-xl font-bold leading-none">Lumina</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("app.tagline")}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          <NavItems />
        </nav>
        <div className="space-y-1 border-t px-4 py-4">
          <button onClick={toggleDark} data-testid="sidebar-dark-toggle"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </span>
            {dark ? t("common.lightMode") : t("common.darkMode")}
          </button>
          <NavLink to="/profile" data-testid="sidebar-profile"
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-300 ${isActive ? "bg-muted" : "hover:bg-muted"}`}>
            <Avatar className="h-9 w-9">
              <AvatarFallback style={{ backgroundColor: "#E08A6E", color: "#fff" }}>{userInitials(user)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{t("dash.role")}</p>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <LuminaLogo size={34} />
            <span className="text-lg font-bold">Lumina</span>
          </div>
          <div className="ml-auto flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <div className="hidden flex-1 justify-center sm:flex"><GlobalSearch /></div>
            <LanguageMenu />
            <Button variant="ghost" size="icon" className="rounded-full lg:hidden" onClick={toggleDark} data-testid="topbar-dark-toggle" aria-label="Toggle theme">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Notifications />
            <ProfileMenu user={user} />
          </div>
        </header>

        {/* Mobile search */}
        <div className="px-4 pt-3 sm:hidden">
          <GlobalSearch />
        </div>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card lg:hidden">
        <div className="grid grid-cols-6">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.id}
              to={s.path}
              data-testid={`bottomnav-${s.id}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? "" : "text-muted-foreground"
                }`
              }
              style={({ isActive }) => (isActive ? { color: s.color } : {})}
            >
              {({ isActive }) => (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300"
                    style={{ backgroundColor: isActive ? `${s.color}22` : "transparent" }}>
                    <s.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  {t(s.labelKey)}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
