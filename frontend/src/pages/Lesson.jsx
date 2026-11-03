import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLearningModule, completeLearningModule } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, AlertTriangle, ExternalLink, Play, RefreshCw, BookOpen, FileText, CheckSquare } from "lucide-react";
import { toast } from "sonner";

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useApp();
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [iframeError, setIframeError] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLesson = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const { response, data } = await getLearningModule(id);
      if (response?.ok && data?.data?.module) {
        setLesson(data.data.module);
        setCompleted(Boolean(data.data.module.isCompleted));
      } else {
        setError(data?.error?.message || "The requested learning material could not be found.");
      }
    } catch {
      setError("Network connection error. We could not reach Lumina.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleToggleComplete = async () => {
    if (submitting || !lesson) return;
    const nextCompleted = !completed;
    setSubmitting(true);

    try {
      const { response, data } = await completeLearningModule(
        lesson.slug || lesson._id || id,
        { isCompleted: nextCompleted, progressPercent: nextCompleted ? 100 : 0 },
        csrfToken
      );

      if (response?.ok && data?.data) {
        setCompleted(Boolean(data.data.isCompleted));
        if (data.data.isCompleted) {
          toast.success("Lesson Completed", {
            description: `You have completed ${lesson.title}.`,
          });
        } else {
          toast.info("Status Updated", {
            description: `Marked ${lesson.title} as incomplete.`,
          });
        }
      } else {
        toast.error("Could not update lesson progress", {
          description: data?.error?.message || "Please check your connection and try again.",
        });
      }
    } catch {
      toast.error("Network error", {
        description: "Could not reach Lumina server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCheckItem = (index) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate("/learn")}
        className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learn
      </button>

      {loading ? (
        <div className="space-y-6">
          <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="aspect-video w-full animate-pulse rounded-3xl bg-muted" />
        </div>
      ) : error || !lesson ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-center text-destructive">
          <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
          <h2 className="text-xl font-bold">{error || "Lesson Not Found"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">The learning resource you are looking for could not be loaded.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/learn")} className="rounded-full">
              Back to Learn
            </Button>
            <Button onClick={fetchLesson} className="rounded-full">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: "#D9A441" }}>
              {lesson.title}
            </h1>
            <p className="text-xl font-medium text-muted-foreground">
              {lesson.tagline}
            </p>
          </div>

      {/* Medical Disclaimer */}
      {lesson.isDiagnostic && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            <strong>Educational information only.</strong> Lumina provides educational information and does not replace professional medical, developmental, or therapeutic advice. If you have concerns about a child's development, speak with a qualified healthcare or developmental professional.
          </p>
        </div>
      )}

      {/* Video Player / Media Area */}
      {lesson.videoUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border bg-black shadow-sm">
            {lesson.videoSourceType === "upload" ||
            lesson.videoUrl.includes("res.cloudinary.com") ||
            /\.(mp4|webm|mov|mkv|ogg)$/i.test(lesson.videoUrl) ? (
              <video
                src={lesson.videoUrl}
                controls
                controlsList="nodownload"
                className="absolute inset-0 h-full w-full object-contain bg-black"
              >
                Your browser does not support the video tag.
              </video>
            ) : !iframeError ? (
              <iframe
                src={
                  lesson.videoUrl.includes("youtube.com/watch?v=")
                    ? lesson.videoUrl.replace("watch?v=", "embed/")
                    : lesson.videoUrl
                }
                title={lesson.title}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setIframeError(true)}
              ></iframe>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-white bg-slate-900">
                <Play className="mb-4 h-12 w-12 text-slate-500" />
                <h3 className="text-lg font-bold">This video is currently unavailable.</h3>
                <p className="mt-2 text-sm text-slate-400">The video could not be embedded or has been removed.</p>
                <a
                  href={lesson.videoUrl.replace("embed/", "watch?v=")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-slate-200"
                >
                  Watch on External Site <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Source: {lesson.sourceOrg || "Project Lumina"}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-3xl border bg-muted/40 p-6 sm:p-8">
          <div className="rounded-2xl bg-amber-100 p-4 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            {lesson.format === "Guide" ? (
              <BookOpen className="h-8 w-8" />
            ) : lesson.format === "Checklist" ? (
              <CheckSquare className="h-8 w-8" />
            ) : (
              <FileText className="h-8 w-8" />
            )}
          </div>
          <div>
            <Badge variant="outline" className="rounded-full text-xs mb-1">
              {lesson.format} · {lesson.category}
            </Badge>
            <p className="text-base text-foreground font-medium">
              {lesson.desc}
            </p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {lesson.about ? (
            <section>
              <h2 className="text-2xl font-bold">About this material</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {lesson.about}
              </p>
            </section>
          ) : (
            <section>
              <h2 className="text-2xl font-bold">Overview</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {lesson.desc}
              </p>
            </section>
          )}

          {Array.isArray(lesson.takeaways) && lesson.takeaways.length > 0 && (
            <section className="rounded-3xl border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {lesson.format === "Checklist" ? "Action Checklist" : "Key Takeaways"}
                </h2>
                {lesson.format === "Checklist" && (
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {Object.values(checkedItems).filter(Boolean).length} of {lesson.takeaways.length} checked
                  </Badge>
                )}
              </div>
              <ul className="space-y-3">
                {lesson.takeaways.map((takeaway, index) => {
                  const isChecked = Boolean(checkedItems[index]);
                  const isChecklist = lesson.format === "Checklist";

                  return (
                    <li
                      key={index}
                      onClick={() => isChecklist && toggleCheckItem(index)}
                      className={`flex items-start gap-3 rounded-2xl p-3 transition-colors ${
                        isChecklist ? "cursor-pointer hover:bg-muted/60 border border-transparent hover:border-border" : ""
                      }`}
                    >
                      {isChecklist ? (
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            isChecked || completed
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-muted-foreground/40 bg-card"
                          }`}
                        >
                          {(isChecked || completed) && <CheckSquare className="h-3.5 w-3.5" />}
                        </div>
                      ) : (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" style={{ color: "#5FA07E" }} />
                      )}
                      <span className={`text-base ${isChecked || completed ? "text-foreground font-medium" : "text-foreground"}`}>
                        {takeaway}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="md:col-span-1">
          <Card className="sticky top-6 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Progress</h3>
              <Badge variant={completed ? "default" : "outline"} className={`rounded-full text-xs ${completed ? "bg-emerald-600 text-white" : ""}`}>
                {completed ? "100% Complete" : "Not Completed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {completed
                ? "You have finished this lesson. You can update your status at any time."
                : "Mark this lesson as completed to track your learning journey across Lumina."}
            </p>
            <Button
              data-testid="lesson-complete-button"
              className={`w-full rounded-full py-6 text-base font-semibold shadow-sm transition-all duration-200 ${
                completed
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              size="lg"
              onClick={handleToggleComplete}
              disabled={submitting}
            >
              {submitting ? (
                "Saving…"
              ) : completed ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Completed (Click to undo)
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          </Card>
        </div>
      </div>
      </>
    )}
    </div>
  );
}
