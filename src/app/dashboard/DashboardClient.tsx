"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lang = "en" | "es";

const T = {
  en: {
    dashboard: "Dashboard",
    welcomeFixed: "Welcome to Neuronaut",
    situationTitle: "My situation",
    situationDesc: "Job and risk context",
    situationBtn: "Set up",
    snapshotTitle: "Stability snapshot",
    snapshotDesc: "Where you stand right now",
    snapshotBtn: "View snapshot",
    pathsTitle: "Next moves",
    pathsDesc: "Controlled options to reduce risk",
    pathsBtn: "Explore paths",
    english: "English",
    spanish: "Español",
  },
  es: {
    dashboard: "Panel",
    welcomeFixed: "Bienvenido a Neuronaut",
    situationTitle: "Mi situación",
    situationDesc: "Contexto laboral y riesgo",
    situationBtn: "Configurar",
    snapshotTitle: "Resumen de estabilidad",
    snapshotDesc: "Dónde te encuentras ahora",
    snapshotBtn: "Ver resumen",
    pathsTitle: "Próximos pasos",
    pathsDesc: "Opciones controladas para reducir riesgo",
    pathsBtn: "Explorar caminos",
    english: "English",
    spanish: "Español",
  },
};

export default function DashboardClient() {
  const sp = useSearchParams();
  const lang = (sp.get("lang") as Lang) || "en";
  const L = T[lang];

  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        setProfileComplete(false);
        return;
      }

      const { data: profile } = await supabase
        .from("neuronaut_profiles")
        .select("job_title, industry, status, concern")
        .eq("id", user.id)
        .single();

      const complete =
        !!profile?.job_title &&
        !!profile?.industry &&
        !!profile?.status &&
        !!profile?.concern;

      setProfileComplete(complete);
    })();
  }, []);

  const situationHref =
    profileComplete === false
      ? `/profile?lang=${lang}`
      : `/decision?lang=${lang}`;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: 24 }}>
      {/* Emblema + idioma */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: 18,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 60%, transparent 75%)",
          }}
        >
          <img
            src="/neuronautavatar.png"
            alt="Neuronaut emblem"
            style={{
              width: 150,
              opacity: 0.95,
              animation: "neuronPulse 7s ease-in-out infinite",
              filter:
                "drop-shadow(0 0 18px rgba(120,180,255,0.55)) drop-shadow(0 0 40px rgba(120,180,255,0.25))",
              willChange: "transform, opacity",
            }}
          />

          {/* Language switch */}
          <div style={{ display: "flex", gap: 14, fontSize: 14 }}>
            <Link
              href="?lang=en"
              style={{
                fontWeight: lang === "en" ? 700 : 400,
                opacity: lang === "en" ? 1 : 0.6,
                textDecoration: "none",
              }}
            >
              {L.english}
            </Link>
            <Link
              href="?lang=es"
              style={{
                fontWeight: lang === "es" ? 700 : 400,
                opacity: lang === "es" ? 1 : 0.6,
                textDecoration: "none",
              }}
            >
              {L.spanish}
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>{L.dashboard}</h1>
      <p style={{ marginBottom: 32, opacity: 0.85 }}>{L.welcomeFixed}</p>

      {/* Cards */}
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            padding: 24,
            borderRadius: 8,
            backgroundColor: "#1e293b",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ fontWeight: 600 }}>{L.situationTitle}</h2>
          <p>{L.situationDesc}</p>
          <Link
            href={situationHref}
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "10px 20px",
              backgroundColor: "#38bdf8",
              color: "black",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {L.situationBtn}
          </Link>
        </section>

        <section
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            padding: 24,
            borderRadius: 8,
            backgroundColor: "#1e293b",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ fontWeight: 600 }}>{L.snapshotTitle}</h2>
          <p>{L.snapshotDesc}</p>
          <Link
            href={`/snapshot?lang=${lang}`}
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "10px 20px",
              backgroundColor: "#38bdf8",
              color: "black",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {L.snapshotBtn}
          </Link>
        </section>

        <section
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            padding: 24,
            borderRadius: 8,
            backgroundColor: "#1e293b",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ fontWeight: 600 }}>{L.pathsTitle}</h2>
          <p>{L.pathsDesc}</p>
          <Link
            href={`/paths?lang=${lang}`}
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "10px 20px",
              backgroundColor: "#38bdf8",
              color: "black",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {L.pathsBtn}
          </Link>
        </section>
      </div>

      <style jsx global>{`
        @keyframes neuronPulse {
          0% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
}
