import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, X, Send, Trash2, Loader2 } from "lucide-react";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { usePageContext } from "@/hooks/usePageContext";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantProps {
  additionalContext?: {
    courseInfo?: string;
  };
}

export function AIAssistant({ additionalContext }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const pageContext = usePageContext();
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIAssistant();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build rich context from page and additional info
  const buildContext = () => {
    let contextString = pageContext.page;

    if (pageContext.course) {
      contextString += `\nCurso: ${pageContext.course.courseTitle}`;
      if (pageContext.course.courseDescription) {
        contextString += `\nDescripción: ${pageContext.course.courseDescription}`;
      }
      if (pageContext.course.category) {
        contextString += `\nCategoría: ${pageContext.course.category}`;
      }
      if (pageContext.course.level) {
        contextString += `\nNivel: ${pageContext.course.level}`;
      }
    }

    if (pageContext.module) {
      contextString += `\nMódulo ${pageContext.module.orderIndex}: ${pageContext.module.moduleTitle}`;
      if (pageContext.module.moduleDescription) {
        contextString += `\nDescripción del módulo: ${pageContext.module.moduleDescription}`;
      }
      // Include first 500 chars of content for context
      if (pageContext.module.moduleContent) {
        const contentPreview = pageContext.module.moduleContent.slice(0, 500);
        contextString += `\nContenido del módulo: ${contentPreview}${
          pageContext.module.moduleContent.length > 500 ? "..." : ""
        }`;
      }
    }

    if (additionalContext?.courseInfo) {
      contextString += `\n${additionalContext.courseInfo}`;
    }

    return contextString;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setStreamingMessage("");

    await sendMessage({
      userMessage,
      context: {
        page: pageContext.page,
        courseInfo: buildContext(),
        courseId: pageContext.course?.courseId,
        moduleId: pageContext.module?.moduleId,
      },
      onDelta: (delta) => {
        setStreamingMessage((prev) => prev + delta);
      },
      onDone: () => {
        setStreamingMessage("");
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50">
      <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Esmeralda</CardTitle>
            <CardDescription className="text-xs">
              Tu asistente virtual educativa
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              title="Limpiar chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 && !streamingMessage && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-50" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Bienvenida, soy Esmeralda, tu asistente virtual.
                </p>
                <p className="text-xs">
                  ¿En qué podemos ayudarla?
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <p className="text-sm whitespace-pre-wrap">
                    {streamingMessage}
                    <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                  </p>
                </div>
              </div>
            )}

            {isLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
