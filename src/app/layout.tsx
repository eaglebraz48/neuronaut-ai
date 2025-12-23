import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neuronaut",
  description: "Navigate job uncertainty with clarity and control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body style={{ margin: 0, background: "#0a0f1c", color: "white" }}>
        
        {/* 🔴 HARD HEADER — MUST SHOW */}
        <header
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: 0.5,
          }}
        >
          NEURONAUT — LAYOUT ACTIVE
        </header>

        {/* 🔵 PAGE CONTENT */}
        <main style={{ padding: "24px" }}>
          {children}
        </main>

      </body>
    </html>
  );
}
