// components/GrokChat.jsx
"use client";
import { useState, useRef, useEffect } from "react";

import ChatInput from "./_components/chatInput";
import ChatMessage from "./_components/chat-message";


export default function GrokChat() {
  const [messages, setMessages] = useState([
    { id: "welcome", role: "assistant", content: "Hey, I'm Grok. Ask me anything." }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;
    const assistantId = Date.now().toString();
    const history = messages
      .filter(m => m.id !== "welcome")
      .map(({ role, content }) => ({ role, content }));

    setMessages(prev => [
      ...prev,
      { id: Date.now() - 1 + "", role: "user", content: text },
      { id: assistantId, role: "assistant", content: "" }
    ]);
    setIsStreaming(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...history, { role: "user", content: text }] }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      const snap = accumulated;
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: snap } : m));
    }
    setIsStreaming(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "500px", border: "1px solid #eee", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop: "1px solid #eee", padding: "12px" }}>
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}