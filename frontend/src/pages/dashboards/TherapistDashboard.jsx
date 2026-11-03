import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Compass, UserRoundCheck, Users, Clock3, CalendarClock, Check, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getDashboardSummary, getMyConsultations, updateConsultationStatus, cancelConsultation } from "@/lib/api";
import { PillarBanner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";

const availabilityLabels = {
  accepting_clients: "Accepting clients",
  waitlist: "Waitlist",
  not_accepting: "Not accepting clients",
};

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { csrfToken } = useApp();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);

  const loadConsultations = useCallback(async () => {
    setLoadingConsultations(true);
    try {
      const { response, data } = await getMyConsultations();
      if (response.ok && data?.data?.consultations) {
        setConsultations(data.data.consultations);
      }
    } catch {}
    setLoadingConsultations(false);
  }, []);

  useEffect(() => {
    loadConsultations();
  }, [loadConsultations]);

  useEffect(() => {
    getDashboardSummary().then(({ response, data }) => {
      if (response.ok && data?.data) {
        setSummary(data.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const hasProfile = summary?.hasProfile;
  const profile = summary?.profile;
  const metrics = summary?.metrics || { directorySize: 0, colleaguesInCity: 0 };
  const userCity = summary?.userCity;

  return (
    <div className="space-y-8">
      <PillarBanner
        title={hasProfile ? "Your professional presence is published" : "Create your professional profile"}
        subtitle={
          hasProfile
            ? `Your profile is published for parent discovery as a ${profile?.professionalType} in ${profile?.city}.`
            : "Publish your practice details so parents and caregivers can discover your clinical services."
        }
        icon={UserRoundCheck}
        color="#5E8B7E"
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your practice status…</p>
        ) : hasProfile ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full text-xs">
                {profile?.professionalType}
              </Badge>
              <Badge variant="outline" className="rounded-full text-xs">
                {availabilityLabels[profile?.availability] || profile?.availability}
              </Badge>
              <Badge variant="outline" className="rounded-full text-xs">
                <Clock3 className="mr-1 h-3 w-3" />
                {profile?.yearsExperience} years experience
              </Badge>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {profile?.bio}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-primary/20 bg-accent/40 p-3 text-sm text-muted-foreground">
            You have not created a professional profile yet. Click below to enter your practice type, location, and client availability.
          </div>
        )}

        <Button className="mt-5 rounded-full" onClick={() => navigate("/navigate")}>
          {hasProfile ? "Manage professional profile" : "Create professional profile"} <ArrowRight className="h-4 w-4" />
        </Button>
      </PillarBanner>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Compass className="h-5 w-5" />
            </span>
            <Badge variant="secondary" className="rounded-full">
              Live Network
            </Badge>
          </div>
          <h2 className="mt-4 font-bold">Directory Presence</h2>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">
            {metrics.directorySize > 0
              ? `There are ${metrics.directorySize} specialist profiles discoverable in Lumina${
                  userCity ? `, including ${metrics.colleaguesInCity} colleagues in ${userCity}.` : "."
                }`
              : "You will be among the pioneering specialists listed on Lumina."}
          </p>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Profiles are visible exclusively to authenticated parents.
          </p>
        </Card>

        <ComingSoonCard
          icon={BadgeCheck}
          title="Verification status"
          description="Clinical credential verification workflows are under active preparation."
          color="#5E8B7E"
        />

        <ComingSoonCard
          icon={Users}
          title="Family connections"
          description="Inquiry dispatch and direct family connection messaging are not available yet."
          color="#E08A6E"
        />
      </section>

      {/* Consultations Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Your Consultation Bookings
            </h2>
            <p className="text-sm text-muted-foreground">
              Review and manage incoming parent appointments.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full">
            {consultations.length} {consultations.length === 1 ? "Booking" : "Bookings"}
          </Badge>
        </div>

        {loadingConsultations ? (
          <p className="text-sm text-muted-foreground">Loading your appointments…</p>
        ) : consultations.length === 0 ? (
          <Card className="rounded-2xl p-6 text-center text-sm text-muted-foreground">
            No family consultation appointments scheduled yet. When parents book through Lumina, their requests will appear here.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {consultations.map((c) => {
              const handleUpdate = async (status) => {
                try {
                  const { response, data } = await updateConsultationStatus(c.id, status, "", csrfToken);
                  if (response.ok) {
                    toast.success(`Consultation marked as ${status}.`);
                    loadConsultations();
                  } else {
                    toast.error(data?.error?.message || "Could not update status.");
                  }
                } catch {
                  toast.error("Network error updating consultation.");
                }
              };

              const handleCancel = async () => {
                try {
                  const { response, data } = await cancelConsultation(c.id, "Cancelled by therapist", csrfToken);
                  if (response.ok) {
                    toast.success("Consultation cancelled.");
                    loadConsultations();
                  } else {
                    toast.error(data?.error?.message || "Could not cancel consultation.");
                  }
                } catch {
                  toast.error("Network error cancelling consultation.");
                }
              };

              return (
                <Card key={c.id} className="flex flex-col justify-between rounded-2xl p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold">{c.parent?.name || "Parent"}</h3>
                        {c.parent?.email && (
                          <p className="text-xs text-muted-foreground">{c.parent.email}</p>
                        )}
                      </div>
                      <Badge
                        variant={c.status === "confirmed" ? "secondary" : "outline"}
                        className={`rounded-full text-xs capitalize ${
                          c.status === "confirmed"
                            ? "bg-emerald-500/15 text-emerald-700"
                            : c.status === "completed"
                            ? "bg-blue-500/15 text-blue-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {c.status}
                      </Badge>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1 text-muted-foreground">
                      <p>📅 Date: <strong className="text-foreground">{c.date}</strong></p>
                      <p>⏰ Slot: <strong className="text-foreground">{c.timeSlot}</strong></p>
                      {c.childName && <p>Child: {c.childName}</p>}
                      {c.notes && <p className="italic">"{c.notes}"</p>}
                      {c.cancellationReason && (
                        <p className="text-destructive">Cancelled: {c.cancellationReason}</p>
                      )}
                    </div>
                  </div>

                  {c.status === "confirmed" && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate("completed")}
                        className="flex-1 rounded-full text-xs"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Complete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="rounded-full text-xs text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  )}

                  {c.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate("confirmed")}
                        className="flex-1 rounded-full text-xs"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="rounded-full text-xs text-destructive"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
