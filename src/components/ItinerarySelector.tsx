import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sprout, Beef, Leaf, Clock, ArrowRight } from "lucide-react";

interface FormativeUnit {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number | null;
  order_index: number;
}

interface ItinerarySelectorProps {
  moduleId: string;
  formativeUnits: FormativeUnit[];
  onSelected: (selectedUnitId: string) => void;
  selectedUnitId?: string | null;
}

const ITINERARY_ICONS: Record<number, React.ReactNode> = {
  1: <Sprout className="h-8 w-8" />,
  2: <Beef className="h-8 w-8" />,
  3: <Leaf className="h-8 w-8" />,
};

const ITINERARY_COLORS: Record<number, string> = {
  1: "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20",
  2: "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20",
  3: "border-green-300 bg-green-50/50 dark:bg-green-950/20",
};

const ITINERARY_ICON_BG: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  2: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  3: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
};

export function ItinerarySelector({ moduleId, formativeUnits, onSelected, selectedUnitId }: ItinerarySelectorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selection, setSelection] = useState<string | null>(selectedUnitId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadSelection();
  }, [user, moduleId]);

  const loadSelection = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('student_elective_selections')
      .select('formative_unit_id')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .maybeSingle();
    
    if (data) {
      setSelection(data.formative_unit_id);
      onSelected(data.formative_unit_id);
    }
    setLoading(false);
  };

  const handleSelect = async (unitId: string) => {
    if (!user) return;
    setSaving(true);

    try {
      // Upsert selection
      const { error } = await supabase
        .from('student_elective_selections')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          formative_unit_id: unitId,
          selected_at: new Date().toISOString(),
        }, { onConflict: 'user_id,module_id' });

      if (error) throw error;

      setSelection(unitId);
      onSelected(unitId);
      toast({
        title: "Itinerario seleccionado",
        description: `Has elegido: ${formativeUnits.find(u => u.id === unitId)?.title}`,
      });
    } catch (err) {
      console.error('Error saving selection:', err);
      toast({ title: "Error", description: "No se pudo guardar tu selección", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  // If already selected, show compact confirmation
  if (selection) {
    const selectedUnit = formativeUnits.find(u => u.id === selection);
    if (!selectedUnit) return null;

    return (
      <div className="mb-3 p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="font-medium">Itinerario elegido:</span>
          <Badge variant="secondary">{selectedUnit.title}</Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-xs h-7"
            onClick={() => { setSelection(null); }}
          >
            Cambiar
          </Button>
        </div>
      </div>
    );
  }

  // Selection cards
  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-dashed">
        <h4 className="font-semibold text-base mb-1">Elige tu itinerario formativo</h4>
        <p className="text-sm text-muted-foreground">
          Este módulo te permite elegir una especialización. Selecciona el itinerario que mejor se adapte a tus intereses.
        </p>
      </div>

      <div className="grid gap-3">
        {formativeUnits.map((unit, idx) => (
          <Card
            key={unit.id}
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${ITINERARY_COLORS[idx + 1] || 'border-muted'}`}
            onClick={() => !saving && handleSelect(unit.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${ITINERARY_ICON_BG[idx + 1] || 'bg-muted'}`}>
                  {ITINERARY_ICONS[idx + 1] || <Sprout className="h-8 w-8" />}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-sm mb-1">{unit.title}</h5>
                  <p className="text-xs text-muted-foreground mb-2">{unit.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {unit.duration_hours || 50} horas
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1 shrink-0" disabled={saving}>
                  Elegir <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
