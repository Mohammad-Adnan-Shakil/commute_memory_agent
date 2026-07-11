import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import EmptyState from "./components/EmptyState";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import PreviouslyAsked from "./components/PreviouslyAsked";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, session_id: sessionId }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: data.response,
          tools: data.tool_trace,
          routeCoordinates: data.route_coordinates || null,
          congestionLevel: data.congestion_level || null,
          bottleneckIndices: data.bottleneck_segment_indices || null,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: `Error: ${err.message}`, tools: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, sessionId]);

  const latestUserQuery = messages.length > 0
    ? [...messages].reverse().find((m) => m.role === "user")?.text || ""
    : "";

  const handleExampleClick = useCallback((text) => {
    sendMessage(text);
  }, [sendMessage]);

  const handleSend = useCallback(() => {
    sendMessage();
  }, [sendMessage]);

  return (
    <div className="h-dvh bg-neutral-950 text-neutral-100 flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.02),transparent_50%)]" />
      </div>

      <Header />
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {messages.length === 0 ? (
          <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <EmptyState onSend={handleExampleClick} />
          </div>
        ) : (
          <MessageList messages={messages} loading={loading} />
        )}
      </div>
      {messages.length > 0 && !loading && (
        <PreviouslyAsked queryText={latestUserQuery} />
      )}
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={handleSend}
        loading={loading}
      />
    </div>
  );
}
