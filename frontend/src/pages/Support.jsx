import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, PillarBanner } from "@/components/shared";
import { AAC_TILES, AAC_HISTORY, CONSULT_PROS } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MessageCircleHeart, Volume2, Undo2, Trash2, PhoneCall, ShieldAlert, CalendarClock, Check,
  Hand, Utensils, GlassWater, LifeBuoy, Pause, DoorOpen, X, Plus, OctagonX,
  Smile, Frown, Zap, Blocks, Moon,
} from "lucide-react";

const tileIcons = { Hand, Utensils, GlassWater, LifeBuoy, Pause, DoorOpen, Check, X, Plus, OctagonX, Smile, Frown, Zap, Blocks, Moon };

export default function Support() {
  const { t } = useApp();
  const [sentence, setSentence] = useState([]);
  const [history, setHistory] = useState(AAC_HISTORY);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [bookPro, setBookPro] = useState(null);
  const [bookStep, setBookStep] = useState({ date: "", time: "" });
  const [speaking, setSpeaking] = useState(false);

  const addWord = (tile) => setSentence((s) => [...s, tile]);
  const undo = () => setSentence((s) => s.slice(0, -1));
  const clear = () => setSentence([]);

  const speak = () => {
    if (sentence.length === 0) { toast.info("Tap some cards to build a sentence first."); return; }
    const text = sentence.map((s) => s.label).join(" ");
    setHistory((h) => [text + ".", ...h].slice(0, 8));
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } else {
      toast.success(`Speaking: "${text}"`);
    }
  };

  const dates = ["Mon 16", "Tue 17", "Wed 18", "Thu 19", "Fri 20"];
  const times = ["10:00 AM", "11:30 AM", "2:00 PM", "4:00 PM", "5:30 PM"];

  const confirmBooking = () => {
    if (!bookStep.date || !bookStep.time) { toast.error("Please choose a date and time"); return; }
    toast.success("Consultation Requested", { description: `${bookPro.name} · ${bookStep.date}, ${bookStep.time}` });
    setBookPro(null);
    setBookStep({ date: "", time: "" });
  };

  return (
    <div className="space-y-10">
      <PageHeader title={t("support.title")} subtitle={t("support.subtitle")} icon={MessageCircleHeart} color="#4F8A9E" />

      <PillarBanner
        title="Giving a Voice to the Non-Speaking"
        subtitle="Express needs, feelings and choices through accessible communication."
        icon={Volume2}
        color="#4F8A9E"
      />

      {/* Communication Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#4F8A9E", lineHeight: 1.2 }}>
            Every child deserves a way to be heard.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether through words, pictures, or technology, giving a child agency over their communication builds dignity and connection.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border">
          <img
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop"
            alt="An autistic child communicating using visual aids with a parent or therapist, showing agency and dignity"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
      </section>

      {/* AAC Board */}
      <section>
        <Card className="rounded-3xl p-5 sm:p-6" data-testid="aac-board">
          {/* Sentence builder */}
          <div className="rounded-2xl border-2 border-dashed p-4" data-testid="aac-sentence">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Sentence Builder</p>
            {sentence.length === 0 ? (
              <p className="py-3 text-muted-foreground">Tap cards below to build a sentence — e.g. <strong>I want → Water → More</strong></p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {sentence.map((s, i) => {
                  const Icon = tileIcons[s.icon];
                  return (
                    <span key={i} className="flex items-center gap-2 rounded-xl px-3 py-2 text-white" style={{ backgroundColor: s.color }}>
                      <Icon className="h-4 w-4" /> {s.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button data-testid="aac-speak" onClick={speak} className="h-14 flex-1 rounded-2xl text-lg" style={{ backgroundColor: "#4F8A9E" }}>
              <Volume2 className={`mr-2 h-6 w-6 ${speaking ? "animate-pulse" : ""}`} /> Speak
            </Button>
            <Button data-testid="aac-undo" onClick={undo} variant="outline" className="h-14 rounded-2xl px-6 text-lg">
              <Undo2 className="mr-2 h-5 w-5" /> Undo
            </Button>
            <Button data-testid="aac-clear" onClick={clear} variant="outline" className="h-14 rounded-2xl px-6 text-lg">
              <Trash2 className="mr-2 h-5 w-5" /> Clear
            </Button>
          </div>

          {/* Tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {AAC_TILES.map((tile) => {
              const Icon = tileIcons[tile.icon];
              return (
                <button
                  key={tile.id}
                  data-testid={`aac-tile-${tile.id}`}
                  onClick={() => addWord(tile)}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border text-center transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                  style={{ backgroundColor: `${tile.color}18`, borderColor: `${tile.color}44` }}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: tile.color }}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-base font-semibold">{tile.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Recent communication + Crisis */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 lg:col-span-2" data-testid="aac-history">
          <h3 className="text-lg font-bold">Recent Communication</h3>
          <ul className="mt-3 space-y-2">
            {history.map((h, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-muted p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card"><Volume2 className="h-4 w-4 text-primary" /></span>
                <span className="font-medium">{h}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col rounded-2xl p-6" style={{ backgroundColor: "#F0A89418" }} data-testid="crisis-support">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: "#C98474" }}><ShieldAlert className="h-5 w-5" /></span>
            <h3 className="text-lg font-bold">Crisis Support</h3>
          </div>
          <p className="mt-3 flex-1 text-sm text-muted-foreground">
            If you or your child needs urgent help, calm support is available. You are not alone.
          </p>
          <Button data-testid="crisis-call" onClick={() => setCrisisOpen(true)} className="mt-4 h-12 rounded-full" style={{ backgroundColor: "#C98474" }}>
            <PhoneCall className="mr-2 h-5 w-5" /> Call Helpline
          </Button>
        </Card>
      </section>

      {/* Professional Support Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1 relative overflow-hidden rounded-3xl border">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop"
            alt="Therapist and caregiver collaborating naturally in a supportive environment"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#4F8A9E", lineHeight: 1.2 }}>
            The right support should be closer than the nearest city.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Connect with a network of dedicated developmental professionals who work with families as partners, not just patients.
          </p>
        </div>
      </section>

      {/* Book consultation */}
      <section>
        <h2 className="mb-1 text-xl font-bold">Talk to a Professional</h2>
        <p className="mb-4 text-sm text-muted-foreground">Book a prototype consultation with a specialist.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONSULT_PROS.map((p) => (
            <Card key={p.id} data-testid={`consult-${p.id}`} className="flex flex-col rounded-2xl p-5 text-center">
              <Avatar className="mx-auto h-14 w-14">
                <AvatarFallback style={{ backgroundColor: p.color, color: "#fff" }}>{p.initials}</AvatarFallback>
              </Avatar>
              <h3 className="mt-3 font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.spec}</p>
              <p className="text-xs text-muted-foreground">{p.experience} yrs · {p.langs.join(", ")}</p>
              <Badge variant="secondary" className="mx-auto mt-2 rounded-full">{p.slot}</Badge>
              <Button data-testid={`book-${p.id}`} onClick={() => setBookPro(p)} className="mt-4 rounded-full">
                <CalendarClock className="mr-1 h-4 w-4" /> Book Consultation
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Crisis modal */}
      <Dialog open={crisisOpen} onOpenChange={setCrisisOpen}>
        <DialogContent data-testid="crisis-modal">
          <DialogHeader>
            <DialogTitle>Crisis Support</DialogTitle>
            <DialogDescription>Prototype helpline confirmation.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This is a prototype. In a real deployment this would connect you to a trained helpline.
            Please stay calm — a supportive voice is here for you.
          </p>
          <div className="rounded-xl bg-muted p-3 text-center font-semibold">Demo helpline · 1800-000-000</div>
          <DialogFooter>
            <Button data-testid="crisis-confirm" onClick={() => { setCrisisOpen(false); toast.success("Connecting to helpline (prototype)"); }} className="rounded-full">
              Okay, I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking modal */}
      <Dialog open={!!bookPro} onOpenChange={(o) => { if (!o) { setBookPro(null); setBookStep({ date: "", time: "" }); } }}>
        <DialogContent data-testid="booking-modal">
          {bookPro && (
            <>
              <DialogHeader>
                <DialogTitle>Book with {bookPro.name}</DialogTitle>
                <DialogDescription>Choose a date and time, then confirm your request.</DialogDescription>
              </DialogHeader>
              <div>
                <p className="mb-2 text-sm font-medium">1. Select date</p>
                <div className="flex flex-wrap gap-2">
                  {dates.map((d) => (
                    <button key={d} data-testid={`book-date-${d}`} onClick={() => setBookStep((s) => ({ ...s, date: d }))}
                      className={`rounded-xl border px-3 py-2 text-sm transition-colors duration-200 ${bookStep.date === d ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">2. Select time</p>
                <div className="flex flex-wrap gap-2">
                  {times.map((tm) => (
                    <button key={tm} data-testid={`book-time-${tm}`} onClick={() => setBookStep((s) => ({ ...s, time: tm }))}
                      className={`rounded-xl border px-3 py-2 text-sm transition-colors duration-200 ${bookStep.time === tm ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      {tm}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button data-testid="booking-confirm" disabled={!bookStep.date || !bookStep.time} onClick={confirmBooking} className="w-full rounded-full">
                  <Check className="mr-1 h-4 w-4" /> 3. Confirm booking
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
