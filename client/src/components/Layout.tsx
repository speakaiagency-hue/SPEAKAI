import { useLocation, Link } from "wouter";
import { MessageSquare, Type, Image as ImageIcon, Video, LayoutDashboard, Moon, Sun, BookOpen, Settings, Menu, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlansModal } from "./PlansModal";
import { UserMenu } from "./UserMenu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const isAdmin = localStorage.getItem("adminLoggedIn") === "true";

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Início" },
    { href: "/chat", icon: MessageSquare, label: "Chat IA" },
    { href: "/prompt", icon: Type, label: "Gerador de Prompt" },
    { href: "/image", icon: ImageIcon, label: "Gerar Imagem" },
    { href: "/video", icon: Video, label: "Gerar Vídeo" },
    { href: "/members", icon: BookOpen, label: "Área de Membros" },
  ];

  const handleNavigate = (href: string) => {
    setLocation(href);
    setIsOpen(false);
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location === item.href;
    return (
      <button
        onClick={() => handleNavigate(item.href)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-current")} />
        <span>{item.label}</span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border flex-col fixed h-full z-50 glass bg-background/80 backdrop-blur-xl transition-all duration-300">
        <div className="p-4 flex items-center justify-start border-b border-border/50 h-auto py-6">
          <img src="/speak-ai-logo.png" alt="Speak AI" className="h-20 object-contain" />
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-2">
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/admin")}
              className="w-full flex items-center justify-start gap-3 text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10"
            >
              <Settings className="w-5 h-5" />
              <span>Painel Admin</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4 h-20">
          <img src="/speak-ai-logo.png" alt="Speak AI" className="h-12 object-contain" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="absolute top-20 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            <div className="border-t border-border/50 pt-4 space-y-2 mt-4">
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation("/admin");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-start gap-3 text-yellow-600 hover:text-yellow-500 hover:bg-yellow-500/10"
                >
                  <Settings className="w-5 h-5" />
                  <span>Painel Admin</span>
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsDark(!isDark)}
                className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 min-h-screen pt-24 md:pt-0">
        {/* Top Bar with Créditos and Planos */}
        <div className="hidden md:flex fixed top-0 right-0 left-64 h-20 bg-background/80 backdrop-blur-xl border-b border-border/50 items-center justify-between px-6 z-30">
          <div></div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary/50 rounded-full"
              onClick={() => {}}
            >
              <Zap className="w-4 h-4 mr-2" />
              Créditos
            </Button>
            <Button
              variant="outline"
              className="border-border/50 text-foreground hover:bg-secondary/50 rounded-full"
              onClick={() => {}}
            >
              Personalizado
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/20"
              onClick={() => setPlansOpen(true)}
            >
              Planos
            </Button>
            <UserMenu />
          </div>
        </div>

        {/* Mobile Top Bar with Créditos and Planos */}
        <div className="md:hidden fixed top-20 left-0 right-0 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4 flex gap-2 z-30">
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 text-foreground hover:bg-secondary/50 flex-1 text-xs"
            onClick={() => {}}
          >
            <Zap className="w-3 h-3 mr-1" />
            Créditos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 text-foreground hover:bg-secondary/50 flex-1 text-xs"
            onClick={() => {}}
          >
            Personalizado
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex-1 font-semibold text-xs"
            onClick={() => setPlansOpen(true)}
          >
            Planos
          </Button>
        </div>

        <div className="max-w-7xl mx-auto p-6 lg:p-12 animate-in fade-in duration-500 slide-in-from-bottom-4 md:mt-20">
          {children}
        </div>
      </main>

      <PlansModal open={plansOpen} onOpenChange={setPlansOpen} />
    </div>
  );
}
