import { Suspense } from 'react';
import PathBClient from './PathBClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PathBClient />
    </Suspense>
  );
}
