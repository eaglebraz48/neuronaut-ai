'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * HashAuthBridge
 * - Runs BEFORE any page logic
 * - Finalizes Supabase auth if tokens are in URL hash
 * - Prevents dashboard → sign-in redirect race
 */
export default function HashAuthBridge() {
  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash;
      if (!hash || !hash.includes('access_token')) return;

      const params = new URLSearchParams(hash.replace('#', ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) return;

      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      // Clean URL so guards don’t re-trigger
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
    };

    run();
  }, []);

  return null;
}
