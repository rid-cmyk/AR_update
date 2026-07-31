"use client";

import React, { useState } from "react";

interface MobileFABProps {
  icon?: React.ReactNode;
  onClick: () => void;
  color?: string;
  label?: string;
}

export default function MobileFAB({
  icon,
  onClick,
  color = "#25d366",
  label,
}: MobileFABProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        right: 20,
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {label && (
        <div
          style={{
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      )}
      <button
        onClick={onClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: color,
          border: "none",
          boxShadow: pressed
            ? `0 2px 8px ${color}80`
            : `0 4px 16px ${color}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
          transform: pressed ? "scale(0.92)" : "scale(1)",
          color: "#fff",
          fontSize: 24,
        }}
      >
        {icon || (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
