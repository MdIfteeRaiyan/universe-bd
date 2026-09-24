import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildUniversityCatalog } from "../data/catalog.ts";
import { admissionCalendarEvents } from "../data/admission-calendar.ts";
import { privateUniversities } from "../data/private-universities.ts";
import { validateUniversityData } from "../lib/data-quality.ts";

const now = new Date();
const today = now.toISOString().slice(0, 10);
const catalogue = buildUniversityCatalog(privateUniversities, now);
const quality = validateUniversityData(privateUniversities, now);

const profileTasks = catalogue.records.flatMap((record) => {
  const tasks = [];
  if (record.pendingProgrammeCount) tasks.push({ priority: "high", university: record.short, field: "programme costs", reason: `${record.pendingProgrammeCount} costs remain explicitly pending` });
  const missing = Object.entries(record.sourceCoverage).filter(([, covered]) => !covered).map(([field]) => field);
  if (missing.length) tasks.push({ priority: "medium", university: record.short, field: "source coverage", reason: `Missing ${missing.join(", ")} source coverage` });
  if (record.profileCompleteness < 100) tasks.push({ priority: "medium", university: record.short, field: "profile completeness", reason: `${record.profileCompleteness}% complete` });
  return tasks;
});

const calendarTasks = admissionCalendarEvents
  .filter((event) => event.date < today)
  .map((event) => ({ priority: "high", university: event.short, field: "admission calendar", reason: `${event.intake} ${event.title.toLocaleLowerCase()} has passed; monitor the official source for the next intake`, sourceUrl: event.sourceUrl }));

const qualityTasks = quality.issues.map((issue) => ({ priority: issue.severity === "error" ? "blocking" : "high", university: issue.university, field: issue.field, reason: issue.message }));
const tasks = [...qualityTasks, ...calendarTasks, ...profileTasks];
const priorityOrder = { blocking: 0, high: 1, medium: 2 };
tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.university.localeCompare(b.university));

const output = { generatedAt: now.toISOString(), publishPolicy: "Human review required; never publish automatically", summary: { total: tasks.length, blocking: tasks.filter((task) => task.priority === "blocking").length, high: tasks.filter((task) => task.priority === "high").length, medium: tasks.filter((task) => task.priority === "medium").length }, tasks };
const markdown = ["# CampusChoice BD data review queue", "", `Generated: ${output.generatedAt}`, "", "Nothing in this queue is published automatically. Review the linked official source, update the structured record, run the release gate, and then publish.", "", `- Blocking: ${output.summary.blocking}`, `- High priority: ${output.summary.high}`, `- Medium priority: ${output.summary.medium}`, "", ...tasks.map((task) => `- **${task.priority.toUpperCase()} · ${task.university} · ${task.field}** — ${task.reason}${task.sourceUrl ? ` ([official source](${task.sourceUrl}))` : ""}`), ""];

await mkdir("reports", { recursive: true });
await writeFile(path.join("reports", "data-review-queue.json"), `${JSON.stringify(output, null, 2)}\n`);
await writeFile(path.join("reports", "data-review-queue.md"), `${markdown.join("\n")}\n`);
console.log(`Review queue: ${output.summary.total} tasks (${output.summary.blocking} blocking, ${output.summary.high} high, ${output.summary.medium} medium)`);

