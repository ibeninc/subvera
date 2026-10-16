import type { Metadata } from "next";
import { ArchiveList } from "./ArchiveList";

export const metadata: Metadata = { title: "Archive" };

export default function Page() {
  return <ArchiveList />;
}
