import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to auth
        console.log("ProtectedRoute: No user, redirecting to /auth");
        navigate("/auth", { replace: true });
      } else if (!userRole) {
        // User has no role assigned, redirect to auth
        console.log("ProtectedRoute: No role assigned, redirecting to /auth");
        navigate("/auth", { replace: true });
      } else if (role && userRole && role !== userRole) {
        // User is accessing wrong dashboard, redirect to correct one
        console.log(`ProtectedRoute: Wrong role, redirecting to /dashboard/${userRole}`);
        navigate(`/dashboard/${userRole}`, { replace: true });
      }
    }
  }, [user, userRole, loading, navigate, role]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block access if no user or no role
  if (!user || !userRole) {
    return null;
  }

  return <>{children}</>;
}
