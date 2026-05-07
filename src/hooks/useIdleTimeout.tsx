import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

/**
 * SEPE compliance: caducidad de sesión por inactividad del alumno.
 * - Aviso a los `warnAfterMs` ms.
 * - Cierre de sesión a los `logoutAfterMs` ms.
 */
export function useIdleTimeout({
  warnAfterMs = 25 * 60 * 1000, // 25 min
  logoutAfterMs = 30 * 60 * 1000, // 30 min
}: { warnAfterMs?: number; logoutAfterMs?: number } = {}) {
  const { user } = useAuth();
  const [warned, setWarned] = useState(false);
  const warnRef = useRef<number | null>(null);
  const logoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const clearTimers = () => {
      if (warnRef.current) window.clearTimeout(warnRef.current);
      if (logoutRef.current) window.clearTimeout(logoutRef.current);
    };

    const reset = () => {
      clearTimers();
      setWarned(false);
      warnRef.current = window.setTimeout(() => {
        setWarned(true);
        toast.warning("Tu sesión caducará en 5 minutos por inactividad", {
          description: "Mueve el ratón o pulsa una tecla para mantener la sesión activa.",
          duration: 10000,
        });
      }, warnAfterMs);
      logoutRef.current = window.setTimeout(async () => {
        toast.error("Sesión cerrada por inactividad", { duration: 8000 });
        await supabase.auth.signOut();
        window.location.href = "/auth";
      }, logoutAfterMs);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimers();
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, warnAfterMs, logoutAfterMs]);

  return { warned };
}
