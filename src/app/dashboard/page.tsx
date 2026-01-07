import { Suspense } from "react";
import DashboardClientNotes from "./DashboardClientNotes";


export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardClientNotes />

    </Suspense>
  );
}
