import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Building2, Save } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [originalAssignments, setOriginalAssignments] = useState<Assignment[]>([]);
  const [pendingSelections, setPendingSelections] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (open && course) {
      loadData();
    }
  }, [open, course?.id]);

  const loadData = async () => {
    if (!course) return;
    setLoading(true);
    setHasChanges(false);
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
      setOriginalAssignments(assignmentsRes.data || []);
      
      // Initialize pending selections with currently active assignments
      const activeIds = new Set(
        (assignmentsRes.data || [])
          .filter(a => a.is_active)
          .map(a => a.training_center_id)
      );
      setPendingSelections(activeIds);
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

  const isSelected = (centerId: string): boolean => {
    return pendingSelections.has(centerId);
  };

  const toggleSelection = (centerId: string) => {
    setPendingSelections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(centerId)) {
        newSet.delete(centerId);
      } else {
        newSet.add(centerId);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!course) return;
    setSaving(true);

    try {
      const currentActiveIds = new Set(
        originalAssignments.filter(a => a.is_active).map(a => a.training_center_id)
      );

      // Find centers to activate (in pending but not originally active)
      const toActivate = [...pendingSelections].filter(id => !currentActiveIds.has(id));
      
      // Find centers to deactivate (originally active but not in pending)
      const toDeactivate = [...currentActiveIds].filter(id => !pendingSelections.has(id));

      // Process activations
      for (const centerId of toActivate) {
        const existing = originalAssignments.find(a => a.training_center_id === centerId);
        
        if (existing) {
          // Update existing to active
          const { error } = await supabase
            .from("course_center_assignments")
            .update({ is_active: true })
            .eq("course_id", course.id)
            .eq("training_center_id", centerId);
          if (error) throw error;
        } else {
          // Create new assignment
          const { error } = await supabase
            .from("course_center_assignments")
            .insert({
              course_id: course.id,
              training_center_id: centerId,
              is_active: true,
              assigned_by: user?.id
            });
          if (error) throw error;
        }
      }

      // Process deactivations
      for (const centerId of toDeactivate) {
        const { error } = await supabase
          .from("course_center_assignments")
          .update({ is_active: false })
          .eq("course_id", course.id)
          .eq("training_center_id", centerId);
        if (error) throw error;
      }

      toast({
        title: "Cambios guardados",
        description: `${toActivate.length} activados, ${toDeactivate.length} desactivados`,
      });

      setHasChanges(false);
      onAssignmentChange();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving assignments:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredCenters = centers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    setPendingSelections(new Set(centers.map(c => c.id)));
    setHasChanges(true);
  };

  const handleDeselectAll = () => {
    setPendingSelections(new Set());
    setHasChanges(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-xl">{course?.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            {course?.category && <Badge variant="outline">{course.category}</Badge>}
            {course?.course_type && <Badge variant="secondary">{course.course_type}</Badge>}
            {course?.duration_hours && <span>{course.duration_hours}h</span>}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 mt-6 space-y-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Centros Asignados</span>
              <Badge variant={hasChanges ? "destructive" : "default"}>
                {pendingSelections.size} / {centers.length}
              </Badge>
            </div>
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Sin guardar
              </Badge>
            )}
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
            <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={loading}>
              Seleccionar todos
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll} disabled={loading}>
              Deseleccionar todos
            </Button>
          </div>

          {/* Center list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {filteredCenters.map((center) => {
                  const selected = isSelected(center.id);

                  return (
                    <div
                      key={center.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
                        selected ? "bg-primary/5 border-primary/30" : "border-border"
                      }`}
                      onClick={() => toggleSelection(center.id)}
                    >
                      <Checkbox checked={selected} />
                      <div className="flex-1">
                        <p className="font-medium">{center.name}</p>
                        {center.slug && (
                          <p className="text-xs text-muted-foreground">{center.slug}</p>
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

        <SheetFooter className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}