import { Suspense } from 'react';
import PathAClient from './PathAClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PathAClient />
    </Suspense>
  );
}
