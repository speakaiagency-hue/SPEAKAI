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
    } finally {
      setIsTyping(false);
    }
  };

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
