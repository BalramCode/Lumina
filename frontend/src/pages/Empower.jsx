import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared";
import { LuminaLogo } from "@/components/LuminaLogo";
import { MENTORS } from "@/lib/mockData";
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
import {
  IdCard, Pencil, Eye, Share2, Check, AlertTriangle, Sparkles, MessageCircle,
  Download, Copy, Mail, Volume2,
} from "lucide-react";

export default function Empower() {
  const { t, passport, setPassport } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [draft, setDraft] = useState(passport);
  const [connected, setConnected] = useState({});

  const openEdit = () => { setDraft(passport); setEditOpen(true); };
  const saveEdit = () => {
    setPassport({
      ...draft,
      triggers: typeof draft.triggers === "string" ? draft.triggers.split(",").map((s) => s.trim()).filter(Boolean) : draft.triggers,
      strategies: typeof draft.strategies === "string" ? draft.strategies.split(",").map((s) => s.trim()).filter(Boolean) : draft.strategies,
    });
    setEditOpen(false);
    toast.success("Passport updated");
  };

  const PassportBody = ({ compact }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Name</p><p className="font-semibold">{passport.name}</p></div>
        <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Age</p><p className="font-semibold">{passport.age}</p></div>
        <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Communication</p><p className="text-sm font-medium">Visual + verbal</p></div>
      </div>
      <div>
        <p className="text-sm font-semibold">Communication needs</p>
        <p className="mt-1 text-sm text-muted-foreground">{passport.communicationNeeds}</p>
      </div>
      <div>
        <p className="text-sm font-semibold">Sensory triggers</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {passport.triggers.map((x) => <Badge key={x} className="rounded-full border-0" style={{ backgroundColor: "#C9847422", color: "#a5624f" }}>{x}</Badge>)}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">Helpful strategies</p>
        <ul className="mt-1 space-y-1">
          {passport.strategies.map((x) => <li key={x} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary" /> {x}</li>)}
        </ul>
      </div>
      {!compact && (
        <div className="rounded-xl p-3" style={{ backgroundColor: "#F0A89418" }}>
          <p className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4" style={{ color: "#C98474" }} /> Emergency information</p>
          <p className="mt-1 text-sm text-muted-foreground">{passport.emergency}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10">
      <PageHeader title={t("empower.title")} subtitle={t("empower.subtitle")} icon={IdCard} color="#C98474" />

      {/* Autism Passport */}
      <Card className="overflow-hidden rounded-3xl" data-testid="autism-passport">
        <div className="flex items-center justify-between p-6 text-white" style={{ background: "linear-gradient(135deg, #C98474, #E08A6E)" }}>
          <div className="flex items-center gap-3">
            <LuminaLogo size={40} />
            <div>
              <p className="text-sm opacity-90">My Autism Passport</p>
              <p className="text-xl font-bold">{passport.name}</p>
            </div>
          </div>
          <Badge className="border-0 bg-white/25 text-white">Digital profile</Badge>
        </div>
        <div className="p-6">
          <PassportBody />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button data-testid="passport-edit" onClick={openEdit} className="rounded-full"><Pencil className="mr-1 h-4 w-4" /> Edit Passport</Button>
            <Button data-testid="passport-preview" variant="outline" onClick={() => setPreviewOpen(true)} className="rounded-full"><Eye className="mr-1 h-4 w-4" /> Preview</Button>
            <Button data-testid="passport-share" variant="outline" onClick={() => setShareOpen(true)} className="rounded-full"><Share2 className="mr-1 h-4 w-4" /> Export / Share</Button>
          </div>
        </div>
      </Card>

      {/* Mentor Network */}
      <section>
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: "#C98474" }} />
          <h2 className="text-xl font-bold">Mentor Network</h2>
        </div>
        <p className="mb-4 text-muted-foreground">Connect with trained community mentors who understand the journey.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MENTORS.map((m) => (
            <Card key={m.id} data-testid={`mentor-${m.id}`} className="flex flex-col rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback style={{ backgroundColor: m.color, color: "#fff" }}>{m.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>{m.experience} years experience</p>
                <p>Available: {m.availability}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {m.langs.map((l) => <Badge key={l} variant="outline" className="rounded-full text-xs">{l}</Badge>)}
                {m.interests.map((l) => <Badge key={l} variant="secondary" className="rounded-full text-xs">{l}</Badge>)}
              </div>
              <Button
                data-testid={`mentor-connect-${m.id}`}
                variant={connected[m.id] ? "secondary" : "default"}
                onClick={() => { if (!connected[m.id]) { setConnected((c) => ({ ...c, [m.id]: true })); toast.success("Connection requested"); } }}
                className="mt-4 w-full rounded-full"
              >
                {connected[m.id] ? <><Check className="mr-1 h-4 w-4" /> Connection Requested</> : <><MessageCircle className="mr-1 h-4 w-4" /> Request Connection</>}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-testid="passport-edit-modal" className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Passport</DialogTitle>
            <DialogDescription>Update your child's support information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-sm font-medium">Name</label><Input data-testid="edit-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
              <div><label className="mb-1 block text-sm font-medium">Age</label><Input data-testid="edit-age" type="number" value={draft.age} onChange={(e) => setDraft({ ...draft, age: e.target.value })} /></div>
            </div>
            <div><label className="mb-1 block text-sm font-medium">Communication needs</label><Textarea data-testid="edit-comm" value={draft.communicationNeeds} onChange={(e) => setDraft({ ...draft, communicationNeeds: e.target.value })} rows={2} /></div>
            <div><label className="mb-1 block text-sm font-medium">Sensory triggers (comma separated)</label><Input data-testid="edit-triggers" value={Array.isArray(draft.triggers) ? draft.triggers.join(", ") : draft.triggers} onChange={(e) => setDraft({ ...draft, triggers: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Helpful strategies (comma separated)</label><Input data-testid="edit-strategies" value={Array.isArray(draft.strategies) ? draft.strategies.join(", ") : draft.strategies} onChange={(e) => setDraft({ ...draft, strategies: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Emergency information</label><Textarea data-testid="edit-emergency" value={draft.emergency} onChange={(e) => setDraft({ ...draft, emergency: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button data-testid="edit-save" onClick={saveEdit} className="w-full rounded-full">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent data-testid="passport-preview-modal" className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Passport Preview</DialogTitle>
            <DialogDescription>How teachers and professionals will see the passport.</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl border">
            <div className="flex items-center gap-3 p-4 text-white" style={{ background: "linear-gradient(135deg, #C98474, #E08A6E)" }}>
              <LuminaLogo size={36} />
              <div><p className="text-xs opacity-90">My Autism Passport</p><p className="font-bold">{passport.name}, {passport.age}</p></div>
            </div>
            <div className="p-4"><PassportBody /></div>
          </div>
          <p className="text-center text-xs text-muted-foreground">This is how teachers and professionals would see the passport.</p>
        </DialogContent>
      </Dialog>

      {/* Share modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent data-testid="passport-share-modal">
          <DialogHeader>
            <DialogTitle>Export / Share Passport</DialogTitle>
            <DialogDescription>Choose how to share the passport (prototype).</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Choose how you'd like to share {passport.name}'s passport. (Prototype — no file is actually generated.)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button data-testid="share-pdf" variant="outline" className="h-20 flex-col rounded-2xl" onClick={() => { toast.success("PDF ready (prototype)"); setShareOpen(false); }}>
              <Download className="mb-1 h-5 w-5" /> Download PDF
            </Button>
            <Button data-testid="share-link" variant="outline" className="h-20 flex-col rounded-2xl" onClick={() => { toast.success("Link copied (prototype)"); setShareOpen(false); }}>
              <Copy className="mb-1 h-5 w-5" /> Copy link
            </Button>
            <Button data-testid="share-email" variant="outline" className="h-20 flex-col rounded-2xl" onClick={() => { toast.success("Shared via email (prototype)"); setShareOpen(false); }}>
              <Mail className="mb-1 h-5 w-5" /> Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
