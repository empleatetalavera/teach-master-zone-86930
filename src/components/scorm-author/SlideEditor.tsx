import { useState } from "react";
import { Slide, SlideType, QuizOption, HotspotArea, AccordionItem, TabItem, TimelineEvent, DragDropItem, DragDropZone } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Check, X } from "lucide-react";

interface SlideEditorProps {
  slide: Slide;
  onUpdate: (slide: Slide) => void;
}

// Generate simple ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export function SlideEditor({ slide, onUpdate }: SlideEditorProps) {
  const updateField = <K extends keyof Slide>(field: K, value: Slide[K]) => {
    onUpdate({ ...slide, [field]: value } as Slide);
  };

  const renderBaseFields = () => (
    <div className="space-y-4 mb-6">
      <div>
        <Label>Título del slide</Label>
        <Input
          value={slide.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Título del slide"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Duración (segundos)</Label>
          <Input
            type="number"
            value={slide.duration_seconds || ''}
            onChange={(e) => updateField('duration_seconds', parseInt(e.target.value) || undefined)}
            placeholder="Auto"
          />
        </div>
        <div>
          <Label>Color de fondo</Label>
          <Input
            type="color"
            value={slide.background_color || '#ffffff'}
            onChange={(e) => updateField('background_color', e.target.value)}
            className="h-10 p-1"
          />
        </div>
      </div>
    </div>
  );

  const renderTitleSlide = () => {
    if (slide.type !== 'title') return null;
    return (
      <div className="space-y-4">
        <div>
          <Label>Subtítulo</Label>
          <Input
            value={slide.subtitle || ''}
            onChange={(e) => onUpdate({ ...slide, subtitle: e.target.value })}
            placeholder="Subtítulo opcional"
          />
        </div>
        <div>
          <Label>Autor</Label>
          <Input
            value={slide.author || ''}
            onChange={(e) => onUpdate({ ...slide, author: e.target.value })}
            placeholder="Nombre del autor"
          />
        </div>
        <div>
          <Label>URL del logo</Label>
          <Input
            value={slide.logo_url || ''}
            onChange={(e) => onUpdate({ ...slide, logo_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
    );
  };

  const renderContentSlide = () => {
    if (slide.type !== 'content') return null;
    return (
      <div className="space-y-4">
        <div>
          <Label>Layout</Label>
          <Select
            value={slide.layout}
            onValueChange={(v) => onUpdate({ ...slide, layout: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Una columna</SelectItem>
              <SelectItem value="two-column">Dos columnas</SelectItem>
              <SelectItem value="sidebar-left">Sidebar izquierda</SelectItem>
              <SelectItem value="sidebar-right">Sidebar derecha</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Contenido (Markdown)</Label>
          <Textarea
            value={slide.content}
            onChange={(e) => onUpdate({ ...slide, content: e.target.value })}
            placeholder="## Título&#10;&#10;Escribe el contenido aquí..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <div>
          <Label>URL de imagen/video (opcional)</Label>
          <Input
            value={slide.media?.url || ''}
            onChange={(e) => onUpdate({ 
              ...slide, 
              media: e.target.value ? { type: 'image', url: e.target.value } : undefined 
            })}
            placeholder="https://..."
          />
        </div>
      </div>
    );
  };

  const renderQuizSlide = () => {
    if (slide.type !== 'quiz') return null;
    
    const addOption = () => {
      const newOption: QuizOption = {
        id: generateId(),
        text: '',
        isCorrect: false
      };
      onUpdate({ ...slide, options: [...slide.options, newOption] });
    };

    const updateOption = (index: number, updates: Partial<QuizOption>) => {
      const newOptions = [...slide.options];
      newOptions[index] = { ...newOptions[index], ...updates };
      // If setting this as correct, unset others for single-answer
      if (updates.isCorrect && slide.question_type !== 'matching') {
        newOptions.forEach((opt, i) => {
          if (i !== index) opt.isCorrect = false;
        });
      }
      onUpdate({ ...slide, options: newOptions });
    };

    const removeOption = (index: number) => {
      onUpdate({ ...slide, options: slide.options.filter((_, i) => i !== index) });
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>Tipo de pregunta</Label>
          <Select
            value={slide.question_type}
            onValueChange={(v) => onUpdate({ ...slide, question_type: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">Opción múltiple</SelectItem>
              <SelectItem value="true-false">Verdadero/Falso</SelectItem>
              <SelectItem value="fill-blank">Completar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Pregunta</Label>
          <Textarea
            value={slide.question}
            onChange={(e) => onUpdate({ ...slide, question: e.target.value })}
            placeholder="Escribe la pregunta..."
            className="min-h-[80px]"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Opciones de respuesta</Label>
            <Button size="sm" variant="outline" onClick={addOption}>
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </div>
          <div className="space-y-2">
            {slide.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Button
                  size="sm"
                  variant={opt.isCorrect ? "default" : "outline"}
                  className={`w-8 h-8 p-0 ${opt.isCorrect ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => updateOption(idx, { isCorrect: !opt.isCorrect })}
                  title={opt.isCorrect ? 'Correcta' : 'Marcar como correcta'}
                >
                  {opt.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </Button>
                <Input
                  value={opt.text}
                  onChange={(e) => updateOption(idx, { text: e.target.value })}
                  placeholder={`Opción ${idx + 1}`}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOption(idx)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Puntos</Label>
            <Input
              type="number"
              value={slide.points}
              onChange={(e) => onUpdate({ ...slide, points: parseInt(e.target.value) || 1 })}
              min={1}
            />
          </div>
          <div>
            <Label>Intentos máximos</Label>
            <Input
              type="number"
              value={slide.max_attempts}
              onChange={(e) => onUpdate({ ...slide, max_attempts: parseInt(e.target.value) || 1 })}
              min={1}
            />
          </div>
        </div>

        <div>
          <Label>Explicación (se muestra tras responder)</Label>
          <Textarea
            value={slide.explanation || ''}
            onChange={(e) => onUpdate({ ...slide, explanation: e.target.value })}
            placeholder="Explica por qué esta es la respuesta correcta..."
          />
        </div>

        <div>
          <Label>Pista (opcional)</Label>
          <Input
            value={slide.hint || ''}
            onChange={(e) => onUpdate({ ...slide, hint: e.target.value })}
            placeholder="Una pista para el alumno..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={slide.shuffle_options}
            onCheckedChange={(v) => onUpdate({ ...slide, shuffle_options: v })}
          />
          <Label>Aleatorizar opciones</Label>
        </div>
      </div>
    );
  };

  const renderVideoSlide = () => {
    if (slide.type !== 'video') return null;
    return (
      <div className="space-y-4">
        <div>
          <Label>Tipo de vídeo</Label>
          <Select
            value={slide.video_type}
            onValueChange={(v) => onUpdate({ ...slide, video_type: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
              <SelectItem value="mp4">MP4 directo</SelectItem>
              <SelectItem value="embed">Embed personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>URL del vídeo</Label>
          <Input
            value={slide.video_url}
            onChange={(e) => onUpdate({ ...slide, video_url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={slide.autoplay}
              onCheckedChange={(v) => onUpdate({ ...slide, autoplay: v })}
            />
            <Label>Autoplay</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={slide.controls}
              onCheckedChange={(v) => onUpdate({ ...slide, controls: v })}
            />
            <Label>Controles</Label>
          </div>
        </div>
        <div>
          <Label>Transcripción (opcional)</Label>
          <Textarea
            value={slide.transcript || ''}
            onChange={(e) => onUpdate({ ...slide, transcript: e.target.value })}
            placeholder="Transcripción del vídeo para accesibilidad..."
          />
        </div>
      </div>
    );
  };

  const renderImageSlide = () => {
    if (slide.type !== 'image') return null;
    return (
      <div className="space-y-4">
        <div>
          <Label>URL de la imagen</Label>
          <Input
            value={slide.image_url}
            onChange={(e) => onUpdate({ ...slide, image_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Texto alternativo (accesibilidad)</Label>
          <Input
            value={slide.alt_text}
            onChange={(e) => onUpdate({ ...slide, alt_text: e.target.value })}
            placeholder="Descripción de la imagen"
          />
        </div>
        <div>
          <Label>Pie de imagen (opcional)</Label>
          <Input
            value={slide.caption || ''}
            onChange={(e) => onUpdate({ ...slide, caption: e.target.value })}
            placeholder="Pie de imagen"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={slide.zoom_enabled}
            onCheckedChange={(v) => onUpdate({ ...slide, zoom_enabled: v })}
          />
          <Label>Permitir zoom</Label>
        </div>
      </div>
    );
  };

  const renderHotspotSlide = () => {
    if (slide.type !== 'hotspot') return null;
    
    const addHotspot = () => {
      const newHotspot: HotspotArea = {
        id: generateId(),
        x: 20,
        y: 20,
        width: 15,
        height: 15,
        shape: 'circle',
        label: 'Nuevo hotspot',
        content: ''
      };
      onUpdate({ ...slide, hotspots: [...slide.hotspots, newHotspot] });
    };

    const updateHotspot = (index: number, updates: Partial<HotspotArea>) => {
      const newHotspots = [...slide.hotspots];
      newHotspots[index] = { ...newHotspots[index], ...updates };
      onUpdate({ ...slide, hotspots: newHotspots });
    };

    const removeHotspot = (index: number) => {
      onUpdate({ ...slide, hotspots: slide.hotspots.filter((_, i) => i !== index) });
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>URL de la imagen base</Label>
          <Input
            value={slide.image_url}
            onChange={(e) => onUpdate({ ...slide, image_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Instrucciones</Label>
          <Input
            value={slide.instruction || ''}
            onChange={(e) => onUpdate({ ...slide, instruction: e.target.value })}
            placeholder="Haz clic en los puntos para más información..."
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Zonas interactivas</Label>
            <Button size="sm" variant="outline" onClick={addHotspot}>
              <Plus className="w-4 h-4 mr-1" /> Añadir zona
            </Button>
          </div>
          <div className="space-y-3">
            {slide.hotspots.map((hs, idx) => (
              <Card key={hs.id} className="p-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    value={hs.label}
                    onChange={(e) => updateHotspot(idx, { label: e.target.value })}
                    placeholder="Etiqueta"
                  />
                  <Select
                    value={hs.shape}
                    onValueChange={(v) => updateHotspot(idx, { shape: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Círculo</SelectItem>
                      <SelectItem value="rectangle">Rectángulo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div>
                    <Label className="text-xs">X %</Label>
                    <Input
                      type="number"
                      value={hs.x}
                      onChange={(e) => updateHotspot(idx, { x: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y %</Label>
                    <Input
                      type="number"
                      value={hs.y}
                      onChange={(e) => updateHotspot(idx, { y: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ancho %</Label>
                    <Input
                      type="number"
                      value={hs.width}
                      onChange={(e) => updateHotspot(idx, { width: parseInt(e.target.value) || 10 })}
                      min={5}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Alto %</Label>
                    <Input
                      type="number"
                      value={hs.height}
                      onChange={(e) => updateHotspot(idx, { height: parseInt(e.target.value) || 10 })}
                      min={5}
                      max={100}
                    />
                  </div>
                </div>
                <Textarea
                  value={hs.content}
                  onChange={(e) => updateHotspot(idx, { content: e.target.value })}
                  placeholder="Contenido al hacer clic..."
                  className="min-h-[60px]"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeHotspot(idx)}
                  className="mt-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAccordionSlide = () => {
    if (slide.type !== 'accordion') return null;
    
    const addItem = () => {
      const newItem: AccordionItem = {
        id: generateId(),
        title: 'Nueva sección',
        content: ''
      };
      onUpdate({ ...slide, items: [...slide.items, newItem] });
    };

    const updateItem = (index: number, updates: Partial<AccordionItem>) => {
      const newItems = [...slide.items];
      newItems[index] = { ...newItems[index], ...updates };
      onUpdate({ ...slide, items: newItems });
    };

    const removeItem = (index: number) => {
      onUpdate({ ...slide, items: slide.items.filter((_, i) => i !== index) });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={slide.allow_multiple_open}
            onCheckedChange={(v) => onUpdate({ ...slide, allow_multiple_open: v })}
          />
          <Label>Permitir múltiples abiertos</Label>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Secciones</Label>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </div>
          <div className="space-y-2">
            {slide.items.map((item, idx) => (
              <Card key={item.id} className="p-3">
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  placeholder="Título de la sección"
                  className="mb-2"
                />
                <Textarea
                  value={item.content}
                  onChange={(e) => updateItem(idx, { content: e.target.value })}
                  placeholder="Contenido de la sección (Markdown)..."
                  className="min-h-[80px]"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(idx)}
                  className="mt-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSummarySlide = () => {
    if (slide.type !== 'summary') return null;
    
    const addPoint = () => {
      onUpdate({ ...slide, key_points: [...slide.key_points, ''] });
    };

    const updatePoint = (index: number, value: string) => {
      const newPoints = [...slide.key_points];
      newPoints[index] = value;
      onUpdate({ ...slide, key_points: newPoints });
    };

    const removePoint = (index: number) => {
      onUpdate({ ...slide, key_points: slide.key_points.filter((_, i) => i !== index) });
    };

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Puntos clave</Label>
            <Button size="sm" variant="outline" onClick={addPoint}>
              <Plus className="w-4 h-4 mr-1" /> Añadir
            </Button>
          </div>
          <div className="space-y-2">
            {slide.key_points.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-primary font-bold">•</span>
                <Input
                  value={point}
                  onChange={(e) => updatePoint(idx, e.target.value)}
                  placeholder={`Punto clave ${idx + 1}`}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePoint(idx)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>Próximos pasos (opcional)</Label>
          <Textarea
            value={slide.next_steps || ''}
            onChange={(e) => onUpdate({ ...slide, next_steps: e.target.value })}
            placeholder="Qué debe hacer el alumno a continuación..."
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Configuración del Slide</CardTitle>
        </CardHeader>
        <CardContent>
          {renderBaseFields()}
          {renderTitleSlide()}
          {renderContentSlide()}
          {renderQuizSlide()}
          {renderVideoSlide()}
          {renderImageSlide()}
          {renderHotspotSlide()}
          {renderAccordionSlide()}
          {renderSummarySlide()}
        </CardContent>
      </Card>
    </div>
  );
}
