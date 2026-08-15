import React, { useEffect, useRef, useState } from "react";

export default function ChatBot({ userCoords }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 Ask for nearby services." }
  ]);
  const [input, setInput] = useState("");
  const [coords, setCoords] = useState(null);
  const messagesEndRef = useRef(null);

  // -------------------------------
  // Auto scroll to bottom
  // -------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------------------
  // Get GPS
  // -------------------------------
  useEffect(() => {
    if (userCoords) {
      setCoords(userCoords);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        () => {
          console.warn("GPS permission denied");
        }
      );
    }
  }, [userCoords]);

  // -------------------------------
  // Send Message
  // -------------------------------
  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    setMessages(m => [...m, { from: "user", text: userText }]);
    setInput("");

    try {
      const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8000";

const res = await fetch(`${API_BASE}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          lat: coords?.lat,
          lon: coords?.lon
        })
      });

      const data = await res.json();

      // 🔥 Handle list response
      if (data.type === "list") {
        setMessages(m => [
          ...m,
          {
            from: "bot",
            text: "",
            places: data.results || []
          }
        ]);
        return;
      }

      // 🔥 Handle single result
      if (data.type === "result") {
        setMessages(m => [
          ...m,
          {
            from: "bot",
            text: "",
            places: [data]
          }
        ]);
        return;
      }

      // 🔥 Normal chat fallback
      setMessages(m => [
        ...m,
        { from: "bot", text: data.message || "I’m here 🙂" }
      ]);

    } catch {
      setMessages(m => [
        ...m,
        { from: "bot", text: "⚠️ Server not responding." }
      ]);
    }
  }

  // -------------------------------
  // Google Maps Navigation
  // -------------------------------
  function navigateTo(place) {
    if (!place?.latitude || !place?.longitude) return;

    const url =
      coords
        ? `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lon}&destination=${place.latitude},${place.longitude}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

    window.open(url, "_blank");
  }

  return (
    <>
      {/* Floating Bot Button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#0d6efd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 26,
          color: "#fff",
          zIndex: 9999
        }}
      >
        🤖
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 320,
            height: 420,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999
          }}
        >
          <div style={{ padding: 10, fontWeight: "bold" }}>
            Smart City Assistant
          </div>

          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto"
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: m.from === "user" ? "right" : "left",
                  marginBottom: 10
                }}
              >
                {m.text && (
                  <div>
                    <b>{m.from === "user" ? "You" : "Bot"}:</b> {m.text}
                  </div>
                )}

                {/* 🔥 Render Places */}
                {m.places?.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {m.places.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 0",
                          borderBottom: "1px solid #eee"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "600" }}>
                            {p.name}
                          </div>
                          {p.distance_km && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#666"
                              }}
                            >
                              {p.distance_km} km
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => navigateTo(p)}
                          style={{
                            background: "#198754",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: 12
                          }}
                        >
                          Locate
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: 6, padding: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask for nearby services..."
              style={{ flex: 1 }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
