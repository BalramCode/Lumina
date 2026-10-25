import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PageHeader, PillarBanner } from "@/components/shared";
import { CARE_CIRCLE, CARE_CHAT, COMMUNITY_CIRCLES, FORUM_CATEGORIES, FORUM_POSTS, PEERS } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, HeartHandshake, Send, MessageSquarePlus, Check, Target, MessagesSquare } from "lucide-react";

export default function Connect() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(CARE_CHAT);
  const [draft, setDraft] = useState("");
  const [joined, setJoined] = useState({});
  const [connected, setConnected] = useState({});
  const [posts, setPosts] = useState(FORUM_POSTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), sender: "Parent", name: "Priya Sharma", initials: "PS", color: "#E08A6E", text: draft.trim(), time: "Now" }]);
    setDraft("");
  };

  const submitPost = () => {
    if (!newPost.title.trim()) { toast.error("Please add a title"); return; }
    setPosts((p) => [
      { id: Date.now(), name: "Priya Sharma", initials: "PS", color: "#E08A6E", title: newPost.title, category: "Parenting", tags: newPost.tags.split(",").map((s) => s.trim()).filter(Boolean), replies: 0, time: "Just now" },
      ...p,
    ]);
    setNewPost({ title: "", content: "", tags: "" });
    setModalOpen(false);
    toast.success("Post published", { description: "Your discussion is now live in the community forum." });
  };

  return (
    <div className="space-y-10">
      <PageHeader title={t("connect.title")} subtitle={t("connect.subtitle")} icon={Users} color="#E08A6E" />

      <PillarBanner
        title="Breaking the Chains of Isolation"
        subtitle="Find people who understand your journey."
        icon={HeartHandshake}
        color="#E08A6E"
      />

      {/* Caregiver Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#E08A6E", lineHeight: 1.2 }}>
            Supporting the child also means supporting the person who cares for them.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Caregivers need care too. Connect with others who understand the journey, share resources, and find resilience together.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border">
          <img
            src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=1200&auto=format&fit=crop"
            alt="Parent receiving support and connecting with others, showing resilience and dignity"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
      </section>

      {/* Care Circle + Chat */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl p-6 lg:col-span-2" data-testid="care-circle">
          <h2 className="text-xl font-bold">{CARE_CIRCLE.name}</h2>
          <div className="mt-4 flex -space-x-2">
            {CARE_CIRCLE.members.map((m) => (
              <Avatar key={m.name} className="h-10 w-10 border-2 border-card">
                <AvatarFallback style={{ backgroundColor: m.color, color: "#fff" }}>{m.initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            {CARE_CIRCLE.members.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground">{m.role}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-accent p-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4" /> Shared goal</div>
            <p className="mt-1 text-sm text-muted-foreground">{CARE_CIRCLE.goal}</p>
            <Progress value={CARE_CIRCLE.progress} className="mt-3 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{CARE_CIRCLE.progress}% towards this goal</p>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold">Recent updates</p>
            <ul className="mt-2 space-y-2">
              {CARE_CIRCLE.updates.map((u, i) => (
                <li key={i} className="rounded-lg bg-muted p-2 text-sm text-muted-foreground">{u}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Chat */}
        <Card className="flex flex-col rounded-2xl lg:col-span-3" data-testid="care-chat">
          <div className="border-b p-4">
            <h3 className="font-bold">Care Circle chat</h3>
            <p className="text-xs text-muted-foreground">Parent · Therapist · Educator · Teacher</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: 360 }}>
            {messages.map((m) => {
              const mine = m.sender === "Parent";
              return (
                <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback style={{ backgroundColor: m.color, color: "#fff" }} className="text-xs">{m.initials}</AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className={`text-xs font-semibold ${mine ? "opacity-90" : "text-muted-foreground"}`}>{m.name} · {m.sender}</p>
                    <p className="mt-0.5 text-sm">{m.text}</p>
                    <p className={`mt-1 text-[10px] ${mine ? "opacity-80" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 border-t p-3">
            <Input
              data-testid="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Write a message…"
              className="h-11 rounded-full"
            />
            <Button data-testid="chat-send" onClick={sendMessage} size="icon" className="h-11 w-11 shrink-0 rounded-full">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Lumina Clubs Visual */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1 relative overflow-hidden rounded-3xl border">
          <img
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop"
            alt="A warm community activity involving children, caregivers, and facilitators in a safe, sensory-friendly space"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#E08A6E", lineHeight: 1.2 }}>
            From isolated care to shared community.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Lumina Clubs bring children, families, professionals, and peers together in safe, sensory-friendly community spaces.
          </p>
        </div>
      </section>

      {/* Community Circles */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Lumina Clubs (Local Communities)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMMUNITY_CIRCLES.map((c) => (
            <Card key={c.id} data-testid={`circle-${c.id}`} className="flex flex-col rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{c.name}</h3>
                <span className="text-xs text-muted-foreground">{c.members} members</span>
              </div>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">💬 {c.recent}</p>
              {joined[c.id] ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button variant="secondary" className="w-full rounded-full pointer-events-none opacity-80">
                    <Check className="mr-1 h-4 w-4" /> Joined
                  </Button>
                  <Button variant="default" className="w-full rounded-full" onClick={() => navigate(`/connect/club/${c.id}`)}>
                    Open Community
                  </Button>
                </div>
              ) : (
                <Button
                  data-testid={`join-${c.id}`}
                  onClick={() => { setJoined((j) => ({ ...j, [c.id]: true })); toast.success(`Joined ${c.name}`); }}
                  className="mt-4 w-full rounded-full"
                >
                  Join
                </Button>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Community Forum */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Community Forum</h2>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-post-btn" className="rounded-full">
                <MessageSquarePlus className="mr-1 h-4 w-4" /> Create Post
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="create-post-modal">
              <DialogHeader>
                <DialogTitle>Create a post</DialogTitle>
                <DialogDescription>Share a question or story with the community forum.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Title</label>
                  <Input data-testid="post-title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} placeholder="What would you like to ask or share?" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Content</label>
                  <Textarea data-testid="post-content" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} placeholder="Add more details…" rows={4} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Tags (comma separated)</label>
                  <Input data-testid="post-tags" value={newPost.tags} onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })} placeholder="routines, sensory" />
                </div>
              </div>
              <DialogFooter>
                <Button data-testid="post-submit" onClick={submitPost} className="rounded-full">Publish post</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FORUM_CATEGORIES.map((c) => (
            <Badge key={c} variant="outline" className="rounded-full">{c}</Badge>
          ))}
        </div>

        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} data-testid={`forum-post-${p.id}`} className="flex items-start gap-4 rounded-2xl p-4">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback style={{ backgroundColor: p.color, color: "#fff" }}>{p.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-xs text-muted-foreground">· {p.time}</span>
                  <Badge variant="secondary" className="rounded-full text-xs">{p.category}</Badge>
                </div>
                <h3 className="mt-1 font-medium">{p.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {p.tags.map((tg) => <span key={tg} className="text-xs text-primary">#{tg}</span>)}
                  <span className="ml-auto text-xs text-muted-foreground">{p.replies} replies</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Community Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "#E08A6E", lineHeight: 1.2 }}>
            Inclusion begins when communities learn to belong together.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Autistic and neurotypical children participating, playing, and learning side-by-side. Genuine participation means everyone belongs.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border">
          <img
            src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1200&auto=format&fit=crop"
            alt="Autistic and neurotypical children participating together in an activity"
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>
      </section>

      {/* Peer Connections */}
      <section>
        <h2 className="text-xl font-bold">People who understand your journey</h2>
        <p className="mt-1 text-muted-foreground">Peer connections with parents and mentors.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PEERS.map((p) => (
            <Card key={p.id} data-testid={`peer-${p.id}`} className="flex flex-col items-center rounded-2xl p-6 text-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback style={{ backgroundColor: p.color, color: "#fff" }} className="text-lg">{p.initials}</AvatarFallback>
              </Avatar>
              <h3 className="mt-3 font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {p.langs.map((l) => <Badge key={l} variant="outline" className="rounded-full text-xs">{l}</Badge>)}
              </div>
              <Button
                data-testid={`connect-peer-${p.id}`}
                variant={connected[p.id] ? "secondary" : "default"}
                onClick={() => { if (!connected[p.id]) { setConnected((c) => ({ ...c, [p.id]: true })); toast.success("Connection requested"); } }}
                className="mt-4 w-full rounded-full"
              >
                {connected[p.id] ? <><Check className="mr-1 h-4 w-4" /> Connection Requested</> : "Connect"}
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
