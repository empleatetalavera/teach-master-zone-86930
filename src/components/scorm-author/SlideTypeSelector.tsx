import { 
  Type, 
  FileText, 
  HelpCircle, 
  Video, 
  Image, 
  MousePointer2, 
  GripVertical,
  ChevronDown,
  Layers,
  Clock,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideType } from "./types";

interface SlideTypeOption {
  type: SlideType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'interactive' | 'media' | 'advanced';
}

const slideTypes: SlideTypeOption[] = [
  // Basic
  { type: 'title', label: 'Portada', description: 'Slide de título con logo', icon: <Type className="w-5 h-5" />, category: 'basic' },
  { type: 'content', label: 'Contenido', description: 'Texto con formato y media', icon: <FileText className="w-5 h-5" />, category: 'basic' },
  { type: 'summary', label: 'Resumen', description: 'Puntos clave del tema', icon: <ListChecks className="w-5 h-5" />, category: 'basic' },
  
  // Interactive
  { type: 'quiz', label: 'Quiz', description: 'Pregunta de autoevaluación', icon: <HelpCircle className="w-5 h-5" />, category: 'interactive' },
  { type: 'hotspot', label: 'Hotspots', description: 'Imagen con zonas clicables', icon: <MousePointer2 className="w-5 h-5" />, category: 'interactive' },
  { type: 'dragdrop', label: 'Arrastrar', description: 'Ejercicio de emparejar', icon: <GripVertical className="w-5 h-5" />, category: 'interactive' },
  
  // Media
  { type: 'video', label: 'Vídeo', description: 'Reproductor de vídeo', icon: <Video className="w-5 h-5" />, category: 'media' },
  { type: 'image', label: 'Imagen', description: 'Imagen con zoom', icon: <Image className="w-5 h-5" />, category: 'media' },
  
  // Advanced
  { type: 'accordion', label: 'Acordeón', description: 'Contenido desplegable', icon: <ChevronDown className="w-5 h-5" />, category: 'advanced' },
  { type: 'tabs', label: 'Pestañas', description: 'Contenido en tabs', icon: <Layers className="w-5 h-5" />, category: 'advanced' },
  { type: 'timeline', label: 'Línea temporal', description: 'Eventos cronológicos', icon: <Clock className="w-5 h-5" />, category: 'advanced' },
];

interface SlideTypeSelectorProps {
  onSelect: (type: SlideType) => void;
  className?: string;
}

export function SlideTypeSelector({ onSelect, className }: SlideTypeSelectorProps) {
  const categories = [
    { key: 'basic', label: 'Básico' },
    { key: 'interactive', label: 'Interactivo' },
    { key: 'media', label: 'Multimedia' },
    { key: 'advanced', label: 'Avanzado' },
  ];

  return (
    <div className={className}>
      {categories.map((cat) => (
        <div key={cat.key} className="mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {cat.label}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {slideTypes
              .filter((st) => st.category === cat.key)
              .map((st) => (
                <Button
                  key={st.type}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start gap-1 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={() => onSelect(st.type)}
                >
                  <div className="flex items-center gap-2 text-primary">
                    {st.icon}
                    <span className="font-medium text-sm">{st.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    {st.description}
                  </span>
                </Button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
