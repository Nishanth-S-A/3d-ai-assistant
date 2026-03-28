import { useState } from "react";

export const useOllama = () => {
  const [loading, setLoading] = useState(false);

  const ask = async (messages, onStreamUpdate) => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        // Uses Vite proxy
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_OLLAMA_MODEL || "llama3.2",
          messages,
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Mission compromised: network link failed");
      }

      if (!res.body) {
        throw new Error("No response body for streaming");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.message?.content) {
              fullText += parsed.message.content;
              if (onStreamUpdate) {
                onStreamUpdate(fullText);
              }
            }
          } catch (e) {
            console.error("Error parsing streaming line:", e, trimmed);
            // Skip malformed lines
          }
        }
      }

      const trailing = buffer.trim();
      if (trailing) {
        try {
          const parsed = JSON.parse(trailing);
          if (parsed.message?.content) {
            fullText += parsed.message.content;
            if (onStreamUpdate) {
              onStreamUpdate(fullText);
            }
          }
        } catch (e) {
          console.error("Error parsing trailing line:", e, trailing);
        }
      }

      return fullText || "I could not generate a response.";
    } catch (e) {
      const fallback = "Agent temporarily off-grid. Try again later.";
      if (onStreamUpdate) {
        onStreamUpdate(fallback);
      }
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return { ask, loading };
};
