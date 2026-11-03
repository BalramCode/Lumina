import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import {
  getMyLearningModules,
  publishLearningModule,
  updateLearningModule,
  deleteLearningModule,
  uploadLearningVideo,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  PlusCircle,
  Video,
  FileText,
  BookOpen,
  CheckSquare,
  UploadCloud,
  Link2,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Play,
} from "lucide-react";

const FORMAT_OPTIONS = [
  { value: "Video", label: "Video Lesson", icon: Video },
  { value: "Guide", label: "Curriculum Guide", icon: BookOpen },
  { value: "Checklist", label: "Classroom Checklist", icon: CheckSquare },
  { value: "Post", label: "Inclusive Teaching Post", icon: FileText },
];

const PRESET_CATEGORIES = [
  "Communication & Language",
  "Sensory Strategies",
  "Daily Routines",
  "Classroom Support",
  "Inclusive Education",
  "Emotional Regulation",
];

export default function EducatorContentManager() {
  const { user, csrfToken } = useApp();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [format, setFormat] = useState("Video");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [desc, setDesc] = useState("");
  const [duration, setDuration] = useState("15 min");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [langCode, setLangCode] = useState("en");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [takeaways, setTakeaways] = useState([""]);
  const [isDiagnostic, setIsDiagnostic] = useState(false);

  // Video state
  const [videoSourceMode, setVideoSourceMode] = useState("upload"); // "upload" | "link"
  const [videoUrl, setVideoUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [cloudinaryAssetId, setCloudinaryAssetId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  const isVerified = user?.isVerified === true || user?.role === "admin";

  const fetchModules = async () => {
    setLoading(true);
    try {
      const { response, data } = await getMyLearningModules();
      if (response?.ok && data?.data?.modules) {
        setModules(data.data.modules);
      }
    } catch {
      // Ignore network errors on initial load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const resetForm = () => {
    setEditingModule(null);
    setFormat("Video");
    setTitle("");
    setCategory(PRESET_CATEGORIES[0]);
    setDesc("");
    setDuration("15 min");
    setDifficulty("Beginner");
    setLangCode("en");
    setTagline("");
    setAbout("");
    setTakeaways([""]);
    setIsDiagnostic(false);
    setVideoSourceMode("upload");
    setVideoUrl("");
    setCloudinaryPublicId("");
    setCloudinaryAssetId("");
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadSuccess(false);
    setUploadError("");
  };

  const handleOpenCreate = () => {
    if (!isVerified) {
      toast.error("Verification Required", {
        description: "Your specialist credentials must be verified by an administrator before publishing.",
      });
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod) => {
    resetForm();
    setEditingModule(mod);
    setFormat(mod.format || "Video");
    setTitle(mod.title || "");
    setCategory(mod.category || PRESET_CATEGORIES[0]);
    setDesc(mod.desc || "");
    setDuration(mod.duration || "15 min");
    setDifficulty(mod.difficulty || "Beginner");
    setLangCode(mod.langCode || "en");
    setTagline(mod.tagline || "");
    setAbout(mod.about || "");
    setTakeaways(mod.takeaways?.length ? mod.takeaways : [""]);
    setIsDiagnostic(Boolean(mod.isDiagnostic));

    if (mod.cloudinaryPublicId) {
      setVideoSourceMode("upload");
      setVideoUrl(mod.videoUrl || "");
      setCloudinaryPublicId(mod.cloudinaryPublicId);
      setCloudinaryAssetId(mod.cloudinaryAssetId || "");
      setUploadSuccess(true);
    } else {
      setVideoSourceMode(mod.videoUrl ? "link" : "upload");
      setVideoUrl(mod.videoUrl || "");
    }

    setIsModalOpen(true);
  };

  // Video File Selection & Validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg)$/i.test(file.name);
    if (!isVideo) {
      setUploadError("Please select a valid video file (.mp4, .webm, .mov).");
      setSelectedFile(null);
      return;
    }

    const maxBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxBytes) {
      setUploadError("Video file size exceeds the 100MB limit.");
      setSelectedFile(null);
      return;
    }

    setUploadError("");
    setUploadSuccess(false);
    setUploadProgress(0);
    setSelectedFile(file);
  };

  // Direct Cloudinary Upload Trigger
  const handleUploadVideo = async () => {
    if (!selectedFile) {
      setUploadError("Please browse and select a video file first.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const { response, data } = await uploadLearningVideo(selectedFile, csrfToken, (percent) => {
        setUploadProgress(percent);
      });

      if (response?.ok && data?.data?.url) {
        setVideoUrl(data.data.url);
        setCloudinaryPublicId(data.data.publicId);
        setCloudinaryAssetId(data.data.assetId || "");
        if (data.data.duration) {
          setDuration(data.data.duration);
        }
        setUploadSuccess(true);
        toast.success("Video Upload Complete", {
          description: "Video uploaded and ready to publish.",
        });
      } else {
        const errorMsg =
          data?.error?.message || "Failed to upload video to Cloudinary. Check server credentials.";
        setUploadError(errorMsg);
        toast.error("Upload Failed", { description: errorMsg });
      }
    } catch (err) {
      setUploadError(err.message || "Network error during upload.");
      toast.error("Upload Error", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  // Dynamic takeaways handlers
  const handleAddTakeaway = () => {
    setTakeaways([...takeaways, ""]);
  };

  const handleTakeawayChange = (index, value) => {
    const updated = [...takeaways];
    updated[index] = value;
    setTakeaways(updated);
  };

  const handleRemoveTakeaway = (index) => {
    if (takeaways.length === 1) {
      setTakeaways([""]);
    } else {
      setTakeaways(takeaways.filter((_, i) => i !== index));
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 3) {
      toast.error("Validation Error", { description: "Title must be at least 3 characters." });
      return;
    }
    if (!desc.trim() || desc.trim().length < 10) {
      toast.error("Validation Error", { description: "Description must be at least 10 characters." });
      return;
    }

    if (format === "Video") {
      if (videoSourceMode === "upload" && !videoUrl) {
        toast.error("Video Required", {
          description: "Please upload a video file or switch to 'Add Video Link'.",
        });
        return;
      }
      if (videoSourceMode === "link" && (!videoUrl.trim() || !/^https?:\/\/.+/.test(videoUrl.trim()))) {
        toast.error("Video URL Required", {
          description: "Please provide a valid YouTube, Vimeo, or HTTP/HTTPS video URL.",
        });
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      category: category.trim(),
      desc: desc.trim(),
      format,
      duration: duration.trim(),
      difficulty,
      langCode,
      language: langCode === "hi" ? "Hindi" : langCode === "or" ? "Odia" : "English",
      tagline: tagline.trim(),
      about: about.trim(),
      takeaways: takeaways.filter((t) => t.trim().length > 0),
      isDiagnostic,
      videoSourceType: format === "Video" ? (cloudinaryPublicId ? "upload" : "external") : "none",
      videoUrl: videoUrl.trim(),
      cloudinaryPublicId: cloudinaryPublicId || null,
      cloudinaryAssetId: cloudinaryAssetId || null,
    };

    try {
      if (editingModule) {
        const { response, data } = await updateLearningModule(
          editingModule.id || editingModule._id,
          payload,
          csrfToken
        );
        if (response?.ok && data?.data?.module) {
          toast.success("Updated Successfully", {
            description: `"${payload.title}" has been updated.`,
          });
          setIsModalOpen(false);
          fetchModules();
        } else {
          toast.error("Update Failed", {
            description: data?.error?.message || "Could not update learning material.",
          });
        }
      } else {
        const { response, data } = await publishLearningModule(payload, csrfToken);
        if (response?.ok && data?.data?.module) {
          toast.success("Published Successfully", {
            description: `"${payload.title}" is now available in the Learning Hub.`,
          });
          setIsModalOpen(false);
          fetchModules();
        } else {
          toast.error("Publishing Failed", {
            description: data?.error?.message || "Could not publish learning material.",
          });
        }
      }
    } catch (err) {
      toast.error("Error", { description: err.message || "An unexpected error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const { response, data } = await deleteLearningModule(
        deleteTarget.id || deleteTarget._id,
        csrfToken
      );
      if (response?.ok) {
        toast.success("Deleted", {
          description: `"${deleteTarget.title}" has been removed.`,
        });
        setDeleteTarget(null);
        fetchModules();
      } else {
        toast.error("Delete Failed", {
          description: data?.error?.message || "Could not delete this material.",
        });
      }
    } catch (err) {
      toast.error("Error", { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            My Teaching Materials & Guides
          </h2>
          <p className="text-sm text-muted-foreground">
            Create, manage, and share inclusive classroom curriculum, videos, and sensory checklists.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          disabled={!isVerified}
          className="rounded-full shadow-sm"
          style={{ backgroundColor: isVerified ? "#D9A441" : undefined }}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Publish New Material
        </Button>
      </div>

      {/* Verification Notice Banner if unverified */}
      {!isVerified && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold">Professional Verification Pending</p>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
              To safeguard families and children, Lumina requires administrative credential verification
              before publishing learning content to the community. Your application is currently under review.
            </p>
          </div>
        </div>
      )}

      {/* Content Cards Grid / Empty State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="flex flex-col rounded-2xl p-5">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-12 w-full animate-pulse rounded bg-muted" />
            </Card>
          ))}
        </div>
      ) : modules.length === 0 ? (
        <Card className="flex flex-col items-center justify-center rounded-2xl border-dashed p-8 text-center sm:p-12">
          <div className="rounded-full bg-amber-100 p-3 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold">No teaching materials published yet</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Share practical curriculum adaptations, visual schedules, and classroom sensory guides with educators and families across India.
          </p>
          {isVerified && (
            <Button
              onClick={handleOpenCreate}
              variant="outline"
              className="mt-5 rounded-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create First Guide
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const formatMeta = FORMAT_OPTIONS.find((f) => f.value === mod.format) || FORMAT_OPTIONS[0];
            const FIcon = formatMeta.icon;
            const isCloudinary = Boolean(mod.cloudinaryPublicId);

            return (
              <Card
                key={mod.id || mod._id}
                className="flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {mod.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FIcon className="h-3.5 w-3.5" /> {mod.format}
                    </span>
                  </div>

                  <h4 className="mt-3 font-bold leading-snug line-clamp-2 text-foreground">
                    {mod.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {mod.desc}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-0.5">⏱ {mod.duration}</span>
                    <span className="rounded-md bg-muted px-2 py-0.5">📊 {mod.difficulty}</span>
                    <span className="rounded-md bg-muted px-2 py-0.5">🗣 {mod.language}</span>
                  </div>

                  {mod.format === "Video" && (
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
                          <Link2 className="mr-1 h-3 w-3" /> Embedded Video Link
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full text-xs"
                    onClick={() => navigate(`/learn/${mod.id || mod.slug}`)}
                  >
                    <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full text-xs"
                      onClick={() => handleOpenEdit(mod)}
                    >
                      <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(mod)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Publish & Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingModule ? "Edit Teaching Material" : "Publish New Teaching Material"}
            </DialogTitle>
            <DialogDescription>
              {editingModule
                ? "Update your published guide, lesson, or video details."
                : "Add an inclusive classroom guide, video lesson, or practical sensory checklist."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            {/* Format Selection */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Material Format
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = format === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setFormat(opt.value)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm dark:bg-amber-950/40 dark:text-amber-200"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? "text-amber-600 dark:text-amber-400" : ""}`} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Visual Schedules for Transition Periods in Classrooms"
                className="mt-1.5"
                required
              />
            </div>

            {/* Category & Language */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Language *
                </label>
                <select
                  value={langCode}
                  onChange={(e) => setLangCode(e.target.value)}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="or">Odia (ଓଡ଼ିଆ)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Summary Description *
              </label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief summary explaining what educators and parents will learn from this material..."
                className="mt-1.5 resize-none text-sm"
                rows={3}
                required
              />
            </div>

            {/* VIDEO SECTION (Only when format is Video) */}
            {format === "Video" && (
              <div className="rounded-2xl border p-4 bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Video Source Options
                  </label>
                  <div className="inline-flex rounded-full border bg-background p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode("upload")}
                      className={`rounded-full px-3 py-1 font-medium transition-colors ${
                        videoSourceMode === "upload"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <UploadCloud className="mr-1 inline-block h-3.5 w-3.5" /> Upload from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode("link")}
                      className={`rounded-full px-3 py-1 font-medium transition-colors ${
                        videoSourceMode === "link"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Link2 className="mr-1 inline-block h-3.5 w-3.5" /> Add Video Link
                    </button>
                  </div>
                </div>

                {/* Option 1: Upload from Device to Cloudinary */}
                {videoSourceMode === "upload" ? (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="rounded-full"
                      >
                        <UploadCloud className="mr-2 h-4 w-4" /> Browse Video File
                      </Button>

                      {selectedFile && (
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      )}

                      {selectedFile && !uploadSuccess && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUploadVideo}
                          disabled={isUploading}
                          className="rounded-full sm:ml-auto"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Uploading...
                            </>
                          ) : (
                            "Upload to Cloudinary"
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Upload progress */}
                    {isUploading && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Uploading video to Cloudinary…</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    {/* Upload Success Alert */}
                    {uploadSuccess && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>Video successfully stored in Cloudinary ({duration}).</span>
                      </div>
                    )}

                    {/* Upload Error Alert */}
                    {uploadError && (
                      <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Option 2: Add External Video Link */
                  <div className="space-y-2">
                    <Input
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setCloudinaryPublicId("");
                        setCloudinaryAssetId("");
                      }}
                      placeholder="Paste YouTube, Vimeo, or HTTP/HTTPS video URL (e.g. https://www.youtube.com/watch?v=...)"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lumina will automatically format YouTube and Vimeo URLs into responsive players.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Duration & Difficulty */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimated Duration
                </label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 15 min"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Key Takeaways Builder */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Takeaways
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddTakeaway}
                  className="h-7 text-xs"
                >
                  <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Point
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                {takeaways.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={point}
                      onChange={(e) => handleTakeawayChange(index, e.target.value)}
                      placeholder={`Key takeaway #${index + 1}...`}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTakeaway(index)}
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic disclaimer checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isDiagnostic"
                checked={isDiagnostic}
                onChange={(e) => setIsDiagnostic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isDiagnostic" className="text-xs text-muted-foreground">
                Include developmental disclaimer on this material
              </label>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting || isUploading}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || isUploading}
                className="rounded-full"
                style={{ backgroundColor: "#D9A441" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : editingModule ? (
                  "Save Changes"
                ) : (
                  "Publish Material"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teaching Material?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? If a video file was
              stored in Cloudinary, it will be safely removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete Material"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
