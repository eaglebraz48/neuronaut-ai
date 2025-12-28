import "./globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Neuronaut",
  description: "Navigate job uncertainty with clarity and control.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>

      <body
        style={{
          backgroundColor: "#0a0f1c",
          color: "#fff",
          minHeight: "100vh",
        }}
      >
        <main>
          <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}
