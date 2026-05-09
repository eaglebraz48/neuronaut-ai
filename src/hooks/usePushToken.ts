import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * usePushToken — native Capacitor push notification registration.
 *
 * - Only runs inside the Capacitor native app (Android / iOS).
 * - Completely skipped in the browser, so the existing Firebase Web SDK
 *   notification flow in DashboardClientNotes.tsx is unaffected.
 * - Requests OS permission, registers with FCM, and saves the token to
 *   profiles.fcm_token via Supabase update.
 */

export function usePushToken() {
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    const init = async () => {
      // Guard: only run inside native Capacitor app
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;
      } catch {
        return;
      }

      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');

        // Request OS permission (shows native prompt on first run)
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== 'granted') return;

        // Register with FCM — triggers 'registration' event with token
        await PushNotifications.register();

        // Listen for the FCM token
        const registrationHandler = PushNotifications.addListener(
          'registration',
          async (token) => {
            if (!token?.value) return;

            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                console.warn('[usePushToken] No authenticated user — skipping FCM save');
                return;
              }

              console.log('[usePushToken] Saving FCM token for user:', user.id);

              const { error } = await supabase
                .from('profiles')
                .update({
                  fcm_token: token.value,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

              if (error) {
                console.error('[usePushToken] FCM save error (user_id):', error);

                // Fallback: try with 'id' column in case schema uses that
                const { error: error2 } = await supabase
                  .from('profiles')
                  .update({
                    fcm_token: token.value,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', user.id);

                if (error2) {
                  console.error('[usePushToken] FCM save error (id fallback):', error2);
                } else {
                  console.log('[usePushToken] FCM token saved via id column');
                }
              } else {
                console.log('[usePushToken] FCM token saved successfully');
              }
            } catch (err) {
              console.error('[usePushToken] Supabase update failed:', err);
            }
          }
        );

        // Listen for registration errors (silent — we don't block UX)
        const errorHandler = PushNotifications.addListener(
          'registrationError',
          (err) => {
            console.error('[usePushToken] FCM registration error:', err);
          }
        );

        // Return cleanup to remove listeners on unmount
        cleanupFn = async () => {
          (await registrationHandler).remove();
          (await errorHandler).remove();
        };
      } catch (err) {
        console.error('[usePushToken] Init failed:', err);
      }
    };

    init();

    return () => {
      cleanupFn?.();
    };
  }, []); // runs once on mount
}
