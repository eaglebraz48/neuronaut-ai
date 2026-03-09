import "./globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import HashAuthBridge from "@/components/HashAuthBridge";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Lang = "en" | "es" | "pt" | "fr";
const LANGS: readonly Lang[] = ["en", "es", "pt", "fr"] as const;

async function getLangFromCookie(): Promise<Lang> {
  try {
    const jar = await cookies();
    const v = jar.get("neuronaut_lang")?.value;
    if (v && (LANGS as readonly string[]).includes(v as Lang)) {
      return v as Lang;
    }
  } catch {}
  return "en";
}

export const metadata = {
  title: "Neuronaut AI",
  description:
    "Neuronaut is an AI decision agent that helps people navigate career changes, layoffs, and uncertain life moments.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const lang = await getLangFromCookie();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Language" content={lang} />
        <meta name="content-language" content={lang} />
        <meta name="google" content="notranslate" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>

      <body
        style={{
          backgroundColor: "#0a0f1c",
          color: "#fff",
          minHeight: "100vh",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <HashAuthBridge />

        <main style={{ minHeight: "100vh" }}>
          <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}