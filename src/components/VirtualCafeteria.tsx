import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Coffee, Send, User, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CafeteriaMessage {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  author_name?: string;
}

interface VirtualCafeteriaProps {
  courseId: string;
}

export function VirtualCafeteria({ courseId }: VirtualCafeteriaProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CafeteriaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { loadMessages(); }, [courseId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Use forum_topics with a special prefix for cafeteria messages
      const { data, error } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("course_id", courseId)
        .like("title", "[CAFETERIA]%")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const withAuthors = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", msg.created_by).single();
          return {
            id: msg.id,
            content: msg.content,
            created_by: msg.created_by,
            created_at: msg.created_at,
            author_name: profile?.full_name || "Usuario",
          };
        })
      );
      setMessages(withAuthors);
    } catch (error) {
      console.error("Error loading cafeteria:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setSending(true);
    try {
      const { error } = await supabase.from("forum_topics").insert({
        course_id: courseId,
        title: `[CAFETERIA] ${newMessage.trim().substring(0, 50)}`,
        content: newMessage.trim(),
        created_by: user.id,
        is_pinned: false,
        is_locked: false,
        views_count: 0,
      });
      if (error) throw error;
      setNewMessage("");
      loadMessages();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-amber-600" />
          Cafetería Virtual
        </CardTitle>
        <CardDescription>
          Espacio de interacción libre entre participantes. ¡Conversa, comparte y socializa!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Escribe un mensaje informal... ☕"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="sm" className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">La cafetería está vacía</p>
            <p className="text-xs">¡Sé el primero en iniciar una conversación!</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[350px]">
            <div className="space-y-3 pr-2">
              {messages.map(msg => (
                <div key={msg.id} className="p-3 border rounded-lg bg-amber-50/30 dark:bg-amber-950/10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{msg.author_name}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(msg.created_at), "d MMM, HH:mm", { locale: es })}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
          Este es un espacio informal de libre participación. Respeta las normas de convivencia del curso.
        </div>
      </CardContent>
    </Card>
  );
}
