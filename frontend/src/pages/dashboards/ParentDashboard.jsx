import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, HeartHandshake, MapPin, MessageCircleHeart } from "lucide-react";
import { getProfessionalDirectory } from "@/lib/api";
import { PillarBanner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";

function initials(name) {
  return name?.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "L";
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getProfessionalDirectory().then(({ response, data }) => {
      if (response.ok) setProfiles(data?.data?.profiles || []);
      setStatus(response.ok ? "ready" : "error");
    }).catch(() => setStatus("error"));
  }, []);

  return <div className="space-y-8">
    <PillarBanner title="Professional support nearby" subtitle="Browse profiles created and managed by Lumina therapists." icon={Compass} color="#5E8B7E">
      {status === "loading" && <p className="text-sm text-muted-foreground">Loading professional profiles…</p>}
      {status === "error" && <p className="text-sm text-muted-foreground">Professional discovery is temporarily unavailable.</p>}
      {status === "ready" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.slice(0, 3).map((profile) => <Card key={profile.id} className="bg-card p-4"><div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{initials(profile.name)}</span><div className="min-w-0"><h2 className="truncate font-bold">{profile.name}</h2><p className="truncate text-sm text-muted-foreground">{profile.professionalType}</p></div></div><p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{profile.city}</p></Card>)}
        {!profiles.length && <Card className="bg-card p-4 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">No professional profiles are available yet.</Card>}
      </div>}
      <Button className="mt-5 rounded-full" onClick={() => navigate("/navigate")}>Browse professional directory <ArrowRight className="h-4 w-4" /></Button>
    </PillarBanner>
    <section><h2 className="mb-4 text-xl font-bold">Family support</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><ComingSoonCard icon={BookOpen} title="Learning resources" description="Personalized learning progress and recommendations need a backend learning profile." color="#D9A441" /><ComingSoonCard icon={MessageCircleHeart} title="Caregiver communities" description="Community membership and conversations are not connected to live backend data yet." color="#E08A6E" /><ComingSoonCard icon={HeartHandshake} title="Support planning" description="Care plans and family support tools are not implemented yet." color="#4F8A9E" /></div></section>
  </div>;
}
