import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Mail, Phone, Paperclip, X, Loader2, Send, BookOpen, FileQuestion } from "lucide-react";

interface CAUSupportFormProps {
  courseId: string;
  supportEmail?: string;
  supportPhone?: string;
}

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

export function CAUSupportForm({ courseId, supportEmail, supportPhone }: CAUSupportFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Campos requeridos", description: "Completa el asunto y el mensaje", variant: "destructive" });
      return;
    }
    if (attachment && attachment.size > MAX_BYTES) {
      toast({ title: "Archivo demasiado grande", description: "Máximo 25 MB", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      let metadata: Record<string, any> = { channel: "CAU", support_email: supportEmail || null };

      if (attachment) {
        const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user!.id}/cau/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("student-documents")
          .upload(path, attachment, { upsert: false, contentType: attachment.type });
        if (upErr) throw upErr;
        metadata.attachment = {
          path,
          name: attachment.name,
          size: attachment.size,
          type: attachment.type,
        };
      }

      const { error } = await supabase.from("communications").insert({
        sender_id: user!.id,
        receiver_id: null,
        course_id: courseId,
        communication_type: "cau_ticket",
        subject: `[CAU] ${subject}`,
        message,
        metadata,
      });
      if (error) throw error;

      toast({
        title: "Consulta enviada",
        description: "El Centro de Atención al Usuario te responderá en un plazo de 0 a 48 horas.",
      });
      setSubject("");
      setMessage("");
      setAttachment(null);
    } catch (err: any) {
      console.error("CAU send error", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="p-4 border-b bg-gradient-to-r from-red-500/10 to-red-500/5">
        <h4 className="font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-red-600" />
          Centro de Atención al Usuario
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          Soporte técnico del Campus Virtual
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => navigate("/campus-guide")}
          >
            <BookOpen className="h-4 w-4 mr-2" /> Visita Virtual
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "faqs");
              window.history.pushState({}, "", url.toString());
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            <FileQuestion className="h-4 w-4 mr-2" /> FAQ
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Antes de plantear tu consulta o incidencia técnica, puedes encontrar
          información sobre el funcionamiento del Campus en la <span className="font-medium text-foreground">visita virtual</span> y
          en las <span className="font-medium text-foreground">preguntas frecuentes</span>.
        </p>

        <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-xs">
          <div className="font-semibold text-foreground">VÍA FORMULARIO WEB:</div>
          <div className="text-muted-foreground">Rellena los siguientes campos y envía tu consulta o incidencia.</div>
          {supportPhone && (
            <>
              <div className="font-semibold text-foreground pt-1">VÍA TELEFÓNICA:</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {supportPhone}
              </div>
            </>
          )}
          {supportEmail && (
            <>
              <div className="font-semibold text-foreground pt-1">VÍA CORREO ELECTRÓNICO:</div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a>
              </div>
            </>
          )}
          <div className="pt-2 text-muted-foreground">
            <span className="font-semibold text-foreground">ATENCIÓN:</span> El plazo de resolución de consultas o
            incidencias oscila entre las 0 y 48 horas.
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cau-subject">Asunto</Label>
          <Input
            id="cau-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto de la consulta"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cau-message">Escriba su mensaje</Label>
          <Textarea
            id="cau-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe tu duda o incidencia con el mayor detalle posible"
            rows={5}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cau-attachment" className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" /> Adjuntar archivo (opcional · máx. 25 MB)
          </Label>
          <Input
            id="cau-attachment"
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          />
          {attachment && (
            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-2 py-1 text-xs">
              <span className="truncate">{attachment.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachment(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
