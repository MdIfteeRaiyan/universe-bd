import type { Metadata } from "next";
import { FocusedToolShell } from "@/components/focused-tool-shell";
import { GradeScaleTool } from "./tool";

export const metadata: Metadata = {
  title: "Official University Grade Scales | CampusChoice BD",
  description: "Compare source-checked university grading policies without assuming one common scale.",
};

export default function GradeScalesPage() {
  return <FocusedToolShell eyebrow="OFFICIAL GRADE SCALES" title="Read the university’s own scale." description="Choose a university after shortlisting it. A chart appears only when its current official grading policy has been checked."><GradeScaleTool /></FocusedToolShell>;
}
