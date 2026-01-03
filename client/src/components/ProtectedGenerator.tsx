import { useEffect, useState } from "react";
import { getAuthHeader, isAuthenticated } from "@/lib/auth";
import { useLocation } from "wouter";

export function withAccessCheck<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const [, setLocation] = useLocation();
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!isAuthenticated()) {
        setLocation("/login");
        return;
      }

      checkAccess();
    }, []);

    const checkAccess = async () => {
      try {
        const response = await fetch("/api/auth/check-access", {
          headers: getAuthHeader(),
        });
        if (response.ok) {
          const data = await response.json();
          if (!data.hasAccess) {
            console.log("❌ Sem créditos, redirecionando para planos");
            setLocation("/plans");
          } else {
            console.log("✅ Acesso liberado com créditos");
            setHasAccess(true);
          }
        } else {
          console.error("Check access failed:", response.status);
          setLocation("/plans");
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setLocation("/plans");
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Verificando créditos...</div>
        </div>
      );
    }

    if (!hasAccess) {
      return null;
    }

    return <Component {...props} />;
  };
}
