import type { Metadata } from "next";
import { FocusedToolShell } from "@/components/focused-tool-shell";
import { LivingCostTool } from "./tool";

export const metadata: Metadata = {
  title: "Student Living Cost Planner | CampusChoice BD",
  description: "Estimate student living costs for university hall, hostel, mess or family accommodation.",
};

export default function LivingCostsPage() {
  return <FocusedToolShell eyebrow="LIVING COST PLANNER" title="Plan life beyond tuition." description="Compare an estimated monthly range for accommodation, food, transport and personal expenses. These are planning ranges, not guaranteed prices."><LivingCostTool /></FocusedToolShell>;
}
