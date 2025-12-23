import { Suspense } from 'react';
import SnapshotClient from './SnapshotClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SnapshotClient />
    </Suspense>
  );
}
