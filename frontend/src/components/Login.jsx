import React from "react";
import { Link } from "react-router-dom";
import { AuthBrand, default as AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGIN } from "@/constants/testIds/auth";

export default function Login() {
  return (
    <AuthLayout>
      <div className="lumina-fade-in mx-auto max-w-md">
        <AuthBrand />
        <div className="mt-10"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back</h1><p className="mt-3 text-lg text-muted-foreground">Login is being connected to Lumina. Your account is not authenticated from this screen yet.</p></div>
        <form className="mt-8 space-y-5" onSubmit={(event) => event.preventDefault()}>
          <div><label className="mb-1.5 block text-sm font-medium" htmlFor="login-email">Email address</label><Input id="login-email" data-testid={LOGIN.emailInput} type="email" autoComplete="email" /></div>
          <div><label className="mb-1.5 block text-sm font-medium" htmlFor="login-password">Password</label><Input id="login-password" data-testid={LOGIN.passwordInput} type="password" autoComplete="current-password" /></div>
          <Button data-testid={LOGIN.submitButton} type="submit" disabled className="h-12 w-full rounded-full text-base">Login will be available soon</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">New to Lumina? <Link data-testid={LOGIN.registerLink} to="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
      </div>
    </AuthLayout>
  );
}
