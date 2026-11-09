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
// Never roll an old date forward without a fresh official source review.
export const admissionCalendarEvents: AdmissionCalendarEvent[] = [
  {
    id: "nsu-spring-2027-application", university: "North South University", short: "NSU", intake: "Spring 2027",
    title: "Undergraduate application deadline", kind: "application", date: "2026-11-22", time: "11:59 PM",
    scope: "Undergraduate applicants", sourceUrl: "https://admissions.northsouth.edu/index.php/deadline",
    sourceLabel: "Official NSU dates and deadlines", checkedAt: "2026-11-09",
  },
  {
    id: "nsu-spring-2027-test", university: "North South University", short: "NSU", intake: "Spring 2027",
    title: "Undergraduate admission test", kind: "admission-test", date: "2026-11-28",
    scope: "Undergraduate applicants", sourceUrl: "https://admissions.northsouth.edu/index.php/deadline",
    sourceLabel: "Official NSU dates and deadlines", checkedAt: "2026-11-09",
    note: "Confirm the official page again before travelling because universities may revise schedules.",
  },
  {
    id: "bracu-spring-2027-application", university: "BRAC University", short: "BRACU", intake: "Spring 2027",
    title: "Main undergraduate application deadline", kind: "application", date: "2026-11-22",
    scope: "Domestic undergraduate programmes listed for the main intake", sourceUrl: "https://www.bracu.ac.bd/ug-domestic-applicant",
    sourceLabel: "Official BRAC University domestic applicant page", checkedAt: "2026-11-09",
    note: "Some programmes may publish later seat-dependent tests. Confirm the programme panel before applying.",
  },
  {
    id: "bracu-spring-2027-test", university: "BRAC University", short: "BRACU", intake: "Spring 2027",
    title: "Main undergraduate admission test", kind: "admission-test", date: "2026-11-27", time: "9:30 AM",
    scope: "Domestic undergraduate programmes listed for the main intake", sourceUrl: "https://www.bracu.ac.bd/ug-domestic-applicant",
    sourceLabel: "Official BRAC University domestic applicant page", checkedAt: "2026-11-09",
  },
  {
    id: "aiub-spring-2027-application", university: "American International University-Bangladesh", short: "AIUB", intake: "Spring 2026–27",
    title: "Undergraduate application deadline", kind: "application", date: "2026-11-23", time: "2:00 PM",
    scope: "All undergraduate programmes", sourceUrl: "https://www.aiub.edu/admission",
    sourceLabel: "Official AIUB admission circular", checkedAt: "2026-11-09",
  },
  {
    id: "aiub-spring-2027-general-test", university: "American International University-Bangladesh", short: "AIUB", intake: "Spring 2026–27",
    title: "General undergraduate written examination", kind: "admission-test", date: "2026-11-26", time: "12:00 PM",
    scope: "Undergraduate programmes except B.Pharm and LL.B", sourceUrl: "https://www.aiub.edu/admission",
    sourceLabel: "Official AIUB admission circular", checkedAt: "2026-11-09",
  },
  {
    id: "aiub-spring-2027-pharmacy-law-test", university: "American International University-Bangladesh", short: "AIUB", intake: "Spring 2026–27",
    title: "B.Pharm and LL.B written examination", kind: "admission-test", date: "2026-11-28", time: "12:00 PM",
    scope: "B.Pharm and LL.B applicants", sourceUrl: "https://www.aiub.edu/admission",
    sourceLabel: "Official AIUB admission circular", checkedAt: "2026-11-09",
  },
  {
    id: "uiu-spring-2027-application", university: "United International University", short: "UIU", intake: "Spring 2027",
    title: "Undergraduate application deadline", kind: "application", date: "2026-12-01", time: "11:59 PM",
    scope: "Published undergraduate programmes", sourceUrl: "https://www.uiu.ac.bd/admission/admission-notice/",
    sourceLabel: "Official UIU admission notice", checkedAt: "2026-11-09",
  },
  {
    id: "uiu-spring-2027-test", university: "United International University", short: "UIU", intake: "Spring 2027",
    title: "Undergraduate admission test", kind: "admission-test", date: "2026-12-04", time: "9:00 AM",
    scope: "Published undergraduate programmes", sourceUrl: "https://www.uiu.ac.bd/admission/admission-notice/",
    sourceLabel: "Official UIU admission notice", checkedAt: "2026-11-09",
  },
  {
    id: "ulab-spring-2027-test", university: "University of Liberal Arts Bangladesh", short: "ULAB", intake: "Spring 2027",
    title: "Undergraduate admission test", kind: "admission-test", date: "2026-12-03",
    scope: "Published Spring 2027 undergraduate programmes", sourceUrl: "https://admissions.ulab.edu.bd/",
    sourceLabel: "Official ULAB admissions page", checkedAt: "2026-11-09",
  },
  {
    id: "ewu-spring-2027-application", university: "East West University", short: "EWU", intake: "Spring 2027",
    title: "Main undergraduate application deadline", kind: "application", date: "2026-12-08",
    scope: "Undergraduate programmes except Pharmacy", sourceUrl: "https://www.ewubd.edu/undergraduate-dates-deadline",
    sourceLabel: "Official EWU undergraduate dates and deadlines", checkedAt: "2026-11-09",
  },
  {
    id: "ewu-spring-2027-test", university: "East West University", short: "EWU", intake: "Spring 2027",
    title: "Main undergraduate admission test", kind: "admission-test", date: "2026-12-11", time: "10:00 AM",
    scope: "Undergraduate programmes except Pharmacy", sourceUrl: "https://www.ewubd.edu/undergraduate-dates-deadline",
    sourceLabel: "Official EWU undergraduate dates and deadlines", checkedAt: "2026-11-09",
  },
  {
    id: "ewu-spring-2027-pharmacy-application", university: "East West University", short: "EWU", intake: "Spring 2027",
    title: "Pharmacy application deadline", kind: "application", date: "2026-12-09",
    scope: "Bachelor of Pharmacy applicants", sourceUrl: "https://www.ewubd.edu/undergraduate-dates-deadline",
    sourceLabel: "Official EWU undergraduate dates and deadlines", checkedAt: "2026-11-09",
  },
  {
    id: "ewu-spring-2027-pharmacy-test", university: "East West University", short: "EWU", intake: "Spring 2027",
    title: "Pharmacy admission test", kind: "admission-test", date: "2026-12-12", time: "2:30 PM",
    scope: "Bachelor of Pharmacy applicants", sourceUrl: "https://www.ewubd.edu/undergraduate-dates-deadline",
    sourceLabel: "Official EWU undergraduate dates and deadlines", checkedAt: "2026-11-09",
  },
  {
    id: "vu-spring-2027-pharmacy-law-test", university: "Varendra University", short: "VU", intake: "Spring 2027",
    title: "Pharmacy and Law admission test", kind: "admission-test", date: "2026-12-22",
    scope: "Pharmacy and Law & Human Rights applicants", sourceUrl: "https://vu.edu.bd/academics/academic-calendar",
    sourceLabel: "Official Varendra University academic calendar", checkedAt: "2026-10-29",
  },
  {
    id: "vu-spring-2027-test", university: "Varendra University", short: "VU", intake: "Spring 2027",
    title: "General admission test", kind: "admission-test", date: "2026-12-27",
    scope: "Other undergraduate applicants", sourceUrl: "https://vu.edu.bd/academics/academic-calendar",
    sourceLabel: "Official Varendra University academic calendar", checkedAt: "2026-10-29",
  },
];
