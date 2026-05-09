import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Mail, Phone, Paperclip, X, Loader2, Send, AlertCircle } from "lucide-react";

interface CAUSupportFormProps {
  courseId: string;
  courseTitle?: string;
  supportEmail?: string;
  supportPhone?: string;
}

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

export function CAUSupportForm({ courseId, courseTitle, supportEmail, supportPhone }: CAUSupportFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
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
      let attachmentInfo: { path: string; name: string; size: number; type: string; url?: string } | null = null;

      if (attachment) {
        const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user!.id}/cau/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("student-documents")
          .upload(path, attachment, { upsert: false, contentType: attachment.type });
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage
          .from("student-documents")
          .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 días
        attachmentInfo = {
          path,
          name: attachment.name,
          size: attachment.size,
          type: attachment.type,
          url: signed?.signedUrl,
        };
      }

      const metadata: Record<string, any> = {
        channel: "CAU",
        support_email: supportEmail || null,
        attachment: attachmentInfo,
      };

      // 1) Registrar en BBDD (siempre queda traza)
      const { data: comm, error } = await supabase.from("communications").insert([{
        sender_id: user!.id,
        course_id: courseId,
        communication_type: "message",
        subject: `[CAU] ${subject}`,
        message,
        metadata,
      }]).select("id").single();
      if (error) throw error;

      // 2) Intentar envío de email real al CAU del centro (requiere infraestructura email)
      let emailSent = false;
      if (supportEmail) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, username")
            .eq("id", user!.id)
            .maybeSingle();
          const studentName = profile?.full_name || profile?.username || user!.email || "Alumno/a";

          const { error: fnErr } = await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "cau-support-message",
              recipientEmail: supportEmail,
              idempotencyKey: `cau-${comm.id}`,
              templateData: {
                studentName,
                studentEmail: user!.email,
                courseTitle: courseTitle || "Curso",
                subject,
                message,
                attachmentUrl: attachmentInfo?.url,
                attachmentName: attachmentInfo?.name,
              },
            },
          });
          if (!fnErr) emailSent = true;
        } catch (e) {
          console.warn("[CAU] email send skipped:", e);
        }
      }

      toast({
        title: "Consulta enviada",
        description: emailSent
          ? "Tu mensaje ha sido enviado al CAU. Te responderán en un plazo de 0 a 48 horas."
          : "Tu mensaje queda registrado. El CAU te responderá en un plazo de 0 a 48 horas.",
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
    <div className="max-h-[80vh] overflow-y-auto">
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
          {supportEmail ? (
            <>
              <div className="font-semibold text-foreground pt-1">VÍA CORREO ELECTRÓNICO:</div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">{supportEmail}</a>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 pt-1 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>El centro aún no ha configurado un email de soporte. Tu mensaje quedará registrado en la plataforma.</span>
            </div>
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
            rows={6}
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
            Enviar consulta
          </Button>
        </div>
      </div>
    </div>
  );
}
