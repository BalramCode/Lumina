import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  MapPin,
  BriefcaseBusiness,
  Languages,
  Clock3,
  Star,
  CheckCircle2,
  Navigation,
  Search,
  RotateCcw,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  CalendarClock,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  createProfessionalProfile,
  getMyProfessionalProfile,
  getProfessionalDirectory,
  getProfessionalProfile,
  updateProfessionalProfile,
} from "@/lib/api";
import { PageHeader, PillarBanner } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PROF_TYPES = [
  "All",
  "Speech Therapist",
  "Occupational Therapist",
  "Developmental Pediatrician",
  "Special Educator",
  "Behaviour Therapist",
  "Psychologist",
];

const DEFAULT_COORDS = { lat: 20.2961, lng: 85.8245 }; // Bhubaneswar default

const EMPTY_FORM = {
  professionalType: "",
  specialization: "",
  bio: "",
  city: "",
  languages: "",
  yearsExperience: "",
  availability: "accepting_clients",
};

const availabilityLabels = {
  accepting_clients: "Accepting clients",
  waitlist: "Waitlist",
  not_accepting: "Not accepting clients",
};

function profileToForm(profile) {
  return {
    professionalType: profile.professionalType || "",
    specialization: profile.specialization || "",
    bio: profile.bio || "",
    city: profile.city || "",
    languages: Array.isArray(profile.languages) ? profile.languages.join(", ") : "",
    yearsExperience: String(profile.yearsExperience ?? ""),
    availability: profile.availability || "accepting_clients",
  };
}

function profilePayload(form) {
  return {
    professionalType: form.professionalType,
    specialization: form.specialization,
    bio: form.bio,
    city: form.city,
    languages: form.languages
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean),
    yearsExperience: Number(form.yearsExperience),
    availability: form.availability,
  };
}

function initials(name) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SP"
  );
}

function ParentDirectory() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [typeFilter, setTypeFilter] = useState("All");
  const [specQuery, setSpecQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [useNearby, setUseNearby] = useState(false);
  const [maxDist, setMaxDist] = useState([15]); // km
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [geoStatus, setGeoStatus] = useState("");

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (typeFilter && typeFilter !== "All") params.type = typeFilter;
      if (specQuery.trim()) params.specialization = specQuery.trim();
      if (cityFilter.trim()) params.city = cityFilter.trim();

      if (useNearby && coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        params.maxDist = maxDist[0];
      }

      const { response, data } = await getProfessionalDirectory(params);
      if (response.ok) {
        setProfiles(data?.data?.profiles || []);
      } else {
        setError(data?.error?.message || "We could not load the professional directory.");
      }
    } catch {
      setError("Network error. We could not reach Lumina.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, specQuery, cityFilter, useNearby, coords, maxDist]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDirectory();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadDirectory]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by your browser. Using Bhubaneswar default.");
      setCoords(DEFAULT_COORDS);
      setUseNearby(true);
      return;
    }

    setGeoStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
        setGeoStatus(`Using current coordinates (${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E)`);
        setUseNearby(true);
      },
      () => {
        setGeoStatus("Location access denied. Using Bhubaneswar default coordinates.");
        setCoords(DEFAULT_COORDS);
        setUseNearby(true);
      },
      { timeout: 8000 }
    );
  };

  const handleResetFilters = () => {
    setTypeFilter("All");
    setSpecQuery("");
    setCityFilter("");
    setUseNearby(false);
    setMaxDist([15]);
    setCoords(DEFAULT_COORDS);
    setGeoStatus("");
  };

  const openProfile = async (id) => {
    setError("");
    try {
      const { response, data } = await getProfessionalProfile(id);
      if (response.ok) {
        setSelected(data.data.profile);
      } else {
        setError(data?.error?.message || "We could not load that professional profile.");
      }
    } catch {
      setError("We could not reach Lumina. Please try again.");
    }
  };

  const hasActiveFilters = typeFilter !== "All" || specQuery || cityFilter || useNearby;

  return (
    <div className="space-y-6">
      {/* Search and Geospatial Filter Controls */}
      <Card className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Search Specialists</h2>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                data-testid="clear-filters"
                onClick={handleResetFilters}
                className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Professional Type Filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Professional Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="filter-type" className="rounded-xl">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  {PROF_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialization Search */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Specialization / Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  data-testid="filter-specialization"
                  placeholder="e.g. AAC, Sensory, IEP..."
                  value={specQuery}
                  onChange={(e) => setSpecQuery(e.target.value)}
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            {/* City or District */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                City / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  data-testid="filter-city"
                  placeholder="e.g. Bhubaneswar, Cuttack..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="rounded-xl pl-9"
                />
              </div>
            </div>
          </div>

          {/* Geospatial 2dsphere Nearby Search Section */}
          <div className="mt-2 rounded-2xl border bg-muted/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={useNearby ? "default" : "outline"}
                  data-testid="filter-nearby"
                  onClick={() => {
                    if (!useNearby) {
                      setUseNearby(true);
                      if (!geoStatus) {
                        setGeoStatus(`Using default coordinates (${coords.lat}°N, ${coords.lng}°E)`);
                      }
                    } else {
                      setUseNearby(false);
                    }
                  }}
                  className="rounded-full text-xs font-semibold"
                >
                  <Navigation className="mr-1.5 h-3.5 w-3.5" />
                  {useNearby ? "Nearby Search Active" : "Find Nearby Specialists"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleDetectLocation}
                  className="rounded-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Detect My Location
                </Button>
              </div>

              {useNearby && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Radius: <strong className="text-foreground">{maxDist[0]} km</strong>
                  </span>
                  <div className="w-36">
                    <Slider
                      data-testid="filter-distance"
                      value={maxDist}
                      onValueChange={setMaxDist}
                      min={1}
                      max={50}
                      step={1}
                    />
                  </div>
                </div>
              )}
            </div>

            {geoStatus && (
              <p className="mt-2 text-xs text-muted-foreground">{geoStatus}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <div
          className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadDirectory} className="rounded-full">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try Again
          </Button>
        </div>
      )}

      {/* Results Section */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="flex flex-col rounded-2xl p-5 shadow-sm">
              <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-12 w-full animate-pulse rounded bg-muted" />
              <div className="mt-4 h-9 w-full animate-pulse rounded-full bg-muted" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              data-testid={`professional-${profile.id}`}
              className="flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {initials(profile.name)}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-foreground">{profile.name}</h3>
                        {profile.isVerified && (
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-600"
                            title="Verified Specialist"
                          />
                        )}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {profile.professionalType}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-current" /> {profile.rating || "4.9"}
                  </span>
                </div>

                {profile.specialization && (
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className="rounded-full border-amber-300 bg-amber-50 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      {profile.specialization}
                    </Badge>
                  </div>
                )}

                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {profile.bio}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {profile.city}
                    </span>
                    {profile.distance !== null && profile.distance !== undefined && (
                      <Badge variant="secondary" className="rounded-full text-[11px] font-semibold">
                        📍 {profile.distance} km away
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {profile.yearsExperience} years experience
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.isArray(profile.languages) &&
                    profile.languages.map((language) => (
                      <Badge key={language} variant="outline" className="rounded-full text-[11px]">
                        {language}
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
                <span className="text-xs font-medium text-foreground">
                  {availabilityLabels[profile.availability] || profile.availability}
                </span>
                <Button
                  data-testid={`view-profile-${profile.id}`}
                  className="rounded-full text-xs font-semibold"
                  variant="outline"
                  size="sm"
                  onClick={() => openProfile(profile.id)}
                >
                  View profile
                </Button>
              </div>
            </Card>
          ))}

          {!profiles.length && (
            <Card className="rounded-3xl border-dashed p-10 text-center text-muted-foreground sm:col-span-2">
              <Compass className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-bold text-foreground">No specialists found</h3>
              <p className="mt-1 text-sm">
                No verified professionals matched your current filter criteria.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-4 rounded-full"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Clear All Filters
                </Button>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Profile Detail Modal */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold">{selected.name}</DialogTitle>
                  {selected.isVerified && (
                    <Badge variant="secondary" className="rounded-full text-xs text-emerald-700">
                      Verified
                    </Badge>
                  )}
                </div>
                <DialogDescription>
                  {selected.professionalType} · {selected.city}
                  {selected.distance !== null && selected.distance !== undefined
                    ? ` (${selected.distance} km away)`
                    : ""}
                </DialogDescription>
              </DialogHeader>

              {selected.specialization && (
                <div>
                  <Badge variant="outline" className="rounded-full text-xs">
                    Specialization: {selected.specialization}
                  </Badge>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-1">About Clinical Practice</h4>
                <p className="text-sm leading-6 text-muted-foreground">{selected.bio}</p>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2 rounded-2xl bg-muted/40 p-4">
                <span className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  {selected.yearsExperience} years clinical practice
                </span>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {availabilityLabels[selected.availability] || selected.availability}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Languages Spoken</h4>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(selected.languages) &&
                    selected.languages.map((language) => (
                      <Badge key={language} variant="outline" className="rounded-full">
                        <Languages className="mr-1 h-3 w-3" />
                        {language}
                      </Badge>
                    ))}
                </div>
              </div>

              {selected.availability !== "not_accepting" && (
                <Button
                  className="w-full rounded-full mt-4"
                  onClick={() => {
                    setSelected(null);
                    navigate("/support");
                  }}
                >
                  <CalendarClock className="mr-2 h-4 w-4" /> Book Consultation with {selected.name}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TherapistProfile() {
  const { csrfToken } = useApp();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfessionalProfile()
      .then(({ response, data }) => {
        if (response.ok && data?.data?.profile) {
          setProfile(data.data.profile);
          setForm(profileToForm(data.data.profile));
        } else if (response.status !== 404) {
          setError(data?.error?.message || "We could not load your profile.");
        }
      })
      .catch(() => setError("We could not reach Lumina. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const action = profile ? updateProfessionalProfile : createProfessionalProfile;
      const { response, data } = await action(profilePayload(form), csrfToken);
      if (response.ok && data?.data?.profile) {
        setProfile(data.data.profile);
        setForm(profileToForm(data.data.profile));
        setMessage(
          profile
            ? "Your professional profile has been updated."
            : "Your professional profile has been created."
        );
      } else {
        const details = data?.error?.details;
        setError(
          Array.isArray(details)
            ? details.join(" ")
            : data?.error?.message || "We could not save your profile."
        );
      }
    } catch {
      setError("We could not reach Lumina. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl p-8 text-center text-muted-foreground">
        Loading your professional profile…
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl p-5 sm:p-6">
      <h2 className="text-xl font-bold">
        {profile ? "Update your professional profile" : "Create your professional profile"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Only parents can browse published professional profiles.
      </p>
      <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
        {error && (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-primary/30 bg-accent p-3 text-sm" role="status">
            {message}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="professional-type">
              Professional type
            </label>
            <Input
              id="professional-type"
              placeholder="e.g. Speech Therapist"
              value={form.professionalType}
              onChange={(event) => setForm({ ...form, professionalType: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="professional-specialization">
              Clinical Specialization
            </label>
            <Input
              id="professional-specialization"
              placeholder="e.g. Early Language & AAC, Sensory Integration"
              value={form.specialization}
              onChange={(event) => setForm({ ...form, specialization: event.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="professional-city">
              City / Practice Location
            </label>
            <Input
              id="professional-city"
              placeholder="e.g. Bhubaneswar"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="professional-languages">
              Languages
            </label>
            <Input
              id="professional-languages"
              placeholder="English, Odia, Hindi"
              value={form.languages}
              onChange={(event) => setForm({ ...form, languages: event.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="professional-bio">
            About your practice
          </label>
          <Textarea
            id="professional-bio"
            value={form.bio}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="professional-experience">
              Years of experience
            </label>
            <Input
              id="professional-experience"
              type="number"
              min="0"
              max="60"
              value={form.yearsExperience}
              onChange={(event) => setForm({ ...form, yearsExperience: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="professional-availability">
              Availability
            </label>
            <select
              id="professional-availability"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={form.availability}
              onChange={(event) => setForm({ ...form, availability: event.target.value })}
            >
              {Object.entries(availabilityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" disabled={submitting} className="rounded-full">
          {submitting ? "Saving…" : profile ? "Save changes" : "Create profile"}
        </Button>
      </form>
    </Card>
  );
}

export default function ProfessionalDirectory() {
  const { user } = useApp();
  const isParent = user?.role === "parent";
  const isTherapist = user?.role === "therapist";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Professional Directory"
        subtitle={
          isParent
            ? "Browse verified specialists with clinical experience in neurodevelopmental care."
            : "Manage your clinical practice listing for parent discovery."
        }
        icon={Compass}
        color="#5E8B7E"
      />
      {/* <PillarBanner
        title="Professional support"
        subtitle="Profiles are verified by Lumina and visible to authenticated parents."
        icon={Compass}
        color="#5E8B7E"
      /> */}
      {isParent ? (
        <ParentDirectory />
      ) : isTherapist ? (
        <TherapistProfile />
      ) : (
        <Card className="rounded-2xl p-8 text-center text-muted-foreground">
          The professional directory is available to parent and specialist accounts.
        </Card>
      )}
    </div>
  );
}
