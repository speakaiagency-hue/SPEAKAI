import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { isAuthenticated, getAuthHeader } from "@/lib/auth";
import axios from "axios";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Se não estiver logado, redireciona para login
    if (!isAuthenticated()) {
      setLocation("/login");
      return;
    }

    const checkAccess = async () => {
      try {
        const res = await axios.get("/api/auth/check-access", {
          headers: getAuthHeader(),
        });

        // ✅ Garante que a resposta seja JSON válido
        if (res.data && typeof res.data === "object") {
          if (res.data.hasAccess) {
            setAllowed(true);
          } else {
            setAllowed(false);
            setLocation("/plans");
          }
        } else {
          console.error("Resposta inesperada da API:", res.data);
          setAllowed(true); // ⚠️ fallback: permite acesso para não travar a UI
        }
      } catch (err: any) {
        console.error("Erro ao verificar acesso:", err);

        // ✅ Se for erro 402 (Payment Required), redireciona para planos
        if (err.response?.status === 402) {
          setAllowed(false);
          setLocation("/plans");
        } else {
          // ⚠️ fallback: permite acesso mesmo se a API falhar
          setAllowed(true);
        }
      }
    };

    checkAccess();
  }, [setLocation]);

  if (allowed === null) {
    return <div>Carregando...</div>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
