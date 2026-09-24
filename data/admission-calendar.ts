export type AdmissionEventKind = "application" | "admission-test" | "scholarship" | "result";

export type AdmissionCalendarEvent = {
  id: string;
  university: string;
  short: string;
  intake: string;
  title: string;
  kind: AdmissionEventKind;
  date: string;
  time?: string;
  scope: string;
  sourceUrl: string;
  sourceLabel: string;
  checkedAt: string;
  note?: string;
};

// Dates are added only when an official university page publishes them.
// Closed events stay visible briefly as useful context; they are never rolled
// forward to a new intake without a fresh source review.
export const admissionCalendarEvents: AdmissionCalendarEvent[] = [
  {
    id: "nsu-summer-2026-application",
    university: "North South University",
    short: "NSU",
    intake: "Summer 2026",
    title: "Undergraduate application deadline",
    kind: "application",
    date: "2026-04-22",
    time: "11:59 PM",
    scope: "Undergraduate applicants",
    sourceUrl: "https://admissions.northsouth.edu/deadline",
    sourceLabel: "Official NSU dates and deadlines",
    checkedAt: "2026-09-23",
  },
  {
    id: "nsu-summer-2026-test",
    university: "North South University",
    short: "NSU",
    intake: "Summer 2026",
    title: "Undergraduate admission test",
    kind: "admission-test",
    date: "2026-04-24",
    time: "10:00 AM",
    scope: "Undergraduate applicants",
    sourceUrl: "https://admissions.northsouth.edu/deadline",
    sourceLabel: "Official NSU dates and deadlines",
    checkedAt: "2026-09-23",
  },
  {
    id: "bracu-fall-2026-application",
    university: "BRAC University",
    short: "BRACU",
    intake: "Fall 2026",
    title: "Main undergraduate application deadline",
    kind: "application",
    date: "2026-08-02",
    scope: "Domestic undergraduate programmes listed for the main intake",
    sourceUrl: "https://www.bracu.ac.bd/ug-domestic-applicant",
    sourceLabel: "Official BRAC University domestic applicant page",
    checkedAt: "2026-09-23",
    note: "Some programmes may publish later seat-dependent tests. Confirm the programme panel before applying.",
  },
  {
    id: "bracu-fall-2026-test",
    university: "BRAC University",
    short: "BRACU",
    intake: "Fall 2026",
    title: "Main undergraduate admission test",
    kind: "admission-test",
    date: "2026-08-07",
    time: "9:30 AM",
    scope: "Domestic undergraduate programmes listed for the main intake",
    sourceUrl: "https://www.bracu.ac.bd/ug-domestic-applicant",
    sourceLabel: "Official BRAC University domestic applicant page",
    checkedAt: "2026-09-23",
  },
  {
    id: "ewu-fall-2026-financial-assistance",
    university: "East West University",
    short: "EWU",
    intake: "Fall 2026",
    title: "Financial-assistance application deadline",
    kind: "scholarship",
    date: "2026-09-01",
    scope: "Eligible undergraduate and graduate students",
    sourceUrl: "https://www.ewubd.edu/notice-details/financial-assistance-fall-2026",
    sourceLabel: "Official EWU financial-assistance notice",
    checkedAt: "2026-09-23",
  },
];

