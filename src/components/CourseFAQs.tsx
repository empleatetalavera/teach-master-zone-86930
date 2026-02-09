import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { HelpCircle, Plus, Search, Trash2 } from "lucide-react";

interface FAQ {
  id: string;
  course_id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

interface CourseFAQsProps {
  courseId: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

export function CourseFAQs({ courseId, isTeacher = false, isAdmin = false }: CourseFAQsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);

  const canEdit = isTeacher || isAdmin;

  useEffect(() => { loadFAQs(); }, [courseId]);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      let query = (supabase as any).from("course_faqs").select("*").eq("course_id", courseId).order("order_index");
      if (!canEdit) query = query.eq("is_published", true);
      const { data, error } = await query;
      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error("Error loading FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newQuestion.trim() || !newAnswer.trim() || !user) return;
    setCreating(true);
    try {
      const { error } = await (supabase as any).from("course_faqs").insert({
        course_id: courseId,
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        category: newCategory.trim() || null,
        created_by: user.id,
        is_published: true,
        order_index: faqs.length,
      });
      if (error) throw error;
      toast({ title: "FAQ añadida" });
      setDialogOpen(false);
      setNewQuestion("");
      setNewAnswer("");
      setNewCategory("");
      loadFAQs();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear la FAQ", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("course_faqs").delete().eq("id", id);
    if (!error) { toast({ title: "FAQ eliminada" }); loadFAQs(); }
  };

  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))];
  const filteredFaqs = faqs.filter(f =>
    !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const groupedFaqs = categories.length > 0
    ? categories.map(cat => ({ category: cat!, faqs: filteredFaqs.filter(f => f.category === cat) }))
    : [{ category: "General", faqs: filteredFaqs }];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Preguntas Frecuentes (FAQs)
            </CardTitle>
            <CardDescription>Respuestas a las dudas más comunes del curso</CardDescription>
          </div>
          {canEdit && (
            <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva FAQ
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar en las FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay preguntas frecuentes disponibles</p>
          </div>
        ) : (
          groupedFaqs.map(group => (
            <div key={group.category}>
              {categories.length > 0 && (
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">{group.category}</h3>
              )}
              <Accordion type="multiple" className="w-full">
                {group.faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left text-sm hover:no-underline">
                      <div className="flex items-center gap-2 flex-1">
                        <span>{faq.question}</span>
                        {!faq.is_published && <Badge variant="outline" className="text-xs">Borrador</Badge>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleDelete(faq.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background border shadow-lg">
          <DialogHeader>
            <DialogTitle>Nueva Pregunta Frecuente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pregunta</label>
              <Input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="¿Cómo puedo...?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Respuesta</label>
              <Textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Respuesta detallada..." rows={4} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría (opcional)</label>
              <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Ej: Plataforma, Evaluación, Certificación" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleCreate} disabled={creating}>{creating ? "Creando..." : "Crear FAQ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
