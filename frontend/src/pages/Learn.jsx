import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PageHeader, PillarBanner } from "@/components/shared";
import { getLearningModules, getGovernmentSchemes } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BookOpen,
  HousePlus,
  Video,
  Headphones,
  FileText,
  Play,
  Landmark,
  ArrowRight,
  RefreshCw,
  CheckSquare,
  UploadCloud,
  Link2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const formatIcon = {
  Video,
  Audio: Headphones,
  Reading: FileText,
  Guide: BookOpen,
  Checklist: CheckSquare,
  Post: FileText,
};

const LANGUAGE_FILTERS = [
  { code: "all", label: "All Languages", short: "ALL" },
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "हि" },
  { code: "or", label: "ଓଡ଼ିଆ", short: "ଓ" },
];

export default function Learn() {
  const { t, setLang } = useApp();
  const navigate = useNavigate();

  const [selectedLang, setSelectedLang] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [completionFilter, setCompletionFilter] = useState("all");

  const [modules, setModules] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = {};
      if (selectedLang !== "all") {
        queryParams.lang = selectedLang;
      }

      const [modulesRes, schemesRes] = await Promise.all([
        getLearningModules(queryParams),
        getGovernmentSchemes(),
      ]);

      if (modulesRes.response?.ok && modulesRes.data?.data?.modules) {
        setModules(modulesRes.data.data.modules);
      } else {
        setError(modulesRes.data?.error?.message || "Could not load learning resources from Lumina.");
      }

      if (schemesRes.response?.ok && schemesRes.data?.data?.schemes) {
        setSchemes(schemesRes.data.data.schemes);
      }
    } catch {
      setError("Network connection error. We could not reach Lumina.");
    } finally {
      setLoading(false);
    }
  }, [selectedLang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle language filter click
  const handleLanguageChange = (code) => {
    setSelectedLang(code);
    if (code !== "all") {
      setLang(code);
    }
  };

  // Dynamically derive unique categories from live MongoDB modules
  const categories = useMemo(() => {
    const unique = Array.from(new Set(modules.map((m) => m.category).filter(Boolean)));
    return ["All", ...unique];
  }, [modules]);

  // Completed lessons count and total count
  const completedCount = useMemo(() => modules.filter((m) => m.isCompleted).length, [modules]);
  const totalCount = modules.length;

  // Filter modules by active category and completion status
  const displayedModules = useMemo(() => {
    let filtered = modules;
    if (activeCategory !== "All") {
      filtered = filtered.filter(
        (m) => m.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (completionFilter === "completed") {
      filtered = filtered.filter((m) => m.isCompleted);
    } else if (completionFilter === "unfinished") {
      filtered = filtered.filter((m) => !m.isCompleted);
    }
    return filtered;
  }, [modules, activeCategory, completionFilter]);

  // Calculate real learning progress from user completions
  const dynamicProgress = useMemo(() => {
    if (!totalCount) return 0;
    return Math.round((completedCount / totalCount) * 100);
  }, [completedCount, totalCount]);

  return (
    <div className="space-y-10">
      {/* Header & Language Filter Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={t("learn.title") || "Learning Hub"}
          subtitle={t("learn.subtitle") || "Knowledge and practical strategies for families, educators and caregivers."}
          icon={BookOpen}
          color="#D9A441"
        />

        {/* Multilingual Toggle */}
        <div className="inline-flex shrink-0 rounded-full border bg-card p-1 shadow-sm" data-testid="learn-language-toggle">
          {LANGUAGE_FILTERS.map((l) => (
            <button
              key={l.code}
              data-testid={`learn-lang-${l.code}`}
              onClick={() => handleLanguageChange(l.code)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${selectedLang === l.code
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* The Challenge */}
      {/* <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
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
      </section> */}

      {/* Parent Empowerment */}
      {/* <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
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
      </section> */}

      {/* Pillar: Capacity Building at Home */}
      {/* <PillarBanner
        title="Capacity Building at Home"
        subtitle="Build confidence and practical skills without needing to travel for every answer."
        icon={HousePlus}
        color="#D9A441"
      /> */}

      {/* Learning Modules Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Learning Resources & Lessons
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore verified lessons, teaching videos, classroom guides, and sensory checklists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2" data-testid="learn-completion-filter">
            <button
              type="button"
              data-testid="filter-all"
              onClick={() => setCompletionFilter("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                completionFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Lessons ({totalCount})
            </button>
            <button
              type="button"
              data-testid="filter-unfinished"
              onClick={() => setCompletionFilter("unfinished")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                completionFilter === "unfinished"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Unfinished ({totalCount - completedCount})
            </button>
            <button
              type="button"
              data-testid="filter-completed"
              onClick={() => setCompletionFilter("completed")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                completionFilter === "completed"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {error && (
            <Button variant="ghost" size="sm" onClick={loadData} className="text-xs">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={loadData} className="rounded-full">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="flex flex-col rounded-2xl p-5 shadow-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-12 w-full animate-pulse rounded bg-muted" />
                <div className="mt-4 h-9 w-full animate-pulse rounded-full bg-muted" />
              </Card>
            ))}
          </div>
        ) : displayedModules.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedModules.map((m) => {
              const FIcon = formatIcon[m.format] || FileText;
              const isCloudinary = Boolean(m.cloudinaryPublicId);

              return (
                <Card
                  key={m.id || m._id}
                  data-testid={`learn-module-${m.id}`}
                  className="flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {m.category}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {m.isCompleted ? (
                          <Badge className="bg-emerald-600/15 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-semibold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] text-muted-foreground">
                            Unfinished
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FIcon className="h-3.5 w-3.5" /> {m.format}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-3 text-lg font-bold leading-snug line-clamp-2 text-foreground">
                      {m.title}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm text-muted-foreground line-clamp-2">
                      {m.desc}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-2 py-0.5">⏱ {m.duration}</span>
                      <span className="rounded-md bg-muted px-2 py-0.5">📊 {m.difficulty}</span>
                      <span className="rounded-md bg-muted px-2 py-0.5">🗣 {m.language}</span>
                    </div>

                    {m.format === "Video" && (
                      <div className="mt-3">
                        {isCloudinary ? (
                          <Badge
                            variant="outline"
                            className="rounded-full border-emerald-300 bg-emerald-50 text-[10px] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <UploadCloud className="mr-1 h-3 w-3" /> Cloudinary Video
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full border-sky-300 bg-sky-50 text-[10px] text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                          >
                            <Link2 className="mr-1 h-3 w-3" /> Embedded Video
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Status</span>
                        <span className={m.isCompleted ? "font-semibold text-emerald-600" : ""}>
                          {m.isCompleted ? "Completed (100%)" : "Not Completed"}
                        </span>
                      </div>
                      <Progress value={m.isCompleted ? 100 : 0} className="h-2" />
                    </div>
                  </div>

                  <Button
                    data-testid={`start-learning-${m.id}`}
                    onClick={() => navigate(`/learn/${m.id || m.slug}`)}
                    className="mt-5 w-full rounded-full shadow-sm"
                  >
                    <Play className="mr-1.5 h-4 w-4" /> {m.isCompleted ? "Review Material" : "Start Learning"}
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : !loading && !error ? (
          <Card className="rounded-2xl border-dashed p-8 text-center text-muted-foreground sm:col-span-2 lg:col-span-3">
            <p className="text-base font-medium">No learning materials found for this selection.</p>
            <p className="mt-1 text-xs">
              Try switching language to &ldquo;All Languages&rdquo; or selecting &ldquo;All&rdquo; categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full"
              onClick={() => {
                setSelectedLang("all");
                setActiveCategory("All");
              }}
            >
              Reset Filters
            </Button>
          </Card>
        ) : null}
      </section>

      {/* Learning Categories Filter Tabs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Explore by Category</h2>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                data-testid={`learn-tab-${cat}`}
                className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Card className="rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold">{activeCategory}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeCategory === "All"
              ? `Displaying all ${displayedModules.length} verified lessons and guides available in the community.`
              : `Curated guides, videos and activities for ${activeCategory}. Designed to help families and educators build practical skills at home and in the classroom.`}
          </p>
        </Card>
      </section>

      {/* Government Support Schemes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Government Disability Support Schemes</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {schemes.map((g) => (
            <Card key={g.id || g._id} data-testid={`gov-${g.id}`} className="flex flex-col rounded-2xl p-5 shadow-sm">
              <Badge variant="outline" className="mb-3 w-fit rounded-full text-xs">
                {g.tag}
              </Badge>
              <h3 className="font-bold text-foreground">{g.title}</h3>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{g.desc}</p>
              <button
                data-testid={`gov-learn-${g.id}`}
                onClick={() => toast.info(g.title, { description: g.desc })}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </button>
            </Card>
          ))}

          {!schemes.length && !loading && (
            <Card className="rounded-2xl p-6 text-center text-muted-foreground sm:col-span-2 lg:col-span-4">
              Government scheme information is being loaded.
            </Card>
          )}
        </div>
      </section>

      {/* Dynamic Learning Progress Card */}
      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Learning Progress</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Based on verified modules and practical guides in the Lumina Learning Hub.
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full text-xs w-fit">
            {completedCount} of {totalCount} completed
          </Badge>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-3xl font-extrabold text-primary">{dynamicProgress}% Complete</span>
          <span className="text-xs text-muted-foreground font-medium">
            {totalCount - completedCount} lessons remaining
          </span>
        </div>
        <Progress value={dynamicProgress} className="mt-3 h-3" />
      </Card>
    </div>
  );
}
