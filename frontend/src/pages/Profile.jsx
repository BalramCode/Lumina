import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { LANGUAGES } from "@/lib/translations";
import { updateUserProfile } from "@/lib/api";
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

const roleLabels = {
  parent: "Parent & Caregiver",
  therapist: "Therapist & Specialist",
  educator: "Special Educator",
  mentor: "Community Mentor",
};

export default function Profile() {
  const { t, dark, toggleDark, lang, setLang, user, csrfToken, updateUser } = useApp();

  const [prefs, setPrefs] = useState({
    reduceMotion: false,
    largeText: false,
    quietNotifs: false,
    emailUpdates: false,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPrefs({
        reduceMotion: Boolean(user.preferences.reduceMotion),
        largeText: Boolean(user.preferences.largeText),
        quietNotifs: Boolean(user.preferences.quietNotifs),
        emailUpdates: Boolean(user.preferences.emailUpdates),
      });
    }
  }, [user?.preferences]);

  const initials = user?.name
    ?.split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "L";

  const locationDisplay = [user?.location?.city, user?.location?.district, user?.location?.state]
    .filter(Boolean)
    .join(", ") || "Location not set";

  const openEdit = () => {
    setEditName(user?.name || "");
    setEditCity(user?.location?.city || "");
    setEditState(user?.location?.state || "");
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      const { response, data } = await updateUserProfile(
        {
          name: editName.trim(),
          location: {
            city: editCity.trim(),
            state: editState.trim(),
          },
        },
        csrfToken
      );

      if (response.ok && data?.data?.user) {
        updateUser(data.data.user);
        toast.success("Profile updated");
        setEditOpen(false);
      } else {
        const details = data?.error?.details;
        toast.error(Array.isArray(details) ? details.join(" ") : data?.error?.message || "Failed to update profile.");
      }
    } catch {
      toast.error("Could not reach server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const togglePref = async (k) => {
    const nextVal = !prefs[k];
    const nextPrefs = { ...prefs, [k]: nextVal };
    setPrefs(nextPrefs);

    try {
      const { response, data } = await updateUserProfile(
        { preferences: nextPrefs },
        csrfToken
      );

      if (response.ok && data?.data?.user) {
        updateUser(data.data.user);
      } else {
        setPrefs((prev) => ({ ...prev, [k]: !nextVal }));
        toast.error(data?.error?.message || "Could not save preference.");
      }
    } catch {
      setPrefs((prev) => ({ ...prev, [k]: !nextVal }));
      toast.error("Could not save preference. Check connection.");
    }
  };

  const handleToggleDark = async () => {
    const nextDark = !dark;
    toggleDark();

    try {
      const { response, data } = await updateUserProfile(
        { preferences: { theme: nextDark ? "dark" : "light" } },
        csrfToken
      );
      if (response.ok && data?.data?.user) {
        updateUser(data.data.user);
      }
    } catch {
      // Offline fallback: toggleDark() already updated localStorage and document element
    }
  };

  const handleSetLang = async (code) => {
    setLang(code);

    try {
      const { response, data } = await updateUserProfile(
        { preferences: { lang: code } },
        csrfToken
      );
      if (response.ok && data?.data?.user) {
        updateUser(data.data.user);
      }
    } catch {
      // Offline fallback: setLang() already updated localStorage
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("nav.profile")}</h1>

      <Card className="rounded-3xl p-6" data-testid="profile-card">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback style={{ backgroundColor: "#E08A6E", color: "#fff" }} className="text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">{user?.name || "Lumina User"}</h2>
            <p className="text-muted-foreground">{roleLabels[user?.role] || user?.role || t("dash.role")}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
              <MapPin className="h-4 w-4" /> {locationDisplay}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="secondary" className="rounded-full">
                {roleLabels[user?.role] || "Active Member"}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {LANGUAGES.find((l) => l.code === lang)?.label || "English"}
              </Badge>
            </div>
          </div>
          <Button data-testid="edit-profile-btn" onClick={openEdit} variant="outline" className="rounded-full sm:ml-auto">
            <Pencil className="mr-1 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </Card>

      {/* Preferences */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6" data-testid="appearance-card">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Appearance</h3>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-medium">Dark mode</span>
            <Switch data-testid="profile-dark-switch" checked={dark} onCheckedChange={handleToggleDark} />
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Language</span>
            </div>
            <div className="inline-flex rounded-full border p-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  data-testid={`profile-lang-${l.code}`}
                  onClick={() => handleSetLang(l.code)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 ${
                    lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-6" data-testid="accessibility-card">
          <div className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Accessibility preferences</h3>
          </div>
          <div className="mt-4 space-y-4">
            {[
              { k: "reduceMotion", label: "Reduce motion" },
              { k: "largeText", label: "Larger text" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between">
                <span className="font-medium">{row.label}</span>
                <Switch
                  data-testid={`pref-${row.k}`}
                  checked={prefs[row.k]}
                  onCheckedChange={() => togglePref(row.k)}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 lg:col-span-2" data-testid="notification-card">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Notification settings</h3>
          </div>
          <div className="mt-4 space-y-4">
            {[
              { k: "quietNotifs", label: "Quiet, low-frequency notifications" },
              { k: "emailUpdates", label: "Email me weekly updates" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between">
                <span className="font-medium">{row.label}</span>
                <Switch
                  data-testid={`pref-${row.k}`}
                  checked={prefs[row.k]}
                  onCheckedChange={() => togglePref(row.k)}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Your Lumina profile and preferences are securely managed on your account.
      </p>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-testid="edit-profile-modal">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name and location details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="edit-profile-name">
                Full Name
              </label>
              <Input
                id="edit-profile-name"
                data-testid="profile-name-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="edit-profile-city">
                  City
                </label>
                <Input
                  id="edit-profile-city"
                  placeholder="e.g. Bhubaneswar"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="edit-profile-state">
                  State
                </label>
                <Input
                  id="edit-profile-state"
                  placeholder="e.g. Odisha"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-testid="profile-save"
              disabled={saving}
              onClick={handleSaveProfile}
              className="w-full rounded-full"
            >
              <Check className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
