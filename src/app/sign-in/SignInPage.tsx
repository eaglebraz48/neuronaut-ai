'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error(error);
    } else {
      // Redirect user or show success message
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '20px' }}>
      <h1>Sign In</h1>
      <div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded-md"
        />
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md mt-4"
        >
          {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
        </button>
      </div>

      <Link href="/reviewers-login" className="text-gray-400 mt-2 block">
        <small>For reviewers login</small>
      </Link>
    </main>
  );
}
