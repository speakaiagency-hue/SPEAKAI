import { Coins, AlertCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthHeader } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreditsDisplayProps {
  operationCost: number;
  operationName: string;
  creditsAfterOperation?: number;
}

export function CreditsDisplay({ operationCost, operationName, creditsAfterOperation }: CreditsDisplayProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
    const interval = setInterval(fetchCredits, 2000);
    return () => clearInterval(interval);
  }, [creditsAfterOperation]);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/credits/balance", {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasEnoughCredits = credits !== null && credits >= operationCost;

  return (
    <div className="space-y-2">
      {/* Credits Balance - Minimalista */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <span className="text-xs text-muted-foreground">Disponível</span>
        <div className={cn(
          "text-lg font-bold",
          loading ? "text-gray-500" : hasEnoughCredits ? "text-green-400" : "text-red-400"
        )}>
          {loading ? "..." : credits}
        </div>
      </div>

      {/* Operation Cost - Minimalista */}
      <div className={cn(
        "flex items-center justify-between p-2 rounded text-xs",
        hasEnoughCredits 
          ? "text-blue-400" 
          : "text-red-400"
      )}>
        <span>Custo {operationName}</span>
        <span className="font-semibold">-{operationCost}</span>
      </div>

      {/* Insufficient Credits Warning */}
      {!loading && !hasEnoughCredits && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
            <div className="text-xs text-red-400">
              Precisa de {operationCost} créditos. Compre mais!
            </div>
          </div>
          <a
            href="https://pay.kiwify.com.br/KRTMqIF"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-8 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center justify-center gap-1"
            data-testid="button-buy-credits"
          >
            <Plus className="w-3 h-3" />
            Comprar 190 Créditos (R$ 19)
          </a>
        </div>
      )}

      {/* After Operation Credits */}
      {creditsAfterOperation !== undefined && (
        <div className="flex items-center justify-between p-2 rounded text-xs bg-green-500/5 text-green-400">
          <span>Após operação</span>
          <span className="font-semibold">{creditsAfterOperation}</span>
        </div>
      )}
    </div>
  );
}
