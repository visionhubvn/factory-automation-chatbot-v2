"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Maximize2, 
  Minimize2,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeadData {
  name: string | null;
  phone: string | null;
  email: string | null;
  interest: string | null;
  intent_level: string | null;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Chào bạn! Tôi là trợ lý AI chuyên gia về **Xử lý ảnh Công nghiệp (Machine Vision)**. Bạn đang quan tâm đến giải pháp tự động hóa hay các khóa học chuyên sâu của chúng tôi?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const processAIResponse = async (aiMessage: string) => {
    const leadTagRegex = /\|\|LEAD_DATA:\s*({.*?})\|\|/;
    const match = aiMessage.match(leadTagRegex);

    if (match) {
      try {
        const leadJson = JSON.parse(match[1]) as LeadData;
        console.log("✅ Lead Captured:", leadJson);
        
        // Gửi Lead về Google Sheets (chạy ngầm)
        sendLeadToGoogleSheets(leadJson);

        // Trả về nội dung AI đã làm sạch (xóa tag JSON đi)
        return aiMessage.replace(leadTagRegex, "").trim();
      } catch (e) {
        console.error("❌ Lead JSON Parse Error:", e);
      }
    }
    return aiMessage;
  };

  const sendLeadToGoogleSheets = async (lead: LeadData) => {
    const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    if (!GOOGLE_SCRIPT_URL) return;

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          sessionId,
          source: "Landing Page V2",
          chatHistory: messages.map(m => `[${m.role}]: ${m.content}`).join("\n"),
          timestamp: new Date().toLocaleString("vi-VN"),
          interest: lead.interest,
          intentLevel: lead.intent_level
        }),
      });
    } catch (error) {
      console.error("❌ Google Sheets Error:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      // Xử lý Lead data ẩn nếu có
      const cleanContent = await processAIResponse(data.content);
      
      setMessages([...newMessages, { role: "assistant", content: cleanContent }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Kết nối gián đoạn. Vui lòng thử lại sau." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-body">
      {/* Nút bong bóng chat */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full kinetic-gradient text-on-primary-fixed shadow-[0_10px_40px_rgba(0,224,176,0.5)] flex items-center justify-center group"
          >
            <MessageSquare className="w-8 h-8 group-hover:animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cửa sổ Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "64px" : "600px"
            }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`w-[380px] md:w-[420px] glass-panel border border-outline-variant/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}
          >
            {/* Header */}
            <div className="px-6 py-4 kinetic-gradient flex items-center justify-between cursor-pointer"
                 onClick={() => isMinimized && setIsMinimized(false)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center p-0.5 border border-white/30">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-headline font-black text-on-primary-fixed leading-none uppercase tracking-wider">
                    VISION.VAI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span className="text-[10px] text-on-primary-fixed/80 font-bold uppercase tracking-widest">
                      AI Specialist Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-on-primary-fixed"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-on-primary-fixed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nội dung chat */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary-container scrollbar-track-transparent">
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                          m.role === "user" ? "bg-secondary-container" : "bg-primary-container"
                        }`}>
                          {m.role === "user" ? <User className="w-4 h-4 text-on-secondary-container" /> : <Bot className="w-4 h-4 text-on-primary-container" />}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm chat-markdown ${
                          m.role === "user" 
                          ? "bg-secondary-container text-on-secondary-container rounded-tr-none" 
                          : "bg-surface-container-highest text-on-surface-variant rounded-tl-none border border-outline-variant/10"
                        }`}>
                          {m.role === "assistant" ? (
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(m.content) as string }} />
                          ) : m.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="flex gap-3 items-center bg-surface-container-highest/50 px-4 py-2 rounded-full border border-outline-variant/10">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-fixed" />
                        <span className="text-xs text-outline uppercase tracking-widest font-bold">ANALYZING...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface-container-high/50 border-t border-outline-variant/10">
                  <div className="relative flex items-center">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type your inquiry..."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 text-white text-sm px-5 py-4 rounded-xl focus:outline-none focus:border-primary-container transition-all pr-14 placeholder:text-outline/50 font-headline tracking-wide"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 p-2.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim transition-all disabled:opacity-30 flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[9px] text-center text-outline uppercase tracking-[0.2em] mt-3 font-bold opacity-50">
                    Industrial AI Protocol v2.5.4
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
