'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SignInButton() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = () => {
    router.push('/sign-in');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={isSignedIn ? signOut : signIn}
      className="bg-blue-600 text-white py-2 px-4 rounded-md"
    >
      {isSignedIn ? 'Sign out' : 'Sign in'}
    </button>
  );
}
