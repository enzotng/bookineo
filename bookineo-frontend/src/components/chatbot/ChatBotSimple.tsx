import React from "react";

export const ChatBotSimple: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "red",
        color: "white",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "24px"
      }}
      onClick={() => alert("Chatbot clicked!")}
    >
      💬
    </div>
  );
};