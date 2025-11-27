import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const creditPlans = [
  {
    id: "starter",
    credits: 1000,
    price: "R$ 19,90",
    value: "R$ 0,020 por crédito",
    bonus: "0",
    popular: false,
  },
  {
    id: "professional",
    credits: 5000,
    price: "R$ 89,90",
    value: "R$ 0,018 por crédito",
    bonus: "500 bônus",
    popular: true,
  },
  {
    id: "enterprise",
    credits: 20000,
    price: "R$ 299,90",
    value: "R$ 0,015 por crédito",
    bonus: "3000 bônus",
    popular: false,
  },
];

export function CreditsModal({ open, onOpenChange }: CreditsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-3xl">Pacotes de Créditos</DialogTitle>
          <p className="text-muted-foreground">Use créditos para gerar conteúdo com IA</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          {creditPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 transition-all duration-300 ${
                plan.popular
                  ? "border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 shadow-xl shadow-indigo-500/20"
                  : "border-border/50 bg-card/50 hover:border-indigo-400/50"
              } p-6 flex flex-col h-full`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600">
                  Mais Vendido
                </Badge>
              )}

              <div className="mb-4">
                <div className="text-3xl font-bold text-indigo-400 mb-1">{plan.credits}</div>
                <p className="text-sm text-muted-foreground">Créditos</p>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold mb-1">{plan.price}</div>
                <p className="text-xs text-muted-foreground">{plan.value}</p>
              </div>

              {plan.bonus !== "0" && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 font-semibold">🎁 {plan.bonus}</p>
                </div>
              )}

              <div className="flex-1 mb-4 text-sm text-muted-foreground space-y-2">
                <p>✓ Válido por 1 ano</p>
                <p>✓ Sem limite de uso</p>
                <p>✓ Suporte por email</p>
              </div>

              <Button
                className={`w-full h-10 font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20"
                    : "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                Comprar Créditos
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-6">
          <h3 className="font-semibold mb-4">Como usam os créditos?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <p className="font-semibold mb-2">💬 Chat IA</p>
              <p className="text-muted-foreground">5 créditos por mensagem</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <p className="font-semibold mb-2">✍️ Gerador de Prompt</p>
              <p className="text-muted-foreground">3 créditos por geração</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <p className="font-semibold mb-2">🖼️ Gerar Imagem</p>
              <p className="text-muted-foreground">10 créditos por imagem</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <p className="font-semibold mb-2">🎬 Gerar Vídeo</p>
              <p className="text-muted-foreground">50 créditos por vídeo</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
