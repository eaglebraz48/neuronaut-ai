import { Suspense } from 'react';
import DecisionClient from './DecisionClient';

export default function DecisionPage() {
  return (
    <Suspense fallback={null}>
      <DecisionClient />
    </Suspense>
  );
}
