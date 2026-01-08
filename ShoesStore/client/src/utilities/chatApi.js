import axios from "axios";
// Prefer backend proxy if available; fallback to direct Groq API
const GROQ_BASE = process.env.REACT_APP_GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const backendChatPath = process.env.REACT_APP_CHAT_PROXY_PATH || ""; // empty means no proxy

const proxyClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL_FE,
  headers: { "Content-Type": "application/json" },
});

proxyClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function sendChat(messages, options = {}) {
  const { useProxy, model = "llama-3.3-70b-versatile", temperature = 0.3 } = options;
  const shouldProxy = typeof useProxy === "boolean" ? useProxy : Boolean(backendChatPath);
  // messages: [{ role: 'system'|'user'|'assistant', content: string }]
  try {
    if (shouldProxy) {
      const res = await proxyClient.post(backendChatPath, { messages, model, temperature });
      return res.data?.content || res.data?.message || "";
    }

    if (!GROQ_KEY) {
      throw new Error("Missing REACT_APP_GROQ_API_KEY for direct Groq calls");
    }

    const res = await axios.post(
      GROQ_BASE,
      { model, messages, temperature },
      { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } }
    );

    const choice = res.data?.choices?.[0];
    const content = choice?.message?.content || "";
    return content;
  } catch (err) {
    console.error("sendChat error:", err);
    return "Sorry, I couldn't reach the assistant right now.";
  }
}

export default { sendChat };