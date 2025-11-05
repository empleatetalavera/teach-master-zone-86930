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
        navigate("/auth");
      } else if (role && userRole && role !== userRole) {
        // Redirect to correct dashboard if accessing wrong role
        navigate(`/dashboard/${userRole}`);
      }
    }
  }, [user, userRole, loading, navigate, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
