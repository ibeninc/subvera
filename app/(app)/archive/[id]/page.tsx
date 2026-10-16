import type { Metadata } from "next";
import { Suspense } from "react";
import { ArchivedReport } from "./ArchivedReport";

export const metadata: Metadata = { title: "Archived report" };

export default function Page() {
  // ArchivedReport reads the id from the URL, so it renders inside a Suspense boundary.
  return (
    <Suspense>
      <ArchivedReport />
    </Suspense>
  );
}
