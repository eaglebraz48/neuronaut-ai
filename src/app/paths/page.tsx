import { Suspense } from 'react';
import PathsClient from './PathsClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PathsClient />
    </Suspense>
  );
}
