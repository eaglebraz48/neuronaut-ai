'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignInButton() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = supabase.auth.user();
    setIsSignedIn(!!user);
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: 'test@example.com' }); // replace with actual flow
    if (error) console.error(error);
    router.push('/sign-in'); // Redirect to the magic link sign-in page
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    router.push('/'); // Redirect to homepage
  };

  return (
    <button
      onClick={isSignedIn ? signOut : signIn}
      className="bg-blue-600 text-white py-2 px-4 rounded-md"
    >
      {isSignedIn ? 'Sign Out' : 'Sign In'}
    </button>
  );
}
