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
import { BookOpen, Plus, Search, User, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface GlossaryEntry {
  id: string;
  course_id: string;
  term: string;
  definition: string;
  created_by: string;
  is_approved: boolean;
  created_at: string;
  author_name?: string;
}

interface CourseGlossaryProps {
  courseId: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

export function CourseGlossary({ courseId, isTeacher = false, isAdmin = false }: CourseGlossaryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const canModerate = isTeacher || isAdmin;

  useEffect(() => {
    loadEntries();
  }, [courseId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("course_glossary")
        .select("*")
        .eq("course_id", courseId)
        .order("term", { ascending: true });

      if (error) throw error;

      const withAuthors = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", entry.created_by)
            .single();
          return { ...entry, author_name: profile?.full_name || "Usuario" };
        })
      );

      setEntries(withAuthors);
    } catch (error) {
      console.error("Error loading glossary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTerm.trim() || !newDefinition.trim() || !user) return;
    setCreating(true);
    try {
      const { error } = await (supabase as any).from("course_glossary").insert({
        course_id: courseId,
        term: newTerm.trim(),
        definition: newDefinition.trim(),
        created_by: user.id,
        is_approved: canModerate,
      });
      if (error) throw error;
      toast({ title: "Término añadido", description: canModerate ? "Término publicado en el glosario" : "Término enviado para revisión" });
      setDialogOpen(false);
      setNewTerm("");
      setNewDefinition("");
      loadEntries();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo añadir el término", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await (supabase as any).from("course_glossary").update({ is_approved: true }).eq("id", id);
    if (!error) { toast({ title: "Término aprobado" }); loadEntries(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("course_glossary").delete().eq("id", id);
    if (!error) { toast({ title: "Término eliminado" }); loadEntries(); }
  };

  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  
  const filteredEntries = entries.filter(e => {
    const matchesSearch = !search || e.term.toLowerCase().includes(search.toLowerCase()) || e.definition.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = !selectedLetter || e.term.toUpperCase().startsWith(selectedLetter);
    const isVisible = canModerate || e.is_approved;
    return matchesSearch && matchesLetter && isVisible;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Glosario del Curso
            </CardTitle>
            <CardDescription>Términos y definiciones clave. Los participantes pueden ampliarlo.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Término
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar término..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Alphabet filter */}
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedLetter === null ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={() => setSelectedLetter(null)}
          >
            *
          </Button>
          {alphabet.map(l => (
            <Button
              key={l}
              variant={selectedLetter === l ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => setSelectedLetter(selectedLetter === l ? null : l)}
            >
              {l}
            </Button>
          ))}
        </div>

        {/* Entries */}
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay términos en el glosario</p>
            <p className="text-xs">¡Sé el primero en contribuir!</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-2">
              {filteredEntries.map(entry => (
                <div key={entry.id} className={`p-3 border rounded-lg ${!entry.is_approved ? 'border-amber-300 bg-amber-50/50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{entry.term}</h4>
                        {!entry.is_approved && <Badge variant="outline" className="text-xs">Pendiente</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{entry.definition}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.author_name} · {format(new Date(entry.created_at), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    {canModerate && (
                      <div className="flex gap-1">
                        {!entry.is_approved && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleApprove(entry.id)}>
                            <Edit2 className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(entry.id)}>
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

      {/* New term dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border shadow-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Término del Glosario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Término</label>
              <Input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="Ej: Certificado de Profesionalidad" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Definición</label>
              <Textarea value={newDefinition} onChange={(e) => setNewDefinition(e.target.value)} placeholder="Escribe la definición del término..." rows={4} />
            </div>
            {!canModerate && (
              <p className="text-xs text-muted-foreground">Tu aportación será revisada por el tutor antes de publicarse.</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleCreate} disabled={creating}>{creating ? "Añadiendo..." : "Añadir"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
