import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname || "";
  const match = pathname.match(/^\/dashboard\/([^\/]+)/);
  const roleSegment = match ? match[1] : undefined;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("ProtectedRoute: No user, redirecting to /auth");
        navigate("/auth", { replace: true });
        return;
      }
      if (!userRole) {
        console.log("ProtectedRoute: No role assigned, redirecting to /auth");
        navigate("/auth", { replace: true });
        return;
      }

      const targetRole = userRole === "super_admin" ? "admin" : userRole;

      // If at /dashboard root, or role segment mismatches, redirect to correct dashboard
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
        console.log(`ProtectedRoute: At /dashboard, redirecting to /dashboard/${targetRole}`);
        navigate(`/dashboard/${targetRole}`, { replace: true });
        return;
      }

      if (roleSegment && roleSegment !== targetRole) {
        console.log(`ProtectedRoute: Wrong role in URL (${roleSegment}), redirecting to /dashboard/${targetRole}`);
        navigate(`/dashboard/${targetRole}`, { replace: true });
      }
    }
  }, [user, userRole, loading, navigate, pathname, roleSegment]);

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
