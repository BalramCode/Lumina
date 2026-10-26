import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Compass, UserRoundCheck, Users } from "lucide-react";
import { PillarBanner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import ComingSoonCard from "@/components/dashboard/ComingSoonCard";

export default function TherapistDashboard() {
  const navigate = useNavigate();
  return <div className="space-y-8"><PillarBanner title="Your professional presence" subtitle="Create or update the profile parents can browse in Lumina's directory." icon={UserRoundCheck} color="#5E8B7E"><Button className="mt-5 rounded-full" onClick={() => navigate("/navigate")}>Manage professional profile <ArrowRight className="h-4 w-4" /></Button></PillarBanner><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><ComingSoonCard icon={BadgeCheck} title="Verification status" description="Credential verification is not implemented. A profile is not a verification badge." color="#5E8B7E" /><ComingSoonCard icon={Users} title="Family connections" description="Family connection requests and messaging are not available yet." color="#E08A6E" /><ComingSoonCard icon={Compass} title="Availability insights" description="You can set your availability in your profile; scheduling analytics are not available yet." color="#4F8A9E" /></section></div>;
}
