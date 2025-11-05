import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, MessageSquare, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TutorMessagingProps {
  courseId: string;
  tutorId?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export function TutorMessaging({ courseId, tutorId, supportEmail, supportPhone }: TutorMessagingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [tutorProfile, setTutorProfile] = useState<any>(null);

  useEffect(() => {
    if (tutorId) {
      loadTutorProfile();
    }
    loadMessages();
  }, [tutorId, courseId]);

  const loadTutorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, phone")
        .eq("id", tutorId)
        .single();

      if (error) throw error;
      setTutorProfile(data);
    } catch (error) {
      console.error("Error loading tutor profile:", error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("communications")
        .select(`
          *,
          sender:profiles!communications_sender_id_fkey(full_name, avatar_url),
          receiver:profiles!communications_receiver_id_fkey(full_name, avatar_url)
        `)
        .eq("course_id", courseId)
        .eq("sender_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa el asunto y el mensaje",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from("communications")
        .insert({
          sender_id: user!.id,
          receiver_id: tutorId || null,
          course_id: courseId,
          communication_type: "message",
          subject,
          message,
        });

      if (error) throw error;

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado al tutor",
      });

      setSubject("");
      setMessage("");
      loadMessages();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Atención al Alumno
          </CardTitle>
          <CardDescription>
            Contacta con tu tutor o el equipo de soporte del curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tutorProfile && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              {tutorProfile.avatar_url ? (
                <img
                  src={tutorProfile.avatar_url}
                  alt={tutorProfile.full_name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">
                    {tutorProfile.full_name?.[0] || "T"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold">{tutorProfile.full_name || "Tutor del Curso"}</p>
                <p className="text-sm text-muted-foreground">Tutor asignado</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {supportEmail && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a 
                    href={`mailto:${supportEmail}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>
            )}

            {supportPhone && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <a 
                    href={`tel:${supportPhone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {supportPhone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensaje al Tutor</CardTitle>
          <CardDescription>
            Tu tutor responderá a la brevedad posible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje..."
                disabled={sending}
              />
            </div>

            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                disabled={sending}
              />
            </div>

            <Button type="submit" disabled={sending} className="w-full">
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensajes Anteriores</CardTitle>
          <CardDescription>
            Historial de comunicaciones con el tutor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay mensajes anteriores
            </p>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <Card key={msg.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString("es-ES")}
                        </p>
                      </div>
                      <Badge variant={msg.is_read ? "outline" : "default"}>
                        {msg.is_read ? "Leído" : "Enviado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
