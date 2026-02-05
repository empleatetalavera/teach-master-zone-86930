import { Slide } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Lightbulb, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SlidePreviewProps {
  slide: Slide;
  isInteractive?: boolean;
}

export function SlidePreview({ slide, isInteractive = false }: SlidePreviewProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [expandedPoints, setExpandedPoints] = useState<string[]>([]);

  const renderTitleSlide = () => {
    if (slide.type !== 'title') return null;
    return (
      <div 
        className="h-full flex flex-col items-center justify-center p-8 text-center"
        style={{ backgroundColor: slide.background_color || 'hsl(var(--primary))' }}
      >
        {slide.logo_url && (
          <img src={slide.logo_url} alt="Logo" className="h-16 mb-6 object-contain" />
        )}
        <h1 className="text-3xl font-bold text-white mb-4">{slide.title}</h1>
        {slide.subtitle && (
          <p className="text-xl text-white/80">{slide.subtitle}</p>
        )}
        {slide.author && (
          <p className="mt-8 text-sm text-white/60">{slide.author}</p>
        )}
      </div>
    );
  };

  const renderContentSlide = () => {
    if (slide.type !== 'content') return null;
    return (
      <div className="h-full p-6 overflow-auto">
        <h2 className="text-2xl font-bold text-primary mb-4">{slide.title}</h2>
        <div className={`flex gap-6 ${slide.layout === 'two-column' ? 'flex-row' : 'flex-col'}`}>
          <div className={`prose prose-sm max-w-none ${slide.layout === 'two-column' ? 'flex-1' : ''}`}>
            <ReactMarkdown>{slide.content}</ReactMarkdown>
          </div>
          {slide.media && (
            <div className={slide.layout === 'two-column' ? 'flex-1' : 'mt-4'}>
              {slide.media.type === 'image' && (
                <img 
                  src={slide.media.url} 
                  alt={slide.media.caption || ''} 
                  className="w-full rounded-lg shadow-lg"
                />
              )}
              {slide.media.caption && (
                <p className="text-sm text-muted-foreground mt-2 text-center">{slide.media.caption}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuizSlide = () => {
    if (slide.type !== 'quiz') return null;
    
    const handleOptionClick = (optionId: string) => {
      if (!isInteractive || showExplanation) return;
      setSelectedOption(optionId);
    };

    const handleSubmit = () => {
      setShowExplanation(true);
    };

    const selectedOpt = slide.options.find(o => o.id === selectedOption);
    const isCorrect = selectedOpt?.isCorrect;

    return (
      <div className="h-full p-6 overflow-auto">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{slide.points} puntos</Badge>
          <Badge variant="outline">Intentos: {slide.max_attempts}</Badge>
        </div>
        <h2 className="text-xl font-bold mb-6">{slide.question}</h2>
        
        <div className="space-y-3 mb-6">
          {slide.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            const showResult = showExplanation;
            
            let optionClass = "border-2 p-4 rounded-lg cursor-pointer transition-all ";
            if (showResult) {
              if (opt.isCorrect) {
                optionClass += "border-green-500 bg-green-50 dark:bg-green-950";
              } else if (isSelected && !opt.isCorrect) {
                optionClass += "border-red-500 bg-red-50 dark:bg-red-950";
              } else {
                optionClass += "border-muted opacity-50";
              }
            } else {
              optionClass += isSelected 
                ? "border-primary bg-primary/10" 
                : "border-muted hover:border-primary/50";
            }

            return (
              <div 
                key={opt.id}
                className={optionClass}
                onClick={() => handleOptionClick(opt.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    showResult && opt.isCorrect 
                      ? 'bg-green-500 text-white' 
                      : showResult && isSelected && !opt.isCorrect
                      ? 'bg-red-500 text-white'
                      : isSelected 
                      ? 'bg-primary text-white' 
                      : 'bg-muted'
                  }`}>
                    {showResult ? (opt.isCorrect ? <Check className="w-4 h-4" /> : isSelected ? <X className="w-4 h-4" /> : '') : ''}
                  </div>
                  <span>{opt.text}</span>
                </div>
              </div>
            );
          })}
        </div>

        {isInteractive && !showExplanation && selectedOption && (
          <Button onClick={handleSubmit} className="w-full">
            Comprobar respuesta
          </Button>
        )}

        {showExplanation && slide.explanation && (
          <Card className={`mt-4 ${isCorrect ? 'border-green-500' : 'border-amber-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className={`w-5 h-5 ${isCorrect ? 'text-green-500' : 'text-amber-500'}`} />
                <span className="font-semibold">{isCorrect ? '¡Correcto!' : 'Incorrecto'}</span>
              </div>
              <p className="text-sm text-muted-foreground">{slide.explanation}</p>
            </CardContent>
          </Card>
        )}

        {slide.hint && !showExplanation && (
          <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Pista: {slide.hint}
          </p>
        )}
      </div>
    );
  };

  const renderVideoSlide = () => {
    if (slide.type !== 'video') return null;
    
    const getEmbedUrl = () => {
      if (slide.video_type === 'youtube') {
        const videoId = slide.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=${slide.autoplay ? 1 : 0}&controls=${slide.controls ? 1 : 0}`;
      }
      if (slide.video_type === 'vimeo') {
        const videoId = slide.video_url.match(/vimeo\.com\/(\d+)/)?.[1];
        return `https://player.vimeo.com/video/${videoId}?autoplay=${slide.autoplay ? 1 : 0}`;
      }
      return slide.video_url;
    };

    return (
      <div className="h-full p-6">
        <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
        {slide.video_type === 'mp4' ? (
          <video 
            src={slide.video_url} 
            controls={slide.controls}
            autoPlay={slide.autoplay}
            className="w-full rounded-lg"
          />
        ) : (
          <iframe
            src={getEmbedUrl()}
            className="w-full aspect-video rounded-lg"
            allowFullScreen
          />
        )}
        {slide.transcript && (
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="transcript">
              <AccordionTrigger>Ver transcripción</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{slide.transcript}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    );
  };

  const renderImageSlide = () => {
    if (slide.type !== 'image') return null;
    return (
      <div className="h-full p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
        <div className="flex-1 flex items-center justify-center">
          <img 
            src={slide.image_url} 
            alt={slide.alt_text}
            className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${slide.zoom_enabled ? 'cursor-zoom-in hover:scale-105 transition-transform' : ''}`}
          />
        </div>
        {slide.caption && (
          <p className="text-sm text-muted-foreground text-center mt-4">{slide.caption}</p>
        )}
      </div>
    );
  };

  const renderHotspotSlide = () => {
    if (slide.type !== 'hotspot') return null;
    return (
      <div className="h-full p-6">
        <h2 className="text-xl font-bold mb-2">{slide.title}</h2>
        {slide.instruction && (
          <p className="text-sm text-muted-foreground mb-4">{slide.instruction}</p>
        )}
        <div className="relative inline-block">
          <img 
            src={slide.image_url} 
            alt="Imagen interactiva"
            className="max-w-full rounded-lg"
          />
          {slide.hotspots.map((hs) => (
            <button
              key={hs.id}
              className={`absolute bg-primary/80 hover:bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                activeHotspot === hs.id ? 'ring-4 ring-primary/50 scale-110' : ''
              }`}
              style={{
                left: `${hs.x}%`,
                top: `${hs.y}%`,
                width: hs.shape === 'circle' ? `${hs.width}%` : undefined,
                height: hs.shape === 'circle' ? `${hs.height}%` : undefined,
                aspectRatio: hs.shape === 'circle' ? '1' : undefined,
                minWidth: '24px',
                minHeight: '24px',
              }}
              onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
            >
              {hs.label.charAt(0)}
            </button>
          ))}
        </div>
        {activeHotspot && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {slide.hotspots.find(h => h.id === activeHotspot)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {slide.hotspots.find(h => h.id === activeHotspot)?.content}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderAccordionSlide = () => {
    if (slide.type !== 'accordion') return null;
    return (
      <div className="h-full p-6">
        <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
        <Accordion 
          type={slide.allow_multiple_open ? "multiple" : "single"} 
          collapsible={!slide.allow_multiple_open}
        >
          {slide.items.map((item, idx) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left">
                {item.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  const renderSummarySlide = () => {
    if (slide.type !== 'summary') return null;
    return (
      <div className="h-full p-6">
        <h2 className="text-2xl font-bold text-primary mb-6">{slide.title}</h2>
        <div className="space-y-3">
          {slide.key_points.map((point, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{point}</span>
            </div>
          ))}
        </div>
        {slide.next_steps && (
          <Card className="mt-6 border-dashed">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Próximos pasos</h3>
              <p className="text-sm text-muted-foreground">{slide.next_steps}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow-lg overflow-hidden h-full min-h-[400px]">
      {renderTitleSlide()}
      {renderContentSlide()}
      {renderQuizSlide()}
      {renderVideoSlide()}
      {renderImageSlide()}
      {renderHotspotSlide()}
      {renderAccordionSlide()}
      {renderSummarySlide()}
    </div>
  );
}
