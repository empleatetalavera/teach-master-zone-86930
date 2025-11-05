import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GradeNotificationToast() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new grade notifications
    const channel = supabase
      .channel("grade-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any;
          
          // Only show toast for grade notifications
          if (notification.type === "grade_published") {
            const metadata = notification.metadata || {};
            const gradeScore = metadata.grade_score || 0;
            
            // Customize toast based on grade
            const getGradeEmoji = (score: number) => {
              if (score >= 90) return "🌟";
              if (score >= 70) return "👏";
              if (score >= 50) return "✅";
              return "💪";
            };

            toast({
              title: `${notification.title} 🎓`,
              description: (
                <div className="space-y-2">
                  <p>{notification.message}</p>
                  <div className="text-2xl font-bold">
                    {getGradeEmoji(gradeScore)} {gradeScore}%
                  </div>
                  {notification.related_course_id && (
                    <button
                      onClick={() => navigate(`/course/${notification.related_course_id}`)}
                      className="text-sm underline mt-2"
                    >
                      Ver Curso
                    </button>
                  )}
                </div>
              ),
              duration: 8000,
            });
            
            // Play a notification sound (optional)
            try {
              const audio = new Audio("/notification.mp3");
              audio.volume = 0.3;
              audio.play().catch(() => {
                // Ignore if sound fails to play
              });
            } catch (error) {
              // Ignore sound errors
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, navigate]);

  return null; // This component doesn't render anything
}
