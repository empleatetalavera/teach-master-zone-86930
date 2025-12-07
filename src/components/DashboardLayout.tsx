import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { BrandingHeader } from "@/components/BrandingHeader";
import { NotificationBell } from "@/components/NotificationBell";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useContractCheck } from "@/hooks/useContractCheck";
import ContractSigningModal from "@/components/ContractSigningModal";

export function DashboardLayout() {
  const { user, userRole } = useAuth();
  const [trainingCenterId, setTrainingCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string>("");
  const [isLoadingCenter, setIsLoadingCenter] = useState(true);
  const [contractSkipped, setContractSkipped] = useState(false);

  // Fetch user's training center
  useEffect(() => {
    async function fetchUserCenter() {
      if (!user) {
        setIsLoadingCenter(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("training_center_id")
          .eq("id", user.id)
          .single();

        if (profile?.training_center_id) {
          setTrainingCenterId(profile.training_center_id);
          
          const { data: center } = await supabase
            .from("training_centers")
            .select("name")
            .eq("id", profile.training_center_id)
            .single();
          
          if (center) {
            setCenterName(center.name);
          }
        }
      } catch (error) {
        console.error("Error fetching user center:", error);
      } finally {
        setIsLoadingCenter(false);
      }
    }

    fetchUserCenter();
  }, [user]);

  const { hasSignedContract, isLoading: isLoadingContract, refreshContractStatus } = useContractCheck(
    trainingCenterId,
    userRole
  );

  const handleSkipContract = () => {
    setContractSkipped(true);
  };

  // Show contract modal for center admins who haven't signed
  const showContractModal = 
    !isLoadingCenter && 
    !isLoadingContract && 
    userRole === "admin" && 
    trainingCenterId && 
    hasSignedContract === false &&
    !contractSkipped;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <BrandingHeader />
          <header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="relative w-96 max-w-md hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar cursos, usuarios..." 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Contract Signing Modal - Blocks access for center admins who haven't signed */}
      {showContractModal && trainingCenterId && (
        <ContractSigningModal
          open={true}
          onSigned={refreshContractStatus}
          onSkip={handleSkipContract}
          trainingCenterId={trainingCenterId}
          centerName={centerName}
        />
      )}
    </SidebarProvider>
  );
}
