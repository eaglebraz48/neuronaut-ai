'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get('redirect') || '/dashboard';
  const lang = sp.get('lang') || 'en';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The PKCE flow is handled automatically by Supabase
        // We just need to let it process the URL parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('Callback params:', { accessToken, refreshToken });

        if (accessToken && refreshToken) {
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log('Session set:', data, error);

          if (error) throw error;
        }

        // Small delay to ensure session is persisted
        await new Promise(resolve => setTimeout(resolve, 500));

        // Redirect to dashboard
        router.replace(`${redirect}?lang=${lang}`);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => router.replace(`/sign-in?lang=${lang}`), 2000);
      }
    };

    handleCallback();
  }, [router, redirect, lang]);

  if (error) {
    return <div style={{ padding: 24, color: 'red' }}>Error: {error}</div>;
  }

  return <div style={{ padding: 24 }}>Signing you in…</div>;
}