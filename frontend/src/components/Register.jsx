import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Heart, HandHeart, GraduationCap, Stethoscope } from "lucide-react";
import { ONBOARD_ROLES } from "@/lib/mockData";
import { registerUser } from "@/lib/api";
import { AuthBrand, default as AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { REGISTER } from "@/constants/testIds/auth";

const roleIcons = { Heart, Stethoscope, GraduationCap, HandHeart };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2 || form.name.trim().length > 100) errors.name = "Enter a name between 2 and 100 characters.";
  if (!emailPattern.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (form.password.length < 8) errors.password = "Use at least 8 characters for your password.";
  if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match.";
  if (!ONBOARD_ROLES.some((role) => role.id === form.role)) errors.role = "Choose how you would like to join Lumina.";
  if (!form.guardianConsent) errors.guardianConsent = "Please confirm that you are an adult and authorized user.";
  return errors;
}

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "", guardianConsent: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setRegisteredName("");
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) return setErrors(nextErrors);

    setIsSubmitting(true);
    setServerError("");
    try {
      const { response, data } = await registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role, guardianConsent: true });
      if (response.status === 201) {
        setRegisteredName(data?.data?.user?.name || form.name.trim());
        setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
        return;
      }
      const details = data?.error?.details;
      setServerError(Array.isArray(details) && details.length > 0 ? details.join(" ") : data?.error?.message || "We could not create your account. Please try again.");
    } catch {
      setServerError("We could not reach Lumina. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lumina-fade-in max-w-xl">
        <AuthBrand />
        <div className="mt-10"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create your Lumina account</h1><p className="mt-3 text-lg text-muted-foreground">Join a supportive community for families, professionals, educators, and mentors.</p></div>
        {registeredName ? (
          <div className="mt-8 rounded-2xl border border-primary/30 bg-accent p-5" role="status"><h2 className="font-bold">Your account has been created.</h2><p className="mt-1 text-sm text-muted-foreground">Thanks, {registeredName}. Login will be available in the next step.</p><Link to="/login" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View login <ArrowRight className="h-4 w-4" /></Link></div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            {serverError && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{serverError}</div>}
            <div><label className="mb-1.5 block text-sm font-medium" htmlFor="register-name">Full name</label><Input id="register-name" data-testid={REGISTER.nameInput} value={form.name} onChange={(event) => updateField("name", event.target.value)} autoComplete="name" aria-invalid={!!errors.name} />{errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}</div>
            <div><label className="mb-1.5 block text-sm font-medium" htmlFor="register-email">Email address</label><Input id="register-email" data-testid={REGISTER.emailInput} type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" aria-invalid={!!errors.email} />{errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}</div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="mb-1.5 block text-sm font-medium" htmlFor="register-password">Password</label><Input id="register-password" data-testid={REGISTER.passwordInput} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} autoComplete="new-password" aria-invalid={!!errors.password} />{errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}</div>
              <div><label className="mb-1.5 block text-sm font-medium" htmlFor="register-password-confirm">Confirm password</label><Input id="register-password-confirm" data-testid={REGISTER.passwordConfirmInput} type="password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} autoComplete="new-password" aria-invalid={!!errors.confirmPassword} />{errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}</div>
            </div>
            <fieldset><legend className="text-sm font-medium">Choose how you would like to join</legend><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{ONBOARD_ROLES.map((role) => { const Icon = roleIcons[role.icon]; const selected = form.role === role.id; return <button key={role.id} type="button" onClick={() => updateField("role", role.id)} aria-pressed={selected} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${selected ? "border-primary bg-accent" : "hover:bg-muted"}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Icon className="h-5 w-5" /></span><span className="font-semibold">{role.label}</span>{selected && <Check className="ml-auto h-5 w-5 text-primary" />}</button>; })}</div>{errors.role && <p className="mt-2 text-sm text-destructive">{errors.role}</p>}</fieldset>
            <label className="flex items-start gap-3 rounded-2xl border p-4"><Checkbox checked={form.guardianConsent} onCheckedChange={(value) => updateField("guardianConsent", value === true)} className="mt-0.5" aria-invalid={!!errors.guardianConsent} /><span className="text-sm">I am at least 18 years old and am an authorized user of Lumina. I understand that account registration does not collect information about a child.</span></label>
            {errors.guardianConsent && <p className="text-sm text-destructive">{errors.guardianConsent}</p>}
            <Button data-testid={REGISTER.submitButton} type="submit" disabled={isSubmitting} className="h-12 w-full rounded-full text-base">{isSubmitting ? "Creating account…" : <>Create account <ArrowRight className="h-5 w-5" /></>}</Button>
          </form>
        )}
        {!registeredName && <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link data-testid={REGISTER.loginLink} to="/login" className="font-semibold text-primary hover:underline">Login</Link></p>}
      </div>
    </AuthLayout>
  );
}
