import React from "react";
import { LuminaLogo } from "@/components/LuminaLogo";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">{children}</div>
        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-3xl border">
            <img
              src="https://images.unsplash.com/photo-1635770618588-06bd8d5d73b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBwYXJlbnQlMjBjaGlsZCUyMGhhcHB5JTIwY2FsbXxlbnwwfHx8fDE3ODYzODYxMDJ8MA&ixlib=rb-4.1.0&q=85"
              alt="A parent and child sharing a joyful moment"
              className="h-64 w-full object-cover sm:h-[26rem]"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-card/95 p-4 backdrop-blur">
              <p className="text-sm font-semibold">You are not alone.</p>
              <p className="mt-1 text-sm text-muted-foreground">Learn, connect, find professionals, and give every voice a way to be heard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthBrand() {
  return (
    <div className="flex items-center gap-3">
      <LuminaLogo size={48} />
      <div>
        <p className="text-2xl font-bold leading-none">Lumina</p>
        <p className="mt-1 text-sm text-muted-foreground">Community Operating System</p>
      </div>
    </div>
  );
}
