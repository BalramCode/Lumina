import React, { useEffect, useState } from "react";
import { Compass, MapPin, BriefcaseBusiness, Languages, Clock3 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  createProfessionalProfile,
  getMyProfessionalProfile,
  getProfessionalDirectory,
  getProfessionalProfile,
  updateProfessionalProfile,
} from "@/lib/api";
import { PageHeader, PillarBanner } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMPTY_FORM = {
  professionalType: "", bio: "", city: "", languages: "", yearsExperience: "", availability: "accepting_clients",
};
const availabilityLabels = {
  accepting_clients: "Accepting clients",
  waitlist: "Waitlist",
  not_accepting: "Not accepting clients",
};

function profileToForm(profile) {
  return {
    professionalType: profile.professionalType,
    bio: profile.bio,
    city: profile.city,
    languages: profile.languages.join(", "),
    yearsExperience: String(profile.yearsExperience),
    availability: profile.availability,
  };
}

function profilePayload(form) {
  return {
    professionalType: form.professionalType,
    bio: form.bio,
    city: form.city,
    languages: form.languages.split(",").map((language) => language.trim()).filter(Boolean),
    yearsExperience: Number(form.yearsExperience),
    availability: form.availability,
  };
}

function ParentDirectory() {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfessionalDirectory().then(({ response, data }) => {
      if (response.ok) setProfiles(data?.data?.profiles || []);
      else setError(data?.error?.message || "We could not load the professional directory.");
    }).catch(() => setError("We could not reach Lumina. Please try again.")).finally(() => setLoading(false));
  }, []);

  const openProfile = async (id) => {
    setError("");
    try {
      const { response, data } = await getProfessionalProfile(id);
      if (response.ok) setSelected(data.data.profile);
      else setError(data?.error?.message || "We could not load that professional profile.");
    } catch {
      setError("We could not reach Lumina. Please try again.");
    }
  };

  return (
    <>
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}
      {loading ? <Card className="rounded-2xl p-8 text-center text-muted-foreground">Loading professionals…</Card> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profiles.map((profile) => <Card key={profile.id} className="flex flex-col rounded-2xl p-5">
            <h2 className="font-bold">{profile.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{profile.professionalType}</p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{profile.city}</p>
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{profile.yearsExperience} years of experience</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">{profile.languages.map((language) => <Badge key={language} variant="outline" className="rounded-full">{language}</Badge>)}</div>
            <Button className="mt-5 rounded-full" variant="outline" onClick={() => openProfile(profile.id)}>View profile</Button>
          </Card>)}
          {!profiles.length && <Card className="rounded-2xl p-8 text-center text-muted-foreground sm:col-span-2">No professional profiles are available yet.</Card>}
        </div>
      )}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>{selected && <>
          <DialogHeader><DialogTitle>{selected.name}</DialogTitle><DialogDescription>{selected.professionalType} · {selected.city}</DialogDescription></DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">{selected.bio}</p>
          <div className="grid gap-3 text-sm sm:grid-cols-2"><span className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />{selected.yearsExperience} years experience</span><span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{availabilityLabels[selected.availability]}</span></div>
          <div className="flex flex-wrap gap-1">{selected.languages.map((language) => <Badge key={language} variant="outline" className="rounded-full"><Languages className="mr-1 h-3 w-3" />{language}</Badge>)}</div>
        </>}</DialogContent>
      </Dialog>
    </>
  );
}

function TherapistProfile() {
  const { csrfToken } = useApp();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfessionalProfile().then(({ response, data }) => {
      if (response.ok && data?.data?.profile) {
        setProfile(data.data.profile);
        setForm(profileToForm(data.data.profile));
      } else if (response.status !== 404) setError(data?.error?.message || "We could not load your profile.");
    }).catch(() => setError("We could not reach Lumina. Please try again.")).finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setMessage(""); setSubmitting(true);
    try {
      const action = profile ? updateProfessionalProfile : createProfessionalProfile;
      const { response, data } = await action(profilePayload(form), csrfToken);
      if (response.ok && data?.data?.profile) {
        setProfile(data.data.profile);
        setForm(profileToForm(data.data.profile));
        setMessage(profile ? "Your professional profile has been updated." : "Your professional profile has been created.");
      } else {
        const details = data?.error?.details;
        setError(Array.isArray(details) ? details.join(" ") : data?.error?.message || "We could not save your profile.");
      }
    } catch { setError("We could not reach Lumina. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Card className="rounded-2xl p-8 text-center text-muted-foreground">Loading your professional profile…</Card>;
  return <Card className="rounded-2xl p-5 sm:p-6"><h2 className="text-xl font-bold">{profile ? "Update your professional profile" : "Create your professional profile"}</h2><p className="mt-1 text-sm text-muted-foreground">Only parents can browse published professional profiles.</p>
    <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}
      {message && <div className="rounded-xl border border-primary/30 bg-accent p-3 text-sm" role="status">{message}</div>}
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-medium" htmlFor="professional-type">Professional type</label><Input id="professional-type" value={form.professionalType} onChange={(event) => setForm({ ...form, professionalType: event.target.value })} /></div><div><label className="mb-1 block text-sm font-medium" htmlFor="professional-city">City</label><Input id="professional-city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div></div>
      <div><label className="mb-1 block text-sm font-medium" htmlFor="professional-bio">About your practice</label><Textarea id="professional-bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-3"><div><label className="mb-1 block text-sm font-medium" htmlFor="professional-languages">Languages</label><Input id="professional-languages" placeholder="English, Odia" value={form.languages} onChange={(event) => setForm({ ...form, languages: event.target.value })} /></div><div><label className="mb-1 block text-sm font-medium" htmlFor="professional-experience">Years of experience</label><Input id="professional-experience" type="number" min="0" max="60" value={form.yearsExperience} onChange={(event) => setForm({ ...form, yearsExperience: event.target.value })} /></div><div><label className="mb-1 block text-sm font-medium" htmlFor="professional-availability">Availability</label><select id="professional-availability" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })}>{Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
      <Button type="submit" disabled={submitting} className="rounded-full">{submitting ? "Saving…" : profile ? "Save changes" : "Create profile"}</Button>
    </form>
  </Card>;
}

export default function ProfessionalDirectory() {
  const { user } = useApp();
  const isParent = user?.role === "parent";
  const isTherapist = user?.role === "therapist";
  return <div className="space-y-8"><PageHeader title="Professional Directory" subtitle={isParent ? "Browse professional profiles created and managed by Lumina therapists." : "Manage the information shown in the Lumina professional directory."} icon={Compass} color="#5E8B7E" />
    <PillarBanner title="Professional support" subtitle="Profiles are created by therapists and visible to authenticated parents." icon={Compass} color="#5E8B7E" />
    {isParent ? <ParentDirectory /> : isTherapist ? <TherapistProfile /> : <Card className="rounded-2xl p-8 text-center text-muted-foreground">The professional directory is available to parent and therapist accounts.</Card>}
  </div>;
}
