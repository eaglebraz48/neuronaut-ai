import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getNotification,
  resolveLocale,
  type NotificationKey,
} from '@/lib/notifications';

// ─── Supabase admin client ────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// ─── FCM v1: get OAuth2 access token via service account JWT ─────────────────
async function getAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const header = { alg: 'RS256', typ: 'JWT' };
  const signingInput = `${encode(header)}.${encode(payload)}`;

  const pemBody = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    Buffer.from(pemBody, 'base64'),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(signingInput)
  );

  const jwt = `${signingInput}.${Buffer.from(signature).toString('base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get FCM access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const {
      token,            // FCM device token
      userId,           // Supabase user ID — used to look up locale
      notificationKey,  // e.g. "ai_response_ready" | "new_message" | etc.
      // Optional: caller can override title/body for dynamic content
      titleOverride,
      bodyOverride,
    } = await req.json();

    if (!token || !userId || !notificationKey) {
      return NextResponse.json(
        { success: false, error: 'Missing token, userId, or notificationKey' },
        { status: 400 }
      );
    }

    // ── 1. Fetch user locale from Supabase ──────────────────────────────────
    // Adjust the table/column name to match your schema
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('locale')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('Could not fetch user locale, falling back to en:', profileError.message);
    }

    const locale = resolveLocale(profile?.locale ?? null);

    // ── 2. Get localized strings ────────────────────────────────────────────
    const { title, body } = getNotification(
      notificationKey as NotificationKey,
      locale,
      {
        title: titleOverride ?? undefined,
        body: bodyOverride ?? undefined,
      }
    );

    // ── 3. Get FCM access token ─────────────────────────────────────────────
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
    const accessToken = await getAccessToken();

    // ── 4. Send via FCM v1 API ──────────────────────────────────────────────
    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            // Android config
            android: {
              notification: {
                title,
                body,
                icon: 'ic_notification',       // drawable resource name in Android app
                color: '#4F46E5',               // Neuronaut brand color — update as needed
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
              },
            },
            // Apple (APNs) config
            apns: {
              payload: {
                aps: {
                  alert: { title, body },
                  badge: 1,
                  sound: 'default',
                },
              },
              headers: {
                'apns-priority': '10',
              },
            },
            // Web Push config
            webpush: {
              notification: {
                title,
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                lang: locale,                   // tells the browser the content language
                click_action: '/',
              },
            },
          },
        }),
      }
    );

    const data = await fcmRes.json();

    if (!fcmRes.ok) {
      console.error('FCM send error:', data);
      return NextResponse.json({ success: false, error: data }, { status: fcmRes.status });
    }

    return NextResponse.json({ success: true, locale, data });
  } catch (err) {
    console.error('send-push error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export const config = {
  runtime: 'nodejs',
};