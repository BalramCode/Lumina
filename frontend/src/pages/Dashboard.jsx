import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { SECTIONS } from "@/lib/sections";
import { HOW_HELPS, TODAY_STATS, LEARN_PROGRESS } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowRight, MapPinned, HousePlus, HeartHandshake, Network, Volume2,
  BookOpen, Users, MapPin, CalendarClock,
} from "lucide-react";

const howIcons = { MapPinned, HousePlus, HeartHandshake, Network, Volume2 };
const statIcons = { BookOpen, Users, MapPin, CalendarClock };

export default function Dashboard() {
  const { t, user } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <section className="lumina-fade-in flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("dash.greeting")} <span className="align-middle">👋</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{t("dash.subtitle")}</p>
        </div>
        <Card className="flex items-center gap-3 rounded-2xl p-3 pr-5">
          <Avatar className="h-12 w-12">
            <AvatarFallback style={{ backgroundColor: "#E08A6E", color: "#fff" }}>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold leading-none">{user.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("dash.role")}</p>
          </div>
        </Card>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-xl font-bold">{t("dash.quickActions")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              data-testid={`quick-action-${s.id}`}
              onClick={() => navigate(s.path)}
              className="group flex items-start gap-4 rounded-2xl border bg-card p-5 text-left transition-colors duration-300 hover:border-primary/40"
              style={{ backgroundColor: s.tint }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: s.color }}>
                <s.icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-bold">
                  {t(s.quickTitleKey)}
                  <ArrowRight className="h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{t(s.quickDescKey)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* How Lumina Helps */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("dash.howHelps")}</h2>
            <p className="mt-1 text-muted-foreground">Five ways Lumina supports your family's journey.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_HELPS.map((h, i) => {
            const Icon = howIcons[h.icon];
            const wide = i === 0; // feature the first pillar
            return (
              <button
                key={h.id}
                data-testid={`how-helps-${h.id}`}
                onClick={() => navigate(h.to)}
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-colors duration-300 hover:border-primary/40 ${wide ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${h.color}22`, color: h.color }}>
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-lg font-bold leading-snug">{h.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{h.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: h.color }}>
                  Explore <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Today's Support + Progress */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold">{t("dash.todaySupport")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TODAY_STATS.map((s) => {
              const Icon = statIcons[s.icon];
              return (
                <button
                  key={s.id}
                  data-testid={`today-stat-${s.id}`}
                  onClick={() => navigate(s.to)}
                  className="rounded-2xl border bg-card p-4 text-left transition-colors duration-300 hover:border-primary/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}22`, color: s.color }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </button>
              );
            })}
          </div>
        </div>
        <Card className="rounded-2xl p-6">
          <h3 className="text-lg font-bold">Your Learning Progress</h3>
          <p className="mt-1 text-sm text-muted-foreground">Keep building confidence at home.</p>
          <div className="mt-5 flex items-end justify-between">
            <span className="text-3xl font-bold text-primary">{LEARN_PROGRESS}%</span>
            <span className="text-sm text-muted-foreground">Complete</span>
          </div>
          <Progress value={LEARN_PROGRESS} className="mt-3 h-3" />
          <button data-testid="dashboard-continue-learning" onClick={() => navigate("/learn")}
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Continue learning <ArrowRight className="h-4 w-4" />
          </button>
        </Card>
      </section>

      {/* Vision / Final Section */}
      <section className="relative mt-20 overflow-hidden rounded-3xl border bg-card text-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop"
            alt="A diverse group of children, parents, educators, and community members naturally connected"
            className="h-full w-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20 sm:py-32">
          <h2 className="text-xl font-bold uppercase tracking-wide text-primary sm:text-2xl">
            We are not just building another autism platform.
          </h2>
          <h3 className="mt-4 text-3xl font-extrabold uppercase tracking-tight sm:text-5xl lg:text-6xl" style={{ lineHeight: 1.1 }}>
            We are building a community <br className="hidden sm:block" /> around every child.
          </h3>
          <div className="mt-12">
            <span className="flex items-center justify-center gap-3 text-lg font-medium text-muted-foreground">
              <span className="h-px w-12 bg-border"></span>
              Lumina
              <span className="h-px w-12 bg-border"></span>
            </span>
            <p className="mt-2 text-xl font-semibold">From Social Discrimination to Social Acceptance.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
