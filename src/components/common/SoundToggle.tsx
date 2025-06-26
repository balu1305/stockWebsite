import React, { useState, useEffect } from "react";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("soundEnabled");
    if (saved !== null) setEnabled(saved === "true");
  }, []);

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem("soundEnabled", String(newState));
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 bg-zinc-800 text-white px-3 py-1 rounded text-sm shadow z-50"
    >
      🔈 Sound {enabled ? "On" : "Off"}
    </button>
  );
}
