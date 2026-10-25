import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { LANGUAGES } from "@/lib/translations";
import { USER } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Moon, Bell, Globe, Pencil, Accessibility, MapPin, Check } from "lucide-react";

export default function Profile() {
  const { t, dark, toggleDark, lang, setLang } = useApp();
  const [prefs, setPrefs] = useState({ reduceMotion: true, largeText: false, quietNotifs: true, emailUpdates: false });
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(USER.name);

  const togglePref = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("nav.profile")}</h1>

      <Card className="rounded-3xl p-6" data-testid="profile-card">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback style={{ backgroundColor: "#E08A6E", color: "#fff" }} className="text-2xl">{USER.initials}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-muted-foreground">{t("dash.role")}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start"><MapPin className="h-4 w-4" /> {USER.location}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="secondary" className="rounded-full">Caring for {USER.childName}, {USER.childAge}</Badge>
              <Badge variant="outline" className="rounded-full">{LANGUAGES.find((l) => l.code === lang)?.label}</Badge>
            </div>
          </div>
          <Button data-testid="edit-profile-btn" onClick={() => setEditOpen(true)} variant="outline" className="rounded-full sm:ml-auto">
            <Pencil className="mr-1 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </Card>

      {/* Preferences */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6" data-testid="appearance-card">
          <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">Appearance</h3></div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-medium">Dark mode</span>
            <Switch data-testid="profile-dark-switch" checked={dark} onCheckedChange={toggleDark} />
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Language</span></div>
            <div className="inline-flex rounded-full border p-1">
              {LANGUAGES.map((l) => (
                <button key={l.code} data-testid={`profile-lang-${l.code}`} onClick={() => setLang(l.code)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 ${lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-6" data-testid="accessibility-card">
          <div className="flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">Accessibility preferences</h3></div>
          <div className="mt-4 space-y-4">
            {[
              { k: "reduceMotion", label: "Reduce motion" },
              { k: "largeText", label: "Larger text" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between">
                <span className="font-medium">{row.label}</span>
                <Switch data-testid={`pref-${row.k}`} checked={prefs[row.k]} onCheckedChange={() => togglePref(row.k)} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 lg:col-span-2" data-testid="notification-card">
          <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">Notification settings</h3></div>
          <div className="mt-4 space-y-4">
            {[
              { k: "quietNotifs", label: "Quiet, low-frequency notifications" },
              { k: "emailUpdates", label: "Email me weekly updates" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between">
                <span className="font-medium">{row.label}</span>
                <Switch data-testid={`pref-${row.k}`} checked={prefs[row.k]} onCheckedChange={() => togglePref(row.k)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">Prototype profile — no real authentication is used.</p>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-testid="edit-profile-modal">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name.</DialogDescription>
          </DialogHeader>
          <div><label className="mb-1 block text-sm font-medium">Name</label><Input data-testid="profile-name-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <DialogFooter>
            <Button data-testid="profile-save" onClick={() => { setEditOpen(false); toast.success("Profile updated"); }} className="w-full rounded-full">
              <Check className="mr-1 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
