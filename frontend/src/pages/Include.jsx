import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, ScoreRing } from "@/components/shared";
import { INCLUSIVE_CATEGORIES, INCLUSIVE_PLACES, INCLUSIVE_REVIEWS } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Accessibility, Star, MapPin, ShieldCheck, PenLine } from "lucide-react";

const ACCOMMODATIONS = ["Quiet Hours", "Low Lighting", "Sensory Space", "Staff Trained", "Wheelchair Accessible", "Flexible Seating"];

export default function Include() {
  const { t } = useApp();
  const [cat, setCat] = useState("All");
  const [reviews, setReviews] = useState(INCLUSIVE_REVIEWS);
  const [reviewFor, setReviewFor] = useState(null);
  const [form, setForm] = useState({ stars: 5, sensory: 4, accs: [], text: "" });

  const places = cat === "All" ? INCLUSIVE_PLACES : INCLUSIVE_PLACES.filter((p) => p.category === cat);

  const toggleAcc = (a) => setForm((f) => ({ ...f, accs: f.accs.includes(a) ? f.accs.filter((x) => x !== a) : [...f.accs, a] }));

  const submitReview = () => {
    if (!form.text.trim()) { toast.error("Please write a short review"); return; }
    setReviews((r) => [{ id: Date.now(), place: reviewFor.name, name: "Priya Sharma", initials: "PS", color: "#E08A6E", stars: form.stars, text: form.text, time: "Just now" }, ...r]);
    setReviewFor(null);
    setForm({ stars: 5, sensory: 4, accs: [], text: "" });
    toast.success("Review submitted", { description: "Thank you for helping other families." });
  };

  const scoreColor = (s) => (s >= 90 ? "#5FA07E" : s >= 80 ? "#5E8B7E" : s >= 70 ? "#D9A441" : "#C98474");

  return (
    <div className="space-y-10">
      <PageHeader title={t("include.title")} subtitle={t("include.subtitle")} icon={Accessibility} color="#5FA07E" />

      <div
        className="lumina-fade-in rounded-3xl border p-6 sm:p-8"
        style={{ backgroundColor: "#6FA28714", borderColor: "#6FA28733" }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" style={{ color: "#5FA07E" }} />
          <h2 className="text-2xl font-bold">Autism-Friendly Partner Network</h2>
        </div>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every space is rated with an <strong>Inclusion Score</strong> based on sensory and accessibility features —
          so families know what to expect before they arrive.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {INCLUSIVE_CATEGORIES.map((c) => (
          <button
            key={c}
            data-testid={`include-cat-${c}`}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${cat === c ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Places */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((p) => (
          <Card key={p.id} data-testid={`place-${p.id}`} className="flex flex-col rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {p.location}</p>
                <Badge variant="secondary" className="mt-2 rounded-full">{p.category}</Badge>
              </div>
              <ScoreRing score={p.score} color={scoreColor(p.score)} />
            </div>
            <div className="mt-3 flex items-center gap-1 text-sm" style={{ color: "#D9A441" }}>
              <Star className="h-4 w-4 fill-current" /> <span className="font-semibold">{p.rating}</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground">Sensory features</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.sensory.map((s) => <Badge key={s} variant="outline" className="rounded-full text-xs">{s}</Badge>)}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground">Accessibility</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {p.access.map((s) => <Badge key={s} className="rounded-full border-0 text-xs" style={{ backgroundColor: "#5FA07E22", color: "#4d8a6a" }}>{s}</Badge>)}
              </div>
            </div>
            <Button data-testid={`review-btn-${p.id}`} variant="outline" onClick={() => setReviewFor(p)} className="mt-4 rounded-full">
              <PenLine className="mr-1 h-4 w-4" /> Write a review
            </Button>
          </Card>
        ))}
      </div>

      {/* Reviews */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Recent Reviews</h2>
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} data-testid={`review-${r.id}`} className="flex items-start gap-4 rounded-2xl p-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback style={{ backgroundColor: r.color, color: "#fff" }}>{r.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-xs text-muted-foreground">reviewed {r.place} · {r.time}</span>
                </div>
                <div className="mt-1 flex" style={{ color: "#D9A441" }}>
                  {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.stars ? "fill-current" : "opacity-30"}`} />)}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Review modal */}
      <Dialog open={!!reviewFor} onOpenChange={(o) => !o && setReviewFor(null)}>
        <DialogContent data-testid="review-modal">
          {reviewFor && (
            <>
              <DialogHeader>
                <DialogTitle>Review {reviewFor.name}</DialogTitle>
                <DialogDescription>Rate and share your experience to help other families.</DialogDescription>
              </DialogHeader>
              <div>
                <p className="mb-1 text-sm font-medium">Overall rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} data-testid={`star-${n}`} onClick={() => setForm((f) => ({ ...f, stars: n }))} aria-label={`${n} stars`}>
                      <Star className={`h-8 w-8 ${n <= form.stars ? "fill-current" : "opacity-30"}`} style={{ color: "#D9A441" }} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Sensory friendliness</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} data-testid={`sensory-${n}`} onClick={() => setForm((f) => ({ ...f, sensory: n }))} aria-label={`${n} sensory`}>
                      <Star className={`h-7 w-7 ${n <= form.sensory ? "fill-current" : "opacity-30"}`} style={{ color: "#5FA07E" }} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Accommodations you used</p>
                <div className="flex flex-wrap gap-2">
                  {ACCOMMODATIONS.map((a) => (
                    <button key={a} data-testid={`acc-${a}`} onClick={() => toggleAcc(a)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors duration-200 ${form.accs.includes(a) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea data-testid="review-text" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} placeholder="Share your experience…" rows={3} />
              <DialogFooter>
                <Button data-testid="review-submit" onClick={submitReview} className="w-full rounded-full">Submit Review</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
