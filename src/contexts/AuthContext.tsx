import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("AuthContext: Initial session retrieval failed:", err);
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      try {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error("AuthContext: Auth state handler exception:", err);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("AuthContext: SignOut failed:", error.message);
      }
    } catch (err) {
      console.error("AuthContext: Error occurred during signOut execution:", err);
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
