import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LEARN_MODULES } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, AlertTriangle, ExternalLink, Play } from "lucide-react";
import { toast } from "sonner";

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const lesson = LEARN_MODULES.find((m) => m.id === id);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Lesson not found</h2>
        <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate("/learn")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learn
        </Button>
      </div>
    );
  }

  const handleComplete = () => {
    setCompleted(true);
    toast.success("Lesson Completed", { description: `You have completed ${lesson.title}.` });
    setTimeout(() => {
      navigate("/learn");
    }, 1500);
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

      {/* Video Player Area */}
      <div className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border bg-black shadow-sm">
          {!iframeError ? (
            <iframe
              src={lesson.videoUrl}
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
                Watch on YouTube <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Source: {lesson.sourceOrg}
        </p>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-2xl font-bold">About this lesson</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {lesson.about}
            </p>
          </section>

          <section className="rounded-3xl border bg-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6">Key Takeaways</h2>
            <ul className="space-y-4">
              {lesson.takeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" style={{ color: "#5FA07E" }} />
                  <span className="text-base text-foreground">{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="md:col-span-1">
          <Card className="sticky top-6 rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-2">Progress</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Mark this lesson as completed to track your learning journey.
            </p>
            <Button
              className="w-full rounded-full py-6 text-base shadow-sm"
              size="lg"
              onClick={handleComplete}
              disabled={completed}
              style={{ backgroundColor: completed ? "#5FA07E" : undefined }}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Completed
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
