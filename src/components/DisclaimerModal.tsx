'use client';

import { useEffect, useMemo, useState } from 'react';

type Persistence = 'local' | 'session' | 'none';

type Props = {
  termsVersion?: string;
  persistence?: Persistence;
  productName?: string;
  companyName?: string;
  onAccept?: () => void;
  onDecline?: () => void;
};

const UI_COPY = {
  en: {
    title: 'Before You Continue',
    scrollHint: 'Please scroll through this disclaimer to continue.',
    accept: 'I Understand & Continue',
    scroll: 'Scroll to Continue',
  },
  pt: {
    title: 'Antes de continuar',
    scrollHint: 'Role este aviso até o final para continuar.',
    accept: 'Entendi e continuar',
    scroll: 'Role para continuar',
  },
  es: {
    title: 'Antes de continuar',
    scrollHint: 'Desplácese por este aviso para continuar.',
    accept: 'Entiendo y continuar',
    scroll: 'Desplácese para continuar',
  },
  fr: {
    title: 'Avant de continuer',
    scrollHint: 'Veuillez faire défiler cet avis pour continuer.',
    accept: 'J’ai compris et continuer',
    scroll: 'Faire défiler pour continuer',
  },
};

export default function DisclaimerModal({
  termsVersion = '2026-01-02',
  persistence = 'local',
  productName = 'Neuronaut',
  companyName = 'Arison8, LLC',
  onAccept,
  onDecline,
}: Props) {
  const KEY = useMemo(
    () => `neuronaut_disclaimer_accepted_v${termsVersion}`,
    [termsVersion]
  );

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const lang =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('lang') || 'en'
      : 'en';

  const T = UI_COPY[lang as keyof typeof UI_COPY] ?? UI_COPY.en;

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
      onAccept?.();
    }
  }

  function decline() {
    setOpen(false);
    setScrolled(false);
    onDecline?.();
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
        {/* HEADER */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8f0' }}>
          <h2
            id="neuronaut-disclaimer-title"
            style={{ margin: 0, fontSize: 18, fontWeight: 800 }}
          >
            {T.title}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#475569' }}>
            {T.scrollHint}
          </p>
        </div>

        {/* BODY — TEXTO LEGAL COMPLETO */}
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
            substitute for professional advice. Laws and regulations vary by
            jurisdiction.
          </p>

          <p>
            <strong>No Professional Advice.</strong> {productName} does not
            provide medical, mental health, legal, financial, tax, or
            immigration advice.
          </p>

          <p>
            <strong>Emergency.</strong> If you are in immediate danger, contact
            local emergency services. In the U.S., call or text{' '}
            <strong>988</strong>.
          </p>

          <p>
            <strong>User Responsibility.</strong> You are responsible for your
            own decisions and actions.
          </p>

          <p style={{ marginBottom: 0 }}>
            <strong>Limitation of Liability.</strong> To the maximum extent
            permitted by law, {companyName} is not liable for damages arising
            from use of {productName}.
          </p>

          <hr style={{ margin: '18px 0' }} />

          <h3>Português (Brasil)</h3>
          <p>
            <strong>Aviso Informativo.</strong> {productName} fornece apenas
            informações gerais e não substitui aconselhamento profissional.
          </p>

          <hr style={{ margin: '18px 0' }} />

          <h3>Español</h3>
          <p>
            <strong>Uso Informativo.</strong> {productName} proporciona
            información general y no sustituye asesoramiento profesional.
          </p>

          <hr style={{ margin: '18px 0' }} />

          <h3>Français</h3>
          <p>
            <strong>Usage Informatif.</strong> {productName} fournit des
            informations générales et ne remplace pas un avis professionnel.
          </p>
        </div>

        {/* FOOTER */}
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
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Version: <strong>{termsVersion}</strong>
            </div>
            {onDecline && (
              <button
                onClick={decline}
                style={{
                  border: '1px solid #e2e8f0',
                  background: 'transparent',
                  color: '#64748b',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Decline
              </button>
            )}
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
            {scrolled ? T.accept : T.scroll}
          </button>
        </div>
      </div>
    </div>
  );
}
