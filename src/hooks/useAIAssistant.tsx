import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useAIAssistant = () => {
  const { user, userRole } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveConversation = async (
    userMessage: string,
    assistantResponse: string,
    context: any,
    responseTime: number
  ) => {
    if (!user) return;

    try {
      await supabase.from("ai_conversations").insert({
        user_id: user.id,
        user_role: userRole,
        user_message: userMessage,
        assistant_response: assistantResponse,
        context_page: context?.page,
        context_course_id: context?.courseId,
        context_module_id: context?.moduleId,
        response_time_ms: responseTime,
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const streamChat = useCallback(
    async ({
      userMessage,
      context,
      onDelta,
      onDone,
    }: {
      userMessage: string;
      context?: { page?: string; courseInfo?: string; courseId?: string; moduleId?: string };
      onDelta: (deltaText: string) => void;
      onDone: () => void;
    }) => {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

      const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
      setMessages(newMessages);
      setIsLoading(true);
      setError(null);

      const startTime = Date.now();

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            context: {
              ...context,
              userRole,
            },
          }),
        });

        if (!resp.ok) {
          const errorData = await resp.json();
          throw new Error(errorData.error || "Error al comunicarse con el asistente");
        }

        if (!resp.body) {
          throw new Error("No se recibió respuesta del servidor");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;
        let assistantMessage = "";

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantMessage += content;
                onDelta(content);
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        const responseTime = Date.now() - startTime;

        // Save conversation to database
        await saveConversation(userMessage, assistantMessage, context, responseTime);

        // Update messages with complete assistant response
        setMessages([...newMessages, { role: "assistant", content: assistantMessage }]);
        onDone();
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error en el chat:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userRole, user]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage: streamChat,
    clearMessages,
  };
};
