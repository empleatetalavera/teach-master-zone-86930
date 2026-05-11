import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Loader2 } from "lucide-react";

interface Contact {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "student" | "teacher";
  online: boolean;
}

interface Props {
  courseId: string;
  tutorId?: string | null;
}

const ONLINE_THRESHOLD_MIN = 10;

export function CourseContactsCard({ courseId, tutorId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!open) return;
    void loadContacts();
  }, [open, courseId, tutorId]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data: enrolls } = await supabase
        .from("enrollments")
        .select("user_id, enrollment_role")
        .eq("course_id", courseId);

      const ids = Array.from(new Set([...(enrolls?.map((e: any) => e.user_id) ?? []), tutorId].filter(Boolean))) as string[];
      if (ids.length === 0) {
        setContacts([]);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, last_seen_at")
        .in("id", ids);

      const now = Date.now();
      const built: Contact[] = (profiles || []).map((p: any) => {
        const isTutor = p.id === tutorId || enrolls?.find((e: any) => e.user_id === p.id)?.enrollment_role === "teacher";
        const lastSeen = p.last_seen_at ? new Date(p.last_seen_at).getTime() : 0;
        const online = lastSeen > 0 && (now - lastSeen) / 60000 < ONLINE_THRESHOLD_MIN;
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          role: isTutor ? "teacher" : "student",
          online,
        };
      });

      built.sort((a, b) => {
        if (a.role !== b.role) return a.role === "teacher" ? -1 : 1;
        return (a.full_name || "").localeCompare(b.full_name || "");
      });
      setContacts(built);
    } finally {
      setLoading(false);
    }
  };

  const initials = (name: string | null) =>
    (name || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Mis Contactos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground">
          En este icono tendrás acceso al listado de <strong>alumnos matriculados</strong> en este curso, así como al resto del <strong>equipo de docentes</strong>.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Podrás identificar quién está conectado en este momento mediante un punto verde junto a su nombre.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Ver mis contactos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Contactos de mi grupo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 pt-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No hay contactos disponibles para este curso.
                </p>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">{initials(c.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{c.full_name || "Sin nombre"}</p>
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${c.online ? "bg-green-500" : "bg-red-500"}`}
                          title={c.online ? "Conectado" : "Desconectado"}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={c.role === "teacher" ? "default" : "secondary"} className="text-[10px] py-0 px-1.5">
                          {c.role === "teacher" ? "Tutor-Formador" : "Alumno"}
                        </Badge>
                        {c.email && (
                          <span className="text-xs text-muted-foreground truncate">{c.email}</span>
                        )}
                      </div>
                    </div>
                    {c.email && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        asChild
                      >
                        <a href={`mailto:${c.email}`} title="Enviar email">
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
