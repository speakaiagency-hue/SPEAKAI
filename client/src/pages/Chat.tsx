<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
import { Send, Eraser, Download, User, Bot, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader } from "@/lib/auth";
import { withMembershipCheck } from "@/components/ProtectedGenerator";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

function ChatComponent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Eu sou Speak AI. Como posso ajudar você hoje?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [useContext, setUseContext] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const conversationIdRef = useRef(Date.now().toString());

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages
        .filter((m) => m.role !== "assistant" || m.id !== "1")
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

      const response = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          message: input,
          history: useContext ? history : [],
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
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao conectar com IA";
      toast({ title: message, variant: "destructive" });
      console.error("Chat error:", error);
=======
import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatSession, Persona } from "../types";
import { PERSONAS, INITIAL_CHAT_TITLE } from "../constants";
import { gemini } from "../services/gemini";
import Sidebar from "../components/Sidebar";
import ChatMessage from "../components/ChatMessage";

const Chat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      const newSession: ChatSession = {
        id: uuidv4(),
        title: INITIAL_CHAT_TITLE,
        messages: [],
        personaId: activePersona.id,
        createdAt: Date.now(),
      };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  }, [sessions.length, activePersona.id]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, scrollToBottom, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedImage({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !attachedImage) || isTyping || !activeSession) return;

    const isImageGeneration = /^(gere|gerar|crie|desenhe|make|create|generate|paint|draw)\b/i.test(
      inputValue.trim()
    );

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
      imageUrl: attachedImage?.data,
      imageMimeType: attachedImage?.mimeType,
    };

    const updatedMessages = [...activeSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: updatedMessages,
              title:
                s.title === INITIAL_CHAT_TITLE
                  ? userMessage.content.slice(0, 30) || "Imagem anexada"
                  : s.title,
            }
          : s
      )
    );

    const currentPrompt = inputValue;
    const currentAttached = attachedImage;

    setInputValue("");
    setAttachedImage(null);
    setIsTyping(true);

    if (isImageGeneration) {
      const modelMessageId = uuidv4();
      try {
        const { imageUrl, description } = await gemini.generateImage(currentPrompt);
        const modelMessage: Message = {
          id: modelMessageId,
          role: "model",
          content: description || "Aqui está a imagem que você pediu:",
          imageUrl: imageUrl,
          timestamp: Date.now(),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId ? { ...s, messages: [...s.messages, modelMessage] } : s
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Normal stream chat
    const modelMessageId = uuidv4();
    const initialModelMessage: Message = {
      id: modelMessageId,
      role: "model",
      content: "",
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [...s.messages, initialModelMessage] } : s
      )
    );

    try {
      let accumulatedContent = "";
      const stream = gemini.streamChat(updatedMessages, activePersona, currentAttached || undefined);

      for await (const chunk of stream) {
        accumulatedContent += chunk;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              const msgs = [...s.messages];
              const lastMsgIdx = msgs.findIndex((m) => m.id === modelMessageId);
              if (lastMsgIdx !== -1) {
                msgs[lastMsgIdx] = { ...msgs[lastMsgIdx], content: accumulatedContent };
              }
              return { ...s, messages: msgs };
            }
            return s;
          })
        );
      }
    } catch (error) {
      console.error(error);
>>>>>>> 87d5f26ece9d13fb96c693db41abfb9dbe19437a
    } finally {
      setIsTyping(false);
    }
  };

<<<<<<< HEAD
  const handleExport = () => {
    const text = messages
      .map((m) => `[${m.role.toUpperCase()}] ${m.timestamp.toLocaleTimeString()}: ${m.content}`)
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
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary"><Bot className="w-6 h-6" /></span>
            Chat
          </h1>
        </div>
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
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:bg-destructive/10">
            <Eraser className="w-4 h-4 mr-2" /> Limpar
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-4 animate-in fade-in slide-in-from-bottom-2",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                    m.role === "user" 
                      ? "bg-gradient-to-br from-primary to-violet-600 text-white" 
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {m.role === "user" ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div
                  className={cn(
                    "p-4 rounded-2xl max-w-[80%] shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary/50 backdrop-blur-md rounded-tl-sm border border-border/50"
                  )}
                >
                  <div className="prose dark:prose-invert prose-sm max-w-none break-words">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                  <div className="text-[10px] opacity-50 mt-2 text-right uppercase tracking-wider font-medium">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
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
=======
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: INITIAL_CHAT_TITLE,
      messages: [],
      personaId: activePersona.id,
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  return (
    <div className="flex h-screen text-slate-100 overflow-hidden relative">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onSelectPersona={setActivePersona}
        activePersona={activePersona}
      />

      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 pt-20">
          <div className="max-w-4xl mx-auto w-full">
            {activeSession?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center mt-20 text-center">
                <h1 className="text-4xl md:text-6xl font-black mb-8 purple-gradient-text uppercase leading-tight tracking-tighter">
                  SPEAK AI
                </h1>

                <div className="space-y-4 w-full max-w-sm mx-auto">
                  {[
                    "Gere uma imagem de um robô cyberpunk",
                    "O que tem nesta imagem?",
                    "Crie uma logo minimalista roxa",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputValue(suggestion)}
                      className="brand-outline-btn w-full text-center hover:scale-105 transition-transform"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeSession?.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} personaIcon={activePersona.icon} />
              ))
            )}

            {isTyping && (
              <div className="flex justify-center w-full mb-12">
                <div className="w-full max-w-2xl text-[9px] uppercase tracking-[0.4em] text-purple-400/40 font-black px-8 py-4 animate-pulse text-center">
                  Processing Neural Content...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-8 pb-12">
          <div className="max-w-2xl mx-auto">
            {/* Image Preview before sending */}
            {attachedImage && (
              <div className="mb-4 flex justify-center">
                <div className="relative group">
                  <img
                    src={attachedImage.data}
                    className="h-24 w-24 object-cover rounded-2xl border border-white/20 shadow-xl"
                  />
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
                       )}

            <form
              onSubmit={handleSendMessage}
              className="relative glass border-white/5 rounded-[2.5rem] p-2 flex items-center gap-1 group transition-all"
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 text-slate-500 hover:text-purple-400 transition-colors flex-shrink-0"
                title="Attach Image for Vision"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Talk or ask for an image..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-700 py-4 px-2 min-h-[56px] max-h-40 resize-none text-sm tracking-wide self-center"
                rows={1}
              />

              <div className="px-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !attachedImage) || isTyping}
                  className="btn-purple-solid"
                >
                  <span>Enviar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
>>>>>>> 87d5f26ece9d13fb96c693db41abfb9dbe19437a
