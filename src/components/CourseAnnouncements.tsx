import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Bell, Plus, Pin, Trash2, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Announcement {
  id: string;
  course_id: string;
  title: string;
  content: string;
  created_by: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  author_name?: string;
}

interface CourseAnnouncementsProps {
  courseId: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

export function CourseAnnouncements({ courseId, isTeacher = false, isAdmin = false }: CourseAnnouncementsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  const canEdit = isTeacher || isAdmin;

  useEffect(() => { loadAnnouncements(); }, [courseId]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      let query = (supabase as any).from("course_announcements").select("*").eq("course_id", courseId)
        .order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
      if (!canEdit) query = query.eq("is_published", true);
      const { data, error } = await query;
      if (error) throw error;

      const withAuthors = await Promise.all(
        (data || []).map(async (a) => {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", a.created_by).single();
          return { ...a, author_name: profile?.full_name || "Usuario" };
        })
      );
      setAnnouncements(withAuthors);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim() || !user) return;
    setCreating(true);
    try {
      const { error } = await (supabase as any).from("course_announcements").insert({
        course_id: courseId,
        title: newTitle.trim(),
        content: newContent.trim(),
        created_by: user.id,
        is_pinned: false,
        is_published: true,
      });
      if (error) throw error;
      toast({ title: "Anuncio publicado" });
      setDialogOpen(false);
      setNewTitle("");
      setNewContent("");
      loadAnnouncements();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el anuncio", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    await (supabase as any).from("course_announcements").update({ is_pinned: !currentPinned }).eq("id", id);
    loadAnnouncements();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("course_announcements").delete().eq("id", id);
    toast({ title: "Anuncio eliminado" });
    loadAnnouncements();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Tablón de Anuncios
            </CardTitle>
            <CardDescription>Avisos y novedades del curso</CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Anuncio
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay anuncios publicados</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-2">
              {announcements.map(a => (
                <div key={a.id} className={`p-4 border rounded-lg ${a.is_pinned ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {a.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                        <h4 className="font-semibold text-sm">{a.title}</h4>
                        {!a.is_published && <Badge variant="outline" className="text-xs">Borrador</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{a.author_name}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(a.created_at), "d MMM yyyy, HH:mm", { locale: es })}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTogglePin(a.id, a.is_pinned)}>
                          <Pin className={`h-3 w-3 ${a.is_pinned ? 'text-primary' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border shadow-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Anuncio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título del anuncio..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido</label>
              <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Escribe el contenido del anuncio..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleCreate} disabled={creating}>{creating ? "Publicando..." : "Publicar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
