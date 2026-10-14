import type { Metadata } from "next";
import { Suspense } from "react";
import { Findings } from "./Findings";

export const metadata: Metadata = { title: "Findings" };

export default function Page() {
  // Findings reads ?finding= from the URL, so it renders inside a Suspense boundary.
  return (
    <Suspense>
      <Findings />
    </Suspense>
  );
}
