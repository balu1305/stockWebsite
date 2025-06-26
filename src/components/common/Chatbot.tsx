"use client";
import React, { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "system", content: "You are a helpful trading assistant." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      setMessages([...newMessages, data.reply]);
    } catch (error) {
      alert("Error connecting to ChatGPT");
    }

    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
      {open ? (
        <div className="rounded-xl shadow-lg border bg-white w-80 h-[460px] flex flex-col">
          <div className="p-3 border-b flex justify-between items-center font-semibold">
            Trading Chatbot
            <button onClick={() => setOpen(false)}>✖</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 text-sm">
            {messages.slice(1).map((msg, i) => (
              <div key={i} className={\`p-2 rounded \${msg.role === "user" ? "bg-blue-100 text-right" : "bg-gray-100"}\`}>
                {msg.content}
              </div>
            ))}
            {loading && <div className="text-gray-400">Thinking...</div>}
          </div>
          <div className="p-2 border-t flex gap-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button onClick={sendMessage} className="px-3 bg-blue-500 text-white rounded text-sm">
              Send
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-full shadow">
          💬
        </button>
      )}
    </div>
  );
}
