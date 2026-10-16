import type { Metadata } from "next";
import { Suspense } from "react";
import { Reports } from "./Reports";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  // Reports reads ?review= from the URL, so it renders inside a Suspense boundary.
  return (
    <Suspense>
      <Reports />
    </Suspense>
  );
}
