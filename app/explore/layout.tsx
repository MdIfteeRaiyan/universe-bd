import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Private Universities",
  description: "Search 88 private universities in Bangladesh by programme, location, GPA and source-checked published cost.",
  alternates: { canonical: "/explore" },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) { return children; }
