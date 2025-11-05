import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, MessageSquare, Info, Copy } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  message: string;
  template_type: string;
  is_active: boolean;
  usage_count: number;
}

export default function QuickResponseManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
    template_type: "general",
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const mockVariables = {
    nombre_estudiante: "María García",
    nombre_curso: "Marketing Digital Avanzado",
    progreso: "45",
    dias_inactivo: "5",
    ultimo_acceso: "15 de enero de 2025",
    fecha_actual: new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
  };

  const availableVariables = [
    { key: "{nombre_estudiante}", description: "Nombre completo del estudiante" },
    { key: "{nombre_curso}", description: "Título del curso" },
    { key: "{progreso}", description: "Porcentaje de progreso (número)" },
    { key: "{dias_inactivo}", description: "Días sin acceder al curso" },
    { key: "{ultimo_acceso}", description: "Fecha del último acceso" },
    { key: "{fecha_actual}", description: "Fecha actual" },
  ];

  const conditionalExamples = [
    { 
      syntax: "{if progreso < 20}texto{/if}", 
      description: "Mostrar texto solo si progreso es menor a 20%" 
    },
    { 
      syntax: "{if dias_inactivo > 7}texto{else}alternativo{/if}", 
      description: "Mostrar texto u alternativa según condición" 
    },
    { 
      syntax: "Operadores: <, >, <=, >=, ==, !=", 
      description: "Comparar cualquier variable numérica" 
    },
  ];

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast({
      title: "Copiado",
      description: `Variable ${variable} copiada al portapapeles`,
    });
  };

  const replaceVariables = (text: string) => {
    const variables: Record<string, string> = {};
    Object.entries(mockVariables).forEach(([key, value]) => {
      variables[key] = value.toString();
    });
    
    // First process conditionals
    const conditionalRegex = /\{if\s+(\w+)\s*(==|!=|<=|>=|<|>)\s*(\d+)\}([\s\S]*?)(?:\{else\}([\s\S]*?))?\{\/if\}/g;
    let result = text.replace(conditionalRegex, (match, variable, operator, value, ifContent, elseContent) => {
      const variableValue = parseFloat(variables[variable] || "0");
      const compareValue = parseFloat(value);
      
      let conditionMet = false;
      switch (operator) {
        case ">": conditionMet = variableValue > compareValue; break;
        case "<": conditionMet = variableValue < compareValue; break;
        case ">=": conditionMet = variableValue >= compareValue; break;
        case "<=": conditionMet = variableValue <= compareValue; break;
        case "==": conditionMet = variableValue === compareValue; break;
        case "!=": conditionMet = variableValue !== compareValue; break;
      }
      
      return conditionMet ? ifContent : (elseContent || "");
    });
    
    // Then replace simple variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, value);
    });
    
    return result;
  };

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("quick_response_templates")
        .select("*")
        .eq("user_id", user!.id)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("quick_response_templates")
          .update(formData)
          .eq("id", editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Plantilla actualizada",
          description: "Los cambios se han guardado correctamente",
        });
      } else {
        // Create new template
        const { error } = await supabase.from("quick_response_templates").insert({
          user_id: user!.id,
          ...formData,
        });

        if (error) throw error;

        toast({
          title: "Plantilla creada",
          description: "La nueva plantilla está lista para usar",
        });
      }

      setDialogOpen(false);
      setEditingTemplate(null);
      setFormData({
        name: "",
        subject: "",
        message: "",
        template_type: "general",
      });
      loadTemplates();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      message: template.message,
      template_type: template.template_type,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return;

    try {
      const { error } = await supabase
        .from("quick_response_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se ha eliminado correctamente",
      });
      loadTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (template: Template) => {
    try {
      const { error } = await supabase
        .from("quick_response_templates")
        .update({ is_active: !template.is_active })
        .eq("id", template.id);

      if (error) throw error;
      loadTemplates();
    } catch (error: any) {
      console.error("Error toggling template:", error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      inactive: "Inactividad",
      low_performance: "Bajo Rendimiento",
      encouragement: "Ánimo",
      general: "General",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      inactive: "bg-yellow-500",
      low_performance: "bg-red-500",
      encouragement: "bg-green-500",
      general: "bg-blue-500",
    };
    return colors[type] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Respuestas Rápidas</h1>
          <p className="text-muted-foreground">
            Gestiona plantillas de mensajes para comunicarte eficientemente con tus estudiantes
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setFormData({
                  name: "",
                  subject: "",
                  message: "",
                  template_type: "general",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
              </DialogTitle>
              <DialogDescription>
                Crea una plantilla de mensaje que podrás usar desde las notificaciones
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Variables y Condicionales</AlertTitle>
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-2 font-medium">Variables disponibles:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {availableVariables.map((variable) => (
                          <div 
                            key={variable.key}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted"
                            onClick={() => copyVariable(variable.key)}
                          >
                            <div>
                              <code className="font-mono font-semibold">{variable.key}</code>
                              <p className="text-muted-foreground">{variable.description}</p>
                            </div>
                            <Copy className="h-3 w-3" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <p className="mb-2 font-medium">Bloques condicionales:</p>
                      <div className="space-y-2 text-xs">
                        {conditionalExamples.map((example, idx) => (
                          <div key={idx} className="p-2 bg-muted/50 rounded">
                            <code className="font-mono font-semibold block mb-1">{example.syntax}</code>
                            <p className="text-muted-foreground">{example.description}</p>
                          </div>
                        ))}
                        <div className="p-2 bg-primary/5 rounded border border-primary/20">
                          <p className="font-semibold mb-1">Ejemplo completo:</p>
                          <code className="text-[10px] font-mono block whitespace-pre-wrap">
                            {`Hola {nombre_estudiante},
{if progreso < 20}
Veo que estás empezando. ¿Necesitas ayuda?
{else}
¡Vas muy bien! Continúa así.
{/if}`}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Plantilla</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Mensaje por inactividad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Plantilla</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, template_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="inactive">Inactividad</SelectItem>
                      <SelectItem value="low_performance">
                        Bajo Rendimiento
                      </SelectItem>
                      <SelectItem value="encouragement">Ánimo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto del Mensaje</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Ej: Nos preocupa tu ausencia"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Contenido del Mensaje</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? "Ver Plantilla" : "Vista Previa"}
                  </Button>
                </div>
                {previewMode ? (
                  <div className="border rounded-lg p-4 bg-muted/30 min-h-[200px]">
                    <p className="text-sm font-medium mb-2">Asunto:</p>
                    <p className="text-sm mb-4 p-2 bg-background rounded">
                      {replaceVariables(formData.subject)}
                    </p>
                    <p className="text-sm font-medium mb-2">Mensaje:</p>
                    <p className="text-sm whitespace-pre-wrap p-2 bg-background rounded">
                      {replaceVariables(formData.message)}
                    </p>
                  </div>
                ) : (
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={8}
                    placeholder="Escribe el mensaje que se enviará al estudiante..."
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Tip: Usa las variables dinámicas para personalizar el mensaje automáticamente
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Plantilla"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No tienes plantillas de respuesta
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera plantilla para comenzar a responder rápidamente
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Plantilla
            </Button>
          </Card>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className={`transition-all ${
                !template.is_active ? "opacity-60" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge
                        className={getTypeColor(template.template_type)}
                      >
                        {getTypeLabel(template.template_type)}
                      </Badge>
                      {!template.is_active && (
                        <Badge variant="outline">Inactiva</Badge>
                      )}
                    </div>
                    <CardDescription>
                      Usada {template.usage_count} veces
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Asunto:
                  </p>
                  <p className="text-sm">{template.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Mensaje:
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {template.message}
                  </p>
                </div>
                {template.message.includes("{") && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Vista previa con datos de ejemplo:
                    </p>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Asunto:</p>
                      <p className="text-xs mb-2">{replaceVariables(template.subject)}</p>
                      <p className="text-xs font-semibold mb-1">Mensaje:</p>
                      <p className="text-xs whitespace-pre-wrap">
                        {replaceVariables(template.message)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(template)}
                  >
                    {template.is_active ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
