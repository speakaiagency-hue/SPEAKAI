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
    if (!isAuthenticated()) {
      setLocation("/login");
      return;
    }

    const checkAccess = async () => {
      try {
        const res = await axios.get("/api/auth/check-access", {
          headers: { ...getAuthHeader(), Accept: "application/json" },
          validateStatus: (status) => [200, 304, 402].includes(status),
        });

        if (res.status === 304) {
          // Nada novo, mantém estado atual
          return;
        }

        if (res.status === 402) {
          setAllowed(false);
          setLocation("/plans");
          return;
        }

        const data = res.data;
        if (data && typeof data === "object" && "hasAccess" in data) {
          if (data.hasAccess) {
            setAllowed(true);
          } else {
            setAllowed(false);
            setLocation("/plans");
          }
        } else {
          console.error("Resposta inesperada da API:", data);
          setAllowed(false); // não libera acesso em caso de resposta inválida
        }
      } catch (err: any) {
        console.error("Erro ao verificar acesso:", err);
        setAllowed(false); // não libera acesso em caso de erro
      }
    };

    checkAccess();
  }, [setLocation]);

  if (allowed === null) {
    return <div>Carregando...</div>;
  }

  if (!allowed) {
    return <div>Sem acesso</div>; // mostra mensagem em vez de sumir
  }

  return <>{children}</>;
}
