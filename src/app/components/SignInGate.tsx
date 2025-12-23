'use client';

import { useState } from 'react';
import PrivacyLiteModal from '../privacy-lite/page';


export default function SignInGate() {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      {!agreed && (
        <PrivacyLiteModal onAgree={() => setAgreed(true)} />
      )}

      {agreed && (
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white">
          Sign in with email
        </button>
      )}
    </>
  );
}
