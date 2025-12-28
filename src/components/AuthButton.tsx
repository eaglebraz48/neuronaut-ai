"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthButton() {
  const router = useRouter();
  const sp = useSearchParams();
  const lang = sp.get("lang") || "en";

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoggedIn(!!session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!loggedIn) return null;

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push(`/?lang=${lang}`);
  };

  return (
    <button
      onClick={signOut}
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "white",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}
