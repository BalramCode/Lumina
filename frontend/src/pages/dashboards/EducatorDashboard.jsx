import React, { useEffect, useState } from "react";
import { School, Users, GraduationCap, Stethoscope, HeartHandshake } from "lucide-react";
import { getDashboardSummary } from "@/lib/api";
import { PillarBanner } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";
import EducatorContentManager from "@/components/dashboard/EducatorContentManager";

export default function EducatorDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then(({ response, data }) => {
      if (response.ok && data?.data) {
        setSummary(data.data);
      }
    }).finally(() => setLoading(false));
  }, []);

  const metrics = summary?.metrics || { totalEducators: 0, totalProfessionals: 0, totalCommunityMembers: 0 };

  return (
    <div className="space-y-10">
      <PillarBanner
        title="Inclusive education network"
        subtitle="Connect with specialists and families to foster neurodiversity-affirming learning environments."
        icon={School}
        color="#D9A441"
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading educator overview…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full text-xs">
              <GraduationCap className="mr-1 h-3.5 w-3.5 text-amber-600" />
              {metrics.totalEducators} {metrics.totalEducators === 1 ? "Educator" : "Educators"}
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              <Stethoscope className="mr-1 h-3.5 w-3.5 text-emerald-600" />
              {metrics.totalProfessionals} {metrics.totalProfessionals === 1 ? "Specialist profile" : "Specialist profiles"}
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              <Users className="mr-1 h-3.5 w-3.5 text-primary" />
              {metrics.totalCommunityMembers} Total community members
            </Badge>
          </div>
        )}
      </PillarBanner>

      {/* Active Content Management Section */}
      <section>
        <EducatorContentManager />
      </section>

      {/* Educator Network Community Modules */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Educator Network Tools</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ComingSoonCard
            icon={Users}
            title="Educator community"
            description="School inclusion groups and peer discussion forums will be connected here."
            color="#5E8B7E"
          />
          <ComingSoonCard
            icon={HeartHandshake}
            title="Inclusive practice guides"
            description="Standardized sensory-friendly classroom checklists will appear here."
            color="#4F8A9E"
          />
        </div>
      </section>
    </div>
  );
}

