import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Plus, Trash2, Save, X } from "lucide-react";

interface FormativeUnit {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface ModuleFormativeUnitManagerProps {
  moduleId: string;
  moduleTitle: string;
  formativeUnits: FormativeUnit[];
  onUpdate: () => void;
}

export function ModuleFormativeUnitManager({
  moduleId,
  moduleTitle,
  formativeUnits,
  onUpdate
}: ModuleFormativeUnitManagerProps) {
  const { toast } = useToast();
  
  // Module editing state
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editedModuleTitle, setEditedModuleTitle] = useState(moduleTitle);
  const [savingModule, setSavingModule] = useState(false);

  // Unit editing state
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editedUnitTitle, setEditedUnitTitle] = useState("");
  const [savingUnit, setSavingUnit] = useState(false);

  // Add unit dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [addingUnit, setAddingUnit] = useState(false);

  // Delete unit dialog state
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);
  const [deletingUnit, setDeletingUnit] = useState(false);

  // Save module title
  const handleSaveModuleTitle = async () => {
    if (!editedModuleTitle.trim()) {
      toast({ title: "Error", description: "El nombre del módulo no puede estar vacío", variant: "destructive" });
      return;
    }

    setSavingModule(true);
    try {
      const { error } = await supabase
        .from("modules")
        .update({ title: editedModuleTitle.trim() })
        .eq("id", moduleId);

      if (error) throw error;

      toast({ title: "Guardado", description: "Nombre del módulo actualizado" });
      setIsEditingModule(false);
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingModule(false);
    }
  };

  // Start editing a unit
  const startEditingUnit = (unit: FormativeUnit) => {
    setEditingUnitId(unit.id);
    setEditedUnitTitle(unit.title);
  };

  // Save unit title
  const handleSaveUnitTitle = async () => {
    if (!editedUnitTitle.trim()) {
      toast({ title: "Error", description: "El nombre de la unidad no puede estar vacío", variant: "destructive" });
      return;
    }

    setSavingUnit(true);
    try {
      const { error } = await supabase
        .from("formative_units")
        .update({ title: editedUnitTitle.trim() })
        .eq("id", editingUnitId);

      if (error) throw error;

      toast({ title: "Guardado", description: "Nombre de la unidad actualizado" });
      setEditingUnitId(null);
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingUnit(false);
    }
  };

  // Add new unit
  const handleAddUnit = async () => {
    if (!newUnitTitle.trim()) {
      toast({ title: "Error", description: "El nombre de la unidad no puede estar vacío", variant: "destructive" });
      return;
    }

    setAddingUnit(true);
    try {
      const nextOrderIndex = formativeUnits.length > 0 
        ? Math.max(...formativeUnits.map(u => u.order_index)) + 1 
        : 1;

      const { error } = await supabase
        .from("formative_units")
        .insert({
          module_id: moduleId,
          title: newUnitTitle.trim(),
          order_index: nextOrderIndex,
          is_active: true
        });

      if (error) throw error;

      toast({ title: "Creada", description: "Nueva unidad formativa añadida" });
      setShowAddDialog(false);
      setNewUnitTitle("");
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setAddingUnit(false);
    }
  };

  // Delete unit
  const handleDeleteUnit = async () => {
    if (!deleteUnitId) return;

    setDeletingUnit(true);
    try {
      const { error } = await supabase
        .from("formative_units")
        .delete()
        .eq("id", deleteUnitId);

      if (error) throw error;

      toast({ title: "Eliminada", description: "Unidad formativa eliminada" });
      setDeleteUnitId(null);
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeletingUnit(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Module Title Editor */}
      <div className="flex items-center gap-2">
        {isEditingModule ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editedModuleTitle}
              onChange={(e) => setEditedModuleTitle(e.target.value)}
              className="flex-1"
              placeholder="Nombre del módulo"
            />
            <Button size="sm" onClick={handleSaveModuleTitle} disabled={savingModule}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setIsEditingModule(false);
              setEditedModuleTitle(moduleTitle);
            }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditingModule(true)}
          >
            <Edit2 className="h-4 w-4" />
            Editar nombre del módulo
          </Button>
        )}
      </div>

      {/* Formative Units List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Unidades Formativas ({formativeUnits.length})</span>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Añadir UF
          </Button>
        </div>

        <div className="space-y-1">
          {formativeUnits.map((unit, index) => (
            <div 
              key={unit.id} 
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="text-xs font-mono text-muted-foreground w-8">
                UF{index + 1}
              </span>
              
              {editingUnitId === unit.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedUnitTitle}
                    onChange={(e) => setEditedUnitTitle(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="Nombre de la unidad"
                  />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleSaveUnitTitle} disabled={savingUnit}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingUnitId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm truncate">{unit.title}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
                    onClick={() => startEditingUnit(unit)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 opacity-50 hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => setDeleteUnitId(unit.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Unidad Formativa</DialogTitle>
            <DialogDescription>
              Crear una nueva unidad formativa en este módulo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newUnitTitle}
              onChange={(e) => setNewUnitTitle(e.target.value)}
              placeholder="Nombre de la unidad formativa"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUnit} disabled={addingUnit}>
              {addingUnit ? "Añadiendo..." : "Añadir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUnitId} onOpenChange={(open) => !open && setDeleteUnitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar unidad formativa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los contenidos, actividades y evaluaciones asociadas a esta unidad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUnit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingUnit ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
