'use client';

import { useEffect, useMemo, useState } from 'react';

type Persistence = 'local' | 'session' | 'none';

type Props = {
  termsVersion?: string;
  persistence?: Persistence;
  productName?: string;
  companyName?: string;
  onAccepted?: () => void;
};

export default function DisclaimerModal({
  termsVersion = '2026-01-02',
  persistence = 'local',
  productName = 'Neuronaut',
  companyName = 'Arison8, LLC',
  onAccepted,
}: Props) {
  const KEY = useMemo(
    () => `neuronaut_disclaimer_accepted_v${termsVersion}`,
    [termsVersion]
  );

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (persistence === 'none') {
      setOpen(true);
      return;
    }

    if (typeof window === 'undefined') {
      setOpen(true);
      return;
    }

    try {
      const storage =
        persistence === 'session'
          ? window.sessionStorage
          : window.localStorage;
      const ok = storage.getItem(KEY) === 'true';
      setOpen(!ok);
    } catch {
      setOpen(true);
    }
  }, [KEY, persistence]);

  function accept() {
    try {
      if (typeof window !== 'undefined') {
        if (persistence === 'local') {
          window.localStorage.setItem(KEY, 'true');
        } else if (persistence === 'session') {
          window.sessionStorage.setItem(KEY, 'true');
        }
      }
    } finally {
      setOpen(false);
      setScrolled(false);
      onAccepted?.();
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="neuronaut-disclaimer-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 'min(760px, 92vw)',
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 16px 50px rgba(2,6,23,.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8f0' }}>
          <h2
            id="neuronaut-disclaimer-title"
            style={{ margin: 0, fontSize: 18, fontWeight: 800 }}
          >
            Before You Continue
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#475569' }}>
            Please scroll through this disclaimer to continue.
          </p>
        </div>

        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
              setScrolled(true);
            }
          }}
          style={{
            maxHeight: '62vh',
            overflowY: 'auto',
            padding: 18,
            lineHeight: 1.55,
            color: '#0f172a',
          }}
        >
          <h3 style={{ marginTop: 0 }}>English</h3>

          <p>
            <strong>Informational Use Only.</strong> {productName} provides
            general informational and educational guidance and is not a
            substitute for professional advice. Laws, regulations, and
            professional standards vary by country and jurisdiction.
            <strong> Governing Language.</strong> This disclaimer is written in
            English. Any translations are provided for convenience only. In the
            event of any inconsistency, the English version shall prevail.
          </p>

          <p>
            <strong>No Professional Advice.</strong> {productName} does not
            provide:
            <br />• medical advice, diagnosis, or treatment
            <br />• mental health counseling, therapy, or crisis support
            <br />• legal advice
            <br />• financial, investment, or credit advice
            <br />• tax, immigration, or regulatory advice
          </p>

          <p>
            <strong>Emergency / Crisis.</strong> If you are in immediate danger,
            experiencing a medical emergency, or thinking about self-harm, call
            your local emergency number immediately (in the U.S., call 911). In
            the U.S., mental health crisis support is available via call or text
            at <strong>988</strong>.
          </p>

          <p>
            <strong>User Responsibility.</strong> You are responsible for your
            own decisions and actions. Always verify information independently
            and consult a qualified professional licensed in your jurisdiction
            before acting.
          </p>

          <p>
            <strong>International Use.</strong> Laws, regulations, professional
            standards, and consumer protections vary by country, state, and
            locality. Guidance may not apply to your location.
          </p>

          <p>
            <strong>Language & Translation.</strong> Responses may be generated
            or translated automatically. Meaning, tone, and legal interpretation
            may vary across languages. The English version controls in case of
            discrepancy.
          </p>

          <p style={{ marginBottom: 0 }}>
            <strong>Limitation of Liability.</strong> To the maximum extent
            permitted by law, {companyName} is not liable for any direct or
            indirect damages arising from your use of {productName}.
          </p>

          <hr style={{ margin: '18px 0' }} />

          <h3>Português (Brasil)</h3>
          <p>
            <strong>Aviso:</strong> {productName} oferece informações gerais e
            não substitui aconselhamento profissional (médico, psicológico,
            jurídico, financeiro, tributário ou imigração). As leis variam por
            país ou jurisdição. Traduções automáticas podem alterar o sentido. Em
            caso de divergência, a versão em inglês prevalece.
          </p>

          <h3>Español</h3>
          <p>
            <strong>Aviso:</strong> {productName} brinda información general y no
            sustituye asesoramiento profesional (médico, salud mental, legal,
            financiero, impuestos o inmigración). Las leyes varían según el país
            o jurisdicción. Las traducciones automáticas pueden cambiar el
            significado. En caso de discrepancia, prevalece la versión en
            inglés.
          </p>

          <h3>Français</h3>
          <p>
            <strong>Avis :</strong> {productName} fournit des informations
            générales et ne remplace pas un avis professionnel (médical, santé
            mentale, juridique, financier, fiscal ou immigration). Les lois
            varient selon le pays ou la juridiction. Les traductions automatiques
            peuvent modifier le sens. En cas de divergence, la version anglaise
            prévaut.
          </p>
        </div>

        <div
          style={{
            padding: 16,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Version: <strong>{termsVersion}</strong>
          </div>

          <button
            onClick={accept}
            disabled={!scrolled}
            style={{
              border: 'none',
              background: scrolled ? '#0f172a' : '#94a3b8',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 16px',
              fontWeight: 800,
              cursor: scrolled ? 'pointer' : 'not-allowed',
              minWidth: 140,
            }}
          >
            {scrolled ? 'I Understand & Continue' : 'Scroll to Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
