import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Packages with Kiwify links (add your actual links from Kiwify dashboard)
const creditPackages = [
  {
    id: "100",
    credits: 100,
    price: "57,00",
    originalPrice: "97,00",
    kiwifyLink: "https://pay.kiwify.com.br/KRTMqIF", // Replace with your 100 credits link
    highlighted: false,
  },
  {
    id: "200",
    credits: 200,
    price: "117,00",
    originalPrice: "187,00",
    kiwifyLink: "https://pay.kiwify.com.br/KRTMqIF", // Replace with your 200 credits link
    highlighted: false,
  },
  {
    id: "300",
    credits: 300,
    price: "287,00",
    originalPrice: "287,00",
    kiwifyLink: "https://pay.kiwify.com.br/KRTMqIF", // Replace with your 300 credits link
    highlighted: false,
  },
  {
    id: "500",
    credits: 500,
    price: "277,00",
    originalPrice: "477,00",
    kiwifyLink: "https://pay.kiwify.com.br/KRTMqIF", // Replace with your 500 credits link
    highlighted: true, // Most popular
  },
  {
    id: "1000",
    credits: 1000,
    price: "517,00",
    originalPrice: "957,00",
    kiwifyLink: "https://pay.kiwify.com.br/KRTMqIF", // Replace with your 1000 credits link
    highlighted: false,
  },
  {
    id: "2000",
    credits: 2000,
    price: "977,00",
    originalPrice: "1147,00",
    kiwifyLink: "https://pay.kiwify.com.br/KRTMqIF", // Replace with your 2000 credits link
    highlighted: false,
  },
];

export default function Credits() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Comprar Créditos
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha o pacote de créditos que melhor se adequa às suas necessidades
          </p>
        </div>

        {/* Grid de Pacotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
                pkg.highlighted
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-slate-900 shadow-2xl shadow-indigo-500/40 lg:scale-105"
                  : "border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-indigo-400/50"
              }`}
            >
              {/* Highlight Badge */}
              {pkg.highlighted && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  ⭐ Mais Popular
                </div>
              )}

              <div className="p-6 flex flex-col h-full">
                {/* Credits Amount */}
                <div className="mb-4">
                  <div className="text-5xl font-bold text-indigo-300 mb-2">
                    {pkg.credits}
                  </div>
                  <div className="text-muted-foreground">Créditos</div>
                </div>

                {/* Price */}
                <div className="mb-6 pb-4 border-b border-slate-700">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {pkg.originalPrice}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    R$ {pkg.price}
                  </div>
                </div>

                {/* Benefits */}
                <div className="flex-1 mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Válido por 365 dias</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Suporte prioritário</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span>Acesso imediato</span>
                  </div>
                </div>

                {/* Button */}
                <Button
                  onClick={() => window.open(pkg.kiwifyLink, "_blank")}
                  className={`w-full h-10 font-semibold transition-all ${
                    pkg.highlighted
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                      : "border border-indigo-500/50 text-indigo-300 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-400"
                  }`}
                  variant={pkg.highlighted ? "default" : "outline"}
                  data-testid={`button-buy-credits-${pkg.id}`}
                >
                  Comprar Agora
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            ✓ Pagamento seguro via Kiwify • ✓ Créditos depositados instantaneamente • ✓ Suporte 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
