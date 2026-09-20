import type { Metadata } from "next";
import PublicDirectory from "./public-directory";

export const metadata: Metadata = {
  title: "Public Universities — CampusChoice BD",
  description: "A separate, source-checked public-university admission guide for Bangladesh.",
  alternates: { canonical: "/public-universities" },
};

export default function PublicUniversitiesPage() {
  return <PublicDirectory />;
}
