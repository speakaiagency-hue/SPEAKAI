import React from "react";
import { Message } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
  personaIcon?: string; // ícone da persona ativa
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, personaIcon }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      {!isUser && personaIcon && (
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3 shrink-0">
          <span className="text-lg">{personaIcon}</span>
        </div>
      )}

      <div
        className={`p-4 rounded-2xl max-w-[70%] shadow-md ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
        }`}
      >
        {/* Renderiza texto com markdown */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>

        {/* Se houver imagem anexada ou gerada */}
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Imagem gerada ou anexada"
            className="mt-3 rounded-lg border border-gray-300 shadow-md max-h-64 object-contain"
          />
        )}

        {/* Timestamp */}
        <div className="text-xs opacity-60 mt-2">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
