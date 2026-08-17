import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    (supabase as any)
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data, error }: { data: boolean | null; error: Error | null }) => {
        setIsAdmin(!!data && !error);
        setLoading(false);
      });
  }, [user, authLoading]);

  return { isAdmin, loading };
};
