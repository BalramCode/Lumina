import React from "react";
import { BookOpen, HeartHandshake, Users } from "lucide-react";
import { PillarBanner } from "@/components/shared";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";

export default function MentorDashboard() {
  return <div className="space-y-8"><PillarBanner title="Community inclusion" subtitle="Mentor-led opportunities and awareness resources will appear here as they are introduced." icon={Users} color="#4F8A9E" /><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><ComingSoonCard icon={HeartHandshake} title="Support opportunities" description="Mentor matching and opportunities are not connected to a backend yet." color="#E08A6E" /><ComingSoonCard icon={BookOpen} title="Awareness resources" description="Managed awareness resources are not available yet." color="#D9A441" /><ComingSoonCard icon={Users} title="Inclusion activities" description="Community activity planning and sign-ups are not implemented yet." color="#5FA07E" /></section></div>;
}
