export type ProgramCost = {
  name: string;
  credits: number;
  semesters?: number;
  tuitionPerCredit: number;
  total: number;
  minimum?: boolean;
  discounted?: boolean;
  pending?: boolean;
};

export type UniversitySource = {
  label: string;
  url: string;
};

export type ProgrammeAdmissionRule = {
  programmes: string[];
  summary: string;
  minimumSscGpa?: number;
  minimumHscGpa?: number;
  minimumCombinedGpa?: number;
  requiredSubjects?: string[];
  admissionTest?: string;
  gpaPaths?: AdmissionGpaPath[];
};

export type AdmissionGpaPath = {
  label: string;
  minimumSscGpa?: number;
  minimumHscGpa?: number;
  minimumCombinedGpa?: number;
};

export type UniversityAdmissionRules = {
  generalRule: string;
  sourceUrl: string;
  minimumSscGpa?: number;
  minimumHscGpa?: number;
  minimumCombinedGpa?: number;
  gpaPaths?: AdmissionGpaPath[];
  programmeRules?: ProgrammeAdmissionRule[];
};

export type University = {
  id: number;
  name: string;
  short: string;
  institutionType?: "Public" | "Private";
  district: string;
  division: string;
  area?: string;
  address?: string;
  logo?: string;
  programs: string[];
  programCosts?: ProgramCost[];
  programCatalogComplete?: boolean;
  cost?: number;
  admission?: number;
  lab?: number;
  semester?: number;
  credits?: number;
  minGpa?: number;
  totalCost?: number;
  publishedMinimumCost?: number;
  costLabel?: string;
  matchedProgram?: string;
  feeBreakdown?: string[];
  scholarships?: string[];
  status: "Official" | "Directory";
  facts?: string[];
  sources?: UniversitySource[];
  admissionRules?: UniversityAdmissionRules;
  verifiedAt?: string;
  dataContext?: {
    intake?: string;
    reviewDue?: string;
    note?: string;
  };
};

export type GradeChart = {
  source: string;
  checked: string;
  note: string;
  bands: { score: string; letter: string; point: string }[];
};

export type AccommodationMode = "hall" | "hostel" | "mess" | "family";
