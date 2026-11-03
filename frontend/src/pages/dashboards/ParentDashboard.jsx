import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Compass, HeartHandshake, MapPin, MessageCircleHeart, CheckCircle2, CalendarClock } from "lucide-react";
import { getDashboardSummary, getMyConsultations } from "@/lib/api";
import { PillarBanner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";

function initials(name) {
  return name?.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "L";
}

const availabilityLabels = {
  accepting_clients: "Accepting clients",
  waitlist: "Waitlist",
  not_accepting: "Not accepting",
};

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    getDashboardSummary().then(({ response, data }) => {
      if (response.ok && data?.data) {
        setSummary(data.data);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    }).catch(() => setStatus("error"));

    getMyConsultations({ status: "confirmed" })
      .then(({ response, data }) => {
        if (response.ok && data?.data?.consultations) {
          setConsultations(data.data.consultations);
        }
      })
      .catch(() => {});
  }, []);

  const metrics = summary?.metrics || { totalProfessionals: 0, acceptingClients: 0, inMyCity: 0 };
  const recentProfiles = summary?.recentProfessionals || [];
  const userCity = summary?.userCity;

  return (
    <div className="space-y-8">
      <PillarBanner
        title="Professional support nearby"
        subtitle="Discover verified therapists, developmental specialists, and counselors in the Lumina network."
        icon={Compass}
        color="#5E8B7E"
      >
        {status === "loading" && <p className="text-sm text-muted-foreground">Loading community overview…</p>}
        {status === "error" && <p className="text-sm text-muted-foreground">Professional discovery is temporarily unavailable.</p>}

        {status === "ready" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full text-xs">
                {metrics.totalProfessionals} {metrics.totalProfessionals === 1 ? "Specialist profile" : "Specialist profiles"}
              </Badge>
              <Badge variant="outline" className="rounded-full text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                {metrics.acceptingClients} Accepting clients
              </Badge>
              {userCity && (
                <Badge variant="outline" className="rounded-full text-xs">
                  <MapPin className="mr-1 h-3 w-3 text-primary" />
                  {metrics.inMyCity} in {userCity}
                </Badge>
              )}
              {consultations.length > 0 && (
                <Badge variant="outline" className="rounded-full text-xs">
                  <CalendarClock className="mr-1 h-3 w-3 text-primary" />
                  {consultations.length} Active {consultations.length === 1 ? "Booking" : "Bookings"}
                </Badge>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProfiles.map((profile) => (
                <Card key={profile.id} className="bg-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {initials(profile.name)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-bold">{profile.name}</h2>
                      <p className="truncate text-sm text-muted-foreground">{profile.professionalType}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.city}
                    </span>
                    <span className="font-medium text-foreground">
                      {availabilityLabels[profile.availability] || profile.availability}
                    </span>
                  </div>
                </Card>
              ))}

              {!recentProfiles.length && (
                <Card className="bg-card p-4 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                  No professional profiles are available yet. As therapists publish their clinical profiles, they will appear here.
                </Card>
              )}
            </div>
          </div>
        )}

        <Button className="mt-5 rounded-full" onClick={() => navigate("/navigate")}>
          Browse professional directory <ArrowRight className="h-4 w-4" />
        </Button>
      </PillarBanner>

      <section>
        <h2 className="mb-4 text-xl font-bold">Family support</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col justify-between rounded-2xl p-5 border bg-card shadow-sm" data-testid="parent-learning-progress-card">
            <div>
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "#D9A44122", color: "#D9A441" }}
                >
                  <BookOpen className="h-5 w-5" />
                </span>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {summary?.learningProgress ? `${summary.learningProgress.progressPercent}% Complete` : "0% Complete"}
                </Badge>
              </div>
              <h3 className="mt-4 font-bold text-base">Learning resources</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary?.learningProgress
                  ? `${summary.learningProgress.completedCount} of ${summary.learningProgress.totalModules} family guides and lessons completed.`
                  : "Explore home-based guides and verified lessons."}
              </p>
              <div className="mt-4">
                <Progress value={summary?.learningProgress?.progressPercent || 0} className="h-2" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-5 w-full rounded-full text-xs"
              data-testid="parent-continue-learning-btn"
              onClick={() => navigate("/learn")}
            >
              Continue learning <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Card>
          <ComingSoonCard
            icon={MessageCircleHeart}
            title="Caregiver communities"
            description="Community membership and conversations are not connected to live backend data yet."
            color="#E08A6E"
          />
          <ComingSoonCard
            icon={HeartHandshake}
            title="Support planning"
            description="Care plans and family support tools are not implemented yet."
            color="#4F8A9E"
          />
        </div>
      </section>

      {consultations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Your Upcoming Consultations
            </h2>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/support")}
              className="text-xs"
            >
              Manage in Support & AAC <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {consultations.slice(0, 3).map((c) => (
              <Card key={c.id} className="p-4 flex items-center justify-between rounded-2xl">
                <div>
                  <h3 className="font-bold text-sm">{c.professional?.name || "Specialist"}</h3>
                  <p className="text-xs text-muted-foreground">{c.professional?.professionalType}</p>
                  <p className="mt-1 text-xs text-foreground font-medium">📅 {c.date} · ⏰ {c.timeSlot}</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 text-xs rounded-full">
                  Confirmed
                </Badge>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
