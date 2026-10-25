import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export const PageHeader = ({ title, subtitle, icon: Icon, color }) => (
  <div className="lumina-fade-in flex items-start gap-4">
    {Icon && (
      <div
        className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
    )}
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
    </div>
  </div>
);

export const PillarBanner = ({ title, subtitle, icon: Icon, color, children }) => (
  <div
    className="lumina-fade-in relative overflow-hidden rounded-3xl border p-6 sm:p-8"
    style={{ backgroundColor: `${color}14`, borderColor: `${color}33` }}
  >
    <div className="relative z-10">
      <Badge className="mb-4 gap-1.5 border-0 text-white" style={{ backgroundColor: color }}>
        <Sparkles className="h-3.5 w-3.5" /> Solution pillar
      </Badge>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: color }}>
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  </div>
);

export const ScoreRing = ({ score, size = 72, color = "#5E8B7E" }) => {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none">{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};

export const DemoTag = ({ label = "Demo Profile" }) => (
  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
    {label}
  </span>
);
