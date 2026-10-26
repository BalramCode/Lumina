import React from "react";
import { BookOpen, HeartHandshake, School, Users } from "lucide-react";
import { PillarBanner } from "@/components/shared";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";

export default function EducatorDashboard() {
  return <div className="space-y-8"><PillarBanner title="Inclusive education" subtitle="Tools for inclusive teaching will appear here as they become available." icon={School} color="#D9A441" /><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><ComingSoonCard icon={BookOpen} title="Teaching materials" description="Curriculum and classroom materials require a dedicated educator-resource backend." color="#D9A441" /><ComingSoonCard icon={Users} title="Educator community" description="Educator groups and shared discussions are not available yet." color="#5E8B7E" /><ComingSoonCard icon={HeartHandshake} title="Inclusive practice guides" description="Guides will be published when managed resource content is available." color="#4F8A9E" /></section></div>;
}
