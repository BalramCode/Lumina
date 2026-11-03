import React, { useEffect, useState } from "react";
import { BookOpen, HeartHandshake, Users, Heart, Sparkles } from "lucide-react";
import { getDashboardSummary } from "@/lib/api";
import { PillarBanner } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";

export default function MentorDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then(({ response, data }) => {
      if (response.ok && data?.data) {
        setSummary(data.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const metrics = summary?.metrics || { totalMentors: 0, totalParents: 0, totalCommunityMembers: 0 };

  return (
    <div className="space-y-8">
      <PillarBanner
        title="Community inclusion & mentorship"
        subtitle="Support new caregivers and guide families toward social acceptance and practical inclusion."
        icon={Users}
        color="#4F8A9E"
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading mentorship network…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full text-xs">
              <Sparkles className="mr-1 h-3.5 w-3.5 text-cyan-600" />
              {metrics.totalMentors} {metrics.totalMentors === 1 ? "Peer mentor" : "Peer mentors"}
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              <Heart className="mr-1 h-3.5 w-3.5 text-rose-500" />
              {metrics.totalParents} {metrics.totalParents === 1 ? "Family" : "Families"} supported
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              <Users className="mr-1 h-3.5 w-3.5 text-primary" />
              {metrics.totalCommunityMembers} Total community members
            </Badge>
          </div>
        )}
      </PillarBanner>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ComingSoonCard
          icon={HeartHandshake}
          title="Support opportunities"
          description="Direct 1-on-1 family matching and request dispatch will be enabled here."
          color="#E08A6E"
        />
        <ComingSoonCard
          icon={BookOpen}
          title="Awareness resources"
          description="Advocacy kits, community stories, and awareness resources are being curated."
          color="#D9A441"
        />
        <ComingSoonCard
          icon={Users}
          title="Inclusion activities"
          description="Local meetup coordination and sensory-friendly event scheduling are upcoming."
          color="#5FA07E"
        />
      </section>
    </div>
  );
}
