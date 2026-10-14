import type { Metadata } from "next";
import { NewReview } from "./NewReview";

export const metadata: Metadata = { title: "New review" };

export default function Page() {
  return <NewReview />;
}
