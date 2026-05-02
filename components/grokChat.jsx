"use client";
import GrokChat from "@/app/(main)/chat/page";
import { useState } from "react";


export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div style={{ position: "fixed", bottom: "80px", right: "24px", width: "380px", zIndex: 50 }}>
          <GrokChat />
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: "fixed", bottom: "24px", right: "24px", width: "52px", height: "52px", borderRadius: "50%", background: "#7c6aff", border: "none", cursor: "pointer", fontSize: "22px", zIndex: 50 }}
      >
        {open ? "✕" : "✦"}
      </button>
    </>
  );
}