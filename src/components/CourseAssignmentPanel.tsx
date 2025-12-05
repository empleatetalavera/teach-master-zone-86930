import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Building2, Check, X } from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string | null;
  course_type: string | null;
  duration_hours: number | null;
}

interface TrainingCenter {
  id: string;
  name: string;
  slug: string | null;
}

interface Assignment {
  course_id: string;
  training_center_id: string;
  is_active: boolean;
}

interface CourseAssignmentPanelProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentChange: () => void;
}

export default function CourseAssignmentPanel({ 
  course, 
  open, 
  onOpenChange,
  onAssignmentChange 
}: CourseAssignmentPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open && course) {
      loadData();
    }
  }, [open, course?.id]);

  const loadData = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const [centersRes, assignmentsRes] = await Promise.all([
        supabase
          .from("training_centers")
          .select("id, name, slug")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("course_center_assignments")
          .select("course_id, training_center_id, is_active")
          .eq("course_id", course.id)
      ]);

      if (centersRes.error) throw centersRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      setCenters(centersRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (centerId: string): boolean => {
    return assignments.some(a => 
      a.training_center_id === centerId && a.is_active
    );
  };

  const toggleAssignment = async (centerId: string) => {
    if (!course) return;
    setSaving(centerId);

    try {
      const existing = assignments.find(a => 
        a.training_center_id === centerId
      );

      if (existing) {
        const { error } = await supabase
          .from("course_center_assignments")
          .update({ is_active: !existing.is_active })
          .eq("course_id", course.id)
          .eq("training_center_id", centerId);

        if (error) throw error;

        setAssignments(prev => prev.map(a => 
          a.training_center_id === centerId
            ? { ...a, is_active: !a.is_active }
            : a
        ));
      } else {
        const { error } = await supabase
          .from("course_center_assignments")
          .insert({
            course_id: course.id,
            training_center_id: centerId,
            is_active: true,
            assigned_by: user?.id
          });

        if (error) throw error;

        setAssignments(prev => [...prev, {
          course_id: course.id,
          training_center_id: centerId,
          is_active: true
        }]);
      }

      onAssignmentChange();
      toast({
        title: "Asignación actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error: any) {
      console.error("Error toggling assignment:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const filteredCenters = centers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assignedCount = assignments.filter(a => a.is_active).length;

  const handleSelectAll = async () => {
    if (!course) return;
    const unassignedCenters = centers.filter(c => !isAssigned(c.id));
    
    for (const center of unassignedCenters) {
      await toggleAssignment(center.id);
    }
  };

  const handleDeselectAll = async () => {
    if (!course) return;
    const assignedCenters = centers.filter(c => isAssigned(c.id));
    
    for (const center of assignedCenters) {
      await toggleAssignment(center.id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-xl">{course?.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            {course?.category && <Badge variant="outline">{course.category}</Badge>}
            {course?.course_type && <Badge variant="secondary">{course.course_type}</Badge>}
            {course?.duration_hours && <span>{course.duration_hours}h</span>}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Centros Asignados</span>
              <Badge>{assignedCount} / {centers.length}</Badge>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar centro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              disabled={loading}
            >
              Seleccionar todos
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeselectAll}
              disabled={loading}
            >
              Deseleccionar todos
            </Button>
          </div>

          {/* Center list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2 pr-4">
                {filteredCenters.map((center) => {
                  const assigned = isAssigned(center.id);
                  const isSaving = saving === center.id;

                  return (
                    <div
                      key={center.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                        assigned ? "bg-primary/5 border-primary/30" : "border-border"
                      }`}
                      onClick={() => !isSaving && toggleAssignment(center.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={assigned} 
                          disabled={isSaving}
                          onCheckedChange={() => toggleAssignment(center.id)}
                        />
                        <div>
                          <p className="font-medium">{center.name}</p>
                          {center.slug && (
                            <p className="text-xs text-muted-foreground">{center.slug}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : assigned ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredCenters.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No se encontraron centros
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}