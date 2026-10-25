import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, PillarBanner, DemoTag } from "@/components/shared";
import {
  PROFESSIONALS, PROF_TYPES, PROF_LANGS, DISTRICTS, DIVIDE_STATS, RESEARCH,
} from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Compass, MapPinned, Network, MapPin, Star, Check, Home, Wifi, ArrowRight,
  Users, BookOpen, GraduationCap, Building2, Microscope,
} from "lucide-react";

function ProCard({ p, onView, connected, onConnect }) {
  return (
    <Card data-testid={`professional-${p.id}`} className="flex flex-col rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback style={{ backgroundColor: p.color, color: "#fff" }}>{p.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold">{p.name}</h3>
            <DemoTag />
          </div>
          <p className="text-sm text-muted-foreground">{p.type}</p>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#D9A441" }}>
          <Star className="h-4 w-4 fill-current" /> {p.rating}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /> {p.location}</span>
        <span className="text-muted-foreground">{p.distance} km away</span>
        <span className="text-muted-foreground">{p.experience} yrs exp.</span>
        <span className="text-muted-foreground">{p.spec}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.langs.map((l) => <Badge key={l} variant="outline" className="rounded-full text-xs">{l}</Badge>)}
      </div>
      <Badge className="mt-3 w-fit rounded-full border-0" style={{ backgroundColor: "#5FA07E22", color: "#4d8a6a" }}>
        {p.availability}
      </Badge>
      <div className="mt-4 flex gap-2">
        <Button data-testid={`view-profile-${p.id}`} variant="outline" className="flex-1 rounded-full" onClick={() => onView(p)}>View Profile</Button>
        <Button
          data-testid={`connect-pro-${p.id}`}
          className="flex-1 rounded-full"
          variant={connected ? "secondary" : "default"}
          onClick={() => onConnect(p)}
        >
          {connected ? <><Check className="mr-1 h-4 w-4" /> Requested</> : "Connect"}
        </Button>
      </div>
    </Card>
  );
}

function MockMap({ pros, onPin }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl" data-testid="mock-map">
      <div className="lumina-grid-bg relative h-80 w-full sm:h-96" style={{ backgroundColor: "#EFE9DC" }}>
        {/* stylised roads */}
        <div className="absolute left-0 top-1/3 h-2 w-full -rotate-3 bg-black/5" />
        <div className="absolute left-1/2 top-0 h-full w-2 rotate-6 bg-black/5" />
        <div className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium shadow-sm">
          Bhubaneswar - Nearby Clinics
        </div>
        {pros.map((p) => (
          <button
            key={p.id}
            data-testid={`map-pin-${p.id}`}
            onClick={() => onPin(p)}
            className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-300 hover:scale-110"
            style={{ top: `${p.top}%`, left: `${p.left}%` }}
            aria-label={`View ${p.name}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white shadow-md" style={{ backgroundColor: p.color }}>
              <MapPin className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

const researchIcons = { "University Study": GraduationCap, "Evidence Resource": BookOpen, "Autism Research": Microscope, "Community Survey": Users };

export default function NavigatePage() {
  const { t } = useApp();
  const [type, setType] = useState("All");
  const [langF, setLangF] = useState("All");
  const [maxDist, setMaxDist] = useState([15]);
  const [connected, setConnected] = useState({});
  const [preview, setPreview] = useState(null);

  const filtered = useMemo(() => PROFESSIONALS.filter((p) =>
    (type === "All" || p.type === type) &&
    (langF === "All" || p.langs.includes(langF)) &&
    p.distance <= maxDist[0]
  ), [type, langF, maxDist]);

  const handleConnect = (p) => {
    if (connected[p.id]) return;
    setConnected((c) => ({ ...c, [p.id]: true }));
    toast.success(`Request sent to ${p.name}`, { description: "Prototype connection — no message is actually sent." });
  };

  return (
    <div className="space-y-10">
      <PageHeader title={t("navigate.title")} subtitle={t("navigate.subtitle")} icon={Compass} color="#5E8B7E" />

      {/* Pillar 1: Geo-Tagged Professional Matchmaking */}
      <PillarBanner
        title="Geo-Tagged Professional Matchmaking"
        subtitle="Find professionals based on location, expertise and your family's needs."
        icon={MapPinned}
        color="#5E8B7E"
      />

      {/* Filters + Map + Directory */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card className="rounded-2xl p-5">
            <h3 className="font-bold">Filters</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Professional type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger data-testid="filter-type"><SelectValue /></SelectTrigger>
                  <SelectContent>{PROF_TYPES.map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Language</label>
                <Select value={langF} onValueChange={setLangF}>
                  <SelectTrigger data-testid="filter-language"><SelectValue /></SelectTrigger>
                  <SelectContent>{PROF_LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Max distance: {maxDist[0]} km</label>
                <Slider data-testid="filter-distance" value={maxDist} onValueChange={setMaxDist} min={1} max={20} step={1} />
              </div>
              <p className="text-sm text-muted-foreground">{filtered.length} professionals match</p>
            </div>
          </Card>
          <MockMap pros={filtered} onPin={setPreview} />
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((p) => (
              <ProCard key={p.id} p={p} onView={setPreview} connected={!!connected[p.id]} onConnect={handleConnect} />
            ))}
          </div>
          {filtered.length === 0 && (
            <Card className="rounded-2xl p-10 text-center text-muted-foreground">No professionals match these filters. Try widening your search.</Card>
          )}
        </div>
      </section>

      {/* Geographic Access Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#5FA07E", lineHeight: 1.2 }}>
            Distance should never decide who gets support.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            By connecting families to professionals, resources, and community networks, we ensure that specialized guidance can reach every home.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted-foreground">
            <span>Family</span>
            <ArrowRight className="h-4 w-4" />
            <span>Professional</span>
            <ArrowRight className="h-4 w-4" />
            <span>Resource</span>
            <ArrowRight className="h-4 w-4" />
            <span>Community</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border">
          <img
            src="https://images.unsplash.com/photo-1596496181848-3091d4878b24?q=80&w=1200&auto=format&fit=crop"
            alt="A community health worker or professional connecting with a family, representing distance support"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
      </section>

      {/* Pillar 2: Bridging the Geographic Divide */}
      <PillarBanner
        title="Bridging the Geographic Divide"
        subtitle="Specialized support should not depend on where a family lives."
        icon={Network}
        color="#5FA07E"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5" data-testid="nearby-support">
            <div className="flex items-center gap-2 font-bold"><Home className="h-5 w-5 text-primary" /> Nearby Support</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {["Local therapists", "Inclusive schools", "Community centers", "Support groups"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-5" data-testid="remote-support">
            <div className="flex items-center gap-2 font-bold"><Wifi className="h-5 w-5 text-primary" /> Remote Support</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {["Online consultations", "Digital learning", "Remote professional guidance", "Mentor connections", "Research resources"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {x}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Flow */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-card p-5 text-sm font-semibold">
          <span className="rounded-full bg-accent px-4 py-2">Family</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="rounded-full px-4 py-2 text-white" style={{ backgroundColor: "#5E8B7E" }}>Lumina</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="rounded-full bg-accent px-4 py-2">Professional / Mentor / Resource</span>
        </div>
      </PillarBanner>

      {/* District support */}
      <section>
        <h2 className="mb-1 text-xl font-bold">Find support by district</h2>
        <p className="mb-4 text-sm text-muted-foreground">Prototype data across Odisha districts.</p>
        <div className="mb-4 grid grid-cols-3 gap-3">
          {DIVIDE_STATS.map((s) => (
            <Card key={s.label} data-testid={`divide-stat-${s.label}`} className="rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-primary sm:text-3xl">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DISTRICTS.map((d) => (
            <Card key={d.name} data-testid={`district-${d.name}`} className="flex items-center justify-between rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Building2 className="h-5 w-5" /></span>
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.professionals} professionals · {d.resources} resources</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          ))}
        </div>
      </section>

      {/* Research portal */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Microscope className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Research & Evidence</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RESEARCH.map((r) => {
            const Icon = researchIcons[r.category] || BookOpen;
            return (
              <Card key={r.id} data-testid={`research-${r.id}`} className="flex flex-col rounded-2xl p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-4 w-4" /></span>
                  <Badge variant="secondary" className="rounded-full">{r.category}</Badge>
                </div>
                <h3 className="mt-3 font-bold">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.institution}</p>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.desc}</p>
                <button data-testid={`research-read-${r.id}`} onClick={() => toast.info(r.title, { description: "Prototype research entry." })}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Read More <ArrowRight className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent data-testid="professional-preview">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>{preview.name}</DialogTitle>
                <DialogDescription>Professional profile — prototype listing.</DialogDescription>
              </DialogHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback style={{ backgroundColor: preview.color, color: "#fff" }} className="text-lg">{preview.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{preview.type}</p>
                  <p className="text-sm text-muted-foreground">{preview.location} · {preview.distance} km away</p>
                  <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: "#D9A441" }}><Star className="h-4 w-4 fill-current" /> {preview.rating}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Experience: </span>{preview.experience} years</p>
                <p><span className="text-muted-foreground">Specialization: </span>{preview.spec}</p>
                <p><span className="text-muted-foreground">Languages: </span>{preview.langs.join(", ")}</p>
                <p><span className="text-muted-foreground">Availability: </span>{preview.availability}</p>
              </div>
              <Button data-testid="preview-connect" className="w-full rounded-full" onClick={() => { handleConnect(preview); setPreview(null); }}>
                Connect
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
