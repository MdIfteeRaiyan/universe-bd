import type { Metadata } from "next";
import { admissionCalendarEvents } from "@/data/admission-calendar";
import { AdmissionCalendar } from "./admission-calendar";

export const metadata: Metadata = {
  title: "Admission Calendar | CampusChoice BD",
  description: "Track source-checked university application, admission-test and scholarship dates in Bangladesh.",
  alternates: { canonical: "/admission-calendar" },
};

export default function AdmissionCalendarPage() {
  return <AdmissionCalendar events={admissionCalendarEvents} />;
}

