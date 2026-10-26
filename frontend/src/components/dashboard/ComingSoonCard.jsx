import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ComingSoonCard({ icon: Icon, title, description, color }) {
  return <Card className="flex flex-col rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ color, backgroundColor: `${color}22` }}><Icon className="h-5 w-5" /></span><Badge variant="outline" className="rounded-full">Coming soon</Badge></div><h2 className="mt-4 font-bold">{title}</h2><p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p><p className="mt-4 text-xs font-medium text-muted-foreground">This feature is not available until its backend support is implemented.</p></Card>;
}
