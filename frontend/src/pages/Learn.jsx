import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PageHeader, PillarBanner } from "@/components/shared";
import { LEARN_MODULES, LEARN_TABS, GOV_SUPPORT, LEARN_PROGRESS } from "@/lib/mockData";
import { LANGUAGES } from "@/lib/translations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, HousePlus, Video, Headphones, FileText, Play, Landmark, ArrowRight } from "lucide-react";

const formatIcon = { Video, Audio: Headphones, Reading: FileText };

export default function Learn() {
  const { t, lang, setLang } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(LEARN_TABS[0]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title={t("learn.title")} subtitle={t("learn.subtitle")} icon={BookOpen} color="#D9A441" />
        {/* Language toggle */}
        <div className="inline-flex shrink-0 rounded-full border bg-card p-1" data-testid="learn-language-toggle">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              data-testid={`learn-lang-${l.code}`}
              onClick={() => setLang(l.code)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 ${lang === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* The Challenge */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#D9A441", lineHeight: 1.2 }}>
            Autism support should not depend on where a child is born.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Families in Tier-2, Tier-3, and rural communities often face geographic, financial, and social barriers to developmental support.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border">
          <img
            src="https://www.helpguide.org/wp-content/uploads/2023/02/Does-My-Child-Have-Autism-1200x799.jpeg?q=80&w=1200&auto=format&fit=crop"
            alt="A realistic Indian family environment showing the challenges of accessing support"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
      </section>

      {/* Parent Empowerment */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1 relative overflow-hidden rounded-3xl border">
          <img
            src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1200&auto=format&fit=crop"
            alt="Parent learning with their child in a natural home-based learning environment"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#D9A441", lineHeight: 1.2 }}>
            When support reaches home, intervention becomes part of everyday life.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Empowering parents through guided, home-based learning transforms daily interactions into powerful developmental steps.
          </p>
        </div>
      </section>

      {/* Pillar: Capacity Building at Home */}
      <PillarBanner
        title="Capacity Building at Home"
        subtitle="Build confidence and practical skills without needing to travel for every answer."
        icon={HousePlus}
        color="#D9A441"
      />

      {/* Modules */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Learning modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_MODULES.map((m) => {
            const FIcon = formatIcon[m.format] || FileText;
            return (
              <Card key={m.id} data-testid={`learn-module-${m.id}`} className="flex flex-col rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="rounded-full">{m.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FIcon className="h-4 w-4" /> {m.format}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{m.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.desc}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>⏱ {m.duration}</span>
                  <span>📊 {m.difficulty}</span>
                  <span>🗣 {m.language}</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span><span>{m.progress}%</span>
                  </div>
                  <Progress value={m.progress} className="h-2" />
                </div>
                <Button
                  data-testid={`start-learning-${m.id}`}
                  onClick={() => navigate(`/learn/${m.id}`)}
                  className="mt-4 w-full rounded-full"
                >
                  <Play className="mr-1 h-4 w-4" /> {m.progress === 100 ? "Review" : "Start Learning"}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Learning categories */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Learning categories</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            {LEARN_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab} data-testid={`learn-tab-${tab}`}
                className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Card className="mt-4 rounded-2xl p-6">
          <h3 className="text-lg font-bold">{activeTab}</h3>
          <p className="mt-2 text-muted-foreground">
            Curated guides, videos and activities for <strong>{activeTab}</strong>. This is prototype content
            demonstrating how families and educators would explore each learning track.
          </p>
        </Card>
      </section>

      {/* Government support */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Government Support</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOV_SUPPORT.map((g) => (
            <Card key={g.id} data-testid={`gov-${g.id}`} className="flex flex-col rounded-2xl p-5">
              <Badge variant="outline" className="mb-3 w-fit rounded-full">{g.tag}</Badge>
              <h3 className="font-bold">{g.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{g.desc}</p>
              <button data-testid={`gov-learn-${g.id}`}
                onClick={() => toast.info(g.title, { description: "Prototype informational content." })}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Learn more <ArrowRight className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      </section>

      {/* Learning progress */}
      <Card className="rounded-2xl p-6">
        <h2 className="text-xl font-bold">Your Learning Progress</h2>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-3xl font-bold text-primary">{LEARN_PROGRESS}% Complete</span>
        </div>
        <Progress value={LEARN_PROGRESS} className="mt-3 h-3" />
      </Card>
    </div>
  );
}
