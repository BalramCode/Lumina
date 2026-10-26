import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AuthBrand, default as AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  return (
    <AuthLayout>
      <div className="lumina-fade-in max-w-xl">
        <AuthBrand />
        <div className="mt-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl uppercase text-primary" style={{ lineHeight: 1.1 }}>
            From Social Discrimination <br /> to Social Acceptance
          </h1>
          <p className="mt-6 text-xl font-medium text-foreground">No parent should navigate autism alone.</p>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">Lumina connects families, professionals, resources, and communities to make autism support more accessible, inclusive, and free.</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-full px-6 text-base"><Link to="/register">Create an account <ArrowRight className="h-5 w-5" /></Link></Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base"><Link to="/login">I already have an account</Link></Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">Your account is protected by a secure server session after login.</p>
      </div>
    </AuthLayout>
  );
}
