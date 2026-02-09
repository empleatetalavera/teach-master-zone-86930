import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useContractCheck(trainingCenterId: string | null, userRole: string | null) {
  const [hasSignedContract, setHasSignedContract] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkContract() {
      // Only check for center admins (not super_admin)
      if (!trainingCenterId || userRole !== "admin") {
        setHasSignedContract(true);
        setIsLoading(false);
        return;
      }

      // Check sessionStorage cache first to avoid repeated queries/modals
      const cacheKey = `contract_signed_${trainingCenterId}`;
      if (sessionStorage.getItem(cacheKey) === 'true') {
        setHasSignedContract(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("center_contracts")
          .select("id")
          .eq("training_center_id", trainingCenterId)
          .eq("contract_type", "general")
          .maybeSingle();

        if (error) {
          console.error("Error checking contract:", error);
          setHasSignedContract(true);
        } else {
          const signed = !!data;
          setHasSignedContract(signed);
          if (signed) {
            sessionStorage.setItem(cacheKey, 'true');
          }
        }
      } catch (error) {
        console.error("Error checking contract:", error);
        setHasSignedContract(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkContract();
  }, [trainingCenterId, userRole]);

  const refreshContractStatus = async () => {
    if (!trainingCenterId) return;
    
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("center_contracts")
        .select("id")
        .eq("training_center_id", trainingCenterId)
        .eq("contract_type", "general")
        .maybeSingle();
      
      const signed = !!data;
      setHasSignedContract(signed);
      if (signed && trainingCenterId) {
        sessionStorage.setItem(`contract_signed_${trainingCenterId}`, 'true');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { hasSignedContract, isLoading, refreshContractStatus };
}
