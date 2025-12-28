'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function HashAuthBridge() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;

    // No magic link → do nothing
    if (!hash || !hash.includes('access_token')) return;

    const params = new URLSearchParams(hash.replace('#', ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) return;

    (async () => {
      // ✅ THIS IS THE CRITICAL STEP YOU WERE MISSING
      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      // Clean URL (remove hash)
      window.history.replaceState({}, '', '/dashboard');

      // Go to dashboard
      router.replace('/dashboard');
    })();
  }, [router]);

  return null;
}
