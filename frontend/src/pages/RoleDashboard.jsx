import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared";
import { roleMeta } from "@/pages/dashboards/dashboardMeta";
import ParentDashboard from "@/pages/dashboards/ParentDashboard";
import TherapistDashboard from "@/pages/dashboards/TherapistDashboard";
import EducatorDashboard from "@/pages/dashboards/EducatorDashboard";
import MentorDashboard from "@/pages/dashboards/MentorDashboard";

const dashboardByRole = {
  parent: ParentDashboard,
  therapist: TherapistDashboard,
  educator: EducatorDashboard,
  mentor: MentorDashboard,
};

export default function RoleDashboard() {
  const { user } = useApp();
  const { role } = useParams();
  const meta = roleMeta[user?.role];
  const DashboardContent = dashboardByRole[user?.role];

  if (!meta || !DashboardContent) return null;
  if (role && role !== user.role) return <Navigate to={`/dashboard/${user.role}`} replace />;

  return <div className="space-y-8"><PageHeader title={meta.title} subtitle={meta.subtitle} icon={meta.icon} color={meta.color} /><DashboardContent /></div>;
}
