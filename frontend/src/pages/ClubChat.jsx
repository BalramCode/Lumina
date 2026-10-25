import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { COMMUNITY_CIRCLES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Info, Send, Smile, Paperclip, Pin, Flag, LogOut, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function ClubChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const club = COMMUNITY_CIRCLES.find((c) => c.id === id);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (club) {
      setMessages(club.messages || []);
    }
  }, [club]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!club) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Community not found</h2>
        <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate("/connect")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Connect
        </Button>
      </div>
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    const newMsg = {
      id: Date.now(),
      senderRole: "Parent",
      name: "You",
      initials: "Y",
      color: "#5FA07E",
      text: draft.trim(),
      time: "Just now",
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
  };

  const handleAction = (action) => {
    toast.success(action, { description: "This action has been recorded." });
    if (action === "Left community") {
      navigate("/connect");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background md:h-[calc(100vh-6rem)] md:rounded-3xl md:border md:shadow-sm overflow-hidden mx-auto max-w-4xl">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigate("/connect")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-bold sm:text-lg">{club.name}</h1>
            <p className="text-xs text-muted-foreground">{club.members} members • Lumina Community</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setInfoOpen(true)}>
          <Info className="h-5 w-5" />
        </Button>
      </header>

      {/* Announcement */}
      {club.announcement && (
        <div className="flex-shrink-0 border-b bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Pin className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-medium">{club.announcement.replace("📌 ", "")}</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        <div className="text-center">
          <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Welcome to the {club.name}
          </span>
        </div>
        
        {messages.map((m) => {
          const isOwn = m.isOwn || m.name === "You";
          return (
            <div key={m.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-8 w-8 shrink-0 mt-auto">
                <AvatarFallback style={{ backgroundColor: m.color, color: "#fff" }} className="text-xs font-semibold">
                  {m.initials}
                </AvatarFallback>
              </Avatar>
              <div className={`flex max-w-[85%] sm:max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
                {!isOwn && (
                  <div className="mb-1 flex items-baseline gap-2 pl-1">
                    <span className="text-xs font-semibold text-foreground">{m.name}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{m.senderRole}</span>
                  </div>
                )}
                <div
                  className={`relative rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isOwn 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-card border rounded-bl-sm text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] font-medium text-muted-foreground">{m.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Composer */}
      <div className="flex-shrink-0 border-t bg-card p-3">
        <div className="flex items-end gap-2">
          <div className="flex pb-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground">
              <Smile className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hidden sm:flex">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write a message..."
            className="min-h-[44px] rounded-2xl border-muted-foreground/20 bg-muted/50 px-4 focus-visible:ring-1"
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="mb-0.5 h-10 w-10 shrink-0 rounded-full transition-transform active:scale-95"
            disabled={!draft.trim()}
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Info Panel Modal */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>About this community</DialogTitle>
            <DialogDescription>{club.location}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-2">
            <div>
              <p className="text-sm text-foreground">{club.desc}</p>
            </div>

            <div className="rounded-2xl border bg-amber-50 p-4 dark:bg-amber-950/30 dark:border-amber-900/50">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold mb-2 text-sm">
                <ShieldAlert className="h-4 w-4" /> Safety & Privacy
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                Please protect children's privacy. Avoid sharing identifiable personal or medical information in community conversations.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-2">Community Guidelines</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-4">
                <li>Respect every family</li>
                <li>No medical misinformation</li>
                <li>Protect children's privacy</li>
                <li>No harassment or discrimination</li>
                <li>Share experiences, not diagnoses</li>
                <li>Contact qualified professionals for medical concerns</li>
              </ul>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => handleAction("Reported message")}>
                <Flag className="mr-2 h-4 w-4" /> Report a message
              </Button>
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleAction("Left community")}>
                <LogOut className="mr-2 h-4 w-4" /> Leave community
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
