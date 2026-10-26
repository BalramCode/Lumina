import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthBrand, default as AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGIN } from "@/constants/testIds/auth";
import { loginUser } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { establishSession } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!emailPattern.test(email.trim()) || !password) {
      setError("Enter your email address and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const { response, data } = await loginUser({ email: email.trim(), password });
      if (response.status === 200 && data?.data?.user) {
        setPassword("");
        establishSession(data.data.user, data.data.csrfToken);
        navigate("/dashboard", { replace: true });
        return;
      }
      if (response.status === 401) setError("Email or password is incorrect.");
      else if (response.status === 429) setError("Too many login attempts. Please wait and try again.");
      else {
        const details = data?.error?.details;
        setError(Array.isArray(details) && details.length ? details.join(" ") : data?.error?.message || "Lumina returned an unexpected response. Please try again.");
      }
    } catch {
      setError("We could not reach Lumina. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lumina-fade-in mx-auto max-w-md">
        <AuthBrand />
        <div className="mt-10"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back</h1><p className="mt-3 text-lg text-muted-foreground">Login securely to continue to Lumina.</p></div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}
          <div><label className="mb-1.5 block text-sm font-medium" htmlFor="login-email">Email address</label><Input id="login-email" data-testid={LOGIN.emailInput} type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} autoComplete="email" aria-invalid={!!error} /></div>
          <div><label className="mb-1.5 block text-sm font-medium" htmlFor="login-password">Password</label><Input id="login-password" data-testid={LOGIN.passwordInput} type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} autoComplete="current-password" aria-invalid={!!error} /></div>
          <Button data-testid={LOGIN.submitButton} type="submit" disabled={isSubmitting} className="h-12 w-full rounded-full text-base">{isSubmitting ? "Logging in…" : "Login"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">New to Lumina? <Link data-testid={LOGIN.registerLink} to="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
      </div>
    </AuthLayout>
  );
}
