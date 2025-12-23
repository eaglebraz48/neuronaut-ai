'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from '../../lib/supabase';

import DecisionForm from '../../components/DecisionForm';  // Adjust this path if necessary

type Lang = "en" | "es";

const T = {
  en: {
    title: "My situation",
    subtitle: "Tell us a bit about your current work context.",
    jobTitle: "Current role",
    industry: "Industry",
    status: "Employment status",
    concern: "Main concern",
    save: "Save",
    back: "← Back to dashboard",
    statuses: {
      employed: "Employed",
      at_risk: "At risk",
      laid_off: "Recently laid off",
    },
    concerns: {
      income: "Income",
      stability: "Stability",
      time: "Time pressure",
      relevance: "Skill relevance",
    },
    decisionText: "Use this decision tool to complete your profile and make decisions about your next steps.",
  },
  es: {
    title: "Mi situación",
    subtitle: "Cuéntanos un poco sobre tu contexto laboral actual.",
    jobTitle: "Rol actual",
    industry: "Industria",
    status: "Estado laboral",
    concern: "Preocupación principal",
    save: "Guardar",
    back: "← Volver al panel",
    statuses: {
      employed: "Empleado",
      at_risk: "En riesgo",
      laid_off: "Recientemente despedido",
    },
    concerns: {
      income: "Ingresos",
      stability: "Estabilidad",
      time: "Presión de tiempo",
      relevance: "Relevancia de habilidades",
    },
    decisionText: "Utiliza esta herramienta de decisiones para completar tu perfil y tomar decisiones sobre tus próximos pasos.",
  },
};

export default function ProfilePage() {
  const sp = useSearchParams();
  const lang: Lang = (sp.get("lang") as Lang) || "en";
  const L = T[lang];

  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("");
  const [concern, setConcern] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("neuronaut_profiles")
        .select("job_title, industry, status, concern")
        .eq("id", user.id)
        .single();

      if (profile) {
        setJobTitle(profile.job_title ?? "");
        setIndustry(profile.industry ?? "");
        setStatus(profile.status ?? "");
        setConcern(profile.concern ?? "");
      }
    })();
  }, []);

  const save = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;

    await supabase.from("neuronaut_profiles").upsert({
      id: user.id,
      job_title: jobTitle,
      industry,
      status,
      concern,
    });
  };

  return (
    <main style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 700 }}>{L.title}</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>{L.subtitle}</p>

      <div style={{ marginTop: 32, display: "grid", gap: 20 }}>
        <div>
          <label>{L.jobTitle}</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>

        <div>
          <label>{L.industry}</label>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>

        <div>
          <label>{L.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          >
            <option value="">—</option>
            <option value="employed">{L.statuses.employed}</option>
            <option value="at_risk">{L.statuses.at_risk}</option>
            <option value="laid_off">{L.statuses.laid_off}</option>
          </select>
        </div>

        <div>
          <label>{L.concern}</label>
          <select
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          >
            <option value="">—</option>
            <option value="income">{L.concerns.income}</option>
            <option value="stability">{L.concerns.stability}</option>
            <option value="time">{L.concerns.time}</option>
            <option value="relevance">{L.concerns.relevance}</option>
          </select>
        </div>

        <button onClick={save} style={{ marginTop: 12 }}>
          {L.save}
        </button>

        <Link href={`/dashboard?lang=${lang}`}>{L.back}</Link>
      </div>

      <section style={{ marginTop: 32 }}>
        <p>{L.decisionText}</p>
        <DecisionForm /> {/* Decision tool placed here */}
      </section>
    </main>
  );
}
