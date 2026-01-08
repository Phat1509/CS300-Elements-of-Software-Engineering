import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProductDetail } from "../../utilities/api";
import { sendChat } from "../../utilities/chatApi";

function useProductContext() {
  const location = useLocation();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const match = location.pathname.match(/\/product\/(\d+)/);
    if (!match) {
      setProduct(null);
      return;
    }
    const id = match[1];
    (async () => {
      const p = await getProductDetail(id);
      if (!p) return setProduct(null);
      setProduct({
        id: p.id,
        name: p.name,
        price: p.price,
        discount_percentage: p.discount_percentage,
        brand: p.brandName,
        category: p.categoryName,
      });
    })();
  }, [location.pathname]);

  return product;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const product = useProductContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem("chat.messages");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("chat.messages", JSON.stringify(messages));
  }, [messages]);

  const systemPrompt = useMemo(() => {
    const uname = user?.name || user?.email || "Guest";
    const pctx = product
      ? `Current product: ${product.name} (id ${product.id}), price ${product.price}, discount ${product.discount_percentage}%, brand ${product.brand || ""}, category ${product.category || ""}.`
      : "No specific product selected.";
    return [
      "You are a helpful shopping assistant for a shoes store.",
      `User: ${uname}.`,
      pctx,
      "Be concise and helpful. If asked about account, cart, orders, or products, respond based on provided context and ask clarifying questions if needed.",
    ].join("\n");
  }, [user, product]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");

    const newMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
      { role: "user", content },
    ].slice(-12); // limit context size

    setMessages((prev) => [...prev, { role: "user", content }]);
    setSending(true);
    try {
      const reply = await sendChat(newMessages, { useProxy: false });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the assistant right now." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-widget-root">
      {/* Bubble */}
      <button
        type="button"
        className="chat-bubble"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
      >
        {open ? "×" : "💬"}
      </button>

      {/* Panel */}
      {open && (
        <div className="chat-panel">
          <div className="chat-header">Assistant</div>
          <div className="chat-body">
            {messages.length === 0 && (
              <div className="chat-empty">Ask me about products, orders, or your account.</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.role}`}>
                <div className="bubble">{m.content}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder={sending ? "Sending..." : "Type your message"}
              disabled={sending}
            />
            <button type="button" onClick={handleSend} disabled={sending || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}