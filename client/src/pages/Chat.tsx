import { useState, useRef, useEffect } from "react";
import { Send, Eraser, Download, Bot, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader } from "@/lib/auth";
import { withMembershipCheck } from "@/components/ProtectedGenerator";
import ChatMessage from "@/components/ChatMessage"; // novo componente

import { Message } from "@/types";

function ChatComponent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Eu sou Speak AI. Como posso ajudar você hoje?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [useContext, setUseContext] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const conversationIdRef = useRef(Date.now().toString());

  // Auto scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = useContext
        ? messages.filter((m) => m.role !== "assistant" || m.id !== "1").map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          }))
        : [];

      const response = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          message: input,
          history,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar mensagem");
      }

      const result = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.text,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao conectar com IA";
      toast({
        title: "Erro ao enviar mensagem",
        description: message,
        variant: "destructive",
      });
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExport = () => {
    const text = messages
      .map((m) => `[${m.role.toUpperCase()}] ${new Date(m.timestamp).toLocaleTimeString()}: ${m.content}`)
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString()}.txt`;
    a.click();
    toast({ title: "Histórico exportado com sucesso!" });
  };

  const handleClear = () => {
    setMessages([]);
    toast({ title: "Conversa limpa" });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <span className="p-2 rounded-lg bg-primary/10 text-primary">
            <Bot className="w-6 h-6" />
          </span>
          Chat
        </h1>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => setUseContext(!useContext)}
          >
            <span>Contexto:</span>
            {useContext ? (
              <ToggleRight className="w-8 h-8 text-primary" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-destructive hover:bg-destructive/10"
          >
            <Eraser className="w-4 h-4 mr-2" /> Limpar
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse text-primary" />
                </div>
                <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-background/50 border-t border-border/50 backdrop-blur-md">
          <div className="max-w-4xl mx-auto relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem aqui..."
              className="pr-12 py-6 rounded-xl border-border/50 bg-secondary/30 focus:ring-primary/30 shadow-inner"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default withMembershipCheck(ChatComponent);
