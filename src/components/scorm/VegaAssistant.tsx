/**
 * Floating AI assistant ("Vega") for the SCORM Pro Player.
 * Streams responses from the existing `ai-assistant` edge function (Lovable AI Gateway).
 */
import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, RefreshCw, HelpCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

interface VegaAssistantProps {
  open: boolean;
  onClose: () => void;
  courseTitle?: string;
  moduleTitle?: string;
  lessonTitle?: string;
}

export default function VegaAssistant({ open, onClose, courseTitle, moduleTitle, lessonTitle }: VegaAssistantProps) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte con esta lección?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const courseInfo = [
        courseTitle && `Curso: ${courseTitle}`,
        moduleTitle && `Módulo: ${moduleTitle}`,
        lessonTitle && `Lección actual: ${lessonTitle}`,
      ].filter(Boolean).join("\n");

      const { data: { session } } = await supabase.auth.getSession();
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          context: { page: "SCORM Player", courseInfo },
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      setMessages(m => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages(m => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch { /* ignore partial */ }
        }
      }
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: `⚠️ Error: ${e?.message ?? "no se pudo contactar al asistente"}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={cn(
      "fixed right-4 bottom-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)]",
      "h-[520px] max-h-[calc(100vh-6rem)] flex flex-col",
      "rounded-2xl border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        <div className="relative">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Pregúntale al asistente</p>
          <p className="text-xs text-muted-foreground truncate">{lessonTitle ?? courseTitle ?? "Asistente IA"}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMessages([{ role: "assistant", content: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte?" }])} aria-label="Reiniciar">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ayuda">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Cerrar">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef as any}>
        <div className="p-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-3 py-2 text-sm flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pensando…
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="border-t p-2 flex items-center gap-2 bg-background"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
