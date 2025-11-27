import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface PlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    id: "basico",
    name: "Básico",
    price: "R$ 29,90",
    period: "/mês",
    description: "Perfeito para iniciantes",
    features: [
      "Chat IA ilimitado",
      "Gerador de Prompt básico",
      "5 gerações de imagem/mês",
      "Suporte por email",
    ],
    notIncluded: ["Gerador de vídeo", "Prioridade no suporte"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 79,90",
    period: "/mês",
    description: "Para profissionais",
    features: [
      "Chat IA ilimitado",
      "Gerador de Prompt avançado",
      "50 gerações de imagem/mês",
      "10 gerações de vídeo/mês",
      "Suporte prioritário",
      "Análise de desempenho",
    ],
    notIncluded: [],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 199,90",
    period: "/mês",
    description: "Para agências e empresas",
    features: [
      "Tudo do plano Pro",
      "Gerações de imagem ilimitadas",
      "Gerações de vídeo ilimitadas",
      "API dedicada",
      "Suporte 24/7",
      "Relatórios personalizados",
      "Integração customizada",
    ],
    notIncluded: [],
    highlighted: false,
  },
];

export function PlansModal({ open, onOpenChange }: PlansModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-border/50 shadow-2xl shadow-indigo-500/20">
        <DialogHeader className="text-center space-y-4 pb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Nossos Planos</DialogTitle>
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">Escolha o plano ideal para suas necessidades</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all duration-500 ${
                plan.highlighted
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-slate-900 shadow-2xl shadow-indigo-500/40 scale-105 hover:scale-110 hover:shadow-indigo-500/60"
                  : "border-border/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/10"
              } p-6 flex flex-col h-full group`}
              style={{
                animation: mounted ? `slideInUp 0.6s ease-out ${idx * 0.1}s both` : "none",
              }}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50 animate-pulse">
                  ⭐ Mais Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? "text-indigo-300" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6 pb-4 border-b border-border/30">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-indigo-300" : "text-white"}`}>
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>

              <div className="flex-1 mb-6 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Incluso:</p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}

                {plan.notIncluded.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase pt-3">Não incluso:</p>
                    {plan.notIncluded.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-50">
                        <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <Button
                className={`w-full h-11 font-semibold transition-all duration-300 group/btn ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/60 text-white"
                    : "border border-indigo-500/50 text-indigo-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20 hover:border-indigo-400"
                }`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                <span className="flex items-center gap-2">
                  Escolher Plano
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </span>
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ✓ Período de teste gratuito de 7 dias • Cancele a qualquer momento • Sem compromisso
          </p>
        </div>

        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
