"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatbotFloatingProps {
  className?: string;
}

export function ChatbotFloating({ className }: ChatbotFloatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [quickResponses, setQuickResponses] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load welcome message and quick responses on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadWelcomeData();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadWelcomeData = async () => {
    try {
      const response = await fetch("/api/chat");
      const data = await response.json();

      if (data.success) {
        setWelcomeMessage(data.welcomeMessage);
        setQuickResponses(data.quickResponses);

        // Add welcome message
        const welcomeMsg: ChatMessage = {
          id: "welcome",
          content: data.welcomeMessage,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
      }
    } catch (error) {
      console.error("Failed to load welcome data:", error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText.trim(),
          chatHistory: messages,
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I'm having trouble responding right now. Please try again! 🤖",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleQuickResponse = (response: string) => {
    sendMessage(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (messages.length === 0) {
      loadWelcomeData();
    }
    // Focus input after animation
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatMessage = (content: string) => {
    // Simple formatting for links and basic markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .split("\n")
      .map((line, index) => (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: line }} />
          {index < content.split("\n").length - 1 && <br />}
        </span>
      ));
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              onClick={openChat}
              size="lg"
              className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Card
              className={`w-80 h-96 flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm ${
                isMinimized ? "h-12" : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-semibold">CHTR Assistant</span>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-none text-xs"
                  >
                    AI
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMinimize}
                    className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-3 h-3" />
                    ) : (
                      <Minimize2 className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeChat}
                    className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl ${
                              message.role === "user"
                                ? "bg-blue-600 text-white ml-auto"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="text-sm leading-relaxed">
                              {formatMessage(message.content)}
                            </div>
                          </div>
                          {message.role === "user" && (
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 mt-1">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Loading indicator */}
                      {isLoading && (
                        <div className="flex gap-2 justify-start">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-gray-100 p-3 rounded-2xl">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick responses */}
                      {messages.length === 1 && quickResponses.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 font-medium">
                            Quick questions:
                          </p>
                          <div className="space-y-1">
                            {quickResponses.map((response, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickResponse(response)}
                                className="block w-full text-left p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-blue-800"
                              >
                                {response}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about trading, stocks, or CHTR..."
                        className="flex-1 border-gray-200 focus:border-blue-500"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
