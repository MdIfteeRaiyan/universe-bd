import type { AdmissionCalendarEvent } from "@/data/admission-calendar";

export type AdmissionEventStatus = "upcoming" | "closing-soon" | "today" | "closed";

const DAY = 86_400_000;

export function admissionEventStatus(date: string, now = new Date()): AdmissionEventStatus {
  const eventDate = new Date(`${date}T23:59:59+06:00`).getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const difference = eventDate - todayStart;
  if (difference < 0) return "closed";
  if (difference < DAY) return "today";
  if (difference <= 14 * DAY) return "closing-soon";
  return "upcoming";
}

export function sortAdmissionEvents(events: AdmissionCalendarEvent[]) {
  return [...events].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function formatAdmissionDate(date: string) {
  return new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T12:00:00+06:00`),
  );
}

