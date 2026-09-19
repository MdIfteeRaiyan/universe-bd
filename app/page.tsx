"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  ExternalLink,
  GitCompareArrows,
  House,
  MapPin,
  Printer,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { AccommodationMode, GradeChart, University } from "@/data/models";
import {
  accommodationSetupCosts,
  accommodationLabels,
  districtLivingCosts,
  livingCostChecked,
} from "@/data/living-costs";
import { validateUniversityData } from "@/lib/data-quality";
import { buildUniversityCatalog } from "@/data/catalog";
import { createFinancialPlan } from "@/lib/financial-planner";
import { evaluateAdmissionReadiness } from "@/lib/admission-readiness";

const gradeCharts: Record<string, GradeChart> = {
  RUD: {
    source: "https://www.royal.edu.bd/bsc-in-cse/",
    checked: "10 September 2026",
    note: "Royal University of Dhaka publishes this scale on its current undergraduate programme pages; D is the lowest passing grade and F is below 40%.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  FIU: {
    source: "https://fiu.edu.bd/legacy/admission_requirements.pdf",
    checked: "10 September 2026",
    note: "FIU publishes this numerical scale in its official admission rules; D is the lowest passing grade and F is below 40%.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  NDUB: {
    source: "https://ndub.edu.bd/academics/examinations/grading-system/",
    checked: "10 September 2026",
    note: "NDUB's current official grading scale uses D as the lowest passing grade; its policy separately explains that D in a core course must be repeated.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–79", letter: "A", point: "3.75" },
      { score: "70–74", letter: "A−", point: "3.50" },
      { score: "65–69", letter: "B+", point: "3.25" },
      { score: "60–64", letter: "B", point: "3.00" },
      { score: "55–59", letter: "B−", point: "2.75" },
      { score: "50–54", letter: "C+", point: "2.50" },
      { score: "45–49", letter: "C", point: "2.25" },
      { score: "40–44", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  PUST: {
    source: "https://pundrauniversity.ac.bd/programs/bba",
    checked: "10 September 2026",
    note: "Pundra University publishes the same UGC-style scale on its current undergraduate programme pages; D is the lowest passing grade shown.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  AUST: {
    source: "https://www.aust.edu/academics/examincation_and_grading_system",
    checked: "8 September 2026",
    note: "AUST's official bachelor-degree table uses D as its lowest passing letter grade and F below 40%.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  NSU: {
    source: "https://www.northsouth.edu/academic/grading-policy.html",
    checked: "6 September 2026",
    note: "NSU's official grading policy uses a distinct scale; do not compare its raw marks directly with universities using the 80% A+ scale.",
    bands: [
      { score: "93–100", letter: "A", point: "4.00" },
      { score: "90–92", letter: "A−", point: "3.70" },
      { score: "87–89", letter: "B+", point: "3.30" },
      { score: "83–86", letter: "B", point: "3.00" },
      { score: "80–82", letter: "B−", point: "2.70" },
      { score: "77–79", letter: "C+", point: "2.30" },
      { score: "73–76", letter: "C", point: "2.00" },
      { score: "70–72", letter: "C−", point: "1.70" },
      { score: "67–69", letter: "D+", point: "1.30" },
      { score: "60–66", letter: "D", point: "1.00" },
      { score: "Below 60", letter: "F", point: "0.00" },
    ],
  },
  EWU: {
    source: "https://ewubd.edu/grades-rules-and-regulations",
    checked: "6 September 2026",
    note: "EWU identifies A, B, C and D grades as passing grades and F as failing.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  UU: {
    source: "https://uttarauniversity.edu.bd/grading-system/",
    checked: "6 September 2026",
    note: "Uttara University's published chart also lists I for incomplete, W for withdrawal and R/Retake separately from earned grade points.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–79", letter: "A", point: "3.75" },
      { score: "70–74", letter: "A−", point: "3.50" },
      { score: "65–69", letter: "B+", point: "3.25" },
      { score: "60–64", letter: "B", point: "3.00" },
      { score: "55–59", letter: "B−", point: "2.75" },
      { score: "50–54", letter: "C+", point: "2.50" },
      { score: "45–49", letter: "C", point: "2.25" },
      { score: "40–44", letter: "D", point: "2.00" },
      { score: "0–39", letter: "F", point: "0.00" },
    ],
  },
  VU: {
    source: "https://vu.edu.bd/academics/programs/6/b-sc-in-cse",
    checked: "6 September 2026",
    note: "Varendra University publishes this scale on its current CSE programme page; D is the minimum passing letter grade shown.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  NWU: {
    source: "https://www.nwu.ac.bd/grading_system.php",
    checked: "6 September 2026",
    note: "North Western University lists A+ through D as passing grades, with F below 40%.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  PUC: {
    source: "https://www.puc.ac.bd/Home/Content/?Alias=grading-system",
    checked: "10 September 2026",
    note: "Premier University identifies A+ through D as passing grades and F as failing.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  FU: {
    source: "https://feniuniversity.ac.bd/content/grading-policy",
    checked: "10 September 2026",
    note: "Feni University publishes this UGC-approved scale for every department; D is the lowest passing grade and I denotes incomplete.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  BRACU: {
    source: "https://www.bracu.ac.bd/academics/policies-and-procedures",
    checked: "13 September 2026",
    note: "BRAC University's official page states that this numerical scale was introduced from the Fall 2020 semester.",
    bands: [
      { score: "97–100", letter: "A+", point: "4.00" },
      { score: "90–<97", letter: "A", point: "4.00" },
      { score: "85–<90", letter: "A−", point: "3.70" },
      { score: "80–<85", letter: "B+", point: "3.30" },
      { score: "75–<80", letter: "B", point: "3.00" },
      { score: "70–<75", letter: "B−", point: "2.70" },
      { score: "65–<70", letter: "C+", point: "2.30" },
      { score: "60–<65", letter: "C", point: "2.00" },
      { score: "57–<60", letter: "C−", point: "1.70" },
      { score: "55–<57", letter: "D+", point: "1.30" },
      { score: "52–<55", letter: "D", point: "1.00" },
      { score: "50–<52", letter: "D−", point: "0.70" },
      { score: "Below 50", letter: "F", point: "0.00" },
    ],
  },
  AIUB: {
    source: "https://www.aiub.edu/academic-regulations/grading-system",
    checked: "13 September 2026",
    note: "AIUB's official academic regulations also list I, W and UW as non-numeric academic-status grades.",
    bands: [
      { score: "90–100", letter: "A+", point: "4.00" },
      { score: "85–<90", letter: "A", point: "3.75" },
      { score: "80–<85", letter: "B+", point: "3.50" },
      { score: "75–<80", letter: "B", point: "3.25" },
      { score: "70–<75", letter: "C+", point: "3.00" },
      { score: "65–<70", letter: "C", point: "2.75" },
      { score: "60–<65", letter: "D+", point: "2.50" },
      { score: "50–<60", letter: "D", point: "2.25" },
      { score: "Below 50", letter: "F", point: "0.00" },
    ],
  },
  LU: {
    source: "https://lus.ac.bd/faq/",
    checked: "6 September 2026",
    note: "Leading University publishes this as its UGC grading system.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–79", letter: "A", point: "3.75" },
      { score: "70–74", letter: "A−", point: "3.50" },
      { score: "65–69", letter: "B+", point: "3.25" },
      { score: "60–64", letter: "B", point: "3.00" },
      { score: "55–59", letter: "B−", point: "2.75" },
      { score: "50–54", letter: "C+", point: "2.50" },
      { score: "45–49", letter: "C", point: "2.25" },
      { score: "40–44", letter: "D", point: "2.00" },
      { score: "0–39", letter: "F", point: "0.00" },
    ],
  },
  UAP: {
    source: "https://www.uap-bd.edu/eng/grading_system.php",
    checked: "6 September 2026",
    note: "UAP's official grading page uses this scale and lists exemption separately without a grade point.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  EDU: {
    source: "https://www.eastdelta.edu.bd/about-us/grading-system",
    checked: "6 September 2026",
    note: "East Delta publishes lower cutoffs for each letter grade; the displayed ranges end immediately before the next published cutoff.",
    bands: [
      { score: "93–100", letter: "A", point: "4.00" },
      { score: "89–<93", letter: "A−", point: "3.70" },
      { score: "86–<89", letter: "B+", point: "3.30" },
      { score: "82–<86", letter: "B", point: "3.00" },
      { score: "79–<82", letter: "B−", point: "2.70" },
      { score: "75–<79", letter: "C+", point: "2.30" },
      { score: "72–<75", letter: "C", point: "2.00" },
      { score: "69–<72", letter: "C−", point: "1.70" },
      { score: "65–<69", letter: "D+", point: "1.30" },
      { score: "60–<65", letter: "D", point: "1.00" },
      { score: "Below 60", letter: "F", point: "0.00" },
    ],
  },
  CUB: {
    source: "https://www.cub.edu.bd/index_grading_policies.php",
    checked: "6 September 2026",
    note: "CUB publishes this as its uniform grading system and separately identifies incomplete, retake, withdrawal and waiver records.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  BUBT: {
    source: "https://www.bubt.edu.bd/page/evaluation-grading-system",
    checked: "6 September 2026",
    note: "BUBT's official evaluation policy uses this uniform scale; F earns no grade point.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  IUB: {
    source:
      "https://iub.ac.bd/document/notification-regarding-summer-2024-trimester-grade-submission-fe91bb9d-5633-4a0a-b336-ecd597dedcd0.pdf",
    checked: "6 September 2026",
    note: "IUB's uniform grading notification also lists incomplete, withdrawal, audit, pass and repeat statuses separately from earned letter grades.",
    bands: [
      { score: "90–100", letter: "A", point: "4.00" },
      { score: "85–<90", letter: "A−", point: "3.70" },
      { score: "80–<85", letter: "B+", point: "3.30" },
      { score: "75–<80", letter: "B", point: "3.00" },
      { score: "70–<75", letter: "B−", point: "2.70" },
      { score: "65–<70", letter: "C+", point: "2.30" },
      { score: "60–<65", letter: "C", point: "2.00" },
      { score: "55–<60", letter: "C−", point: "1.70" },
      { score: "50–<55", letter: "D+", point: "1.30" },
      { score: "45–<50", letter: "D", point: "1.00" },
      { score: "Below 45", letter: "F", point: "0.00" },
    ],
  },
  CIU: {
    source: "https://ciu.edu.bd/grading-policy",
    checked: "8 September 2026",
    note: "CIU publishes the UGC-prescribed grading scale and lists incomplete and withdrawal separately from earned letter grades.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  UIU: {
    source: "https://www.uiu.ac.bd/academics/grading-performance-evaluation/",
    checked: "9 September 2026",
    note: "UIU publishes a distinct 4.00 scale with A as its highest letter grade, 3.67 and 3.33 steps, and 55% as the minimum passing mark.",
    bands: [
      { score: "90–100", letter: "A", point: "4.00" },
      { score: "86–89", letter: "A−", point: "3.67" },
      { score: "82–85", letter: "B+", point: "3.33" },
      { score: "78–81", letter: "B", point: "3.00" },
      { score: "74–77", letter: "B−", point: "2.67" },
      { score: "70–73", letter: "C+", point: "2.33" },
      { score: "66–69", letter: "C", point: "2.00" },
      { score: "62–65", letter: "C−", point: "1.67" },
      { score: "58–61", letter: "D+", point: "1.33" },
      { score: "55–57", letter: "D", point: "1.00" },
      { score: "0–54", letter: "F", point: "0.00" },
    ],
  },
  GUB: {
    source: "https://green.edu.bd/rules-regulation",
    checked: "9 September 2026",
    note: "Green University publishes the UGC uniform grading scale and identifies incomplete and withdrawal separately from earned letter grades.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  ULAB: {
    source: "https://ulab.edu.bd/sites/default/files/uploads/2025/09/08/Undergraduate-Handbook-Spring-2025-v2.pdf",
    checked: "9 September 2026",
    note: "ULAB's Spring 2025 undergraduate handbook uses A+ and A at 4.00, with its own 3.80, 2.80, 2.50, 2.20 and 1.50 grade-point steps.",
    bands: [
      { score: "95–100", letter: "A+", point: "4.00" },
      { score: "90–94", letter: "A", point: "4.00" },
      { score: "85–89", letter: "A−", point: "3.80" },
      { score: "80–84", letter: "B+", point: "3.30" },
      { score: "75–79", letter: "B", point: "3.00" },
      { score: "70–74", letter: "B−", point: "2.80" },
      { score: "65–69", letter: "C+", point: "2.50" },
      { score: "60–64", letter: "C", point: "2.20" },
      { score: "50–59", letter: "D", point: "1.50" },
      { score: "Below 50", letter: "F", point: "0.00" },
    ],
  },
  SUB: {
    source: "https://www.stamforduniversity.edu.bd/index.php/stamford/details_view/22",
    checked: "9 September 2026",
    note: "Stamford University Bangladesh publishes A+ through D as passing grades, with 2.00 as the passing grade point for an individual course.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  "DIU-D": {
    source: "https://diu.ac/program-notice-details/progression-rules",
    checked: "9 September 2026",
    note: "Dhaka International University publishes the UGC uniform scale in its current progression rules; this entry is distinct from Daffodil International University.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  PCIU: {
    source:
      "https://www.portcity.edu.bd/HomePage/DepatmentDetails/82/C/evaluation-and-grading-system",
    checked: "9 September 2026",
    note: "Port City International University publishes this grading scale for all programmes. D is the lowest passing grade; I and W are non-numeric incomplete and withdrawal grades.",
    bands: [
      { score: "80 and above", letter: "A+", point: "4.00" },
      { score: "75–79", letter: "A", point: "3.75" },
      { score: "70–74", letter: "A−", point: "3.50" },
      { score: "65–69", letter: "B+", point: "3.25" },
      { score: "60–64", letter: "B", point: "3.00" },
      { score: "55–59", letter: "B−", point: "2.75" },
      { score: "50–54", letter: "C+", point: "2.50" },
      { score: "45–49", letter: "C", point: "2.25" },
      { score: "40–44", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  MIU: {
    source: "https://dis.manarat.ac.bd/programs-and-syllabus",
    checked: "9 September 2026",
    note: "Manarat International University publishes this scale in its current programme and syllabus information; incomplete is listed separately without an earned grade point.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–79", letter: "A", point: "3.75" },
      { score: "70–74", letter: "A−", point: "3.50" },
      { score: "65–69", letter: "B+", point: "3.25" },
      { score: "60–64", letter: "B", point: "3.00" },
      { score: "55–59", letter: "B−", point: "2.75" },
      { score: "50–54", letter: "C+", point: "2.50" },
      { score: "45–49", letter: "C", point: "2.25" },
      { score: "40–44", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  EUB: {
    source:
      "https://eub.edu.bd/bsc-electrical-and-electronic/regular-program/program-details",
    checked: "9 September 2026",
    note: "European University of Bangladesh publishes the UGC uniform grading scale in its current EEE programme regulations; incomplete, withdrawal and retake are listed separately.",
    bands: [
      { score: "80–100", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  MU: {
    source: "https://metrouni.edu.bd/sites/policies-regulations/examination",
    checked: "14 September 2026",
    note: "Metropolitan University publishes the UGC-approved scale on its current examination-policy page. D is the lowest earned passing grade; incomplete, withdrawal, supplementary and absence are listed separately.",
    bands: [
      { score: "80 and above", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
  BAUET: {
    source: "https://bauet.ac.bd/ce/program/under-graduate/b-sc-in-ce/",
    checked: "14 September 2026",
    note: "BAUET publishes this scale in its current Civil Engineering undergraduate regulations. D is the lowest passing grade; incomplete, withdrawal and thesis-continuation statuses are non-numeric.",
    bands: [
      { score: "80 and above", letter: "A+", point: "4.00" },
      { score: "75–<80", letter: "A", point: "3.75" },
      { score: "70–<75", letter: "A−", point: "3.50" },
      { score: "65–<70", letter: "B+", point: "3.25" },
      { score: "60–<65", letter: "B", point: "3.00" },
      { score: "55–<60", letter: "B−", point: "2.75" },
      { score: "50–<55", letter: "C+", point: "2.50" },
      { score: "45–<50", letter: "C", point: "2.25" },
      { score: "40–<45", letter: "D", point: "2.00" },
      { score: "Below 40", letter: "F", point: "0.00" },
    ],
  },
};

const universities: University[] = [
  {
    id: 1,
    name: "North South University",
    short: "NSU",
    district: "Dhaka",
    division: "Dhaka",
    area: "Bashundhara Residential Area",
    address: "Plot 15, Block B, Bashundhara Residential Area, Dhaka 1229",
    programs: [
      "Architecture",
      "Civil & Environmental Engineering",
      "CSE",
      "EEE",
      "Electronic & Telecommunication Engineering",
      "Biochemistry & Biotechnology",
      "Environmental Science & Management",
      "Microbiology",
      "Public Health",
      "Pharmacy",
      "BBA in Accounting",
      "BBA in Economics",
      "BBA in Entrepreneurship",
      "BBA in Finance",
      "BBA in Human Resource Management",
      "BBA in International Business",
      "BBA in Management",
      "BBA in Management Information Systems",
      "BBA in Marketing",
      "BBA in Supply Chain Management",
      "BBA General",
      "Economics",
      "English",
      "Law",
      "Media, Communication & Journalism",
      "Anthropology",
      "Sociology",
      "History & Global Studies",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "Architecture", credits: 170, semesters: 15, tuitionPerCredit: 8000, total: 1516000, minimum: true },
      { name: "Civil & Environmental Engineering", credits: 149, semesters: 12, tuitionPerCredit: 8000, total: 1324000, minimum: true },
      { name: "CSE", credits: 130, semesters: 12, tuitionPerCredit: 8000, total: 1172000, minimum: true },
      { name: "EEE", credits: 130, semesters: 12, tuitionPerCredit: 8000, total: 1172000, minimum: true },
      { name: "Electronic & Telecommunication Engineering", credits: 130, semesters: 12, tuitionPerCredit: 8000, total: 1172000, minimum: true },
      { name: "Biochemistry & Biotechnology", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "Environmental Science & Management", credits: 130, semesters: 12, tuitionPerCredit: 8000, total: 1172000, minimum: true },
      { name: "Microbiology", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "Public Health", credits: 130, semesters: 12, tuitionPerCredit: 8000, total: 1172000, minimum: true },
      { name: "Pharmacy", credits: 160, semesters: 8, tuitionPerCredit: 8000, total: 1452000, minimum: true },
      { name: "BBA in Accounting", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Economics", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Entrepreneurship", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Finance", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Human Resource Management", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in International Business", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Management", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Management Information Systems", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Marketing", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA in Supply Chain Management", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "BBA General", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "Economics", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
      { name: "English", credits: 123, semesters: 12, tuitionPerCredit: 8000, total: 1116000, minimum: true },
      { name: "Law", credits: 130, semesters: 8, tuitionPerCredit: 8000, total: 1172000, minimum: true },
      { name: "Media, Communication & Journalism", credits: 129, semesters: 12, tuitionPerCredit: 8000, total: 1164000, minimum: true },
      { name: "Anthropology", credits: 128, semesters: 12, tuitionPerCredit: 8000, total: 1156000, minimum: true },
      { name: "Sociology", credits: 122, semesters: 12, tuitionPerCredit: 8000, total: 1108000, minimum: true },
      { name: "History & Global Studies", credits: 120, semesters: 12, tuitionPerCredit: 8000, total: 1092000, minimum: true },
    ],
    credits: 130,
    minGpa: 3.5,
    publishedMinimumCost: 1172000,
    costLabel: "Published CSE planning total",
    feeBreakdown: [
      "CSE tuition: ৳8,000 × 130 credits = ৳10,40,000",
      "Admission fee: ৳25,000",
      "Refundable caution money: ৳10,000",
      "RFID card: ৳1,000",
      "Per enrolled semester: computer lab ৳3,000 + student activity ৳3,000 + library ৳2,000",
      "Published minimum across the programme's stated 12 semesters: ৳11,72,000 before applicable science-lab fees",
      "Science-lab fee: ৳2,500 per applicable semester",
      "Anthropology published minimum: ৳11,56,000 from 128 credits, 12 standard semesters and the listed one-time fees",
      "Sociology published minimum: ৳11,08,000 from 122 credits, 12 standard semesters and the listed one-time fees",
      "History & Global Studies published minimum: ৳10,92,000 from 120 credits, 12 standard semesters and the listed one-time fees",
      "A single final CSE total is not shown because NSU assesses recurring fees by actual enrolled semester",
    ],
    scholarships: [
      "Top ten admission-test scorers may receive up to 100% merit scholarship",
      "More than 100 additional admission-test scholarships of up to 75% are published by NSU",
      "General undergraduate financial-aid applicants need at least 9 completed credits and CGPA 2.75",
      "Recipients of 50% or 75% tuition waiver must maintain CGPA 3.00",
      "An undergraduate aid recipient must register at least 24 credits across three consecutive semesters",
    ],
    status: "Official",
    facts: [
      "All twenty-eight undergraduate routes on NSU's current admissions catalogue are individually searchable with structured published-minimum records",
      "Official credits are recorded in the source catalogue: Architecture 170; CEE 149; CSE, EEE and ETE 130; Biochemistry, Microbiology and the BBA or Economics routes 120; English 123; Law 130; MCJ 129; Anthropology 128; Sociology 122; History & Global Studies 120",
      "The official catalogue lists ETE, although the newer admissions FAQ currently omits it",
      "General eligibility: combined SSC and HSC GPA 8.00, with at least GPA 3.50 in each",
      "CSE, EEE and Civil & Environmental Engineering require Mathematics and Physics with the published minimum grades",
      "BPharm has separate subject-grade requirements and must be selected as the first choice",
      "Campus: Plot 15, Block B, Bashundhara Residential Area, Dhaka 1229",
    ],
    sources: [
      {
        label:
          "Official complete undergraduate programme catalogue and credits",
        url: "https://www.northsouth.edu/undergraduate-programs.html",
      },
      {
        label: "Official current admissions programme list and credits",
        url: "https://admissions.northsouth.edu/program",
      },
      {
        label: "Official Spring 2026 tuition and recurring fees",
        url: "https://www.northsouth.edu/tuition-fees/",
      },
      {
        label:
          "Official admission requirements and programme-specific eligibility",
        url: "https://admissions.northsouth.edu/undergraduate_requirement",
      },
      {
        label: "Official financial aid office",
        url: "https://www.northsouth.edu/resources/fao.html",
      },
      {
        label: "Official admissions FAQ",
        url: "https://admissions.northsouth.edu/faq",
      },
    ],
    verifiedAt: "8 September 2026",
  },
  {
    id: 2,
    name: "BRAC University",
    short: "BRACU",
    district: "Dhaka",
    division: "Dhaka",
    area: "Merul Badda",
    address: "Kha 224, Bir Uttam Rafiqul Islam Avenue, Merul Badda, Dhaka 1212",
    programs: [
      "Applied English Language Studies",
      "Anthropology",
      "Applied Physics & Electronics",
      "Architecture",
      "BBA",
      "Disaster Management",
      "Biotechnology",
      "Computer Science",
      "CSE",
      "Electronic & Communication Engineering",
      "Economics",
      "EEE",
      "English",
      "Law",
      "Mathematics",
      "Microbiology",
      "Pharmacy",
      "Physics",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "Applied English Language Studies",
        credits: 132,
        semesters: 12,
        tuitionPerCredit: 8250,
        total: 1213400,
        minimum: true,
      },
      {
        name: "Anthropology",
        credits: 130,
        tuitionPerCredit: 8250,
        total: 1196900,
        minimum: true,
      },
      {
        name: "Applied Physics & Electronics",
        credits: 130,
        tuitionPerCredit: 8250,
        total: 1196900,
        minimum: true,
      },
      {
        name: "Architecture",
        credits: 207,
        semesters: 15,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      {
        name: "BBA",
        credits: 130,
        tuitionPerCredit: 8250,
        total: 1196900,
        minimum: true,
      },
      {
        name: "Disaster Management",
        credits: 141,
        tuitionPerCredit: 8250,
        total: 1287650,
        minimum: true,
      },
      {
        name: "Biotechnology",
        credits: 136,
        semesters: 12,
        tuitionPerCredit: 8250,
        total: 1246400,
        minimum: true,
      },
      {
        name: "Computer Science",
        credits: 124,
        tuitionPerCredit: 8250,
        total: 1147400,
        minimum: true,
      },
      { name: "CSE", credits: 136, semesters: 12, tuitionPerCredit: 8250, total: 1397600 },
      {
        name: "Electronic & Communication Engineering",
        credits: 136,
        tuitionPerCredit: 8250,
        total: 1246400,
        minimum: true,
      },
      {
        name: "Economics",
        credits: 120,
        semesters: 10,
        tuitionPerCredit: 8250,
        total: 1114400,
        minimum: true,
      },
      { name: "EEE", credits: 136, tuitionPerCredit: 8250, total: 1246400, minimum: true },
      {
        name: "English",
        credits: 132,
        tuitionPerCredit: 8250,
        total: 1213400,
        minimum: true,
      },
      {
        name: "Law",
        credits: 147,
        semesters: 8,
        tuitionPerCredit: 8800,
        total: 1418000,
        minimum: true,
      },
      { name: "Mathematics", credits: 127, tuitionPerCredit: 8250, total: 1172150, minimum: true },
      {
        name: "Microbiology",
        credits: 136,
        semesters: 12,
        tuitionPerCredit: 8250,
        total: 1246400,
        minimum: true,
      },
      {
        name: "Pharmacy",
        credits: 164,
        semesters: 8,
        tuitionPerCredit: 8250,
        total: 1589400,
      },
      { name: "Physics", credits: 132, tuitionPerCredit: 8250, total: 1213400, minimum: true },
    ],
    credits: 136,
    minGpa: 3.5,
    publishedMinimumCost: 1246400,
    costLabel: "Published CSE fee formula",
    feeBreakdown: [
      "CSE tuition: ৳8,250 × 136 credits = ৳11,22,000",
      "Admission fee: ৳33,900",
      "Library membership: ৳2,500",
      "CSE semester fee: ৳12,600 per enrolled semester; most other programmes: ৳9,350 per enrolled semester",
      "Residential Semester fee: ৳88,000",
      "CSE planning total across 12 semesters: ৳13,97,600 before the application fee and any additional assigned courses",
      "Published fixed minimum: ৳12,46,400 before recurring semester fees and admission-test-assigned courses",
      "Admission application fee: ৳1,500 separately",
      "The initial admission payment includes one assigned course; each additional assigned course costs ৳24,750 for CSE and most other programmes",
      "Admission-test result may assign additional credit or non-credit courses at ৳24,750 each",
      "Disaster Management published fixed minimum: ৳12,87,650 from 141 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "BBA published fixed minimum: ৳11,96,900 from 130 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "English and Applied English Language Studies published fixed minimum: ৳12,13,400 each from 132 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Computer Science published fixed minimum: ৳11,47,400 from 124 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Pharmacy planning total across 8 semesters: ৳15,89,400 from 164 credits, admission, library, Residential Semester and published recurring semester fees",
      "EEE and Electronic & Communication Engineering published fixed minimum: ৳12,46,400 each from 136 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Applied Physics & Electronics published fixed minimum: ৳11,96,900 from 130 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Physics published fixed minimum: ৳12,13,400 from 132 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Mathematics published fixed minimum: ৳11,72,150 from 127 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Biotechnology and Microbiology published fixed minimum: ৳12,46,400 each from 136 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Economics published fixed minimum: ৳11,14,400 from 120 credits plus admission, library and Residential Semester fees, before recurring semester fees",
      "Law published fixed minimum: ৳14,18,000 from 147 curriculum credits at ৳8,800 per credit plus admission, library and Residential Semester fees, before recurring semester fees",
      "Anthropology published fixed minimum: ৳11,96,900 from 130 credits at ৳8,250 plus admission, library and Residential Semester fees, before recurring semester fees",
      "Architecture is a 207-credit, 15-semester programme; its total remains pending because BRAC publishes different studio and lecture rates without a complete programme-wide fee split",
      "A single guaranteed programme total is not shown because enrolled semesters and assigned courses can vary",
    ],
    scholarships: [
      "Highest admission-test scorer in each undergraduate programme may receive 100% tuition waiver",
      "Previous academic results may provide 25% first-semester tuition waiver under the published criteria",
      "After at least 30 credits and CGPA 3.70, continuing students may receive 10%–100% merit waiver",
      "BRAC need-based scholarship may cover up to 100% tuition for economically disadvantaged students",
      "Sibling scholarship: 30% tuition waiver for the sibling enrolling later",
      "Students with disabilities and children of freedom fighters may receive up to 100% tuition waiver",
      "Debater's Blue Scholarship: 50% tuition waiver for one semester for one nominated student",
    ],
    status: "Official",
    facts: [
      "All eighteen undergraduate programme panels present on BRAC University's current Fall 2026 domestic-admissions page are included",
      "Seventeen programmes now have structured published-minimum records; Architecture remains cost-pending because its studio-versus-lecture credit split cannot be converted into one responsible total from the published fee table",
      "General minimum: GPA 3.50 separately in SSC and HSC; Pharmacy follows stricter aggregate and subject-grade rules",
      "EEE, ECE, CSE, Applied Physics & Electronics and Physics require the published Physics and Mathematics grades",
      "Biotechnology and Microbiology require the published Biology and Chemistry grades",
      "Residential Semester and admission-test-assigned extra courses can materially change the payable amount",
      "Campus: Kha 224, Bir Uttam Rafiqul Islam Avenue, Merul Badda, Dhaka 1212",
    ],
    sources: [
      {
        label:
          "Official Fall 2026 domestic programmes and programme-specific requirements",
        url: "https://www.bracu.ac.bd/ug-domestic-applicant",
      },
      {
        label: "Official undergraduate admission requirements",
        url: "https://www.bracu.ac.bd/admissions/undergraduate",
      },
      {
        label: "Official tuition and fees",
        url: "https://www.bracu.ac.bd/admissions/tuition-and-fees",
      },
      {
        label: "Official BBA programme and current curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-business-administration-bba",
      },
      {
        label: "Official English curriculum and Spring 2026 credit total",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-arts-english-ba-english",
      },
      {
        label: "Official Applied English Language Studies curriculum and credits",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-arts-applied-english-language-studies-ba-aels",
      },
      {
        label: "Official Computer Science programme and 124-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-computer-science-cs",
      },
      {
        label: "Official Bachelor of Pharmacy programme and 164-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-pharmacy-hons-phr",
      },
      {
        label: "Official EEE programme and 136-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-electrical-and-electronic-engineering-eee",
      },
      {
        label: "Official ECE programme and 136-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-electronic-and-communication-engineering-ece",
      },
      {
        label: "Official Applied Physics & Electronics programme and 130-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-applied-physics-and-electronics-ape",
      },
      {
        label: "Official Physics programme and 132-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-physics-phy",
      },
      {
        label: "Official Mathematics programme and 127-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-mathematics-mat",
      },
      {
        label: "Official Biotechnology programme and 136-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-biotechnology-bio",
      },
      {
        label: "Official Microbiology programme and 136-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-science-microbiology-mic",
      },
      {
        label: "Official Economics programme and 120-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-social-science-economics-eco",
      },
      {
        label: "Official Law programme and eight-semester curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-laws-llb-hons-llb",
      },
      {
        label: "Official Anthropology programme and 130-credit curriculum",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-social-sciences-anthropology-ant",
      },
      {
        label: "Official Architecture programme, 207 credits and 15 semesters",
        url: "https://www.bracu.ac.bd/avilable-program/bachelor-architecture-arc",
      },
      {
        label: "Official undergraduate scholarships and financial aid",
        url: "https://www.bracu.ac.bd/admissions/scholarships-and-financial-aid",
      },
      {
        label: "Official scholarship summary",
        url: "https://engineering.bracu.ac.bd/scholarships-financial-aid-for-prospective-students",
      },
    ],
    verifiedAt: "13 September 2026",
  },
  {
    id: 3,
    name: "East West University",
    short: "EWU",
    district: "Dhaka",
    division: "Dhaka",
    area: "Aftabnagar",
    address:
      "A/2, Jahurul Islam Avenue, Jahurul Islam City, Aftabnagar, Dhaka 1212",
    programs: [
      "BBA",
      "Economics",
      "English",
      "Law",
      "Sociology",
      "Information Studies",
      "Information & Communication Engineering",
      "CSE",
      "EEE",
      "Pharmacy",
      "Genetic Engineering & Biotechnology",
      "Civil Engineering",
      "Population & Public Health Sciences",
      "Mathematics",
      "Data Science & Analytics",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 917400,
      },
      {
        name: "Economics",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5500,
        total: 820400,
      },
      {
        name: "English",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5500,
        total: 820400,
      },
      {
        name: "Law",
        credits: 130,
        semesters: 8,
        tuitionPerCredit: 6500,
        total: 927000,
      },
      {
        name: "Sociology",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5500,
        total: 814400,
      },
      {
        name: "Information Studies",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5000,
        total: 758400,
      },
      {
        name: "Information & Communication Engineering",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1003400,
      },
      {
        name: "CSE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1003400,
      },
      {
        name: "EEE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1003400,
      },
      {
        name: "Pharmacy",
        credits: 158,
        semesters: 8,
        tuitionPerCredit: 7000,
        total: 1192000,
      },
      {
        name: "Genetic Engineering & Biotechnology",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1003400,
      },
      {
        name: "Civil Engineering",
        credits: 145,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1035900,
      },
      {
        name: "Population & Public Health Sciences",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5500,
        total: 805400,
      },
      {
        name: "Mathematics",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 4000,
        total: 665900,
      },
      {
        name: "Data Science & Analytics",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5500,
        total: 847400,
      },
    ],
    cost: 904000,
    admission: 25000,
    lab: 74400,
    semester: 0,
    credits: 140,
    minGpa: 3,
    totalCost: 1003400,
    costLabel: "Published CSE grand total",
    feeBreakdown: [
      "Tuition: ৳9,04,000",
      "Admission fee: ৳25,000",
      "Lab and activity fees: ৳74,400",
      "Grand total: ৳10,03,400",
      "Application form: ৳1,500 plus online processing fee, shown separately by EWU",
    ],
    scholarships: [
      "Admission-test scholarships are limited to top scorers with at least 75% of total marks",
      "GPA 5.00 with A+ in every SSC and HSC subject for the stated passing years may receive 100% tuition scholarship for four years",
      "GPA 5.00 including fourth subject in both SSC and HSC for the stated passing years may receive 50% tuition scholarship for the first year",
      "Entry awards require admission-test qualification and the published continuation CGPA and credit load",
    ],
    status: "Official",
    facts: [
      "All fifteen undergraduate programs on EWU's current official fee table are included",
      "The official grand totals are reproduced as published; they are not replaced with a recalculation when the table's tuition total differs from credits multiplied by the headline rate",
      "Minimum GPA 3.00 in both SSC and HSC for most undergraduate programs",
      "CSE, ICE and EEE require Mathematics and Physics at HSC or equivalent level",
      "Campus: A/2, Jahurul Islam Avenue, Jahurul Islam City, Aftabnagar, Dhaka 1212",
    ],
    sources: [
      {
        label:
          "Official Spring 2026-onward fees for every undergraduate program",
        url: "https://ewubd.edu/undergraduate-tuition-fees",
      },
      {
        label:
          "Official undergraduate catalogue, admission rules and scholarships",
        url: "https://ewubd.edu/undergraduate-programs",
      },
    ],
    verifiedAt: "6 September 2026",
  },
  {
    id: 4,
    name: "International Islamic University Chittagong",
    short: "IIUC",
    district: "Chattogram",
    division: "Chattogram",
    area: "Kumira",
    address: "Kumira, Sitakunda, Chattogram 4318",
    programs: [
      "Qur'anic Sciences & Islamic Studies",
      "Da'wah & Islamic Studies",
      "Science of Hadith & Islamic Studies",
      "CSE",
      "Computer & Communication Engineering",
      "EEE",
      "Electronic & Telecommunication Engineering",
      "Civil Engineering",
      "Pharmacy",
      "BBA",
      "BBA in Finance",
      "Economics & Banking",
      "English Language & Literature",
      "Arabic Language & Literature",
      "Law",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "Qur'anic Sciences & Islamic Studies",
        credits: 150,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 138025,
      },
      {
        name: "Da'wah & Islamic Studies",
        credits: 0,
        tuitionPerCredit: 0,
        total: 103525,
      },
      {
        name: "Science of Hadith & Islamic Studies",
        credits: 0,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      {
        name: "CSE",
        credits: 154,
        semesters: 8,
        tuitionPerCredit: 2590,
        total: 672685,
      },
      {
        name: "Computer & Communication Engineering",
        credits: 0,
        tuitionPerCredit: 0,
        total: 543025,
      },
      {
        name: "EEE",
        credits: 153,
        semesters: 8,
        tuitionPerCredit: 2480,
        total: 626565,
      },
      {
        name: "Electronic & Telecommunication Engineering",
        credits: 0,
        tuitionPerCredit: 0,
        total: 543025,
      },
      {
        name: "Civil Engineering",
        credits: 0,
        tuitionPerCredit: 0,
        total: 643025,
      },
      {
        name: "Pharmacy",
        credits: 0,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      {
        name: "BBA",
        credits: 129,
        tuitionPerCredit: 2070,
        total: 482155,
      },
      {
        name: "BBA in Finance",
        credits: 0,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      {
        name: "Economics & Banking",
        credits: 0,
        tuitionPerCredit: 0,
        total: 378825,
      },
      {
        name: "English Language & Literature",
        credits: 0,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      {
        name: "Arabic Language & Literature",
        credits: 0,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      {
        name: "Law",
        credits: 0,
        tuitionPerCredit: 0,
        total: 520125,
      },
    ],
    credits: 154,
    totalCost: 672685,
    costLabel: "Calculated from official CSE fee items",
    feeBreakdown: [
      "Published CSE total: ৳6,72,685",
      "Admission fee: ৳30,000",
      "Semester fees: ৳1,20,000 (৳15,000 × 8)",
      "Tuition: ৳3,98,860 (৳2,590 × 154 credits)",
      "Exam fee: ৳30,800",
      "Establishment fee: ৳40,000",
      "Development fee: ৳24,000",
      "Lab fee: ৳24,000",
      "Library development: ৳2,000",
      "Orientation fee: ৳3,000",
      "Rover Scout fee: ৳25",
    ],
    scholarships: [
      "IIUC publishes financial assistance and tuition-waiver facilities based on prior and university academic results",
      "The applicable percentage is intake- and result-dependent and must be confirmed from IIUC's current waiver notice",
      "Only a published, programme-specific payable amount should be used after a waiver is formally awarded",
    ],
    status: "Official",
    facts: [
      "Fifteen bachelor programme families were reconciled across IIUC's official programme-fee and department pages",
      "BSc in CSE: 154 credits across 8 semesters",
      "The displayed CSE total is the sum of every fee item on the official CSE page",
      "Other official published totals currently captured for reconciliation include Civil Engineering ৳6,43,025, EEE ৳6,26,565, CCE ৳5,43,025, ETE ৳5,43,025, Law ৳5,20,125, BBA ৳4,82,155, Economics & Banking ৳3,78,825, Da'wah & Islamic Studies ৳1,03,525 and Qur'anic Sciences & Islamic Studies ৳1,38,025",
      "Admission requirements differ by programme; engineering applicants must check the published science-subject conditions",
      "Permanent campus: Kumira, Sitakunda, Chattogram 4318",
    ],
    sources: [
      {
        label: "Official programme-wise fee directory",
        url: "https://www.iiuc.ac.bd/web/fee-structure",
      },
      {
        label: "Official CSE programme and complete fee breakdown",
        url: "https://portal.iiuc.ac.bd/program/cse",
      },
      {
        label: "Official bachelor admission criteria",
        url: "https://web.iiuc.ac.bd/program/bcriteria",
      },
      {
        label: "Official financial assistance and waiver information",
        url: "https://web.iiuc.ac.bd/program/financial-info",
      },
      {
        label: "Official admissions portal",
        url: "https://www.iiuc.ac.bd/web/admission",
      },
    ],
    verifiedAt: "9 September 2026",
  },
  {
    id: 5,
    name: "East Delta University",
    short: "EDU",
    district: "Chattogram",
    division: "Chattogram",
    area: "East Nasirabad, Khulshi",
    address:
      "Abdullah Al Noman Road, Noman Society, East Nasirabad, Khulshi, Chattogram 4209",
    programs: [
      "BBA",
      "Business Administration & Artificial Intelligence",
      "CSE",
      "EEE",
      "Electronics & Telecommunication Engineering",
      "English",
      "Economics",
    ],
    programCatalogComplete: true,
    credits: 166,
    publishedMinimumCost: 633600,
    costLabel: "Published CSE semester estimate",
    feeBreakdown: [
      "CSE published estimate for a 12-credit semester: ৳56,700",
      "CSE regular tuition: ৳4,000 per credit; displayed flat waiver: 10%; payable rate: ৳3,600 per credit",
      "Admission form: ৳1,000 once",
      "Admission fee: ৳35,000 once",
      "Semester fee: ৳13,500",
      "Student ID and other fee: ৳500 per semester",
      "Published CSE minimum from 166 credits, the displayed payable rate, admission and form fees: ৳6,33,600 before semester and student-ID charges",
      "BBA and Business Administration & AI: payable rate ৳5,000 per credit; 12-credit estimate ৳73,500",
      "EEE and ETE: payable rate ৳3,000 per credit after displayed 25% flat waiver; 12-credit estimate ৳49,500",
      "English: payable rate ৳2,000 per credit after displayed 50% flat waiver; 12-credit estimate ৳37,500",
      "Economics fee table: official verification pending",
      "No whole-program total is shown because East Delta publishes semester estimates rather than a guaranteed complete total",
    ],
    scholarships: [
      "Distinguished Scholarship: first three enrolled semesters automatically, then CGPA 3.50 and at least 12 credits per semester; published award varies by programme",
      "BoT Grant: ৳1,00,000 under the published result criteria; first three semesters automatic, then CGPA 3.00 and at least 12 credits per semester",
      "Women Empowerment & Leadership Fund: 100% of admission, tuition and semester fees; 10 competitive awards",
      "Continuing merit-cum-need support: up to 100% tuition at CGPA 3.85 or above and up to 50% at CGPA 3.50–3.84, subject to credits and committee approval",
      "Special quota: up to 100% tuition for published freedom-fighter-child and underdeveloped-area categories",
      "Student or alumni sibling/spouse waiver: 30% tuition; employee sibling, spouse or ward: 40%, subject to continuation rules",
      "Chairman academic awards and the Student of the Year award provide separate published cash awards",
    ],
    status: "Official",
    facts: [
      "All seven undergraduate programmes currently advertised on the official homepage are included",
      "Current official catalogue credits: BBA 133, Business Administration & AI 138, CSE 166, EEE 166, ETE 147, English 130 and Economics 130",
      "General entry: combined SSC and HSC GPA 5.00 with at least 2.50 each; an alternative combined 6.00 route applies when neither result is below 2.00",
      "CSE, EEE and ETE additionally require Mathematics and Physics with no grade below C",
      "No official numeric tuition reduction tied to admission-test performance was found",
      "The 2026 catalogue conflicts with older programme pages for BBA, English and ETE credits; the newer catalogue controls",
      "Diploma CSE and EEE pages exist in the catalogue, but current admissions status is not confirmed, so they are not counted as separate programmes",
      "Economics fees and the ETE Distinguished Scholarship amount remain pending rather than estimated",
    ],
    sources: [
      {
        label: "Official current undergraduate programme list",
        url: "https://www.eastdelta.edu.bd/",
      },
      {
        label: "Official 2026 programme catalogue and credits",
        url: "https://catalog.eastdelta.edu.bd/programs",
      },
      {
        label: "Official CSE fees and admission requirements",
        url: "https://www.eastdelta.edu.bd/programs-offered-by-the-university/soset/bsc-in-cse",
      },
      {
        label: "Official scholarship repository",
        url: "https://scholarships.eastdelta.edu.bd/",
      },
      {
        label: "Official grading system",
        url: "https://www.eastdelta.edu.bd/about-us/grading-system",
      },
    ],
    verifiedAt: "6 September 2026",
  },
  {
    id: 6,
    name: "Leading University",
    short: "LU",
    district: "Sylhet",
    division: "Sylhet",
    area: "Ragibnagar, Kamal Bazar",
    address:
      "Permanent Campus, Ragibnagar, Kamal Bazar, South Surma, Sylhet 3112",
    programs: [
      "CSE",
      "EEE",
      "Architecture",
      "Civil Engineering",
      "English",
      "BBA",
      "Law",
      "Islamic Studies",
      "Tourism & Hospitality Management",
      "Bangla",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 160, tuitionPerCredit: 2250, total: 515764 },
      { name: "EEE", credits: 160, tuitionPerCredit: 2100, total: 497764 },
      {
        name: "Architecture",
        credits: 198,
        tuitionPerCredit: 2550,
        total: 701164,
      },
      {
        name: "Civil Engineering",
        credits: 164,
        tuitionPerCredit: 2415,
        total: 566224,
      },
      { name: "English", credits: 140, tuitionPerCredit: 1900, total: 403764 },
      { name: "BBA", credits: 141, tuitionPerCredit: 2500, total: 490264 },
      { name: "Law", credits: 141, tuitionPerCredit: 2200, total: 447964 },
      {
        name: "Islamic Studies",
        credits: 140,
        tuitionPerCredit: 200,
        total: 165764,
      },
      {
        name: "Tourism & Hospitality Management",
        credits: 140,
        tuitionPerCredit: 2200,
        total: 445764,
      },
      { name: "Bangla", credits: 122, tuitionPerCredit: 840, total: 240244 },
    ],
    credits: 160,
    totalCost: 515764,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE total: ৳5,15,764",
      "Admission fee: ৳22,000",
      "Tuition rate: ৳2,250 per credit",
      "Transport: ৳5,250 per semester",
      "Student activity: ৳3,000 per semester",
      "Lab: ৳2,250 per semester",
      "Semester fee: ৳6,000 per semester",
      "Library fee: ৳1,500 once",
      "Application form: ৳1,000 separately",
    ],
    scholarships: [
      "Golden GPA 5.00 in both SSC and HSC: 60% tuition waiver",
      "GPA 5.00 in both with one Golden result: 45%; GPA 5.00 in both: 40%",
      "GPA 4.50 in both: 25%; GPA 4.00 in both: 15%; GPA 3.50 in both: 10%",
      "Female students: 10%; second child of the same parents: provisional 30%",
      "Teachers' children, tribal students and students with disabilities: 10%",
      "When several categories apply, only the single highest waiver is awarded",
    ],
    status: "Official",
    facts: [
      "All ten undergraduate programmes on the central official catalogue and fee table are included",
      "The fee table does not publish programme-by-programme semester counts; UniVerse BD leaves that field pending rather than guessing",
      "General entry: GPA 2.50 in both SSC and HSC, or combined GPA 6.00 with neither below 2.00",
      "Engineering applicants require Mathematics and Physics under the central policy",
      "Central fee-table credits conflict with some older department curricula; central published totals and fee-basis credits are preserved",
      "The scholarship page states 15% for GPA 4.00 in both exams, while the FAQ says 10%; the dedicated scholarship page is used",
      "Published totals do not fully reconcile from the visible components, so they are presented as university-published totals rather than recalculated claims",
    ],
    sources: [
      {
        label: "Official complete undergraduate programme catalogue",
        url: "https://lus.ac.bd/admission/academic-programs/",
      },
      {
        label: "Official fees for every undergraduate programme",
        url: "https://lus.ac.bd/admission/tution-fees/",
      },
      {
        label: "Official admission and registration policy",
        url: "https://lus.ac.bd/admission/admission-and-registration-policies/",
      },
      {
        label: "Official scholarship and aid rules",
        url: "https://lus.ac.bd/admission/scholarship-and-aid/",
      },
      { label: "Official grading chart", url: "https://lus.ac.bd/faq/" },
    ],
    verifiedAt: "6 September 2026",
  },
  {
    id: 7,
    name: "University of Asia Pacific",
    short: "UAP",
    district: "Dhaka",
    division: "Dhaka",
    area: "Green Road, Farmgate",
    address: "Main Campus, 74/A Green Road, Farmgate, Dhaka 1205",
    programs: [
      "Architecture",
      "Civil Engineering",
      "CSE",
      "EEE",
      "BBA",
      "English",
      "Law",
      "Pharmacy",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "Architecture",
        credits: 182,
        semesters: 10,
        tuitionPerCredit: 0,
        total: 1182700,
      },
      {
        name: "Civil Engineering",
        credits: 161,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 832700,
      },
      {
        name: "CSE",
        credits: 153,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 832700,
      },
      {
        name: "EEE",
        credits: 151,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 832700,
      },
      {
        name: "BBA",
        credits: 130,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 722700,
      },
      {
        name: "English",
        credits: 123,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 592700,
      },
      {
        name: "Law",
        credits: 144,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 836700,
      },
      {
        name: "Pharmacy",
        credits: 162,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 1233200,
      },
    ],
    credits: 153,
    totalCost: 832700,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE total: ৳8,32,700",
      "CSE registration: ৳45,000 per semester",
      "CSE tuition: ৳55,000 per semester",
      "Combined semester payment: ৳1,00,000 × 8 semesters",
      "Application processing: ৳1,200 separately",
      "Central admission package: ৳21,500; its visible listed components total ৳18,500, so the ৳3,000 difference is flagged rather than explained by guesswork",
      "Refundable caution money: ৳3,000",
      "Convocation registration: ৳10,000",
    ],
    scholarships: [
      "SSC GPA 5.00 and HSC GPA 5.00: 50% first-semester tuition waiver",
      "All A+ in both SSC and HSC: 100% first-semester tuition waiver",
      "Full-free quota: 3% for freedom-fighter children and 3% for meritorious students from remote or underdeveloped areas",
      "Poor and meritorious students may receive 10%–100% waiver based on UAP performance",
      "Second sibling: 60% tuition waiver",
      "From the second semester: top 3% receive 100%, next 6% receive 50%, and next 10% receive 25% tuition waiver",
      "Merit continuation requires CGPA 3.50, full prescribed credits, no F grade and no disciplinary disqualification",
    ],
    status: "Official",
    facts: [
      "All eight undergraduate programmes in UAP's current central fee table are included",
      "UAP publishes fixed registration and tuition amounts per semester, not per-credit rates",
      "General admission: combined SSC and HSC GPA 6.00 with at least 2.50 in each; Architecture and Pharmacy require at least 3.50 in each",
      "Programme-specific science subjects, diploma routes and admission-test rules are preserved on the official admission page",
      "The central Pharmacy total ৳12,33,200 conflicts with an older department-page total of ৳10,10,000; the current central total controls",
      "The central EEE total ৳8,32,700 conflicts with a department figure of ৳8,25,000; the current central total controls",
      "The official contact page gives Dhaka 1205, while some department footers show 1215; the central contact address controls",
    ],
    sources: [
      {
        label: "Official central undergraduate programme and fee table",
        url: "https://www.uap-bd.edu/undergraduate.php",
      },
      {
        label: "Official Fall 2026 programme-specific admission requirements",
        url: "https://www.uap-bd.edu/admission_requirment_undergraduate.php",
      },
      {
        label: "Official tuition-waiver rules",
        url: "https://uap-bd.edu/tution.php",
      },
      {
        label: "Official central campus contact",
        url: "https://uap-bd.edu/contactus.php",
      },
      {
        label: "Official grading system",
        url: "https://www.uap-bd.edu/eng/grading_system.php",
      },
    ],
    verifiedAt: "6 September 2026",
  },
  {
    id: 8,
    name: "Daffodil International University",
    short: "DIU",
    district: "Dhaka",
    division: "Dhaka",
    area: "Daffodil Smart City, Birulia",
    address: "Daffodil Smart City, Birulia, Savar, Dhaka 1216",
    programs: [
      "CSE",
      "Computing & Information System",
      "Software Engineering",
      "Multimedia & Creative Technology",
      "Environmental Science & Disaster Management",
      "Textile Engineering",
      "EEE",
      "Information & Communication Engineering",
      "Agricultural Science",
      "Civil Engineering",
      "Architecture",
      "BBA",
      "Tourism & Hospitality Management",
      "Real Estate",
      "Entrepreneurship",
      "BBA in Management",
      "Law",
      "English",
      "Journalism, Media & Communication",
      "Pharmacy",
      "Nutrition & Food Engineering",
      "Information Technology & Management",
      "Software Engineering — Cyber Security",
      "Software Engineering — Data Science",
      "Software Engineering — Robotics",
      "Physical Education & Sports Science",
      "Public Health",
      "BBA in Accounting",
      "Genetic Engineering & Biotechnology",
      "BBA in Finance & Banking",
      "BBA in Marketing",
      "Robotics & Mechatronics Engineering",
      "Fisheries",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 154.5, tuitionPerCredit: 0, total: 1020450 },
      {
        name: "Computing & Information System",
        credits: 142,
        tuitionPerCredit: 0,
        total: 755600,
      },
      {
        name: "Software Engineering",
        credits: 147,
        tuitionPerCredit: 0,
        total: 952500,
      },
      {
        name: "Multimedia & Creative Technology",
        credits: 147,
        tuitionPerCredit: 0,
        total: 744150,
      },
      {
        name: "Environmental Science & Disaster Management",
        credits: 146,
        tuitionPerCredit: 0,
        total: 612200,
      },
      {
        name: "Textile Engineering",
        credits: 154,
        tuitionPerCredit: 0,
        total: 786200,
      },
      { name: "EEE", credits: 144, tuitionPerCredit: 0, total: 843200 },
      {
        name: "Information & Communication Engineering",
        credits: 145,
        tuitionPerCredit: 0,
        total: 703000,
      },
      {
        name: "Agricultural Science",
        credits: 150,
        tuitionPerCredit: 0,
        total: 694350,
      },
      {
        name: "Civil Engineering",
        credits: 147,
        tuitionPerCredit: 0,
        total: 833850,
      },
      {
        name: "Architecture",
        credits: 194,
        semesters: 10,
        tuitionPerCredit: 0,
        total: 924600,
      },
      { name: "BBA", credits: 130, tuitionPerCredit: 0, total: 789575 },
      {
        name: "Tourism & Hospitality Management",
        credits: 130,
        tuitionPerCredit: 0,
        total: 698600,
      },
      { name: "Real Estate", credits: 130, tuitionPerCredit: 0, total: 706400 },
      {
        name: "Entrepreneurship",
        credits: 130,
        tuitionPerCredit: 0,
        total: 733950,
      },
      {
        name: "BBA in Management",
        credits: 133,
        tuitionPerCredit: 0,
        total: 761000,
      },
      { name: "Law", credits: 144, tuitionPerCredit: 0, total: 954600 },
      { name: "English", credits: 130, tuitionPerCredit: 0, total: 694500 },
      {
        name: "Journalism, Media & Communication",
        credits: 142,
        tuitionPerCredit: 0,
        total: 654000,
      },
      { name: "Pharmacy", credits: 165, tuitionPerCredit: 0, total: 1118500 },
      {
        name: "Nutrition & Food Engineering",
        credits: 151,
        tuitionPerCredit: 0,
        total: 699000,
      },
      {
        name: "Information Technology & Management",
        credits: 142,
        tuitionPerCredit: 0,
        total: 757200,
      },
      {
        name: "Software Engineering — Cyber Security",
        credits: 145,
        tuitionPerCredit: 0,
        total: 962900,
      },
      {
        name: "Software Engineering — Data Science",
        credits: 147,
        tuitionPerCredit: 0,
        total: 964900,
      },
      {
        name: "Software Engineering — Robotics",
        credits: 147,
        tuitionPerCredit: 0,
        total: 964900,
      },
      {
        name: "Physical Education & Sports Science",
        credits: 144,
        tuitionPerCredit: 0,
        total: 609400,
      },
      {
        name: "Public Health",
        credits: 142,
        tuitionPerCredit: 0,
        total: 658800,
      },
      {
        name: "BBA in Accounting",
        credits: 133,
        tuitionPerCredit: 0,
        total: 761000,
      },
      {
        name: "Genetic Engineering & Biotechnology",
        credits: 145,
        tuitionPerCredit: 0,
        total: 930000,
      },
      {
        name: "BBA in Finance & Banking",
        credits: 133,
        tuitionPerCredit: 0,
        total: 761000,
      },
      {
        name: "BBA in Marketing",
        credits: 133,
        tuitionPerCredit: 0,
        total: 761000,
      },
      {
        name: "Robotics & Mechatronics Engineering",
        credits: 154,
        tuitionPerCredit: 0,
        total: 937950,
      },
      { name: "Fisheries", credits: 144, tuitionPerCredit: 0, total: 792400 },
    ],
    credits: 154.5,
    totalCost: 1020450,
    costLabel: "Official-calculator CSE total",
    feeBreakdown: [
      "Published CSE total: ৳10,20,450",
      "CSE tuition component: ৳7,82,250",
      "CSE other-fee component: ৳2,38,200",
      "Admission component inside the published total: ৳61,750",
      "Tuition plus other fees equals the published total; admission is not added again",
      "DIU's calculator does not publish a CSE per-credit rate or semester count, so neither is derived",
    ],
    scholarships: [
      "DIU's official calculator applies result-based waivers by programme; it does not support one universal SSC/HSC percentage chart",
      "Available routes include result-based, sibling or spouse, female, disability, tribal or ethnic, alumni-family, diploma and affiliated-college categories",
      "The official site states that more than 25 scholarship categories exist and awards may reach 100%",
      "Talent Scholarship may cover 100% tuition and provide boarding or lodging assistance through competition",
      "Chairman Endowment Fund supports qualifying meritorious students with financial need",
      "Additional named funds include Mofiz Uddin Majumder, Delwar Hossain Chowdhury and Razia Begum scholarships",
      "Every student should run the official calculator with their exact programme, SSC/HSC results and category before relying on a payable amount",
    ],
    status: "Official",
    facts: [
      "All 33 local undergraduate records returned by DIU's current official tuition calculator are included",
      "All calculator programmes show four-year duration except Architecture, which shows five years",
      "Programme totals and credits are reproduced from the calculator without deriving unpublished per-credit rates",
      "The official homepage's 38-program figure includes undergraduate and postgraduate study, so it does not contradict the 33 local undergraduate calculator records",
      "Exact programme-specific eligibility and full waiver bands remain pending where the dynamic official pages do not publish them clearly",
      "Campus: Daffodil Smart City, Birulia, Savar, Dhaka 1216",
    ],
    sources: [
      {
        label: "Official tuition and waiver calculator",
        url: "https://daffodilvarsity.edu.bd/tuition-fee-calculator",
      },
      {
        label: "Official undergraduate programme calculator data",
        url: "https://webbackend.daffodilvarsity.edu.bd/api/v1/public/programs?tuition_category_id=1&program_type_id=1",
      },
      {
        label: "Official scholarship information",
        url: "https://daffodilvarsity.edu.bd/scholarship",
      },
      {
        label: "Official financial-aid funds",
        url: "https://financialaid.daffodilvarsity.edu.bd/",
      },
      {
        label: "Official admission information",
        url: "https://daffodilvarsity.edu.bd/admission",
      },
    ],
    verifiedAt: "6 September 2026",
  },
  ...[
    ["Independent University, Bangladesh", "IUB", "Dhaka", "Dhaka"],
    [
      "Ahsanullah University of Science and Technology",
      "AUST",
      "Dhaka",
      "Dhaka",
    ],
    ["American International University-Bangladesh", "AIUB", "Dhaka", "Dhaka"],
    ["United International University", "UIU", "Dhaka", "Dhaka"],
    ["Southeast University", "SEU", "Dhaka", "Dhaka"],
    ["Stamford University Bangladesh", "SUB", "Dhaka", "Dhaka"],
    ["State University of Bangladesh", "SUBD", "Dhaka", "Dhaka"],
    ["Primeasia University", "PAU", "Dhaka", "Dhaka"],
    ["Eastern University", "EU", "Dhaka", "Dhaka"],
    ["University of Liberal Arts Bangladesh", "ULAB", "Dhaka", "Dhaka"],
    ["Green University of Bangladesh", "GUB", "Dhaka", "Dhaka"],
    [
      "Bangladesh University of Business and Technology",
      "BUBT",
      "Dhaka",
      "Dhaka",
    ],
    ["Northern University Bangladesh", "NUB", "Dhaka", "Dhaka"],
    ["World University of Bangladesh", "WUB", "Dhaka", "Dhaka"],
    ["Dhaka International University", "DIU-D", "Dhaka", "Dhaka"],
    ["Manarat International University", "MIU", "Dhaka", "Dhaka"],
    ["ASA University Bangladesh", "ASAUB", "Dhaka", "Dhaka"],
    ["Bangladesh University", "BU", "Dhaka", "Dhaka"],
    ["European University of Bangladesh", "EUB", "Dhaka", "Dhaka"],
    ["Presidency University", "PU", "Dhaka", "Dhaka"],
    ["City University", "CU", "Dhaka", "Dhaka"],
    ["Uttara University", "UU", "Dhaka", "Dhaka"],
    ["Canadian University of Bangladesh", "CUB", "Dhaka", "Dhaka"],
    [
      "Shanto-Mariam University of Creative Technology",
      "SMUCT",
      "Dhaka",
      "Dhaka",
    ],
    ["University of Development Alternative", "UODA", "Dhaka", "Dhaka"],
    ["Gono Bishwabidyalay", "GB", "Savar", "Dhaka"],
    ["BGMEA University of Fashion & Technology", "BUFT", "Dhaka", "Dhaka"],
    [
      "University of Science and Technology Chittagong",
      "USTC",
      "Chattogram",
      "Chattogram",
    ],
    ["Premier University", "PUC", "Chattogram", "Chattogram"],
    ["Chittagong Independent University", "CIU", "Chattogram", "Chattogram"],
    ["Southern University Bangladesh", "SUB-C", "Chattogram", "Chattogram"],
    ["BGC Trust University Bangladesh", "BGCTUB", "Chandanaish", "Chattogram"],
    ["Port City International University", "PCIU", "Chattogram", "Chattogram"],
    ["Metropolitan University", "MU", "Sylhet", "Sylhet"],
    ["North East University Bangladesh", "NEUB", "Sylhet", "Sylhet"],
    ["Sylhet International University", "SIU", "Sylhet", "Sylhet"],
    ["Varendra University", "VU", "Rajshahi", "Rajshahi"],
    ["North Bengal International University", "NBIU", "Rajshahi", "Rajshahi"],
    ["Khwaja Yunus Ali University", "KYAU", "Sirajganj", "Rajshahi"],
    ["North Western University", "NWU", "Khulna", "Khulna"],
    [
      "Northern University of Business and Technology Khulna",
      "NUBTK",
      "Khulna",
      "Khulna",
    ],
    ["University of Global Village", "UGV", "Barishal", "Barishal"],
    ["Trust University, Barishal", "TUB", "Barishal", "Barishal"],
    ["First Capital University of Bangladesh", "FCUB", "Chuadanga", "Khulna"],
    [
      "Ishakha International University, Bangladesh",
      "IIUB",
      "Kishoreganj",
      "Dhaka",
    ],
    ["Times University, Bangladesh", "TUB-F", "Faridpur", "Dhaka"],
    ["The People's University of Bangladesh", "PUB", "Dhaka", "Dhaka"],
    ["Asian University of Bangladesh", "AUB", "Dhaka", "Dhaka"],
    ["International Standard University", "ISU", "Dhaka", "Dhaka"],
    [
      "International University of Business Agriculture and Technology",
      "IUBAT",
      "Dhaka",
      "Dhaka",
    ],
    [
      "University of Information Technology and Sciences",
      "UITS",
      "Dhaka",
      "Dhaka",
    ],
    [
      "Atish Dipankar University of Science and Technology",
      "ADUST",
      "Dhaka",
      "Dhaka",
    ],
    ["Sonargaon University", "SU", "Dhaka", "Dhaka"],
    ["Fareast International University", "FIU", "Dhaka", "Dhaka"],
    ["Notre Dame University Bangladesh", "NDUB", "Dhaka", "Dhaka"],
    ["Central Women's University", "CWU", "Dhaka", "Dhaka"],
    ["Bangladesh University of Health Sciences", "BUHS", "Dhaka", "Dhaka"],
    ["Hamdard University Bangladesh", "HUB", "Munshiganj", "Dhaka"],
    ["German University Bangladesh", "GUB-G", "Gazipur", "Dhaka"],
    ["Ranada Prasad Shaha University", "RPSU", "Narayanganj", "Dhaka"],
    [
      "Z.H. Sikder University of Science and Technology",
      "ZHSUST",
      "Shariatpur",
      "Dhaka",
    ],
    ["Anwer Khan Modern University", "AKMU", "Dhaka", "Dhaka"],
    ["University of Scholars", "IUS", "Dhaka", "Dhaka"],
    ["Royal University of Dhaka", "RUD", "Dhaka", "Dhaka"],
    ["Victoria University of Bangladesh", "VUB", "Dhaka", "Dhaka"],
    ["Central University of Science and Technology", "CUST", "Dhaka", "Dhaka"],
    ["Feni University", "FU", "Feni", "Chattogram"],
    ["Britannia University", "BU-C", "Cumilla", "Chattogram"],
    [
      "CCN University of Science and Technology",
      "CCNUST",
      "Cumilla",
      "Chattogram",
    ],
    [
      "Cox's Bazar International University",
      "CBIU",
      "Cox's Bazar",
      "Chattogram",
    ],
    [
      "University of Creative Technology Chittagong",
      "UCTC",
      "Chattogram",
      "Chattogram",
    ],
    ["Rabindra Maitree University", "RMU", "Kushtia", "Khulna"],
    ["Khan Bahadur Ahsanullah University", "KBAU", "Khulna", "Khulna"],
    [
      "Pundra University of Science and Technology",
      "PUST",
      "Bogura",
      "Rajshahi",
    ],
    [
      "Exim Bank Agricultural University Bangladesh",
      "EBAUB",
      "Chapainawabganj",
      "Rajshahi",
    ],
    [
      "Bangladesh Army University of Engineering & Technology",
      "BAUET",
      "Natore",
      "Rajshahi",
    ],
    [
      "Bangladesh Army University of Science and Technology",
      "BAUST",
      "Nilphamari",
      "Rangpur",
    ],
    ["R.T.M. Al-Kabir Technical University", "RTM-AKTU", "Sylhet", "Sylhet"],
    ["Sheikh Fazilatunnesa Mujib University", "SFMU", "Jamalpur", "Mymensingh"],
    ["Global University Bangladesh", "GUB-B", "Barishal", "Barishal"],
  ].map((u, i) => ({
    id: i + 9,
    name: u[0],
    short: u[1],
    district: u[2],
    division: u[3],
    programs: [],
    status: "Directory" as const,
  })),
];
Object.assign(
  universities.find((u) => u.short === "SMUCT")!,
  {
    area: "Uttara",
    address: "Plot 06, Road/Avenue 06, Sector 17/H-1, Uttara, Dhaka 1230, Bangladesh",
    programs: [
      "Fashion Design & Technology",
      "Apparel Manufacturing Management & Technology",
      "Interior Architecture",
      "Interior Architecture for Diploma Holders",
      "Graphic Design & Multimedia",
      "Product Design",
      "Architecture",
      "Computer Science & Information Technology",
      "CSE",
      "BBA",
      "English",
      "Law",
      "Sociology & Anthropology",
      "Bangla",
      "Government & Politics",
      "Islamic Studies",
      "Fine Arts",
      "Music",
      "Dance",
    ],
    programCatalogComplete: false,
    programCosts: [
      { name: "Fashion Design & Technology", credits: 146, semesters: 8, tuitionPerCredit: 3500, total: 592000 },
      { name: "Apparel Manufacturing Management & Technology", credits: 140, semesters: 8, tuitionPerCredit: 3500, total: 571000 },
      { name: "Interior Architecture", credits: 136, semesters: 8, tuitionPerCredit: 3500, total: 557000 },
      { name: "Interior Architecture for Diploma Holders", credits: 108, semesters: 6, tuitionPerCredit: 0, total: 380000 },
      { name: "Graphic Design & Multimedia", credits: 140, semesters: 8, tuitionPerCredit: 3800, total: 613000 },
      { name: "Product Design", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Architecture", credits: 180.5, semesters: 10, tuitionPerCredit: 3100, total: 654550 },
      { name: "Computer Science & Information Technology", credits: 144, semesters: 8, tuitionPerCredit: 2500, total: 441000 },
      { name: "CSE", credits: 145, semesters: 8, tuitionPerCredit: 3000, total: 516000 },
      { name: "Music", credits: 134, semesters: 8, tuitionPerCredit: 1200, total: 241800 },
      { name: "Dance", credits: 134, semesters: 8, tuitionPerCredit: 1200, total: 241800 },
      { name: "Fine Arts", credits: 130, semesters: 8, tuitionPerCredit: 1400, total: 263000 },
      { name: "BBA", credits: 132, semesters: 12, tuitionPerCredit: 3300, total: 520600 },
      { name: "English", credits: 130, semesters: 12, tuitionPerCredit: 2500, total: 410000 },
      { name: "Islamic Studies", credits: 130, semesters: 12, tuitionPerCredit: 900, total: 190000 },
      { name: "Sociology & Anthropology", credits: 130, semesters: 12, tuitionPerCredit: 1500, total: 268000 },
      { name: "Law", credits: 140, semesters: 8, tuitionPerCredit: 3500, total: 571000 },
      { name: "Government & Politics", credits: 130, semesters: 12, tuitionPerCredit: 1500, total: 268000 },
      { name: "Bangla", credits: 130, semesters: 12, tuitionPerCredit: 900, total: 190000 },
    ],
    scholarships: [
      "Average SSC-HSC GPA 4.00–4.24: 10% tuition scholarship",
      "Average SSC-HSC GPA 4.25–4.49: 15% tuition scholarship",
      "Average SSC-HSC GPA 4.50–4.74: 20% tuition scholarship",
      "Average SSC-HSC GPA 4.75–4.99: 25% tuition scholarship",
      "Average SSC-HSC GPA 5.00: 50% tuition scholarship",
      "Golden GPA 5.00: 100% tuition scholarship",
      "Continuation normally requires SGPA 3.25; the official policy explains suspension and restoration conditions",
    ],
    status: "Official",
    facts: [
      "The official catalogue currently lists undergraduate routes across design, engineering, business, humanities, social sciences and performing arts",
      "The official fee page publishes programme credits, duration, admission fee, session fee, tuition rate and complete total",
      "Product Design is listed in the official programme catalogue, but no matching row was found in the readable fee table, so its cost remains pending",
      "The fee page contains more than one table; UniVerse BD uses the first table presented and keeps the source link visible for intake confirmation",
      "Permanent campus: Plot 06, Road/Avenue 06, Sector 17/H-1, Uttara, Dhaka 1230",
    ],
    sources: [
      { label: "Official undergraduate programme catalogue", url: "https://smuct.ac.bd/" },
      { label: "Official undergraduate fee table", url: "https://smuct.ac.bd/undergraduate-course-fees/" },
      { label: "Official scholarship and waiver policy", url: "https://smuct.ac.bd/scholarship-and-waiver/" },
      { label: "Official permanent-campus contact", url: "https://smuct.ac.bd/contact/" },
    ],
    verifiedAt: "19 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "TUB")!,
  {
    area: "Ruiya, Nabogram Road",
    address: "Ruiya, Nabogram Road, Barishal 8200, Bangladesh",
    minGpa: 2.5,
    programs: [
      "EEE",
      "CSE",
      "BBA",
      "Economics & Banking",
      "English",
      "Biochemistry",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "EEE", credits: 160.5, tuitionPerCredit: 2200, total: 419100 },
      { name: "CSE", credits: 150, tuitionPerCredit: 2750, total: 478500 },
      { name: "BBA", credits: 132, tuitionPerCredit: 2000, total: 322000 },
      { name: "Economics & Banking", credits: 130, tuitionPerCredit: 2000, total: 318000 },
      { name: "English", credits: 132, tuitionPerCredit: 2000, total: 322000 },
      { name: "Biochemistry", credits: 148, tuitionPerCredit: 3500, total: 592000 },
    ],
    credits: 150,
    totalCost: 478500,
    publishedMinimumCost: 318000,
    costLabel: "University-published Summer 2026 CSE total",
    feeBreakdown: [
      "CSE: Tk 4,78,500 before waiver — Tk 15,000 admission, Tk 4,12,500 tuition, Tk 48,000 exam/lab and Tk 3,000 certificate/marksheet",
      "Published programme totals range from Tk 3,18,000 for Economics & Banking to Tk 5,92,000 for Biochemistry",
      "Waiver columns on the official table publish reduced programme totals; UniVerse BD keeps the undiscounted total as the baseline",
      "The CSE academic page states 140 curriculum credits while the Summer 2026 fee table states 150; the cost record follows the fee table and displays this conflict",
    ],
    scholarships: [
      "SSC/HSC combined GPA below 8.00: published 50% tuition-waiver column",
      "SSC/HSC combined GPA above 8.00: published 60% tuition-waiver column",
      "SSC/HSC combined GPA above 9.00: published 70% tuition-waiver column",
      "GPA 5.00 in both SSC and HSC: published 75% tuition-waiver column",
      "Golden GPA 5.00 in both SSC and HSC: published 100% tuition-waiver column",
      "The official page also states that female students and siblings receive special financial concessions",
    ],
    status: "Official",
    facts: [
      "The Summer 2026 official fee table lists six undergraduate programmes with credits, charge components and complete programme totals",
      "CSE admission requires Science with Mathematics, normally GPA 2.50 separately in SSC and HSC and combined GPA 6.00",
      "The current CSE academic page describes a four-year, eight-semester OBE curriculum",
      "The fee-table and academic-page CSE credit counts conflict; students should confirm the applicable curriculum with admissions before payment",
      "Campus: Ruiya, Nabogram Road, Barishal 8200",
    ],
    sources: [
      { label: "Official Summer 2026 tuition and waiver table", url: "https://trustuniversity.edu.bd/tuition-fees" },
      { label: "Official CSE curriculum and admission requirements", url: "https://trustuniversity.edu.bd/academics/cse" },
      { label: "Official university website", url: "https://trustuniversity.edu.bd/" },
    ],
    verifiedAt: "19 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BUHS")!,
  {
    area: "Mirpur",
    address: "125/1, Darus Salam, Mirpur, Dhaka 1216, Bangladesh",
    programs: [
      "BPH in Community Nutrition",
      "BPH in Epidemiology and Biostatistics",
      "BPH in Health Promotion & Health Education",
      "BPH in Occupational & Environmental Health and Safety",
      "BPH in Reproductive & Child Health",
      "BS in Biochemistry & Cell Biology",
      "BS in Microbiology and Immunology",
      "BSc in Biomedical Engineering",
      "CSE",
      "BSc in Laboratory Technology",
      "BSc in Radiology & Imaging Technology",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BPH in Community Nutrition", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BPH in Epidemiology and Biostatistics", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BPH in Health Promotion & Health Education", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BPH in Occupational & Environmental Health and Safety", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BPH in Reproductive & Child Health", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BS in Biochemistry & Cell Biology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BS in Microbiology and Immunology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BSc in Biomedical Engineering", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BSc in Laboratory Technology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BSc in Radiology & Imaging Technology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    costLabel: "Official programme cost pending",
    feeBreakdown: [
      "BUHS currently lists eleven undergraduate programmes in its official 2026 application system",
      "No total, per-credit fee, recurring fee, or programme-credit table is published on the accessible official admissions pages",
      "The calculator therefore keeps every BUHS programme amount pending instead of estimating a total",
    ],
    scholarships: [
      "Official numerical scholarship and waiver bands are pending publication by BUHS",
      "No result-based discount is applied in the calculator until an official award table can be verified",
    ],
    status: "Official",
    facts: [
      "All eleven undergraduate choices in BUHS's current official online application form are searchable",
      "The catalogue includes five Bachelor of Public Health routes, two biological-science routes and four applied science or technology routes",
      "Programme-specific admission requirements remain marked pending until BUHS publishes an unambiguous public requirement table",
      "Campus: 125/1, Darus Salam, Mirpur, Dhaka 1216",
    ],
    sources: [
      {
        label: "Official 2026 undergraduate application and programme list",
        url: "https://onlineapplication.buhs.ac.bd/admission/student/apply.php",
      },
      {
        label: "Official undergraduate programme directory",
        url: "https://buhs.ac.bd/program/undergraduate",
      },
      {
        label: "Official BUHS website and contact information",
        url: "https://buhs.ac.bd/",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "GB")!,
  {
    area: "Nolam, Mirzanagar",
    address:
      "Nolam, P.O. Mirzanagar via Savar Cantonment, Ashulia, Savar, Dhaka 1344",
    programs: [
      "Pharmacy",
      "Microbiology",
      "Biochemistry & Molecular Biology",
      "Medical Physics & Biomedical Engineering",
      "CSE",
      "Applied Mathematics",
      "Chemistry",
      "Physics",
      "EEE",
      "BBA",
      "English",
      "Politics & Governance",
      "Bangla Language & Culture",
      "Sociology & Social Work",
      "Law",
      "Veterinary Science & Animal Husbandry",
      "Agriculture",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "Pharmacy", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Microbiology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Biochemistry & Molecular Biology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Medical Physics & Biomedical Engineering", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Applied Mathematics", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Chemistry", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Physics", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BBA", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Politics & Governance", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Bangla Language & Culture", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Sociology & Social Work", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Law", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Veterinary Science & Animal Husbandry", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Agriculture", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    minGpa: 2.5,
    costLabel: "Official programme costs pending verification",
    feeBreakdown: [
      "The university publishes a current 2025–2027 admission and fee PDF",
      "Programme totals are kept pending until every component in the official PDF can be verified without estimation",
      "No unpublished fee is used for budget matching or sorting",
    ],
    scholarships: [
      "Gono Bishwabidyalay currently advertises tuition waivers of up to 75% based on semester results",
      "No result-based amount is calculated until the university publishes the complete percentage bands and continuation rules in accessible text",
    ],
    status: "Official",
    facts: [
      "All seventeen programmes in the university's current undergraduate admission-requirement table are searchable",
      "The general minimum is GPA 2.50 in both SSC and HSC; Pharmacy requires combined GPA 8.00, at least 3.50 in each, plus specified science-subject grades",
      "Veterinary Science requires the science group with Biology, Physics, Chemistry and Mathematics and runs for five years including internship",
      "Agriculture requires GPA 2.50 in each and combined GPA 6.00; diploma applicants require GPA 3.00",
      "Most programmes run for four years across eight semesters",
      "Campus: Nolam, P.O. Mirzanagar via Savar Cantonment, Ashulia, Savar, Dhaka 1344",
    ],
    sources: [
      {
        label: "Official undergraduate programmes and admission requirements",
        url: "https://gonouniversity.edu.bd/admission/undergraduate-admission-requirements/",
      },
      {
        label: "Official 2025–2027 tuition and admission PDF",
        url: "https://gonouniversity.edu.bd/admission/tuition-and-other-fees/",
      },
      {
        label: "Official financial-aid information",
        url: "https://gonouniversity.edu.bd/admission/financial-aid/",
      },
      {
        label: "Official campus contact information",
        url: "https://gonouniversity.edu.bd/contact-us/",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "SIU")!,
  {
    area: "Shamimabad, Bagbari",
    address: "Shamimabad, Bagbari, Sylhet 3100, Bangladesh",
    programs: [
      "CSE",
      "CSE — Evening",
      "Computer Science & Informatics",
      "Electronics & Communication Engineering",
      "English",
      "BBA",
      "Law",
      "Islamic Studies",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", semesters: 8, credits: 0, tuitionPerCredit: 0, total: 325400 },
      { name: "CSE — Evening", semesters: 6, credits: 0, tuitionPerCredit: 0, total: 249400 },
      { name: "Computer Science & Informatics", semesters: 8, credits: 0, tuitionPerCredit: 0, total: 253000 },
      { name: "Electronics & Communication Engineering", semesters: 8, credits: 0, tuitionPerCredit: 0, total: 253000 },
      { name: "English", semesters: 8, credits: 0, tuitionPerCredit: 0, total: 293400 },
      { name: "BBA", semesters: 8, credits: 0, tuitionPerCredit: 0, total: 309400 },
      { name: "Law", semesters: 8, credits: 0, tuitionPerCredit: 0, total: 317400 },
      { name: "Islamic Studies", semesters: 8, credits: 0, tuitionPerCredit: 0, total: 96000 },
    ],
    minGpa: 2.5,
    totalCost: 325400,
    costLabel: "University-published CSE day-programme total",
    feeBreakdown: [
      "Published four-year CSE day total: ৳3,25,400",
      "Admission fee: ৳20,000",
      "Admission form and other fees: ৳1,400",
      "Registration: ৳16,000 × 8 semesters",
      "Tuition: ৳20,000 × 8 semesters",
      "Library and student activity: ৳2,000 × 8 semesters",
      "The separate three-year CSE evening route totals ৳2,49,400",
    ],
    scholarships: [
      "All CSE day students receive 30% off the admission fee under the published table",
      "Combined SSC and HSC GPA 10.00: published CSE total ৳1,91,400 after 80% tuition waiver",
      "Combined GPA 9.00–9.99: 50% tuition waiver; published CSE total ৳2,39,400",
      "Combined GPA 8.00–8.99: 40% tuition waiver; published CSE total ৳2,55,400",
      "Combined GPA 7.00–7.99: 30% tuition waiver; published CSE total ৳2,71,400",
      "Combined GPA 6.00–6.99: 25% tuition waiver; published CSE total ৳2,79,400",
      "Combined GPA 5.00–5.99: 20% tuition waiver; published CSE total ৳2,87,400",
      "The general day-programme policy lists 50% tuition waiver for freedom-fighter children, students with disabilities, tribal students, couples and siblings",
    ],
    status: "Official",
    facts: [
      "All current undergraduate routes with published totals are individually searchable",
      "The general undergraduate minimum is GPA 2.50 separately in SSC and HSC",
      "BTEB-recognized diploma applicants with CGPA 2.50 out of 4.00 may enter BSc Engineering programmes",
      "The official fee page was last updated 31 October 2025",
      "SIU also provides female hostel accommodation in three buildings adjacent to the campus",
      "Campus: Shamimabad, Bagbari, Sylhet 3100",
    ],
    sources: [
      {
        label: "Official programme totals and result-based waiver tables",
        url: "https://siu.edu.bd/admission/tuition-fees",
      },
      {
        label: "Official undergraduate admission criteria",
        url: "https://siu.edu.bd/admission/undergraduate",
      },
      {
        label: "Official special-category waiver policy",
        url: "https://siu.edu.bd/admission/waiver-information",
      },
      {
        label: "Official campus contact information",
        url: "https://siu.edu.bd/contact",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "NBIU")!,
  {
    area: "Chowddopai, Motihar",
    address:
      "Chowddopai (Natore Road), Binodpur Bazar-6206, Motihar, Rajshahi, Bangladesh",
    programs: [
      "CSE",
      "EEE",
      "BBA",
      "Law",
      "Communication & Journalism Studies",
      "Folklore & Bangladesh Studies",
      "Sociology",
      "Political Science",
      "English",
      "Bangla",
      "Islamic History & Culture",
      "Islamic Studies",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 156, semesters: 8, tuitionPerCredit: 0, total: 384000 },
      { name: "EEE", credits: 146, semesters: 8, tuitionPerCredit: 0, total: 368000 },
      { name: "BBA", credits: 132, semesters: 8, tuitionPerCredit: 0, total: 352000 },
      { name: "Law", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 312000 },
      { name: "Communication & Journalism Studies", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 176000 },
      { name: "Folklore & Bangladesh Studies", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Sociology", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 200000 },
      { name: "Political Science", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 200000 },
      { name: "English", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 264000 },
      { name: "Bangla", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 176000 },
      { name: "Islamic History & Culture", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 176000 },
      { name: "Islamic Studies", credits: 123, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    minGpa: 2.5,
    credits: 156,
    totalCost: 384000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published four-year CSE total: ৳3,84,000",
      "CSE tuition fee: ৳38,000 per semester",
      "Development and other fees: ৳10,000 per semester",
      "Eight-semester CSE route for HSC or equivalent applicants",
      "Separate six-semester diploma-entry CSE route: ৳2,88,000",
    ],
    scholarships: [
      "NBIU advertises up to 100% tuition-fee waiver for undergraduate students based on SSC and HSC results",
      "The advertised waiver applies for two semesters",
      "No result-based discounted total is calculated until NBIU publishes the complete result bands and continuation conditions",
    ],
    status: "Official",
    facts: [
      "All twelve undergraduate programmes in NBIU's current official catalogue are searchable",
      "General entry requires GPA 2.50 in both SSC and HSC, or combined GPA 6.00 with at least GPA 2.00 in either examination",
      "Science and Engineering applicants require GPA 3.50 in both SSC and HSC with Mathematics and Physics",
      "The official fee table publishes full eight-semester totals for ten undergraduate programmes",
      "Folklore & Bangladesh Studies and Islamic Studies remain cost-pending because they appear in the programme catalogue but not the current fee table",
      "Campus: Chowddopai (Natore Road), Binodpur Bazar-6206, Motihar, Rajshahi",
    ],
    sources: [
      {
        label: "Official undergraduate programme and credit catalogue",
        url: "https://www.nbiu.edu.bd/prospectivestudents/ug-programs.html",
      },
      {
        label: "Official undergraduate tuition and fee table",
        url: "https://www.nbiu.edu.bd/prospectivestudents/tuition-fees.html",
      },
      {
        label: "Official admission requirements",
        url: "https://www.nbiu.edu.bd/prospectivestudents/admission-procedure.html",
      },
      {
        label: "Official Autumn 2026 waiver notice and campus contact",
        url: "https://www.nbiu.edu.bd/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "AKMU")!,
  {
    area: "Sector 11, Uttara",
    address:
      "House 6, Garib-E-Newaz Avenue, Sector 11, Uttara, Dhaka 1230, Bangladesh",
    programs: [
      "CSE",
      "EEE",
      "Mechanical Engineering",
      "Civil Engineering",
      "Textile Engineering",
      "Fashion Design & Apparel Merchandising",
      "BBA",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "CSE",
        credits: 156,
        semesters: 8,
        tuitionPerCredit: 586.54,
        total: 246500,
      },
      {
        name: "EEE",
        credits: 148,
        semesters: 8,
        tuitionPerCredit: 618.25,
        total: 246500,
      },
      {
        name: "Mechanical Engineering",
        credits: 158,
        semesters: 8,
        tuitionPerCredit: 579.12,
        total: 246500,
      },
      {
        name: "Civil Engineering",
        credits: 167.5,
        semesters: 8,
        tuitionPerCredit: 546.27,
        total: 246500,
      },
      {
        name: "Textile Engineering",
        credits: 162,
        semesters: 8,
        tuitionPerCredit: 564.82,
        total: 246500,
      },
      {
        name: "Fashion Design & Apparel Merchandising",
        credits: 155,
        semesters: 8,
        tuitionPerCredit: 496.78,
        total: 232000,
      },
      {
        name: "BBA",
        credits: 129,
        semesters: 8,
        tuitionPerCredit: 472.87,
        total: 216000,
      },
    ],
    credits: 156,
    totalCost: 246500,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE total: ৳2,46,500",
      "CSE tuition component: ৳91,500 across 156 credits",
      "Admission fee: ৳15,000",
      "Annual development fee: ৳10,000",
      "Laboratory and library fee: ৳10,000 per semester",
      "Sports, culture and other fee: ৳2,500 per semester",
      "The university publishes separate totals for every current undergraduate subject and diploma-entry route",
    ],
    scholarships: [
      "AKMU states that special tuition discounts and financial aid are available",
      "No numerical result band is displayed because the current official page does not publish a complete award table",
    ],
    status: "Official",
    facts: [
      "All seven current undergraduate programmes on the official university homepage are included",
      "The official homepage lists eight semesters for every undergraduate programme",
      "Separate diploma-entry totals are available for CSE, EEE, Civil, Mechanical, Textile and FDAM",
      "Campus: House 6, Garib-E-Newaz Avenue, Sector 11, Uttara, Dhaka 1230",
      "Minimum GPA remains visibly pending until AKMU's current official admission-requirement page provides an unambiguous rule",
    ],
    sources: [
      {
        label: "Official undergraduate programme catalogue",
        url: "https://akmu.edu.bd/",
      },
      {
        label: "Official tuition table for every programme",
        url: "https://akmu.edu.bd/admission/tuition-fees-payment-information-anwer-khan-modern-university-akmu/",
      },
      {
        label: "Official programme offering information",
        url: "https://akmu.edu.bd/admission/programs-offering/",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "AUB")!,
  {
    area: "Tongabari, Ashulia",
    address: "Bangabandhu Road, Tongabari, Ashulia, Dhaka, Bangladesh",
    programs: [
      "CSE",
      "BBA",
      "Economics",
      "English",
      "Bengali",
      "Islamic Studies",
      "Islamic History & Civilization",
      "Sociology & Anthropology",
      "Social Work",
      "Information Science & Library Management",
      "Education & Training",
      "Government & Politics",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "CSE",
        credits: 0,
        tuitionPerCredit: 0,
        total: 434200,
      },
      { name: "BBA", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Economics", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Bengali", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Islamic Studies", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Islamic History & Civilization", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Sociology & Anthropology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Social Work", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Information Science & Library Management", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Education & Training", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Government & Politics", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    minGpa: 2.5,
    totalCost: 434200,
    costLabel: "Official-calculator CSE total",
    feeBreakdown: [
      "Official CSE programme total for the HSC/equivalent route: ৳4,34,200",
      "Diploma-holder CSE route: ৳2,46,550",
      "The displayed total is the programme cost before assuming a first-semester waiver",
    ],
    scholarships: [
      "The official calculator shows first-semester tuition waivers of 25%, 50% or up to 100% according to combined SSC and HSC results",
      "Golden GPA in both SSC and HSC or equivalent: 100% scholarship under the published policy",
      "Poor and high-achieving students may apply for additional scholarship or tuition assistance",
      "Children of Freedom Fighters receive full tuition waiver under the published admission information",
    ],
    status: "Official",
    facts: [
      "All twelve undergraduate subjects on AUB's current official undergraduate page are included",
      "AUB's official calculator currently exposes a complete readable total only for CSE; the other subject totals remain pending rather than estimated",
      "General entry: average GPA 2.50; when either SSC or HSC is GPA 2.00, combined GPA must be at least 6.00",
      "Only science-group applicants may enter honours programmes under the Science and Engineering faculty",
      "Permanent campus: Bangabandhu Road, Tongabari, Ashulia, Dhaka",
    ],
    sources: [
      {
        label: "Official complete undergraduate programme list",
        url: "https://aub.ac.bd/undergraduates",
      },
      {
        label: "Official admission requirements",
        url: "https://aub.ac.bd/admission",
      },
      {
        label: "Official result-based tuition calculator",
        url: "https://aub.ac.bd/tuition-fees-calculator",
      },
      {
        label: "Official waiver and scholarship policy",
        url: "https://aub.ac.bd/waiver-and-scholarships",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "AIUB")!,
  {
    area: "Kuratoli, Khilkhet",
    address: "408/1 (Old KA 66/1), Kuratoli, Khilkhet, Dhaka 1229",
    programs: [
      "English",
      "Journalism & Mass Communication",
      "Economics",
      "Law",
      "BBA",
      "Architecture",
      "EEE",
      "Industrial & Production Engineering",
      "Computer Engineering",
      "Pharmacy",
      "Biochemistry & Molecular Biology",
      "CSE",
      "Data Science",
      "Computer Networks & Cyber Security",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "English",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 6500,
        total: 1037000,
        minimum: true,
      },
      {
        name: "Journalism & Mass Communication",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 5000,
        total: 827000,
        minimum: true,
      },
      {
        name: "Economics",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 5500,
        total: 897000,
        minimum: true,
      },
      {
        name: "Law",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 8500,
        total: 1317000,
        minimum: true,
      },
      {
        name: "BBA",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 8000,
        total: 1247000,
        minimum: true,
      },
      {
        name: "Architecture",
        credits: 177,
        semesters: 10,
        tuitionPerCredit: 6500,
        total: 1302500,
        minimum: true,
      },
      {
        name: "EEE",
        credits: 148,
        semesters: 8,
        tuitionPerCredit: 7500,
        total: 1237000,
        minimum: true,
      },
      {
        name: "Industrial & Production Engineering",
        credits: 148,
        semesters: 8,
        tuitionPerCredit: 6500,
        total: 1089000,
        minimum: true,
      },
      {
        name: "Computer Engineering",
        credits: 147,
        semesters: 8,
        tuitionPerCredit: 6000,
        total: 1009000,
        minimum: true,
      },
      {
        name: "Pharmacy",
        credits: 160,
        semesters: 8,
        tuitionPerCredit: 8500,
        total: 1487000,
        minimum: true,
      },
      { name: "Biochemistry & Molecular Biology", credits: 0, tuitionPerCredit: 7000, total: 0, pending: true },
      {
        name: "CSE",
        credits: 148,
        semesters: 8,
        tuitionPerCredit: 8500,
        total: 1385000,
        minimum: true,
      },
      {
        name: "Data Science",
        credits: 148,
        semesters: 8,
        tuitionPerCredit: 8500,
        total: 1385000,
        minimum: true,
      },
      {
        name: "Computer Networks & Cyber Security",
        credits: 148,
        semesters: 8,
        tuitionPerCredit: 8500,
        total: 1385000,
        minimum: true,
      },
    ],
    credits: 148,
    minGpa: 2.5,
    publishedMinimumCost: 1385000,
    costLabel: "Published CSE fee formula",
    feeBreakdown: [
      "CSE tuition from Fall 2026–27: ৳8,500 × 148 credits = ৳12,58,000",
      "Admission fee: ৳25,000 once",
      "Verification fee: ৳2,000 once",
      "Student activities and facilities: ৳12,500 × 8 standard semesters = ৳1,00,000",
      "Published CSE minimum before curriculum-dependent lab fees: ৳13,85,000",
      "Computer or language lab: ৳2,500 when applicable",
      "Science lab: ৳2,000 when applicable",
      "Health-sciences lab: ৳3,000 when applicable",
      "Studio fee: ৳2,000 when applicable",
      "Per-credit rates: English ৳6,500; Journalism ৳5,000; Economics ৳5,500; Law ৳8,500; BBA ৳8,000",
      "Per-credit rates: Architecture ৳6,500; EEE ৳7,500; IPE ৳6,500; Computer Engineering ৳6,000",
      "Per-credit rates: Pharmacy ৳8,500; Biochemistry & Molecular Biology ৳7,000; CSE, Data Science and Computer Networks & Cyber Security ৳8,500",
      "A guaranteed all-in total is not shown because recurring semesters and applicable lab or studio courses vary",
    ],
    scholarships: [
      "Continuing undergraduate scholarship requires CGPA 3.75 or above",
      "No grade may be below B+",
      "Regular full-time load is 14–15 credits in Fall and Spring and 9 credits in Summer",
      "Incoming students must pass AIUB's competitive scholarship examination; full or partial tuition-waiver slots are limited",
      "Scholarship is a tuition-fee waiver and is not guaranteed by reaching the minimum criteria",
    ],
    status: "Official",
    facts: [
      "All fourteen undergraduate degrees on AIUB's current central Fall 2026–27 fee table are included",
      "CSE applicants need a combined SSC and HSC GPA of 5.00, with at least 2.50 in each examination",
      "Mathematics is required at HSC level for CSE",
      "BSc in CSE: 148 credits",
      "BSc in EEE: 148 credits across 8 semesters",
      "BBA: 140 credits under the Fall 2024–25 onward curriculum",
      "Thirteen programmes now have structured published-minimum records for filtering, comparison and the cost calculator, including Journalism, Computer Engineering and Pharmacy",
      "Biochemistry & Molecular Biology retains its official per-credit rate but remains total-pending until AIUB publishes a complete current curriculum-credit total",
      "The central fee table controls current rates; individual curriculum pages control programme credits",
      "Final payable cost varies with applicable laboratory or studio courses and actual enrolled semesters",
      "Campus: 408/1 (Old KA 66/1), Kuratoli, Khilkhet, Dhaka 1229",
    ],
    sources: [
      {
        label: "Official admission information",
        url: "https://www.aiub.edu/admission",
      },
      {
        label: "Official Fall 2026–27 fees for all undergraduate degrees",
        url: "https://www.aiub.edu/tuition-fee",
      },
      {
        label: "Official CSE curriculum",
        url: "https://www.aiub.edu/faculties/fst/programs/under-graduate/bachelor-of-science-in-computer-science--engineering",
      },
      {
        label: "Official EEE curriculum and programme duration",
        url: "https://www.aiub.edu/faculties/engg/departments/eee",
      },
      {
        label: "Official BBA curriculum and credits",
        url: "https://www.aiub.edu/faculties/fba/about-fba",
      },
      {
        label: "Official English curriculum and credits",
        url: "https://www.aiub.edu/faculties/fass/programs/under-graduate/ba-in-english",
      },
      {
        label: "Official Economics curriculum and credits",
        url: "https://www.aiub.edu/faculties/fass/programs/under-graduate/bss-in-economics",
      },
      {
        label: "Official Law curriculum and credits",
        url: "https://www.aiub.edu/faculties/fass/programs/under-graduate/ba-in-laws",
      },
      {
        label: "Official Architecture curriculum and credits",
        url: "https://www.aiub.edu/faculties/engg/programs/b-arch",
      },
      {
        label: "Official IPE curriculum and credits",
        url: "https://www.aiub.edu/faculties/engg/programs/bsc-in-ipe",
      },
      {
        label: "Official Data Science curriculum and credits",
        url: "https://www.aiub.edu/faculties/fst/programs/under-graduate/bachelor-of-science-in-data-science",
      },
      {
        label: "Official Computer Networks & Cyber Security curriculum and credits",
        url: "https://www.aiub.edu/faculties/fst/programs/under-graduate/bsc-in-computer-network--cyber-security",
      },
      {
        label: "Official Journalism curriculum and credits",
        url: "https://www.aiub.edu/faculties/fass/programs/under-graduate/ba-in-media-and-mass-communication",
      },
      {
        label: "Official Computer Engineering curriculum and credits",
        url: "https://www.aiub.edu/faculties/engg/programs/bsc-in-coe",
      },
      {
        label: "Official Pharmacy curriculum and credits",
        url: "https://www.aiub.edu/faculties/fhls/programs/under-graduate/b-pharm",
      },
      {
        label: "Official scholarship policy",
        url: "https://www.aiub.edu/academic-scholarship",
      },
      {
        label: "Official grading system",
        url: "https://www.aiub.edu/academic-regulations/grading-system",
      },
    ],
    verifiedAt: "13 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "UIU")!,
  {
    programs: [
      "CSE",
      "Data Science",
      "EEE",
      "Civil Engineering",
      "BBA",
      "BBA in Accounting & Information Systems",
      "Economics",
      "English",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 125,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 910500,
      },
      {
        name: "CSE",
        credits: 141,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1014500,
      },
      {
        name: "Data Science",
        credits: 138,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 995000,
      },
      {
        name: "EEE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1008000,
      },
      {
        name: "Civil Engineering",
        credits: 151.5,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1082750,
      },
      {
        name: "Accounting & Information Systems",
        credits: 125,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 910500,
      },
      {
        name: "Economics",
        credits: 122,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 891000,
      },
      {
        name: "Environment & Development Studies",
        credits: 123,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 897500,
      },
      {
        name: "Media Studies & Journalism",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5525,
        total: 816250,
      },
      {
        name: "English",
        credits: 123,
        semesters: 12,
        tuitionPerCredit: 5525,
        total: 777575,
      },
      {
        name: "Pharmacy",
        credits: 160,
        semesters: 8,
        tuitionPerCredit: 6500,
        total: 1178000,
      },
      {
        name: "Biotechnology & Genetic Engineering",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1032000,
      },
    ],
    credits: 141,
    minGpa: 2.5,
    cost: 916500,
    admission: 20000,
    semester: 78000,
    totalCost: 1014500,
    costLabel: "University-published BSCSE total",
    feeBreakdown: [
      "Published BSCSE total without tuition waiver: ৳10,14,500",
      "Tuition: ৳6,500 × 141 credits = ৳9,16,500",
      "Trimester fee: ৳6,500 × 12 trimesters = ৳78,000",
      "The remaining ৳20,000 in the published total is the one-time admission component",
      "UIU also publishes BSCSE totals of ৳7,95,125 and ৳5,75,750 for the corresponding tuition-waiver columns",
      "The budget filter uses the full ৳10,14,500 amount; it does not assume that a student will receive a waiver",
    ],
    scholarships: [
      "The official BSCSE fee table publishes waiver-adjusted totals of ৳7,95,125 and ৳5,75,750 alongside the full ৳10,14,500 total",
      "Top 10% students may receive 25% to 100% tuition waiver based on published trimester results",
      "3% of admitted students may receive 100% tuition and other-fee waiver under the meritorious and poor category",
      "Admission, ID/caution and retake fees remain payable under the published full-waiver notices",
    ],
    status: "Official",
    facts: [
      "All eight undergraduate subjects in UIU's current official tuition table are included",
      "Minimum GPA 2.50 in both SSC and HSC or equivalent",
      "BSc in CSE: 141 credits",
      "The current official tuition table publishes 12 trimesters and a full BSCSE cost of ৳10,14,500",
      "Fall 2026 selection instructions ask selected applicants to bring ৳22,000 at admission; this payment instruction is not substituted for the fee table's programme total",
    ],
    sources: [
      {
        label: "Official admission requirements",
        url: "https://www.uiu.ac.bd/admission/admission-requirements/",
      },
      {
        label: "Official program credits",
        url: "https://admission.uiu.ac.bd/",
      },
      {
        label: "Official tuition fees and waiver-adjusted totals",
        url: "https://www.uiu.ac.bd/admission/tuition-fees-payment-policies/tuition-fees-waiver/",
      },
      {
        label: "Official scholarship and waiver policy",
        url: "https://www.uiu.ac.bd/admission/tuition-fees-payment-policies/scholarship-tuition-fee-and-other-fees-waiver-policy/",
      },
      {
        label: "Official Fall 2026 admission instructions",
        url: "https://www.uiu.ac.bd/notice/list-of-selected-candidates-1st-admission-test-for-fall-2026-trimester/",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "AUST")!,
  {
    programs: [
      "Architecture",
      "Civil Engineering",
      "CSE",
      "EEE",
      "Textile Engineering",
      "Industrial & Production Engineering",
      "Mechanical Engineering",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "Architecture",
        credits: 0,
        semesters: 10,
        tuitionPerCredit: 0,
        total: 1159050,
      },
      {
        name: "Civil Engineering",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 933950,
      },
      {
        name: "CSE",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 933950,
      },
      {
        name: "EEE",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 933950,
      },
      {
        name: "Textile Engineering",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 933950,
      },
      {
        name: "Industrial & Production Engineering",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 933950,
      },
      {
        name: "Mechanical Engineering",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 933950,
      },
    ],
    totalCost: 933950,
    costLabel: "Published total including compulsory transport",
    feeBreakdown: [
      "At admission: ৳1,44,100",
      "Each of the next 7 semesters: ৳1,10,550",
      "Published academic-fee total: ৳9,17,950",
      "Compulsory transport: ৳2,000 × 8 semesters = ৳16,000",
      "Complete four-year engineering total used for matching: ৳9,33,950",
      "Architecture academic fees: ৳11,39,050; transport: ৳20,000 across 10 semesters; complete total: ৳11,59,050",
    ],
    scholarships: [
      "Top 5% in each engineering department receive 100% tuition waiver based on the previous semester GPA",
      "Next 5% receive 50% tuition waiver",
      "One sibling or spouse may receive 50% tuition waiver when both study at AUST, subject to application",
      "Distressed Students Welfare Fund assistance is also listed",
    ],
    status: "Official",
    facts: [
      "All seven programmes in AUST's current engineering and architecture fee table are searchable with programme-specific totals",
      "CSE, CE, EEE, TE, IPE and ME run for 4 years and 8 semesters; Architecture runs for 5 years and 10 semesters",
      "Budget matching includes the compulsory transport charge instead of showing only the lower academic-fee total",
    ],
    sources: [
      {
        label: "Official engineering fee structure",
        url: "https://admission.aust.edu/fee-structure-engg-arch/",
      },
      {
        label: "Official financial assistance rules",
        url: "https://admission.aust.edu/financial-assistance/",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "IUB")!,
  {
    area: "Bashundhara Residential Area",
    address:
      "Plot 16, Block B, Aftabuddin Ahmed Road, Bashundhara Residential Area, Dhaka 1245, Bangladesh",
    programs: [
      "CSE",
      "Computer Science / Software Engineering",
      "EEE",
      "Electronic & Telecommunication Engineering",
      "Biochemistry & Biotechnology",
      "Environmental Science & Management",
      "Microbiology",
      "Mathematics",
      "Physics",
      "BBA",
      "BBA in Accounting",
      "BBA in Finance",
      "BBA in General Management",
      "BBA in Human Resource Management",
      "BBA in International Business",
      "BBA in Marketing",
      "BBA in Management Information Systems",
      "Economics",
      "Anthropology",
      "English Language Teaching",
      "English Literature",
      "Global Studies & Governance",
      "Media & Communication",
      "Law",
      "Pharmacy",
      "Sociology",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "BBA in Accounting",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "BBA in Finance",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "BBA in General Management",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "BBA in Human Resource Management",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "BBA in International Business",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "BBA in Marketing",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "BBA in Management Information Systems",
        credits: 131,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 978000,
      },
      {
        name: "Economics",
        credits: 122,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 919500,
      },
      {
        name: "EEE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1036500,
      },
      {
        name: "Electronic & Telecommunication Engineering",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1036500,
      },
      {
        name: "CSE",
        credits: 136,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1010500,
      },
      {
        name: "Computer Science / Software Engineering",
        credits: 134,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 997500,
      },
      {
        name: "Biochemistry & Biotechnology",
        credits: 124,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 932500,
      },
      {
        name: "Environmental Science & Management",
        credits: 135,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1004000,
      },
      {
        name: "English Language Teaching",
        credits: 125,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 939000,
      },
      {
        name: "English Literature",
        credits: 125,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 939000,
      },
      {
        name: "Law",
        credits: 136,
        semesters: 12,
        tuitionPerCredit: 7500,
        total: 1146500,
      },
      {
        name: "Pharmacy",
        credits: 170,
        semesters: 12,
        tuitionPerCredit: 7500,
        total: 1401500,
      },
      {
        name: "Microbiology",
        credits: 136,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 1004000,
      },
      {
        name: "Mathematics",
        credits: 134,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 997500,
      },
      {
        name: "Physics",
        credits: 133,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 991000,
      },
      {
        name: "Anthropology",
        credits: 127,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 952000,
      },
      {
        name: "Global Studies & Governance",
        credits: 128,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 958500,
      },
      {
        name: "Media & Communication",
        credits: 127,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 952000,
      },
      {
        name: "Sociology",
        credits: 126,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 945500,
      },
    ],
    credits: 136,
    admission: 25000,
    cost: 884000,
    semester: 96000,
    totalCost: 1010500,
    costLabel: "University-published CSE total",
    status: "Official",
    feeBreakdown: [
      "Application form: ৳1,000 once and non-refundable",
      "Admission fee: ৳25,000 once and non-refundable",
      "Tuition from Summer 2024 onward: ৳6,500 per credit for undergraduate programmes other than Law and Pharmacy",
      "CSE tuition: ৳6,500 × 136 credits = ৳8,84,000",
      "Library, computer, laboratory and student activities fee: ৳8,000 × 12 regular semesters = ৳96,000",
      "University-published CSE total: ৳10,10,500 for 136 credits",
      "Law and Pharmacy tuition from Summer 2024 onward: ৳7,500 per credit",
      "The calculator does not assume any scholarship and excludes retakes, delayed completion or other student-specific charges",
    ],
    scholarships: [
      "Admission-test and previous-result scholarships: 30%–100%",
      "Merit scholarships based on IUB semester results: 30%–100%",
      "Need-based aid for returning students: 20%–100%",
      "Children of Freedom Fighters may receive up to 100%",
      "Autumn 2026 admission-merit awards require registration for at least 12 credits",
      "Continuation is reassessed using IUB results, merit thresholds and at least 12 earned credits each semester",
      "Other published aid categories include siblings, small tribal communities, extracurricular achievement, IUB employees and dependants, and children of IUB alumni",
    ],
    facts: [
      "Every degree currently shown on IUB's official undergraduate catalogue is included",
      "Business specialisations are listed separately so students can search the exact BBA route",
      "CSE's active Spring 2024 programme structure publishes 136 total credits",
      "IUB operates Spring, Summer and Autumn semesters; the standard four-year calculation therefore uses 12 regular semesters",
      "Programme-cost switching covers all nineteen rows in IUB's published department-and-credit fee table; the seven searchable BBA specialisations use the same published 131-credit BBA fee basis",
      "BBA is shown as the university's published 131-credit programme total; individual BBA specialisation pages should still be checked before admission",
      "Third-party programme-cost tables are not treated as official when their credits or totals differ from IUB's current pages",
      "Admission requirements are programme-specific and must be checked on the current admission page",
      "Campus: Plot 16, Block B, Aftabuddin Ahmed Road, Bashundhara Residential Area, Dhaka 1245",
    ],
    sources: [
      {
        label: "Official complete undergraduate programme catalogue",
        url: "https://iub.ac.bd/academics/undergraduate-programs",
      },
      {
        label: "Official tuition fees and charges",
        url: "https://iub.ac.bd/admissions/tuition-fees-and-charges",
      },
      {
        label: "Official undergraduate admission information",
        url: "https://iub.ac.bd/page/ug-admission-info",
      },
      {
        label: "Official three-semester academic structure",
        url: "https://iub.ac.bd/admissions/undergraduate-admissions",
      },
      {
        label: "Official scholarships and financial aid",
        url: "https://iub.ac.bd/admissions/scholarships-and-financial-aid",
      },
      {
        label: "Official CSE programme structure",
        url: "https://iub.ac.bd/academics/undergraduate-programs/bsc-in-computer-science-and-engineering-cse",
      },
      {
        label: "Official programme catalogue and individual curriculum credits",
        url: "https://iub.ac.bd/academics/undergraduate-programs",
      },
      {
        label: "Official uniform grading notification",
        url: "https://iub.ac.bd/document/notification-regarding-summer-2024-trimester-grade-submission-fe91bb9d-5633-4a0a-b336-ecd597dedcd0.pdf",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "ULAB")!,
  {
    programs: [
      "BBA",
      "Media & Journalism",
      "English",
      "Bangla",
      "CSE",
      "EEE",
      "Environmental Science",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 120,
        semesters: 12,
        tuitionPerCredit: 6500,
        total: 851500,
      },
      {
        name: "Media & Journalism",
        credits: 133,
        semesters: 12,
        tuitionPerCredit: 6250,
        total: 902750,
      },
      {
        name: "English",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 4650,
        total: 676000,
      },
      {
        name: "Bangla",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 1800,
        total: 305500,
      },
      {
        name: "CSE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 5000,
        total: 771500,
      },
      {
        name: "EEE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 5000,
        total: 771500,
      },
      {
        name: "Environmental Science",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 5500,
        total: 786500,
      },
    ],
    credits: 140,
    totalCost: 771500,
    costLabel: "Published CSE total cost",
    feeBreakdown: [
      "Published CSE total: ৳7,71,500",
      "CSE tuition: ৳5,000 per credit",
      "Total credits: 140",
      "Language lab, CSO/CCO and Essential Skills charges are incorporated in the published total",
      "English remedial course, if required by admission-test result: ৳13,500 extra",
    ],
    scholarships: [
      "100% tuition waiver: GPA 5.00 in both SSC and HSC without the fourth subject",
      "40% tuition waiver: GPA 5.00 in both SSC and HSC with equivalent published results",
      "20% tuition waiver: average SSC/HSC GPA 4.50–4.99",
      "15% tuition waiver: average SSC/HSC GPA 4.00–4.49",
      "10% tuition waiver for female students; non-100% awards are capped at 40%",
    ],
    status: "Official",
    facts: [
      "All seven undergraduate subjects on ULAB's official catalogue are included",
      "Science background is required for science, technology and engineering programmes",
      "An acceptable ULAB admission-test score is required",
      "BSc in CSE: 140 credits",
    ],
    sources: [
      {
        label: "Official complete undergraduate programme catalogue",
        url: "https://ulab.edu.bd/undergraduate-programs",
      },
      {
        label:
          "Official tuition and total cost for every undergraduate subject",
        url: "https://admissions.ulab.edu.bd/undergraduate-programs/tuition-fees",
      },
      {
        label: "Official admission requirements",
        url: "https://admissions.ulab.edu.bd/undergraduate-programs/admissions-requirements",
      },
      {
        label: "Official campus location",
        url: "https://ulab.edu.bd/where-is-ulab",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "GUB")!,
  {
    district: "Narayanganj",
    programs: ["CSE", "BBA", "EEE", "English"],
    credits: 144,
    minGpa: 2.5,
    totalCost: 728750,
    costLabel: "Published CSE total before result waiver",
    feeBreakdown: [
      "Base CSE total: ৳7,28,750",
      "Tuition: ৳4,000 × 144 credits",
      "Admission fee: ৳20,000",
      "Registration: ৳6,500 × 12 semesters",
      "Library, lab and IT services: ৳4,000 × 12 semesters",
      "Official table also includes form/ID/verification/BNCC and four non-credit course fees",
    ],
    scholarships: [
      "Combined SSC/HSC GPA 8.00–9.99: published CSE total ৳6,74,750",
      "Combined GPA 10 with fourth subject: ৳6,47,750",
      "HSC GPA 5.00 with all A+: ৳6,20,750",
      "SSC and HSC GPA 5.00 with all A+: ৳1,88,750",
    ],
    status: "Official",
    facts: [
      "BSc in CSE: 144 credits over 12 semesters",
      "Minimum GPA 2.50 in SSC and HSC; an alternative combined-GPA rule applies when one result is at least 2.00",
    ],
    sources: [
      {
        label: "Official local tuition and result-based cost table",
        url: "https://green.edu.bd/local-tuition-fee",
      },
      {
        label: "Official admission requirements",
        url: "https://green.edu.bd/admission-req-local-students",
      },
    ],
    verifiedAt: "5 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "UITS")!,
  {
    programs: [
      "Civil Engineering",
      "CSE",
      "Information Technology",
      "EEE",
      "Electronic & Communication Engineering",
      "Pharmacy",
      "BBA",
      "Law",
      "English",
      "Social Work",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "Civil Engineering",
        credits: 147,
        semesters: 8,
        tuitionPerCredit: 3500,
        total: 578700,
      },
      {
        name: "CSE",
        credits: 144,
        semesters: 8,
        tuitionPerCredit: 4000,
        total: 640200,
      },
      {
        name: "Information Technology",
        credits: 144,
        semesters: 8,
        tuitionPerCredit: 3500,
        total: 568200,
      },
      {
        name: "EEE",
        credits: 145,
        semesters: 8,
        tuitionPerCredit: 3500,
        total: 571700,
      },
      {
        name: "Electronic & Communication Engineering",
        credits: 144,
        semesters: 8,
        tuitionPerCredit: 3500,
        total: 568200,
      },
      {
        name: "Pharmacy",
        credits: 160,
        semesters: 8,
        tuitionPerCredit: 3200,
        total: 589200,
      },
      {
        name: "BBA",
        credits: 132,
        semesters: 8,
        tuitionPerCredit: 3500,
        total: 520200,
      },
      {
        name: "Law",
        credits: 146,
        semesters: 8,
        tuitionPerCredit: 3200,
        total: 525400,
      },
      {
        name: "English",
        credits: 130,
        semesters: 8,
        tuitionPerCredit: 2800,
        total: 422200,
      },
      {
        name: "Social Work",
        credits: 155,
        semesters: 8,
        tuitionPerCredit: 1600,
        total: 306200,
      },
    ],
    credits: 144,
    cost: 576000,
    admission: 16200,
    semester: 48000,
    totalCost: 640200,
    costLabel: "Published CSE total payable",
    feeBreakdown: [
      "Published CSE total: ৳6,40,200",
      "Tuition: ৳4,000 × 144 credits = ৳5,76,000",
      "Admission form: ৳1,000",
      "Admission fee: ৳15,000",
      "Student welfare: ৳200",
      "Other fees: ৳6,000 × 8 semesters = ৳48,000",
    ],
    scholarships: [
      "SSC and HSC A+ without fourth subject: 100% tuition waiver",
      "Combined GPA 10: 40% tuition waiver",
      "Combined GPA 9.50–9.99: 30%",
      "Combined GPA 9.00–9.49: 20%",
      "Combined GPA 8.50–8.99: 15%",
      "Combined GPA 8.00–8.49: 10%",
      "Sibling or spouse: 20% tuition waiver",
      "Physically challenged students: 75% tuition waiver",
      "Meritorious students from remote and underdeveloped areas may receive 100% tuition waiver within the published 3% allocation",
    ],
    status: "Official",
    facts: [
      "All ten undergraduate programs on the official catalogue are included",
      "Every subject total includes the published admission and other fees",
      "BSc in CSE: 144 credits across 8 semesters",
    ],
    sources: [
      {
        label: "Official fees for every undergraduate subject",
        url: "https://uits.ac.bd/tuition_fee",
      },
      {
        label: "Official regular waiver policy",
        url: "https://uits.ac.bd/regular_waiver_scholarship",
      },
      {
        label: "Official undergraduate catalogue",
        url: "https://uits.ac.bd/undergraduate_program",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "UIU")!,
  {
    programs: [
      "BBA",
      "Accounting & Information Systems",
      "Economics",
      "CSE",
      "Data Science",
      "EEE",
      "Civil Engineering",
      "Environment & Development Studies",
      "Media Studies & Journalism",
      "English",
      "Pharmacy",
      "Biotechnology & Genetic Engineering",
    ],
    programCatalogComplete: true,
    costLabel: "University-published BSCSE total",
    feeBreakdown: [
      "Published BSCSE total without tuition waiver: ৳10,14,500",
      "Tuition: ৳6,500 × 141 credits = ৳9,16,500",
      "Trimester fee: ৳6,500 × 12 trimesters = ৳78,000",
      "The published total includes a ৳20,000 one-time admission component",
      "The current official table provides verified full totals for all twelve undergraduate programmes",
      "BA English and Media Studies & Journalism use UIU's published discounted per-credit rate of ৳5,525",
      "Pharmacy uses 8 semesters at ৳9,750 per semester and includes its published ৳5,000 laboratory fee per semester in the total",
      "Biotechnology & Genetic Engineering includes its published ৳2,000 laboratory fee per trimester in the total",
      "UIU also publishes waiver-adjusted BSCSE totals of ৳7,95,125 and ৳5,75,750",
      "A Fall 2026 selection notice requests ৳22,000 at admission; that intake payment instruction is not substituted for the programme total",
    ],
    scholarships: [
      "Top 10% students each trimester/semester may receive 25%–100% tuition waiver based on previous academic and UIU results",
      "UIU reports providing approximately ৳10–12 crore in scholarships and tuition waivers each year",
      "A published special scholarship can waive tuition and other fees for selected meritorious, financially disadvantaged students from underdeveloped regions",
      "Children of freedom fighters have a separately published 100% tuition-and-other-fees waiver route, with stated exclusions and conditions",
      "Continuation requirements depend on the particular scholarship or waiver category",
    ],
    status: "Official",
    facts: [
      "All twelve undergraduate programmes shown across UIU's current undergraduate catalogue are included",
      "Verified full-cost switching is available for all twelve current undergraduate programmes",
      "General eligibility: GPA 2.50 in both SSC and HSC, or GPA 2.00 in one with combined GPA 6.00",
      "Engineering, science, Pharmacy and Biotechnology programmes have additional subject-specific requirements",
      "Pharmacy requires a minimum combined SSC/HSC GPA of 8.00 and follows separate science-subject rules",
      "Official programme credits and full payable totals are linked directly to UIU's current tuition table",
      "Campus: United City, Madani Avenue, Badda, Dhaka 1212",
    ],
    sources: [
      {
        label: "Official undergraduate programme catalogue",
        url: "https://www.uiu.ac.bd/admission/undergraduate-program/",
      },
      {
        label: "Official programme-specific admission requirements",
        url: "https://www.uiu.ac.bd/admission/admission-requirements/",
      },
      {
        label: "Official tuition fees and waivers",
        url: "https://www.uiu.ac.bd/admission/tuition-fees-payment-policies/tuition-fees-waiver/",
      },
      {
        label: "Official scholarship and waiver policy",
        url: "https://www.uiu.ac.bd/admission/tuition-fees-payment-policies/scholarship-tuition-fee-and-other-fees-waiver-policy/",
      },
    ],
    verifiedAt: "13 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "NUB")!,
  {
    programs: [
      "BBA",
      "CSE",
      "Electronics & Communication Engineering",
      "EEE",
      "Textile Engineering",
      "Pharmacy",
      "English",
      "Law",
    ],
    programCatalogComplete: true,
    costLabel: "Programme total verification pending",
    feeBreakdown: [
      "Published undergraduate admission and other fees: ৳16,700 at admission",
      "Programme tuition and recurring charges remain pending until a current complete official fee table is available",
      "No promotional admission-fair discount is treated as a permanent programme cost",
    ],
    scholarships: [
      "NUB publishes result-based tuition waiver of up to 70% during admission and early semesters",
      "Merit-based scholarships are available based on semester results",
      "Some programme pages publish an additional 5% tuition scholarship for female and tribal-population students, subject to approval",
      "Current admission-fair offers are not used as permanent scholarship rules because they may expire",
    ],
    status: "Official",
    facts: [
      "Eight undergraduate subjects confirmed from NUB's current official programme and university pages are included",
      "General minimum: GPA 2.50 in both SSC and HSC or equivalent examinations",
      "Applicants with GPA 2.00 in one public examination may qualify where the combined GPA reaches the published minimum",
      "CSE requires a science background with Physics and Mathematics; Pharmacy follows separate science-subject requirements",
      "Permanent campus: 111/2 Kawlar Jame Mosjid Road, Ashkona, near Hajj Camp, Dakshinkhan, Dhaka 1230",
    ],
    sources: [
      {
        label: "Official academic programme directory",
        url: "https://nub.ac.bd/academic/t3gwthgw/academic-programs",
      },
      {
        label: "Official undergraduate admission information",
        url: "https://nub.ac.bd/admission/uy4d8iaf/admission-information",
      },
      {
        label: "Official admission and programme requirements",
        url: "https://www.nub.ac.bd/admission/w2zuickf/online-admission",
      },
      {
        label: "Official campus contact information",
        url: "https://nub.ac.bd/contact",
      },
      {
        label: "Official scholarship overview",
        url: "https://nub.ac.bd/admission/qt3uj0a7/why-study-at-nub",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BUBT")!,
  {
    area: "Rupnagar, Mirpur-2",
    address: "Rupnagar, Mirpur-2, Dhaka 1216, Bangladesh",
    programs: [
      "BBA in Accounting",
      "Textile Engineering",
      "English",
      "Economics",
      "Textile Engineering — Diploma Entry",
      "BBA in Marketing",
      "BBA in Finance",
      "CSE",
      "BBA in Management",
      "EEE",
      "Civil Engineering",
      "Law",
      "CSE — Diploma Entry",
      "EEE — Diploma Entry",
      "Civil Engineering — Diploma Entry",
      "Data Science",
    ],
    programCatalogComplete: true,
    credits: 154,
    minGpa: 2.5,
    costLabel: "Complete programme cost pending",
    status: "Official",
    feeBreakdown: [
      "Refundable undergraduate caution/security money: ৳3,000",
      "One-time non-refundable activity fee: ৳3,000",
      "New students pay their first-semester fees at admission",
      "Continuing students pay at least ৳5,000 at registration, reach 50% by midterm and clear the balance before the final examination",
      "Tuition and semester charges depend on the credits offered each semester",
      "No whole-program total is entered because BUBT's current official fee page does not publish one",
    ],
    scholarships: [
      "25%–100% first-semester tuition waiver based on SSC and HSC results",
      "25%–100% tuition waiver based on BUBT semester results",
      "Poor and meritorious students may receive 10%–100% tuition waiver",
      "Sibling waiver: 25% for each sibling",
      "Children of Freedom Fighters: 100% tuition-fee waiver",
      "Students from Dhaka Commerce College and Principal Kazi Faruky School & College: 25% tuition waiver",
      "At least 6% of students receive scholarship, stipend or waiver based on need and merit",
    ],
    facts: [
      "All sixteen undergraduate programme and diploma-entry routes on BUBT's current official catalogue are included",
      "BSc in CSE: 154 credits over 4 years",
      "General entry: GPA 2.50 in both SSC and HSC, or GPA 2.00 in either with a combined GPA of at least 6.00",
      "CSE requires a science background with Mathematics and Physics at HSC or equivalent level",
      "The CSE page accepts a four-year BTEB engineering diploma with CGPA 2.50 out of 4.00",
      "Fees are paid semester by semester",
      "Campus: Rupnagar, Mirpur-2, Dhaka 1216",
    ],
    sources: [
      {
        label: "Official complete undergraduate programme catalogue",
        url: "https://www.bubt.edu.bd/programs",
      },
      {
        label: "Official CSE credits and admission information",
        url: "https://www.bubt.edu.bd/program/bsc-in-cse",
      },
      {
        label: "Official undergraduate admission process",
        url: "https://www.bubt.edu.bd/page/admission-process",
      },
      {
        label: "Official tuition and payment rules",
        url: "https://bubt.edu.bd/page/tuition-and-fees",
      },
      {
        label: "Official scholarship and waiver policy",
        url: "https://bubt.edu.bd/page/scholarship",
      },
      {
        label: "Official evaluation and grading system",
        url: "https://www.bubt.edu.bd/page/evaluation-grading-system",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "MU")!,
  {
    area: "Bateshwar",
    address: "Permanent Campus, Bateshwar, Sylhet 3104, Bangladesh",
    programs: [
      "CSE",
      "Software Engineering",
      "Data Science",
      "EEE",
      "BBA",
      "Economics",
      "English",
      "Law",
    ],
    programCatalogComplete: true,
    credits: 152,
    minGpa: 2.5,
    costLabel: "Official monthly fee schedule",
    feeBreakdown: [
      "Admission form: ৳500",
      "Admission fee: ৳20,000 once for every undergraduate programme",
      "Registration fee: ৳10,000 per term",
      "BNCC and other fee: ৳500 once",
      "Campus activities: ৳2,000 per month",
      "Monthly credit-fee installment: CSE, Software Engineering, Data Science and Law ৳7,000",
      "Monthly credit-fee installment: EEE and BBA ৳6,000",
      "Monthly credit-fee installment: English ৳5,000; Economics ৳4,000",
      "A whole-program total is not displayed because the official table publishes monthly installments, not total credits and a guaranteed final amount",
    ],
    scholarships: [
      "Both SSC and HSC Golden GPA 5.00: official table describes a 50% merit scholarship for four years",
      "Combined SSC and HSC GPA 10 with one Golden GPA 5.00: 30% tuition waiver for four years",
      "Combined GPA 10 without Golden GPA 5.00: 20% tuition waiver for four years",
      "Combined SSC and HSC GPA 9.00: 10% tuition waiver for four years",
      "Separate Chairman, Vice-Chancellor and other category awards are published; exact continuation conditions must be confirmed before reliance",
    ],
    status: "Official",
    facts: [
      "All eight currently listed honours programmes are included",
      "General entry: GPA 2.50 in both SSC and HSC, or GPA 2.00 in either with a combined GPA of at least 6.00",
      "CSE requires science or equivalent study with Mathematics, Physics or Computer Studies; an acceptable admission-test score is also required",
      "CSE: 152 credits; the university lists 12 terms for day students and 10 for the evening route",
      "Data Science has stricter result rules: normally GPA 3.50 in both SSC and HSC, with a published alternative route beginning at GPA 3.00 in each and combined GPA 8.00",
      "Journalism and Media Studies is labelled proposed by the university and is therefore not counted as a current programme",
      "The official fee page defines monthly credit-fee installments rather than a per-credit rate",
      "Costs remain pending in budget filtering until Metropolitan publishes a complete programme total or enough fixed terms to calculate one without assumptions",
      "Permanent campus: Bateshwar, Sylhet 3104",
    ],
    sources: [
      {
        label: "Official honours programme list",
        url: "https://metrouni.edu.bd/sites/programmes/honours-programmes",
      },
      {
        label: "Official undergraduate fee structure",
        url: "https://metrouni.edu.bd/sites/admission/programme-fee-structure",
      },
      {
        label: "Official scholarship and aid",
        url: "https://metrouni.edu.bd/sites/admission/scholarship-aid",
      },
      {
        label: "Official undergraduate admission information",
        url: "https://metrouni.edu.bd/sites/admission/undergraduate",
      },
      {
        label: "Official CSE credits, duration and subject requirements",
        url: "https://metrouni.edu.bd/sites/school-of-science-technology/school-of-science-technology",
      },
      {
        label: "Official Data Science credits and admission requirements",
        url: "https://metrouni.edu.bd/sites/department-of-data-science/bachelor-of-science-honours-in-data-science",
      },
      {
        label: "Official examination and grading policy",
        url: "https://metrouni.edu.bd/sites/policies-regulations/examination",
      },
    ],
    verifiedAt: "14 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "FU")!,
  {
    area: "Trunk Road",
    address: "Feni University, Trunk Road, Feni 3900, Bangladesh",
    logo: "https://feniuniversity.ac.bd/favicon.ico",
    minGpa: 2.5,
    programs: [
      "BBA",
      "Law",
      "English",
      "EEE",
      "EEE — Diploma Entry",
      "CSE",
      "CSE — Diploma Entry",
      "Civil Engineering",
      "Civil Engineering — Diploma Entry",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 143, semesters: 8, tuitionPerCredit: 0, total: 433600 },
      { name: "Law", credits: 141, semesters: 8, tuitionPerCredit: 0, total: 485600 },
      { name: "English", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 421400 },
      { name: "EEE", credits: 156.25, semesters: 8, tuitionPerCredit: 0, total: 431875 },
      { name: "EEE — Diploma Entry", credits: 135.25, semesters: 8, tuitionPerCredit: 0, total: 339105 },
      { name: "CSE", credits: 158, semesters: 8, tuitionPerCredit: 0, total: 490500 },
      { name: "CSE — Diploma Entry", credits: 137.5, semesters: 8, tuitionPerCredit: 0, total: 342345 },
      { name: "Civil Engineering", credits: 157, semesters: 8, tuitionPerCredit: 0, total: 433300 },
      { name: "Civil Engineering — Diploma Entry", credits: 133.5, semesters: 8, tuitionPerCredit: 0, total: 336270 },
    ],
    credits: 158,
    totalCost: 490500,
    costLabel: "University-published 2026 CSE total",
    feeBreakdown: [
      "Published 2026 OBE CSE total: ৳4,90,500 for 158 credits across 8 semesters",
      "Published BBA total: ৳4,33,600 · Law: ৳4,85,600 · English: ৳4,21,400",
      "Published EEE total: ৳4,31,875 · Civil Engineering: ৳4,33,300",
      "Separate official diploma-entry totals are available for CSE, EEE and Civil Engineering",
      "The published total-cost rows include the listed academic and fixed charges; scholarship effects are not pre-deducted",
    ],
    scholarships: [
      "Golden GPA 5.00 in both SSC and HSC: 100% tuition waiver route",
      "GPA 5.00 in both SSC and HSC: 50% tuition waiver route",
      "GPA 4.80–4.99 in both: 30%; GPA 4.50–4.79 in both: 20%",
      "GPA 4.00–4.49 in both: 10%; GPA 3.50–3.99 in both: 5%",
      "Additional assistance categories include freedom-fighter wards, underprivileged students, siblings, spouses, tribal students and national players",
    ],
    status: "Official",
    facts: [
      "All nine undergraduate and diploma-entry routes in the university's 2026 fee table are selectable",
      "Engineering admission requires at least GPA 2.50 in both SSC and HSC plus a science background with Mathematics and Physics",
      "Applicants are selected through a written admission test and viva voce",
      "The current 2026 fee table supersedes older credit figures still stated on the grading-policy page",
      "Current city campus: Trunk Road, Feni 3900",
      "A 10.32-acre permanent campus is under development near the Dhaka–Chattogram Highway, about three kilometres from Mohipal",
    ],
    sources: [
      { label: "Official 2026 undergraduate fee table", url: "https://feniuniversity.ac.bd/content/tuition-policy" },
      { label: "Official undergraduate admission requirements", url: "https://feniuniversity.ac.bd/content/undergraduate-programs" },
      { label: "Official scholarship and financial assistance", url: "https://feniuniversity.ac.bd/content/financial-assistance" },
      { label: "Official grading policy", url: "https://feniuniversity.ac.bd/content/grading-policy" },
      { label: "Official permanent-campus information", url: "https://feniuniversity.ac.bd/content/permanent-campus" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "CCNUST")!,
  {
    area: "Kotbari",
    address: "CCN University of Science & Technology, Kotbari, Cumilla, Bangladesh",
    programs: ["CSE", "EEE", "Civil Engineering", "Law", "English", "BBA"],
    programCatalogComplete: true,
    costLabel: "Current programme costs pending",
    feeBreakdown: [
      "The official tuition-fee route is present, but its current page does not expose readable programme amounts",
      "No total, credit count or per-credit figure is estimated; all six verified programmes remain outside budget matching until their current rows are readable",
    ],
    scholarships: [
      "CCNUST provides an official result-based scholarship calculator using SSC GPA, HSC GPA and applicant category",
      "The calculator's underlying award bands were not exposed in the readable page, so no percentage or payable amount is reproduced",
    ],
    status: "Official",
    facts: [
      "Six undergraduate programme departments are confirmed: CSE, EEE, Civil Engineering, Law, English and Business Administration",
      "Mathematics and Bangla are listed as academic departments, but no separate bachelor degree is added without a current degree-page confirmation",
      "The official Fall 2026 admission route is active",
      "Admission GPA requirements, complete fees, scholarship bands and grading remain pending until readable official tables are available",
      "Campus: Kotbari, Cumilla",
    ],
    sources: [
      { label: "Official university and department catalogue", url: "https://ccnust.ac.bd/" },
      { label: "Official tuition-fee route", url: "https://ccnust.ac.bd/fees-page" },
      { label: "Official scholarship calculator", url: "https://ccnust.ac.bd/scholarship" },
      { label: "Official Fall 2026 admission route", url: "https://ccnust.ac.bd/admissionNotice-page" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BU-C")!,
  {
    status: "Directory",
    facts: [
      "Britannia University remains available in the national private-university directory",
      "Its official website did not return a readable current undergraduate catalogue, fee table, admission policy, scholarship policy or grading scale during this verification pass",
      "No programme or financial data is copied from unofficial admission portals",
      "Subject selection and all calculation routes remain pending until current official publications can be checked",
    ],
    sources: [
      { label: "Official university website", url: "https://britannia.edu.bd/" },
      { label: "University Grants Commission of Bangladesh", url: "https://ugc.gov.bd/" },
    ],
    verifiedAt: "16 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "SUB-C")!,
  {
    area: "Arefin Nagar",
    address:
      "New/471, University Road, Arefin Nagar, Chattogram, Bangladesh",
    minGpa: 2.5,
    programs: [
      "BBA",
      "Hotel & Tourism Management",
      "English",
      "Law",
      "CSE",
      "Civil Engineering",
      "Pharmacy",
      "EEE",
      "Electronic & Communication Engineering",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 132,
        semesters: 8,
        tuitionPerCredit: 2860,
        total: 377520,
      },
      {
        name: "Hotel & Tourism Management",
        credits: 132,
        semesters: 8,
        tuitionPerCredit: 2860,
        total: 377520,
      },
      { name: "English", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Law", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      {
        name: "Civil Engineering",
        credits: 0,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      { name: "Pharmacy", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      {
        name: "Electronic & Communication Engineering",
        credits: 0,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
    ],
    costLabel: "CSE total verification pending",
    feeBreakdown: [
      "Published BBA total: ৳3,77,520 for 132 credits across 8 semesters",
      "Published Hotel & Tourism Management total: ৳3,77,520 for 132 credits across 8 semesters",
      "Published rate for both verified business programmes: ৳2,860 per credit",
      "Engineering, Pharmacy, English and Law totals remain pending until their complete current rows can be verified",
    ],
    scholarships: [
      "Southern publishes renewable result-based tuition-waiver bands",
      "The current scholarship page lists up to 15% for the 3.00–3.25 band",
      "The current scholarship page lists up to 20% for the 3.26–3.50 band",
      "SSC and HSC GPA 5.00 without the fourth subject has a separately published eligibility route",
      "Final awards and continuation conditions must be confirmed with admissions",
    ],
    status: "Official",
    facts: [
      "All nine undergraduate programmes on Southern University's current catalogue are searchable",
      "Business and Arts programmes use three academic semesters per year; Science and Engineering programmes use two",
      "Only BBA and Hotel & Tourism Management currently have complete verified totals in this profile",
      "Unverified programme costs are kept pending and excluded from budget matches",
      "Campus: New/471, University Road, Arefin Nagar, Chattogram",
    ],
    sources: [
      {
        label: "Official current undergraduate programme catalogue",
        url: "https://southern.ac.bd/programs",
      },
      {
        label: "Official current tuition-fee table",
        url: "https://southern.ac.bd/tuition-fees",
      },
      {
        label: "Official current scholarship information",
        url: "https://southern.ac.bd/scholarship",
      },
      {
        label: "Official programme structure and campus address",
        url: "https://old.southern.ac.bd/programs/",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BGCTUB")!,
  {
    area: "BGC Biddyanagar, Chandanaish",
    address: "BGC Biddyanagar, Chandanaish, Chattogram, Bangladesh",
    minGpa: 2.5,
    programs: [
      "BBA",
      "CSE",
      "English",
      "Law",
      "Journalism & Media Studies",
    ],
    costLabel: "Programme costs verification pending",
    feeBreakdown: [
      "The current official and university-operated pages do not expose a complete readable programme-fee table",
      "No total or per-credit rate is estimated; every listed programme remains excluded from budget matching until an official fee row is verified",
    ],
    scholarships: [
      "The university states that stipends and grants are available for deserving poor but meritorious students and wards of freedom fighters",
      "A current fixed percentage, award amount and continuation table was not available on the official financial-aid page, so no scholarship calculation is shown",
    ],
    status: "Official",
    facts: [
      "Five undergraduate routes are confirmed from the current university-operated academic pages: BBA, CSE, English, Law, and Journalism & Media Studies",
      "The published admission route requires GPA 2.50 in both SSC and HSC, or a combined GPA of 6.00 with neither result below 2.00",
      "The official syllabus publishes BBA at 123 credits, English at 126 credits, Law across eight semesters, and Journalism & Media Studies at 126 credits",
      "The university also lists Public Health as a department, but no undergraduate degree is added until its current degree level is confirmed",
      "Programme costs and an official grading table remain pending rather than being copied from third-party summaries",
      "Campus: BGC Biddyanagar, Chandanaish, Chattogram",
    ],
    sources: [
      {
        label: "Official university website",
        url: "https://bgctub.ac.bd/",
      },
      {
        label: "University-operated academic and programme pages",
        url: "https://bgctub.com/",
      },
      {
        label: "Official Law, English and Journalism curricula",
        url: "https://bgctub.com/syllabus/",
      },
      {
        label: "Official BBA programme and credits",
        url: "https://bgctub.com/in-brief-2/",
      },
      {
        label: "Official CSE programme information",
        url: "https://bgctub.com/in-brief-3/",
      },
      {
        label: "Official campus contact information",
        url: "https://bgctub.com/contact-us/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "PCIU")!,
  {
    area: "South Khulshi",
    address:
      "7-14, Nikunja Housing Society, South Khulshi, Chattogram, Bangladesh",
    minGpa: 2.5,
    programs: [
      "BBA",
      "Law",
      "English",
      "Broadcast & Print Journalism",
      "CSE",
      "CSE — Diploma Entry",
      "Civil Engineering",
      "Civil Engineering — Diploma Entry",
      "EEE",
      "EEE — Diploma Entry",
      "Textile Engineering",
      "Textile Engineering — Diploma Entry",
      "Fashion Design & Technology",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 130, tuitionPerCredit: 2200, total: 304000 },
      { name: "Law", credits: 133, tuitionPerCredit: 2500, total: 350500 },
      { name: "English", credits: 132, tuitionPerCredit: 1800, total: 255600 },
      {
        name: "Broadcast & Print Journalism",
        credits: 136,
        tuitionPerCredit: 1200,
        total: 181200,
      },
      { name: "CSE", credits: 156, tuitionPerCredit: 2200, total: 361200 },
      {
        name: "CSE — Diploma Entry",
        credits: 0,
        tuitionPerCredit: 0,
        total: 328200,
      },
      {
        name: "Civil Engineering",
        credits: 159,
        tuitionPerCredit: 2000,
        total: 336000,
      },
      {
        name: "Civil Engineering — Diploma Entry",
        credits: 0,
        tuitionPerCredit: 0,
        total: 307500,
      },
      { name: "EEE", credits: 157, tuitionPerCredit: 2100, total: 347700 },
      {
        name: "EEE — Diploma Entry",
        credits: 0,
        tuitionPerCredit: 0,
        total: 316200,
      },
      {
        name: "Textile Engineering",
        credits: 159,
        tuitionPerCredit: 2000,
        total: 336000,
      },
      {
        name: "Textile Engineering — Diploma Entry",
        credits: 0,
        tuitionPerCredit: 0,
        total: 306000,
      },
      {
        name: "Fashion Design & Technology",
        credits: 145,
        tuitionPerCredit: 1700,
        total: 264500,
      },
    ],
    credits: 156,
    admission: 18000,
    cost: 343200,
    totalCost: 361200,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "CSE total for HSC-background students: ৳3,61,200",
      "CSE tuition basis: ৳2,200 × 156 credits",
      "Non-refundable admission fee: ৳18,000",
      "CSE total for diploma-background students: ৳3,28,200",
      "The published totals already include the admission fee and should not have it added again",
    ],
    scholarships: [
      "Waivers based on SSC and HSC results are published by the university",
      "Need-based financial assistance is available",
      "Special waiver routes are listed for children of freedom fighters",
      "Meritorious students from remote and underdeveloped areas may apply for assistance",
    ],
    status: "Official",
    facts: [
      "All nine bachelor's degree categories on PCIU's current official fee page are included",
      "Separate diploma-entry costs are searchable for CSE, Civil Engineering, EEE and Textile Engineering",
      "General undergraduate minimum: GPA 2.50 in both SSC and HSC or the published equivalent qualification",
      "Official grading scale is available in the Grade Charts section",
      "Admission office: 7-14, Nikunja Housing Society, South Khulshi, Chattogram",
    ],
    sources: [
      {
        label: "Official bachelor's programmes and complete fee table",
        url: "https://www.portcity.edu.bd/HomePage/DepatmentDetails/29/Portfolio/bachelor-s-degree-programs",
      },
      {
        label: "Official evaluation and grading system",
        url: "https://www.portcity.edu.bd/HomePage/DepatmentDetails/82/C/evaluation-and-grading-system",
      },
      {
        label: "Official scholarship and financial-assistance information",
        url: "https://www.portcity.edu.bd/HomePage/DepatmentDetails/19/C/department-of-law",
      },
      {
        label: "Official admission schedule and office address",
        url: "https://www.portcity.edu.bd/HomePage/SubPageDetailsPara/32/Page/admission-admission-schedule",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "USTC")!,
  {
    area: "Foy's Lake",
    address:
      "Foy's Lake, Zakir Hossain Road, Chattogram 4202, Bangladesh",
    minGpa: 2.5,
    programs: [
      "CSE",
      "EEE",
      "Electronic & Telecommunication Engineering",
      "Pharmacy",
      "Biochemistry & Biotechnology",
      "English",
      "BBA",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "CSE",
        credits: 157,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 525000,
      },
      {
        name: "EEE",
        credits: 157,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 485500,
      },
      {
        name: "Electronic & Telecommunication Engineering",
        credits: 157,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 465000,
      },
      {
        name: "Pharmacy",
        credits: 160,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 700000,
      },
      {
        name: "Biochemistry & Biotechnology",
        credits: 157,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 450000,
      },
      {
        name: "English",
        credits: 147,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 177000,
      },
      {
        name: "BBA",
        credits: 123,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 321000,
      },
    ],
    credits: 157,
    totalCost: 525000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE total course fee: ৳5,25,000 for 157 credits across 8 semesters",
      "CSE admission payment: ৳1,03,250 including the first-semester fee",
      "Following CSE semester fee with examination fee: ৳60,250",
      "Application fee: ৳1,000",
      "The official table publishes complete programme totals rather than per-credit tuition rates",
      "Result waivers reduce the admission-fee component; they are not applied to the whole programme total",
    ],
    scholarships: [
      "GPA 4.00 in both SSC and HSC: 25% waiver on the admission-fee component",
      "GPA 5.00 in both SSC and HSC: 50% waiver on the admission-fee component",
      "Golden A+ in both SSC and HSC: 100% waiver on the admission-fee component",
      "The published table lists programme-specific admission payments after each waiver band",
    ],
    status: "Official",
    facts: [
      "Seven undergraduate programmes with complete totals are included from USTC's current official fee table",
      "CSE, EEE, ETE and Biochemistry & Biotechnology are listed as 157-credit, four-year programmes",
      "Pharmacy is a 160-credit programme and follows stricter science-subject admission requirements",
      "English is 147 credits; BBA is 123 credits; both run across eight semesters",
      "Campus: Foy's Lake, Zakir Hossain Road, Chattogram 4202",
    ],
    sources: [
      {
        label: "Official all-department fee and waiver structure",
        url: "https://ustc.ac.bd/fee-waiver-structure/",
      },
      {
        label: "Official university and department directory",
        url: "https://ustc.ac.bd/",
      },
      {
        label: "Official Pharmacy credits and admission requirements",
        url: "https://ustc.ac.bd/department-of-pharmacy/",
      },
      {
        label: "Official English programme and admission requirements",
        url: "https://ustc.ac.bd/department-of-english-language-and-literature/",
      },
      {
        label: "Official campus contact information",
        url: "https://ustc.ac.bd/contact/",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "SEU")!,
  {
    area: "Tejgaon Industrial Area",
    address: "252, Tejgaon Industrial Area, Dhaka 1208, Bangladesh",
    minGpa: 3,
    programs: [
      "Architecture",
      "CSE",
      "EEE",
      "Textile Engineering",
      "ICT",
      "Pharmacy",
      "BBA",
      "Law",
      "English",
      "Bangla",
      "Economics",
    ],
    programCatalogComplete: true,
    status: "Official",
    scholarships: [
      "Published merit waivers are based on HSC/A-Level results",
      "Continuation from the second semester requires TGPA 3.50 or above",
      "The official policy also lists special tuition-fee waiver routes",
    ],
    facts: [
      "General undergraduate entry requires GPA 3.00 in both SSC and HSC/equivalent, except the university's stated exceptions for Bangla and ICT",
      "Current CSE total remains pending because the official fee table is access-restricted during this verification pass",
      "Campus: 252, Tejgaon Industrial Area, Dhaka 1208",
    ],
    sources: [
      {
        label: "Official tuition and fees page",
        url: "https://seu.edu.bd/tuitions-fees",
      },
      {
        label: "Official scholarship and waiver policy",
        url: "https://seu.edu.bd/scholarship-and-waiver",
      },
      {
        label: "Official admissions page",
        url: "https://seu.edu.bd/admissions",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "UGV")!,
  {
    area: "C&B Road",
    address: "874/322, C&B Road, Barishal 8200, Bangladesh",
    minGpa: 2.5,
    programs: [
      "CSE",
      "EEE",
      "Civil Engineering",
      "Mechanical Engineering",
      "BBA",
      "English",
      "Islamic Studies",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "CSE",
        credits: 165,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 475800,
      },
      {
        name: "EEE",
        credits: 162,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 399000,
      },
      {
        name: "Civil Engineering",
        credits: 163,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 399000,
      },
      {
        name: "Mechanical Engineering",
        credits: 164,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 399000,
      },
      {
        name: "BBA",
        credits: 134,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 303000,
      },
      {
        name: "English",
        credits: 145,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 303000,
      },
    ],
    credits: 165,
    totalCost: 475800,
    costLabel: "Published CSE total before GPA waiver",
    feeBreakdown: [
      "CSE admission fee: ৳15,000",
      "CSE semester fee: ৳57,600 × 8 semesters = ৳4,60,800",
      "Published CSE total before waiver: ৳4,75,800",
      "Combined SSC + HSC GPA 10.00: published CSE payable total ৳2,45,400",
      "Combined GPA 8.00–9.99: published CSE payable total ৳2,91,480",
      "Combined GPA 5.00–7.99: published CSE payable total ৳3,37,560",
    ],
    scholarships: [
      "The admission page states that GPA 5.00 in both SSC and HSC, excluding fourth subject, qualifies for a full tuition waiver",
      "Combined SSC + HSC GPA 10.00: the fee table applies a 50% semester-fee waiver",
      "Combined GPA 8.00–9.99: the fee table applies a 40% semester-fee waiver",
      "Combined GPA 5.00–7.99: the fee table applies a 30% semester-fee waiver",
      "Performance- and financial-need-based assistance is available after admission",
      "Concurrently admitted siblings or spouses receive a published 50% tuition discount on entry",
    ],
    status: "Official",
    facts: [
      "All seven undergraduate subjects shown on the current official catalogue are included",
      "The normal entry route requires GPA 2.50 in both SSC and HSC; an alternative route allows one GPA of 2.00 when the combined GPA is at least 6.00",
      "The official fee table publishes complete pre-waiver and GPA-band totals for six undergraduate programmes",
      "UGV's admission page says full tuition waiver for GPA 5.00 in both exams, while its fee table shows a 50% semester-fee waiver for combined GPA 10.00; both are shown and students should confirm the currently applied rule with admissions",
      "Campus: 874/322, C&B Road, Barishal 8200",
    ],
    sources: [
      {
        label: "Official undergraduate programme catalogue",
        url: "https://ugv.edu.bd/",
      },
      {
        label: "Official programme fee and GPA-waiver table",
        url: "https://ugv.edu.bd/fees-structure",
      },
      {
        label: "Official admission requirements and aid",
        url: "https://ugv.edu.bd/admission/show",
      },
      {
        label: "Official scholarship page",
        url: "https://ugv.edu.bd/scholarship",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "VU")!,
  {
    area: "Chandrima, Paba",
    address: "Rajshahi Bypass Road, Chandrima, Paba, Rajshahi 6204, Bangladesh",
    minGpa: 2.5,
    programs: [
      "BBA",
      "CSE",
      "Economics",
      "EEE",
      "English",
      "Islamic History & Culture",
      "Journalism, Communication & Media Studies",
      "Law",
      "Nutrition & Food Engineering",
      "Pharmacy",
      "Political Science",
      "Sociology",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 150, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Economics", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Islamic History & Culture", credits: 140, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Journalism, Communication & Media Studies", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Law", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Nutrition & Food Engineering", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Pharmacy", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Political Science", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Sociology", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    credits: 150,
    costLabel: "Official programme costs pending verification",
    feeBreakdown: [
      "Varendra University routes local applicants to its interactive admission portal for current programme fees",
      "The portal currently redirects to a restricted programme-selection service, so no total is estimated",
      "Every undergraduate subject remains searchable while its amount is clearly marked pending",
    ],
    scholarships: [
      "Current numerical scholarship and waiver bands remain pending verification from the official admission portal",
      "No result-based discount is applied in the calculator until the complete official award table is accessible",
    ],
    status: "Official",
    facts: [
      "All twelve undergraduate programmes shown on the current official academic-programme page are included",
      "General engineering entry requires GPA 2.50 in both SSC and HSC, with science, mathematics and physics requirements applying by programme",
      "B.Pharm requires a combined GPA of 6.50 with at least GPA 3.00 individually, plus the published science-subject prerequisites",
      "The current CSE curriculum contains 150 credits over four years and eight semesters",
      "A complete local-student programme total remains pending because the official admission portal requires an interactive programme selection",
      "Campus: Rajshahi Bypass Road, Chandrima, Paba, Rajshahi 6204",
    ],
    sources: [
      {
        label: "Official departments and programmes",
        url: "https://vu.edu.bd/academics/departments",
      },
      {
        label: "Official CSE curriculum and grading",
        url: "https://vu.edu.bd/academics/programs/6/b-sc-in-cse",
      },
      {
        label: "Official admission and fee portal",
        url: "https://admission.vu.edu.bd/",
      },
      {
        label: "Official B.Pharm admission requirements",
        url: "https://vu.edu.bd/public/academics/programs/5/b-pharm-honors-pharmacy",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "NWU")!,
  {
    area: "Sonadanga",
    address: "236, M. A. Bari Road, Sonadanga, Khulna 9100, Bangladesh",
    minGpa: 2.5,
    programs: [
      "CSE",
      "EEE",
      "Civil Engineering",
      "Electronics & Communication Engineering",
      "BBA",
      "Law",
      "English",
      "Economics",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 162, tuitionPerCredit: 0, total: 402500 },
      { name: "EEE", credits: 161.25, tuitionPerCredit: 0, total: 395900 },
      {
        name: "Civil Engineering",
        credits: 162.75,
        tuitionPerCredit: 0,
        total: 410900,
      },
      {
        name: "Electronics & Communication Engineering",
        credits: 162,
        tuitionPerCredit: 0,
        total: 390650,
      },
      { name: "BBA", credits: 138, tuitionPerCredit: 0, total: 395450 },
      { name: "Law", credits: 140, tuitionPerCredit: 0, total: 411500 },
      { name: "English", credits: 144, tuitionPerCredit: 0, total: 280700 },
      { name: "Economics", credits: 145, tuitionPerCredit: 0, total: 235975 },
    ],
    admission: 15500,
    credits: 162,
    totalCost: 402500,
    costLabel: "Calculated CSE total including published admission fee",
    feeBreakdown: [
      "Published CSE academic fees: ৳3,87,000",
      "Published undergraduate admission fee: ৳15,500",
      "Calculated CSE total before waiver: ৳4,02,500",
      "The university states that it may change the fee structure",
    ],
    scholarships: [
      "Golden GPA 5.00 in both SSC and HSC: 100% tuition waiver",
      "GPA 5.00 in both: 50% tuition waiver",
      "GPA 4.75–4.99 in both: 35%; GPA 4.50–4.74 in both: 25%",
      "GPA 4.00–4.49 in both: 20%; GPA 3.50–3.99 in both: 10%",
      "Diploma CGPA 3.75–4.00: 50%; 3.50–3.74: 30%; 3.00–3.49: 20%; 2.50–2.99: 10%",
      "Children of freedom fighters: 100%; one sibling: 25%; female and tribal students: 5% tuition waiver",
    ],
    status: "Official",
    facts: [
      "All eight HSC-entry undergraduate subjects in the official fee table are included",
      "Separate diploma-entry CSE, EEE, Civil and ECE pathways are published with different credits and fees",
      "Normal entry requires GPA 2.50 in both SSC and HSC; the alternative route permits one GPA of 2.00 when the combined GPA is at least 6.00",
      "Science and Technology applicants must have Physics, Chemistry and Mathematics at HSC/A-Level or equivalent",
      "The official programme figures exclude admission, so the calculator adds the separately published ৳15,500 admission fee exactly once",
      "Campus buildings: 236 M. A. Bari Road and 58 KDA Avenue, Sonadanga, Khulna 9100",
    ],
    sources: [
      {
        label: "Official undergraduate fees and programmes",
        url: "https://www.nwu.ac.bd/undergraduate.php",
      },
      {
        label: "Official admission requirements",
        url: "https://www.nwu.ac.bd/admission_requirement.php",
      },
      {
        label: "Official tuition-waiver policy",
        url: "https://www.nwu.ac.bd/tuition_waiver.php",
      },
      {
        label: "Official current university brochure",
        url: "https://www.nwu.ac.bd/pdf/Brochure.pdf",
      },
      {
        label: "Official grading system",
        url: "https://www.nwu.ac.bd/grading_system.php",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "UODA")!,
  {
    area: "Dhanmondi",
    address: "80 Satmosjid Road, Dhanmondi, Dhaka 1209, Bangladesh",
    status: "Official",
    facts: [
      "UODA's official introduction states that the university was established in 2002",
      "The university reports six faculties and undergraduate courses in more than 14 subjects",
      "Administrative office: 80 Satmosjid Road, Dhanmondi, Dhaka 1209",
      "The official site exposes a tuition-fee route, but a current programme-by-programme amount table was not readable during this verification pass",
      "Programme names, costs, admission rules, scholarships and grading remain pending rather than being inferred from third-party summaries",
    ],
    sources: [
      {
        label: "Official university introduction and undergraduate overview",
        url: "https://uoda.edu.bd/about-uoda/introduction",
      },
      {
        label: "Official tuition-fee route",
        url: "https://uoda.edu.bd/admission/tuition-fees/",
      },
    ],
    verifiedAt: "16 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "PUC")!,
  {
    area: "Prabartak Circle, Panchlaish",
    address:
      "1/A O.R. Nizam Road, Prabartak Circle, Panchlaish, Chattogram, Bangladesh",
    minGpa: 2.5,
    programs: [
      "CSE",
      "EEE",
      "Architecture",
      "Law",
      "English",
      "Mathematics",
      "Economics",
      "Sociology & Sustainable Development",
      "BBA",
    ],
    programCatalogComplete: true,
    scholarships: [
      "Premier University publishes an application route for full, half or other free studentship after at least one completed semester",
      "Applicants for free studentship must have at least GPA 3.00 in the preceding semester and submit financial-supporting documents",
      "The guardian normally applies through the department chair to the Vice Chancellor; an earning student may apply directly",
    ],
    status: "Official",
    facts: [
      "All nine undergraduate programmes on Premier University's current official catalogue are included",
      "Normal entry requires GPA 2.50 in both SSC and HSC; the alternative route permits one GPA of 2.00 when the combined GPA is at least 6.00",
      "CSE, EEE, Architecture and Mathematics require a science background in both SSC and HSC or equivalent",
      "Applicants must pass the university admission test; a combined SAT score of 1100 is accepted in lieu of the test for eligible high-school graduates",
      "The official tuition page currently says Coming Soon, so no programme total is shown or estimated",
      "A current official free-studentship form confirms the application process, but it does not promise a fixed award percentage",
      "Campuses listed by the university include 1/A O.R. Nizam Road, Prabartak Circle and 541 O.R. Nizam Road, GEC Circle, Chattogram",
    ],
    sources: [
      {
        label: "Official undergraduate programme catalogue",
        url: "https://puc.ac.bd/Home/Content/?Alias=undergraduate-program",
      },
      {
        label: "Official undergraduate admission requirements",
        url: "https://puc.ac.bd/Home/Content/?Alias=undergraduate-program-requirements",
      },
      {
        label: "Official tuition page",
        url: "https://www.puc.ac.bd/Home/Content/?Alias=tuition-fees",
      },
      {
        label: "Official grading system",
        url: "https://www.puc.ac.bd/Home/Content/?Alias=grading-system",
      },
      {
        label: "Official free-studentship application and rules",
        url: "https://puc.ac.bd/Content/Downloads/poor-fund-form.pdf",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "NEUB")!,
  {
    area: "Telihaor, Sheikhghat",
    address: "Telihaor, Sheikhghat, Sylhet 3100, Bangladesh",
    minGpa: 2.5,
    programs: ["BBA", "CSE", "English", "Law"],
    programCatalogComplete: true,
    status: "Official",
    facts: [
      "The current undergraduate catalogue lists BBA, CSE, English and Law",
      "Normal entry requires GPA 2.50 in both SSC and HSC; the alternative route permits one GPA of 2.00 when the combined GPA is at least 6.00",
      "The university publishes programme credits through its curriculum and programme pages, but conflicting CSE credit figures remain visible across official pages; no single value is reproduced until reconciled",
      "The official cost page uses an interactive result-based calculator that was not readable during this verification pass, so programme totals and waivers remain pending",
      "Campus: Telihaor, Sheikhghat, Sylhet 3100",
    ],
    sources: [
      {
        label: "Official undergraduate programmes and requirements",
        url: "https://www.neub.edu.bd/admission/undergraduate-programs",
      },
      {
        label: "Official programme catalogue",
        url: "https://neub.edu.bd/content/354-neub-programs",
      },
      {
        label: "Official result-based cost schedule",
        url: "https://www.neub.edu.bd/admission/tuition-fee",
      },
      {
        label: "Official contact page",
        url: "https://www.neub.edu.bd/contact-us",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "SUBD")!,
  {
    district: "Narayanganj",
    division: "Dhaka",
    area: "Kanchan, Rupganj",
    address: "696 Kendua, Kanchan, Rupganj, Narayanganj 1461, Bangladesh",
    minGpa: 2.5,
    programs: [
      "BBA",
      "English",
      "Law",
      "Journalism, Communication & Media Studies",
      "Pharmacy",
      "Microbiology",
      "CSE",
      "CSE — Diploma Entry",
      "Data Science & Engineering",
      "Architecture",
      "Architecture — Diploma Entry",
      "Food Engineering & Nutrition Science",
      "Food Engineering & Nutrition Science — Diploma Entry",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 2300,
        total: 494000,
      },
      {
        name: "English",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 1800,
        total: 429000,
      },
      {
        name: "Law",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 3000,
        total: 615000,
      },
      {
        name: "Journalism, Communication & Media Studies",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 1800,
        total: 489000,
      },
      {
        name: "Pharmacy",
        credits: 164,
        semesters: 8,
        tuitionPerCredit: 4200,
        total: 939800,
      },
      {
        name: "Microbiology",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 1850,
        total: 496000,
      },
      {
        name: "CSE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 2550,
        total: 594000,
      },
      {
        name: "CSE — Diploma Entry",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 2000,
        total: 517000,
      },
      {
        name: "Data Science & Engineering",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 1850,
        total: 496000,
      },
      {
        name: "Architecture",
        credits: 190,
        semesters: 10,
        tuitionPerCredit: 2750,
        total: 759500,
      },
      {
        name: "Architecture — Diploma Entry",
        credits: 190,
        semesters: 10,
        tuitionPerCredit: 2300,
        total: 674000,
      },
      {
        name: "Food Engineering & Nutrition Science",
        credits: 145,
        semesters: 12,
        tuitionPerCredit: 2350,
        total: 577750,
      },
      {
        name: "Food Engineering & Nutrition Science — Diploma Entry",
        credits: 0,
        semesters: 12,
        tuitionPerCredit: 2000,
        total: 527000,
      },
    ],
    credits: 140,
    cost: 357000,
    totalCost: 594000,
    costLabel: "Fall 2026 published CSE total",
    feeBreakdown: [
      "Fall 2026 published CSE total: ৳5,94,000",
      "Tuition: ৳2,550 × 140 credits = ৳3,57,000",
      "Admission fee: ৳25,000",
      "Semester fee: ৳10,000 × 12",
      "Technical lab fee: ৳3,500 × 12",
      "Ethics fee: ৳2,000",
      "Transport: ৳1,000 per month, included in the published total",
      "Admission form: ৳1,000, published separately and not included in the programme total",
    ],
    scholarships: [
      "HSC GPA 4.00–4.49: 15% tuition scholarship",
      "HSC GPA 4.50–4.79: 25%",
      "HSC GPA 4.80–4.99: 35%",
      "HSC GPA 5.00 general: 50%",
      "SSC and HSC GPA 5.00 general: 60%",
      "HSC Golden GPA 5.00: 65%",
      "SSC and HSC Golden GPA 5.00: 75%",
      "Female students receive an additional 10%, subject to policy",
      "Diploma holders receive 10%–30% tuition scholarship for diploma GPA 3.00–4.00",
      "A 5% tuition discount is published for paying a semester in full within the first-installment date",
      "Sibling, spouse or child of a current student may receive a fixed 25% tuition scholarship under the published conditions",
      "Continuation requires semester GPA 3.50 and timely registration",
    ],
    status: "Official",
    facts: [
      "All ten current undergraduate degrees and three separately priced diploma-entry routes are included",
      "The Fall 2026 official table publishes a complete total for every listed undergraduate route",
      "General admission requires GPA 2.50 in both SSC and HSC; the official alternative requires combined GPA 6.00 when one result is below 2.50",
      "Pharmacy publishes additional subject-specific eligibility requirements for Physics, Chemistry, Biology and Higher Mathematics",
      "The programme totals include the recurring transport charge exactly as published by the university",
      "Permanent campus: 696 Kendua, Kanchan, Rupganj, Narayanganj 1461",
    ],
    sources: [
      {
        label: "Official Fall 2026 programme-wise tuition table",
        url: "https://sub.ac.bd/tuition-fee",
      },
      {
        label: "Official undergraduate programme catalogue",
        url: "https://sub.ac.bd/programs",
      },
      {
        label: "Official undergraduate admission requirements",
        url: "https://sub.ac.bd/admission",
      },
      {
        label: "Official scholarship and waiver policy",
        url: "https://sub.ac.bd/scholarship-%26-waiver",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "EUB")!,
  {
    area: "Gabtoli, Mirpur",
    address: "2/4 Gabtoli, Mirpur, Dhaka 1216, Bangladesh",
    logo: "https://eub.edu.bd/favicon.ico",
    minGpa: 2.5,
    programs: [
      "Civil Engineering",
      "CSE",
      "EEE",
      "Industrial & Production Engineering",
      "Mechanical Engineering",
      "Textile Engineering",
      "Civil Engineering — Diploma Entry",
      "CSE — Diploma Entry",
      "EEE — Diploma Entry",
      "Industrial & Production Engineering — Diploma Entry",
      "Mechanical Engineering — Diploma Entry",
      "Textile Engineering — Diploma Entry",
      "BBA",
      "Tourism & Hospitality Management",
      "English",
      "Law",
      "Economics",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "Civil Engineering", credits: 165, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 160, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE", credits: 160, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Industrial & Production Engineering", credits: 160, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Mechanical Engineering", credits: 160, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Textile Engineering", credits: 165, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Civil Engineering — Diploma Entry", credits: 146, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE — Diploma Entry", credits: 140, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE — Diploma Entry", credits: 146, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Industrial & Production Engineering — Diploma Entry", credits: 140, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Mechanical Engineering — Diploma Entry", credits: 140, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Textile Engineering — Diploma Entry", credits: 140, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BBA", credits: 136, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Tourism & Hospitality Management", credits: 132, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English", credits: 132, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Law", credits: 130, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Economics", credits: 141, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    costLabel: "Programme costs require confirmation",
    scholarships: [
      "Golden GPA 5.00 in SSC and HSC: 100% tuition waiver under the current published financial-aid page",
      "Female students: 50% tuition waiver under the published special-group policy",
      "Children of freedom fighters: 100% tuition waiver, subject to application and university conditions",
      "Ethnic-minority students: 100% tuition waiver under the published special-group policy",
      "Sibling and spouse applicants are listed for a 100% waiver; applicants must confirm the applicable fee component and continuation conditions with EUB",
      "Result-based engineering, business and arts waiver bands differ, so no universal payable total is calculated",
    ],
    status: "Official",
    facts: [
      "All seventeen undergraduate and diploma-entry routes in EUB's current financial-information table are included",
      "The official table confirms programme credits but exposes current monetary figures through fields that could not be reliably read in this verification pass; costs therefore remain pending",
      "General admission requires GPA 2.50 separately in SSC and HSC, or combined GPA 6.00 when one result is at least 2.00",
      "Science and engineering applicants must come from the relevant science background",
      "EUB permits up to 19 waived credits for eligible Civil Engineering diploma holders and up to 13.5 credits for other relevant engineering diploma holders",
      "The official EEE programme publishes the university's complete UGC grading scale, now available in Grade Charts",
      "Campus: 2/4 Gabtoli, Mirpur, Dhaka 1216",
    ],
    sources: [
      {
        label: "Official programme credits and financial-aid table",
        url: "https://eub.edu.bd/financial-information",
      },
      {
        label: "Official admission requirements and diploma credit waivers",
        url: "https://eub.edu.bd/admission-information",
      },
      {
        label: "Official grading scale and EEE programme rules",
        url: "https://eub.edu.bd/bsc-electrical-and-electronic/regular-program/program-details",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "PU")!,
  {
    area: "Gulshan-2",
    address: "House 11/A, Road 92, Gulshan-2, Dhaka 1212, Bangladesh",
    logo: "https://pu.edu.bd/favicon.ico",
    programs: [
      "CSE",
      "Civil Engineering",
      "EEE",
      "BBA",
      "English",
      "Economics",
      "Law",
      "CSE — Diploma Weekend",
      "CSE — Diploma Evening",
      "Civil Engineering — Diploma Weekend",
      "Civil Engineering — Diploma Evening",
      "EEE — Diploma Weekend",
      "EEE — Diploma Evening",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "CSE",
        credits: 140,
        tuitionPerCredit: 4700,
        total: 729800,
      },
      {
        name: "Civil Engineering",
        credits: 146,
        tuitionPerCredit: 2600,
        total: 463600,
      },
      {
        name: "EEE",
        credits: 140,
        tuitionPerCredit: 2500,
        total: 435000,
      },
      {
        name: "BBA",
        credits: 132,
        tuitionPerCredit: 4100,
        total: 619900,
      },
      {
        name: "English",
        credits: 130,
        tuitionPerCredit: 2500,
        total: 409000,
      },
      {
        name: "Economics",
        credits: 132,
        tuitionPerCredit: 2100,
        total: 361900,
      },
      {
        name: "Law",
        credits: 145,
        tuitionPerCredit: 5000,
        total: 799000,
      },
      {
        name: "CSE — Diploma Weekend",
        credits: 140,
        tuitionPerCredit: 3000,
        total: 283517,
        discounted: true,
      },
      {
        name: "CSE — Diploma Evening",
        credits: 140,
        tuitionPerCredit: 3000,
        total: 248055,
        discounted: true,
      },
      {
        name: "Civil Engineering — Diploma Weekend",
        credits: 146,
        tuitionPerCredit: 3000,
        total: 341992,
        discounted: true,
      },
      {
        name: "Civil Engineering — Diploma Evening",
        credits: 146,
        tuitionPerCredit: 3000,
        total: 247114,
        discounted: true,
      },
      {
        name: "EEE — Diploma Weekend",
        credits: 140,
        tuitionPerCredit: 3000,
        total: 267809,
        discounted: true,
      },
      {
        name: "EEE — Diploma Evening",
        credits: 140,
        tuitionPerCredit: 3000,
        total: 248055,
        discounted: true,
      },
    ],
    credits: 140,
    totalCost: 729800,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Regular CSE: 134 academic + 6 non-academic credits",
      "Published CSE tuition rate: ৳4,700 per academic credit",
      "Published regular CSE total before merit scholarship: ৳7,29,800",
      "Diploma-engineer weekend and evening routes use separately published all-charge package totals",
      "The selected programme's official total replaces the CSE figure in the details panel and calculator",
    ],
    scholarships: [
      "Combined SSC and HSC GPA 7.00–7.99: published 10% tuition scholarship route",
      "Combined GPA 8.00–8.88: published 20% tuition scholarship route",
      "Combined GPA 9.00–9.99: published 35% tuition scholarship route",
      "Combined GPA 10.00: published 50% tuition scholarship route",
      "Golden A+ result identified as GPA 10*: published 90% tuition scholarship route",
      "Scholarships apply to tuition only; diploma evening and weekend routes publish separate package costs",
    ],
    status: "Official",
    facts: [
      "All seven regular undergraduate programmes and six diploma-engineer schedule options on the current official catalogue are included",
      "Programme credit counts and totals are reproduced from the university's current department fee tables",
      "The current Law department table publishes 145 credits and a ৳7,99,000 total; this newer programme-specific figure is used instead of an inconsistent older admissions-table entry",
      "Diploma-engineer package figures are shown as published and are not recalculated from the headline per-credit rate",
      "An official university-wide grade chart has not yet been verified, so Presidency University remains pending in Grade Charts",
      "Campus: House 11/A, Road 92, Gulshan-2, Dhaka 1212",
    ],
    sources: [
      {
        label: "Official undergraduate and diploma programme catalogue",
        url: "https://pu.edu.bd/academics/programs",
      },
      {
        label: "Official CSE fees and diploma package totals",
        url: "https://pu.edu.bd/academics/cse",
      },
      {
        label: "Official Civil Engineering fees and package totals",
        url: "https://pu.edu.bd/academics/civil",
      },
      {
        label: "Official EEE fees and package totals",
        url: "https://pu.edu.bd/academics/eee",
      },
      {
        label: "Official business programme fees",
        url: "https://pu.edu.bd/academics/business-administration",
      },
      {
        label: "Official English programme fees",
        url: "https://pu.edu.bd/academics/english",
      },
      {
        label: "Official Economics programme fees",
        url: "https://pu.edu.bd/academics/economics",
      },
      {
        label: "Official Law programme fees",
        url: "https://pu.edu.bd/academics/laws",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "DIU-D")!,
  {
    programs: [
      "CSE",
      "BBA",
      "EEE",
      "Electronics & Communication Engineering",
      "Civil Engineering",
      "Mechanical Engineering",
      "Textile Engineering",
      "Law",
      "Pharmacy",
      "English",
    ],
    credits: 148,
    totalCost: 700000,
    costLabel: "Published CSE total fees",
    feeBreakdown: [
      "Published CSE total fees: ৳7,00,000",
      "Admission fee: ৳25,000",
      "Program duration: 4 years",
      "Total credits: 148",
      "The official scholarship calculator may change payable fees by result and student category",
    ],
    scholarships: [
      "The official calculator publishes merit scholarship up to 50%",
      "Female students receive an additional 10% waiver",
      "Department toppers may receive semester-result merit scholarships",
      "Special routes include Freedom Fighter wards, indigenous and physically disabled students",
    ],
    status: "Official",
    facts: [
      "General honours admission requires GPA 2.50 in both SSC and HSC or the applicable official alternative",
    ],
    sources: [
      {
        label: "Official program fee structure",
        url: "https://diu.ac/program-fee-structure",
      },
      {
        label: "Official interactive scholarship calculator",
        url: "https://diu.ac/scholarships",
      },
      {
        label: "Official student admission and aid information",
        url: "https://diu.ac/future-student",
      },
    ],
    verifiedAt: "5 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "WUB")!,
  {
    programs: [
      "BBA",
      "Law",
      "Media Studies & Journalism",
      "English",
      "Tourism & Hospitality Management",
      "Civil Engineering",
      "CSE",
      "EEE",
      "Automobile Engineering",
      "Mechanical Engineering",
      "Mechatronics Engineering",
      "Architecture",
      "Pharmacy",
      "Textile Engineering",
      "Apparel Manufacturing Engineering",
      "Fashion Design & Apparel Technology",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 141,
        semesters: 12,
        tuitionPerCredit: 4300,
        total: 802000,
      },
      {
        name: "Law",
        credits: 144,
        semesters: 8,
        tuitionPerCredit: 4500,
        total: 856000,
      },
      {
        name: "Media Studies & Journalism",
        credits: 132,
        semesters: 12,
        tuitionPerCredit: 4100,
        total: 738100,
      },
      {
        name: "English",
        credits: 142,
        semesters: 12,
        tuitionPerCredit: 3500,
        total: 697500,
      },
      {
        name: "Tourism & Hospitality Management",
        credits: 141,
        semesters: 12,
        tuitionPerCredit: 3100,
        total: 648000,
      },
      {
        name: "Civil Engineering",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 3400,
        total: 772500,
      },
      {
        name: "CSE",
        credits: 146,
        semesters: 12,
        tuitionPerCredit: 3350,
        total: 714500,
      },
      {
        name: "EEE",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 3400,
        total: 775900,
      },
      {
        name: "Automobile Engineering",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 3100,
        total: 722900,
      },
      {
        name: "Mechanical Engineering",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 3100,
        total: 722900,
      },
      {
        name: "Mechatronics Engineering",
        credits: 161,
        semesters: 12,
        tuitionPerCredit: 3100,
        total: 726000,
      },
      {
        name: "Architecture",
        credits: 180,
        semesters: 10,
        tuitionPerCredit: 3600,
        total: 918700,
      },
      {
        name: "Pharmacy",
        credits: 165,
        semesters: 8,
        tuitionPerCredit: 4800,
        total: 1063100,
      },
      {
        name: "Textile Engineering",
        credits: 169,
        semesters: 12,
        tuitionPerCredit: 3000,
        total: 734500,
      },
      {
        name: "Apparel Manufacturing Engineering",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 2500,
        total: 630500,
      },
      {
        name: "Fashion Design & Apparel Technology",
        credits: 134,
        semesters: 12,
        tuitionPerCredit: 3600,
        total: 706300,
      },
    ],
    credits: 146,
    cost: 469000,
    totalCost: 714500,
    costLabel: "Published CSE total cost",
    feeBreakdown: [
      "Published total: ৳7,14,500",
      "Tuition component: ৳4,69,000",
      "Basic-fee component: ৳2,45,500",
      "Published rate: ৳3,350 per credit",
      "Program: 146 credits over 12 semesters",
    ],
    scholarships: [
      "Founder’s Scholarship covers 100% tuition for GPA 5.00 in both SSC and HSC without fourth subject",
      "Founder’s Scholarship continuation requires CGPA 3.75, at least 12 credits and 70% attendance",
      "Merit and underprivileged awards may cover 10%–100% of tuition",
      "Women’s Empowerment Scholarship offers 100% tuition for qualifying underprivileged women; ancillary fees are excluded",
    ],
    status: "Official",
    facts: [
      "All sixteen undergraduate subjects on the current official fee table are included",
      "The official fee table currently calculates CSE on 146 credits",
      "Scholarship awards cover tuition unless the official category explicitly states otherwise",
      "The university states that published costs may change; recheck the official table before payment",
    ],
    sources: [
      {
        label: "Official fees for every undergraduate subject",
        url: "https://admission.wub.edu.bd/admission/tuition_fees",
      },
      {
        label: "Official Fall 2026 scholarship rules",
        url: "https://admission.wub.edu.bd/admission/scholarship",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "UU")!,
  {
    programs: [
      "CSE",
      "CSE — Diploma Entry",
      "EEE",
      "EEE — Diploma Entry",
      "Mathematics",
      "BBA",
      "Fashion Design & Technology",
      "Fashion Design & Technology — Diploma Entry",
      "Civil Engineering",
      "Civil Engineering — Diploma Entry",
      "Textile Engineering",
      "Textile Engineering — Diploma Entry",
      "English",
      "Bangla",
      "Law",
      "Islamic Studies",
      "Physical Education",
      "Education",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "CSE",
        credits: 145,
        semesters: 12,
        tuitionPerCredit: 3610,
        total: 731950,
      },
      {
        name: "CSE — Diploma Entry",
        credits: 131,
        semesters: 10,
        tuitionPerCredit: 2125,
        total: 399875,
      },
      {
        name: "EEE",
        credits: 158.5,
        semesters: 12,
        tuitionPerCredit: 2710,
        total: 638035,
      },
      {
        name: "EEE — Diploma Entry",
        credits: 140.5,
        semesters: 10,
        tuitionPerCredit: 2020,
        total: 405310,
      },
      {
        name: "Mathematics",
        credits: 145,
        semesters: 12,
        tuitionPerCredit: 1170,
        total: 299150,
      },
      {
        name: "BBA",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 3770,
        total: 701100,
      },
      {
        name: "Fashion Design & Technology",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 3170,
        total: 676300,
      },
      {
        name: "Fashion Design & Technology — Diploma Entry",
        credits: 120,
        semesters: 10,
        tuitionPerCredit: 2330,
        total: 401100,
      },
      {
        name: "Civil Engineering",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 2320,
        total: 536700,
      },
      {
        name: "Civil Engineering — Diploma Entry",
        credits: 143,
        semesters: 10,
        tuitionPerCredit: 2210,
        total: 435530,
      },
      {
        name: "Textile Engineering",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 2810,
        total: 658100,
      },
      {
        name: "Textile Engineering — Diploma Entry",
        credits: 140,
        semesters: 10,
        tuitionPerCredit: 1870,
        total: 383300,
      },
      {
        name: "English",
        credits: 141,
        semesters: 12,
        tuitionPerCredit: 3700,
        total: 690200,
      },
      {
        name: "Bangla",
        credits: 143,
        semesters: 12,
        tuitionPerCredit: 1200,
        total: 258100,
      },
      {
        name: "Law",
        credits: 150,
        semesters: 8,
        tuitionPerCredit: 4050,
        total: 781000,
      },
      {
        name: "Islamic Studies",
        credits: 144,
        semesters: 12,
        tuitionPerCredit: 950,
        total: 223300,
      },
      {
        name: "Physical Education",
        credits: 44,
        semesters: 3,
        tuitionPerCredit: 950,
        total: 74800,
      },
      {
        name: "Education",
        credits: 44,
        semesters: 3,
        tuitionPerCredit: 950,
        total: 71800,
      },
    ],
    credits: 145,
    cost: 523450,
    admission: 16500,
    semester: 192000,
    totalCost: 731950,
    costLabel: "Published Fall 2026 CSE total",
    feeBreakdown: [
      "Published base total: ৳7,31,950",
      "Credit fees: ৳5,23,450 (৳3,610 × 145 credits)",
      "Admission fee: ৳16,500",
      "Registration and library fees: ৳16,000 × 12 semesters = ৳1,92,000",
      "Official Fall Excellence table shows a 20% offer and maximum payable cost of ৳6,27,260",
    ],
    scholarships: [
      "Fall 2026 merit bands range from 10% to 30% for combined SSC and HSC GPA 7.00–9.99",
      "Founder Scholarship: 100% for GPA 5.00 in both SSC and HSC, subject to the published passing-year conditions",
      "The official fee table separately lists a 20% Fall Excellence offer for regular CSE",
      "The university should confirm how the intake offer and result band combine before a student relies on a final payable amount",
    ],
    status: "Official",
    facts: [
      "All eighteen bachelor-level and diploma-entry routes on the official Fall 2026 fee table are included",
      "Each subject total is the university's published base total before the displayed Fall Excellence reduction",
      "General undergraduate entry route: GPA 2.50 in both SSC and HSC, or combined GPA 6.00 with neither below 2.00",
      "Permanent campus: Holding 77, Beribadh Road, Turag, Uttara, Dhaka 1230",
    ],
    sources: [
      {
        label: "Official Fall 2026 fees for every undergraduate route",
        url: "https://uttarauniversity.edu.bd/tuition-fees/",
      },
      {
        label: "Official undergraduate catalogue",
        url: "https://uttarauniversity.edu.bd/undergraduate-programs/",
      },
      {
        label: "Official Fall 2026 scholarship policy",
        url: "https://uttarauniversity.edu.bd/scholarship-policy/",
      },
      {
        label: "Official entry requirements",
        url: "https://uttarauniversity.edu.bd/entry-requirements/",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BU")!,
  {
    area: "Mohammadpur",
    address: "5/B, Beribandh Main Road, Adabar, Mohammadpur, Dhaka 1207",
    programs: [
      "Economics",
      "English",
      "Law",
      "Sociology",
      "BBA — Finance",
      "BBA — Accounting",
      "BBA — Marketing",
      "BBA — Human Resource Management",
      "Architecture",
      "CSE",
      "CSE — Diploma Entry",
      "EEE",
      "EEE — Diploma Entry",
      "Mathematics",
      "Pharmacy",
    ],
    programCatalogComplete: true,
    credits: 161,
    admission: 14000,
    totalCost: 531599,
    costLabel: "Published CSE tuition plus admission",
    feeBreakdown: [
      "Combined SSC/HSC GPA 5.00–6.49: tuition ৳5,17,599",
      "Combined GPA 6.50–6.99: tuition ৳4,70,088",
      "Combined GPA 8.00–8.99: tuition ৳3,75,066",
      "Combined GPA 9.00–9.99: tuition ৳3,27,555",
      "Combined GPA 10: tuition ৳2,58,370",
      "GPA 10 without fourth subject: tuition ৳1,00,000",
      "Admission fee, form and ID card: ৳14,000",
      "Refundable library membership ৳2,000 and certificate fee ৳5,000 are not included in the displayed total",
    ],
    scholarships: [
      "BU publishes programme-specific tuition totals based on combined SSC and HSC GPA",
      "For regular CSE, published tuition falls from ৳5,17,599 to ৳1,00,000 across the displayed result bands",
      "The current official CSE table does not display a 7.00–7.99 row; UniVerse BD does not estimate it",
      "Tuition is payable in three instalments per semester under the published notes",
    ],
    status: "Official",
    facts: [
      "All fifteen undergraduate programme and entry routes in BU's current official catalogue are included",
      "Regular CSE curriculum: 161 credits over four years and 12 semesters",
      "The displayed CSE total combines the lowest published tuition band with the stated admission charges only",
      "Permanent campus: 5/B, Beribandh Main Road, Adabar, Mohammadpur, Dhaka 1207",
    ],
    sources: [
      {
        label: "Official complete programme, syllabus and fee directory",
        url: "https://bu.edu.bd/syllabus-and-course-fees/",
      },
      {
        label: "Official regular CSE curriculum and result-based fees",
        url: "https://bu.edu.bd/syllabus-and-course-fees/?degree=BSc+in+CSE+(Regular)",
      },
      {
        label: "Official admission information",
        url: "https://bu.edu.bd/admissions/",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "NUB")!,
  {
    programs: [
      "BBA",
      "CSE",
      "Electronics & Communication Engineering",
      "EEE",
      "Textile Engineering",
      "Pharmacy",
      "English",
      "Law",
    ],
    programCatalogComplete: true,
    credits: 152,
    minGpa: 2.5,
    costLabel: "CSE total verification pending",
    feeBreakdown: [
      "Undergraduate admission and other fee: ৳16,700 at admission",
      "The current Spring 2026 fee-structure PDF is linked for direct checking",
      "No CSE whole-program total is entered because the university's current table could not be extracted and reconciled reliably",
      "UniVerse BD will not convert an admission-fair discount into a standard programme price",
    ],
    scholarships: [
      "Result-based tuition waiver up to 70% is advertised for admission and early semesters",
      "Female students and students from tribal populations may receive a special 5% tuition scholarship",
      "Siblings may receive a 20% tuition scholarship",
      "Every waiver remains subject to the current intake's official conditions and confirmation by NUB",
    ],
    status: "Official",
    facts: [
      "BSc in CSE: 152 credits over 4 years and 12 semesters",
      "Minimum GPA 2.50 in both SSC and HSC or equivalent examinations",
      "CSE operates under an open credit-hour system",
      "Eight current bachelor-level subjects were confirmed from NUB's official programme and university pages",
      "CSE requires a science background with Physics and Mathematics; Pharmacy follows separate science-subject requirements",
      "A current complete CSE fee total was not published clearly enough to reproduce",
      "Permanent campus: 111/2 Kawlar Jame Mosjid Road, Ashkona, near Hajj Camp, Dakshinkhan, Dhaka 1230",
    ],
    sources: [
      {
        label: "Official academic programme directory",
        url: "https://nub.ac.bd/academic/t3gwthgw/academic-programs",
      },
      {
        label: "Official CSE program details",
        url: "https://nub.ac.bd/department/t05oqo1z/computer-science-%26-engineering",
      },
      {
        label: "Official admission information",
        url: "https://nub.ac.bd/admission/uy4d8iaf/admission-information",
      },
      {
        label: "Official online-admission fee information",
        url: "https://www.nub.ac.bd/admission/w2zuickf/online-admission",
      },
      {
        label: "Official Spring 2026 fee-structure PDF",
        url: "https://nub.ac.bd/assets/images//fee-structure/Spring%202026%20%282%29.pdf",
      },
      {
        label: "Official scholarship overview",
        url: "https://nub.ac.bd/admission/qt3uj0a7/why-study-at-nub",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "CUB")!,
  {
    programs: [
      "BBA",
      "CSE",
      "EEE",
      "Shipping & Maritime Science",
      "Civil Engineering",
      "English",
      "Media & Journalism",
      "Law",
      "Public Health",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 126,
        semesters: 12,
        tuitionPerCredit: 3300,
        total: 487800,
      },
      {
        name: "CSE",
        credits: 150,
        semesters: 12,
        tuitionPerCredit: 3300,
        total: 567000,
      },
      {
        name: "EEE",
        credits: 154,
        semesters: 12,
        tuitionPerCredit: 3300,
        total: 580200,
      },
      {
        name: "Shipping & Maritime Science",
        credits: 150,
        semesters: 12,
        tuitionPerCredit: 3500,
        total: 597000,
      },
      {
        name: "Civil Engineering",
        credits: 160,
        semesters: 12,
        tuitionPerCredit: 3300,
        total: 600000,
      },
      {
        name: "English",
        credits: 120,
        semesters: 12,
        tuitionPerCredit: 2550,
        total: 378000,
      },
      {
        name: "Media & Journalism",
        credits: 132,
        semesters: 12,
        tuitionPerCredit: 2600,
        total: 415200,
      },
      {
        name: "Law",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 4100,
        total: 653000,
      },
      {
        name: "Public Health",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 2600,
        total: 410000,
      },
    ],
    credits: 150,
    minGpa: 2.5,
    cost: 495000,
    admission: 12000,
    semester: 60000,
    totalCost: 567000,
    costLabel: "Published Fall 2026 CSE total",
    feeBreakdown: [
      "Published total: ৳5,67,000",
      "Tuition: ৳3,300 × 150 credits = ৳4,95,000",
      "Admission fee: ৳12,000",
      "Registration: ৳5,000 × 12 semesters = ৳60,000",
      "Published GPA-based payable totals range from ৳72,000 to ৳5,17,500",
    ],
    scholarships: [
      "Combined Golden GPA 10: published payable total ৳72,000",
      "Combined GPA 10, non-Golden: ৳3,69,000 after 40% tuition waiver",
      "Combined GPA 9.50–9.99: ৳4,43,250 after 25% tuition waiver",
      "Combined GPA 9.00–9.49: ৳4,68,000 after 20% tuition waiver",
      "Combined GPA 8.00–8.99: ৳4,92,750 after 15% tuition waiver",
      "Combined GPA 7.50–7.99: ৳5,17,500 after 10% tuition waiver",
    ],
    status: "Official",
    facts: [
      "Nine undergraduate subjects are listed in CUB's current official catalogue",
      "BSc in CSE: 150 credits over 4 years and 12 semesters",
      "Minimum GPA 2.50 in both SSC and HSC, or combined GPA 6.00 when one result is at least 2.00",
      "CSE, EEE and Shipping applicants need Mathematics, Physics and Chemistry in HSC or equivalent",
      "An undergraduate competency test is required under the published admission rules",
    ],
    sources: [
      {
        label: "Official Fall 2026 fees for every undergraduate subject",
        url: "https://www.cub.edu.bd/fees_structure.php",
      },
      {
        label:
          "Official undergraduate programme catalogue and admission requirements",
        url: "https://www.cub.edu.bd/admission.php",
      },
      {
        label: "Official grading policy",
        url: "https://www.cub.edu.bd/index_grading_policies.php",
      },
    ],
    verifiedAt: "6 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BUBT")!,
  {
    programs: [
      "BBA",
      "CSE",
      "EEE",
      "Textile Engineering",
      "Civil Engineering",
      "Law",
      "English",
      "Economics",
    ],
    programCatalogComplete: true,
    costLabel: "Programme total verification pending",
    feeBreakdown: [
      "Refundable undergraduate caution/security money: ৳3,000 with first-semester fees",
      "Non-refundable activity fee: ৳3,000 with first-semester fees",
      "Later-semester cost depends on the number of registered credits",
      "The first-semester amount may be paid in full or through the university's published instalment process",
      "No complete programme total is displayed until BUBT publishes an unambiguous credit-and-fee total",
    ],
    scholarships: [
      "25%–100% first-semester tuition waiver based on SSC and HSC results",
      "25%–100% tuition waiver based on semester results at BUBT",
      "10%–100% tuition waiver or scholarship for poor and meritorious students",
      "Sibling waiver: 25% tuition waiver for each sibling",
      "Children of freedom fighters: 100% tuition-fee waiver under the published policy",
      "BUBT states that scholarships, stipends and fee waivers are awarded to at least 6% of students on need and merit",
    ],
    status: "Official",
    facts: [
      "All eight regular undergraduate programmes shown on BUBT's Fall 2026 admission portal are included",
      "Most programmes require GPA 2.50 in both SSC and HSC, or GPA 2.00 in one with combined GPA 6.00",
      "CSE requires a science background with Mathematics and Physics at HSC or equivalent level",
      "EEE and Textile Engineering require the stated science subjects; programme-specific rules must be checked before applying",
      "Civil Engineering has a stricter published requirement: GPA 3.00 in both SSC and HSC plus a science background with Mathematics, Physics and Chemistry",
      "Permanent campus: Rupnagar, Mirpur-2, Dhaka 1216",
    ],
    sources: [
      {
        label:
          "Official Fall 2026 programmes and programme-specific admission requirements",
        url: "https://admission.bubt.edu.bd/",
      },
      {
        label: "Official tuition and payment procedure",
        url: "https://bubt.edu.bd/page/tuition-and-fees",
      },
      {
        label: "Official scholarships and waiver policy",
        url: "https://classic.bubt.edu.bd/Home/page_details/Scholarships_Waiver",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "CU")!,
  {
    programs: [
      "Textile Engineering",
      "CSE",
      "EEE",
      "Mechanical Engineering",
      "Civil Engineering",
      "Pharmacy",
      "BBA",
      "English",
      "Law",
      "Agriculture",
    ],
    programCatalogComplete: true,
    minGpa: 2.5,
    costLabel: "CSE total verification pending",
    scholarships: [
      "Golden GPA 5.00 in both SSC and HSC: 100% tuition waiver; retain with CGPA 3.60",
      "GPA 5.00 in both: 75%; retain with CGPA 3.50",
      "Combined GPA 9.00–9.99: 30%; retain with CGPA 3.20",
      "Combined GPA 8.00–8.99: 25%; retain with CGPA 3.00",
      "Combined GPA 7.00–7.99: 20%; combined 6.00–6.99: 15%; combined 5.00–5.99: 10%",
      "Special categories may receive up to 50%; only the highest applicable waiver is granted",
    ],
    status: "Official",
    facts: [
      "All ten undergraduate subjects on the official catalogue are included",
      "Minimum GPA 2.50 in both SSC and HSC and combined GPA 6.00",
      "Admission includes an admission test",
      "The current fee table is published as images, so no programme amount is reproduced until it can be checked unambiguously",
      "Permanent campus: Khagan, Birulia, Savar, Dhaka 1340",
    ],
    sources: [
      {
        label: "Official complete undergraduate subject catalogue",
        url: "https://www.cityuniversity.ac.bd/undergraduate",
      },
      {
        label: "Official admission eligibility",
        url: "https://www.cityuniversity.ac.bd/admission-eligibility",
      },
      {
        label: "Official tuition page",
        url: "https://www.cityuniversity.ac.bd/tution-fees",
      },
      {
        label: "Official waiver policy",
        url: "https://www.cityuniversity.ac.bd/waiverpolicy",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "SUB")!,
  {
    area: "Siddeswari, Ramna",
    address: "51 Siddeswari Road, Ramna, Dhaka 1217, Bangladesh",
    programs: [
      "BBA",
      "Civil Engineering",
      "CSE",
      "Architecture",
      "Pharmacy",
      "EEE",
      "Microbiology",
      "Law",
      "English",
      "Film & Media",
      "Economics",
      "Environmental Science",
      "Public Administration",
      "Journalism for Electronic & Print Media",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 143, tuitionPerCredit: 4500, total: 709500 },
      {
        name: "Civil Engineering",
        credits: 163,
        tuitionPerCredit: 3800,
        total: 702600,
      },
      {
        name: "CSE",
        credits: 158,
        tuitionPerCredit: 4000,
        total: 708000,
      },
      {
        name: "EEE",
        credits: 160,
        tuitionPerCredit: 3500,
        total: 636000,
      },
      {
        name: "Architecture",
        credits: 187,
        tuitionPerCredit: 3500,
        total: 743000,
      },
      {
        name: "Environmental Science",
        credits: 144,
        tuitionPerCredit: 2600,
        total: 450400,
      },
      {
        name: "Microbiology",
        credits: 147,
        tuitionPerCredit: 3600,
        total: 600800,
      },
      {
        name: "Pharmacy",
        credits: 160,
        tuitionPerCredit: 4000,
        total: 742400,
      },
      { name: "Law", credits: 142, tuitionPerCredit: 4800, total: 751600 },
      { name: "English", credits: 144, tuitionPerCredit: 3000, total: 508000 },
      {
        name: "Public Administration",
        credits: 145,
        tuitionPerCredit: 2500,
        total: 432500,
      },
      {
        name: "Economics",
        credits: 143,
        tuitionPerCredit: 2500,
        total: 427500,
      },
      {
        name: "Film & Media",
        credits: 147,
        tuitionPerCredit: 3000,
        total: 511000,
      },
      {
        name: "Journalism for Electronic & Print Media",
        credits: 143,
        tuitionPerCredit: 2800,
        total: 470400,
      },
    ],
    credits: 158,
    minGpa: 2.5,
    totalCost: 708000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE curriculum: 158 credits",
      "Published CSE tuition rate: ৳4,000 per credit",
      "Published admission fee: ৳26,000",
      "University-published complete CSE total: ৳7,08,000",
      "The displayed total is used directly; no unpublished fee is estimated",
    ],
    scholarships: [
      "Programme fee rows may include a stated special offer; applicants should confirm that the offer is still active for their intake",
      "A combined SSC/HSC GPA of 8.00 or above can qualify an applicant for direct admission, but an English placement test is still required",
      "No temporary notice-based waiver is treated as a permanent scholarship rate",
    ],
    status: "Official",
    facts: [
      "All fourteen undergraduate programmes on Stamford's current official fee page are included with published credits, rates and totals",
      "General minimum: GPA 2.50 in both SSC and HSC",
      "CSE, Civil Engineering and EEE require a science background with Mathematics, Physics and Chemistry",
      "Microbiology and Pharmacy follow additional science-subject requirements",
      "Current campus: 51 Siddeswari Road, Ramna, Dhaka 1217",
    ],
    sources: [
      {
        label: "Official undergraduate programmes and tuition table",
        url: "https://www.stamforduniversity.edu.bd/index.php/stamford/details/27",
      },
      {
        label: "Official programme-specific admission requirements",
        url: "https://www.stamforduniversity.edu.bd/index.php/stamford/details_view/19",
      },
      {
        label: "Official campus and admission contact",
        url: "https://www.stamforduniversity.edu.bd/index.php/stamford/details/7",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "EU")!,
  {
    area: "Ashulia Model Town",
    address:
      "Road 6, Block B, Ashulia Model Town, Khagan, Akran, Ashulia, Dhaka, Bangladesh",
    programs: [
      "English",
      "BBA",
      "Islamic Finance, Banking & Insurance",
      "Civil Engineering",
      "CSE",
      "EEE",
      "Law",
      "Pharmacy",
    ],
    programCatalogComplete: true,
    minGpa: 2.5,
    costLabel: "Programme total verification pending",
    feeBreakdown: [
      "Eastern University publishes programme-specific native-student fee panels",
      "A complete CSE total is not displayed until the current panel can be extracted and reconciled unambiguously",
      "Result-based waivers apply to tuition, not automatically to every compulsory fee",
    ],
    scholarships: [
      "Combined SSC/HSC GPA 10 without fourth subject: 100% tuition waiver; continuation requires SGPA 3.50",
      "Combined GPA 10.00: 40%; 9.50–9.99: 35%; 9.00–9.49: 30%; 8.00–8.99: 25%; 6.00–7.99: 20%",
      "Semester-result waiver: 30% for SGPA 3.85–4.00, 20% for 3.70–3.84 and 10% for 3.50–3.69",
      "Female students receive an additional 10% tuition waiver under the published policy",
      "Children of freedom fighters: 100% tuition waiver within the published quota",
      "National-team players and national-prize-winning artists: 75%; divisional-level: 50%",
    ],
    status: "Official",
    facts: [
      "All eight undergraduate programmes on Eastern University's current admission catalogue are included",
      "General minimum: GPA 2.50 in both SSC and HSC, or GPA 2.00 in one with combined GPA 6.00",
      "Engineering and Pharmacy applicants must satisfy their programme-specific science requirements",
      "Permanent campus: Road 6, Block B, Ashulia Model Town, Khagan, Akran, Ashulia, Dhaka",
      "The university publishes student transport routes connecting several parts of Dhaka to the permanent campus",
    ],
    sources: [
      {
        label: "Official undergraduate programme and tuition directory",
        url: "https://www.easternuni.edu.bd/admission/tuition-fees",
      },
      {
        label: "Official undergraduate admission eligibility",
        url: "https://easternuni.edu.bd/admission/admission-eligibility",
      },
      {
        label: "Official result-based waiver and financial-aid policy",
        url: "https://www.easternuni.edu.bd/admission/waivers",
      },
      {
        label: "Official permanent-campus address",
        url: "https://www.easternuni.edu.bd/admission/how-to-apply",
      },
      {
        label: "Official student transport routes",
        url: "https://www.easternuni.edu.bd/campus/transports",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "PAU")!,
  {
    area: "Banani",
    address: "12 Kemal Ataturk Avenue, Banani, Dhaka, Bangladesh",
    programs: [
      "Architecture",
      "BBA",
      "Biochemistry & Molecular Biology",
      "CSE",
      "EEE",
      "English",
      "International Tourism & Hospitality Management",
      "Law",
      "Microbiology",
      "Public Health Nutrition",
      "Pharmacy",
      "Textile Engineering",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 130,
        semesters: 12,
        tuitionPerCredit: 3500,
        total: 553000,
      },
      {
        name: "International Tourism & Hospitality Management",
        credits: 120,
        semesters: 12,
        tuitionPerCredit: 3500,
        total: 530000,
      },
      {
        name: "Textile Engineering",
        credits: 158,
        semesters: 12,
        tuitionPerCredit: 4000,
        total: 731992,
      },
      {
        name: "EEE",
        credits: 154,
        semesters: 12,
        tuitionPerCredit: 3000,
        total: 584000,
      },
      {
        name: "CSE",
        credits: 150,
        semesters: 12,
        tuitionPerCredit: 3000,
        total: 554000,
      },
      {
        name: "Microbiology",
        credits: 149,
        semesters: 12,
        tuitionPerCredit: 3500,
        total: 643500,
      },
      {
        name: "Biochemistry & Molecular Biology",
        credits: 148,
        semesters: 12,
        tuitionPerCredit: 3600,
        total: 642800,
      },
      {
        name: "Public Health Nutrition",
        credits: 155,
        semesters: 12,
        tuitionPerCredit: 3000,
        total: 575000,
      },
      {
        name: "Pharmacy",
        credits: 160,
        semesters: 8,
        tuitionPerCredit: 5400,
        total: 968000,
      },
    ],
    credits: 150,
    minGpa: 2.5,
    cost: 450000,
    admission: 20000,
    lab: 30000,
    semester: 54000,
    totalCost: 554000,
    costLabel: "University-published CSE total before waiver",
    feeBreakdown: [
      "Tuition: ৳3,000 × 150 credits = ৳4,50,000",
      "Admission fee: ৳20,000",
      "Lab fee: ৳2,500 × 12 semesters = ৳30,000",
      "Other fees: ৳4,500 × 12 semesters = ৳54,000",
      "Published total before waiver: ৳5,54,000",
      "Published total after the listed 25% tuition waiver: ৳4,41,500",
    ],
    scholarships: [
      "Golden GPA 5.00 in both SSC and HSC: 100% tuition waiver",
      "The official CSE fee row lists a 25% tuition waiver and payable total of ৳4,41,500",
      "CGPA 3.80 or above in a semester: additional 10% tuition scholarship",
      "Sibling, spouse or immediate family of a Primeasia alumnus: additional 5% tuition waiver",
      "Credit-transfer students: 20% tuition waiver",
      "The general maximum is 40%, with published exceptions for specific categories",
    ],
    status: "Official",
    facts: [
      "All twelve current undergraduate subjects shown on Primeasia's official programme pages are included",
      "General minimum: GPA 2.50 in both SSC and HSC, or combined GPA 6.00 when either result is GPA 2.00",
      "B.Pharm has separate subject-specific GPA requirements and requires combined SSC/HSC GPA 8.00",
      "CSE is 150 credits over 12 semesters",
      "Current university contact address: 12 Kemal Ataturk Avenue, Banani, Dhaka",
    ],
    sources: [
      {
        label: "Official undergraduate programme catalogue",
        url: "https://primeasia.edu.bd/",
      },
      {
        label: "Official programme tuition and compulsory-fee table",
        url: "https://primeasia.edu.bd/admission/admission-tuition-fees/",
      },
      {
        label: "Official undergraduate admission requirements",
        url: "https://primeasia.edu.bd/admission/admission-requirments/",
      },
      {
        label: "Official scholarship and waiver policy",
        url: "https://primeasia.edu.bd/admission/scholarship-waiver/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "MIU")!,
  {
    area: "Khagan, Ashulia",
    address: "Ashulia Model Town, Khagan, Ashulia, Dhaka, Bangladesh",
    programs: [
      "BBA",
      "CSE",
      "EEE",
      "Pharmacy",
      "English",
      "Law",
      "Journalism & Media Studies",
      "Islamic Studies",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 2600,
        total: 500000,
      },
      {
        name: "CSE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 2600,
        total: 500000,
      },
      {
        name: "EEE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 2600,
        total: 500000,
      },
      {
        name: "English",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 1600,
        total: 360000,
      },
      {
        name: "Law",
        credits: 0,
        tuitionPerCredit: 0,
        total: 458000,
      },
      {
        name: "Journalism & Media Studies",
        credits: 0,
        tuitionPerCredit: 1000,
        total: 276000,
      },
      {
        name: "Islamic Studies",
        credits: 140,
        tuitionPerCredit: 0,
        total: 170000,
      },
    ],
    credits: 140,
    minGpa: 2.5,
    cost: 364000,
    admission: 16000,
    semester: 120000,
    totalCost: 500000,
    costLabel: "University-published CSE day-program total",
    feeBreakdown: [
      "Tuition: ৳2,600 × 140 credits = ৳3,64,000",
      "Admission fee: ৳16,000",
      "Other charges: ৳10,000 × 12 trimesters = ৳1,20,000",
      "Published CSE day-program total before scholarship: ৳5,00,000",
      "The Diploma-holder evening package is separate and is not used as the standard CSE total",
    ],
    scholarships: [
      "Combined GPA up to 8.49: 20% CSE tuition scholarship; published total ৳4,27,200",
      "Combined GPA 8.50–8.99: 25%; total ৳4,09,000",
      "Combined GPA 9.00–9.49: 35%; total ৳3,72,600",
      "Combined GPA 9.50–9.99: 60%; total ৳2,81,600",
      "Combined GPA 10.00: 100%; total ৳1,36,000",
      "Result-based scholarship continues after the first year only when the published MIU CGPA/SGPA threshold is maintained",
      "Top 10% of a programme may receive 25%–100% from the second semester, subject to SGPA and credit-load conditions",
    ],
    status: "Official",
    facts: [
      "Eight undergraduate subjects were reconciled across Manarat's official department sites; seven now have published programme totals",
      "General minimum: GPA 2.50 in both SSC and HSC, or combined GPA 6.00 when a result is GPA 2.00",
      "CSE requires a science background and Mathematics, Physics and Chemistry at HSC or equivalent level",
      "CSE day programme: 140 credits over 12 trimesters",
      "CSE department and permanent-campus address: Ashulia Model Town, Khagan, Ashulia, Dhaka",
      "Admission office: Plot CEN-16, Road 106, Gulshan 2, Dhaka 1212",
    ],
    sources: [
      {
        label: "Official CSE eligibility, fee and result-waiver table",
        url: "https://cse.manarat.ac.bd/admission-and-fees",
      },
      {
        label: "Official BBA fee and result-waiver table",
        url: "https://dba.manarat.ac.bd/admission-and-fees",
      },
      {
        label: "Official EEE fee and result-waiver table",
        url: "https://eee.manarat.ac.bd/admission-and-fees",
      },
      {
        label: "Official English fee and result-waiver table",
        url: "https://english.manarat.ac.bd/admission-and-fees",
      },
      {
        label: "Official Law fee and result-waiver table",
        url: "https://law.manarat.ac.bd/admission-and-fees",
      },
      {
        label: "Official Journalism fee and waiver table",
        url: "https://jms.manarat.ac.bd/admission-and-fees",
      },
      {
        label: "Official scholarship and financial-aid policy",
        url: "https://english.manarat.ac.bd/scholarship",
      },
      {
        label: "Official Law programme page",
        url: "https://law.manarat.ac.bd/",
      },
      {
        label: "Official Islamic Studies fee and contact page",
        url: "https://dis.manarat.ac.bd/admission-and-fees",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "IUBAT")!,
  {
    area: "Sector 10, Uttara",
    address:
      "4 Embankment Drive Road, off Dhaka–Ashulia Road, Sector 10, Uttara Model Town, Dhaka 1230, Bangladesh",
    programs: [
      "BBA",
      "CSE",
      "Civil Engineering",
      "Mechanical Engineering",
      "EEE",
      "Agriculture",
      "Economics",
      "English",
      "Tourism & Hospitality Management",
      "Nursing",
    ],
    programCatalogComplete: true,
    credits: 146,
    minGpa: 3,
    costLabel: "Fall 2026 programme total verification pending",
    feeBreakdown: [
      "IUBAT publishes Fall 2026 undergraduate fees as an official image",
      "BCSE requires at least 146 credits, with extra competency-based courses possible for an individual student",
      "The site does not display a text-readable complete BCSE total, so no amount is estimated here",
      "Fees are assessed by registered credit hours; a student's final requirement may vary after competency review",
    ],
    scholarships: [
      "Entry merit scholarships of up to 100% tuition are available based on prior academic results",
      "Students without an entry scholarship can earn a 50% tuition waiver by obtaining semester CGPA 4.00",
      "Female students receive an additional 10% scholarship under the current Fall 2026 admission information",
      "Recognized sportspeople and artists may receive culture and sports tuition scholarships",
      "IUBAT lists 29 funded merit-cum-need scholarships and also offers payment deferral assistance under conditions",
      "A student securing CGPA 4.00 in three consecutive semesters receives a merit certificate and ৳5,000 cash prize",
    ],
    status: "Official",
    facts: [
      "All ten current bachelor-level programmes in IUBAT's official Fall 2026 admission information are included",
      "General admission requires GPA 3.00 individually in both SSC and HSC and combined GPA 6.50 under the current Fall 2026 requirements",
      "Only science-background applicants qualify for engineering programmes",
      "Undergraduate programmes normally run across 12 semesters over four years",
      "Permanent campus: 4 Embankment Drive Road, Sector 10, Uttara Model Town, Dhaka 1230",
      "Registered students receive group health-insurance coverage for hospitalization up to ৳1,00,000 per year under the published policy",
    ],
    sources: [
      {
        label: "Official Fall 2026 admission, programme and campus information",
        url: "https://iubat.edu/admission/",
      },
      {
        label: "Official bachelor admission requirements",
        url: "https://iubat.edu/online-admission/",
      },
      {
        label: "Official BCSE curriculum and credit requirements",
        url: "https://cse.iubat.edu/curriculum/",
      },
      {
        label: "Official scholarship and financial-assistance information",
        url: "https://iubat.edu/scholarships/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "ASAUB")!,
  {
    area: "Shyamoli, Mohammadpur",
    address:
      "ASA Tower, 23/3 Bir Uttam A. N. M. Nuruzzaman Sarak, Shyamoli, Mohammadpur, Dhaka 1207, Bangladesh",
    programs: ["BBA", "Law", "English", "Applied Sociology", "Pharmacy"],
    programCatalogComplete: true,
    costLabel: "No CSE programme; published subject costs vary",
    feeBreakdown: [
      "Published BBA programme total: ৳3,99,680",
      "The official fee table publishes programme-specific admission, registration, tuition and other charges",
      "ASAUB does not currently list CSE among its active undergraduate programmes, so no CSE cost is shown",
      "Only totals that can be read unambiguously from the current official table are reproduced",
    ],
    scholarships: [
      "Programme-specific waivers are listed in ASAUB's official financial-information table",
      "ASAUB reports providing more than ৳76 crore in student financial aid",
      "Applicants should confirm the exact intake waiver against their selected programme before payment",
    ],
    status: "Official",
    facts: [
      "Five active undergraduate programmes were reconciled from ASAUB's official faculty, admission and fee pages",
      "ASAUB currently offers BBA, Law, English, Applied Sociology and Pharmacy at undergraduate level",
      "CSE, EEE and Agro-Technology are not presented as active programmes; the university website describes them as proposed additions",
      "Campus: ASA Tower, 23/3 Bir Uttam A. N. M. Nuruzzaman Sarak, Shyamoli, Mohammadpur, Dhaka 1207",
      "The general minimum GPA remains pending until the official eligibility page exposes the complete current rule unambiguously",
    ],
    sources: [
      {
        label: "Official faculties and programme catalogue",
        url: "https://www.asaub.edu.bd/",
      },
      {
        label: "Official programme tuition and waiver table",
        url: "https://www.asaub.edu.bd/financial_info.php",
      },
      {
        label: "Official undergraduate eligibility information",
        url: "https://www.asaub.edu.bd/admission_ifo.php",
      },
      {
        label: "Official campus contact address",
        url: "https://www.asaub.edu.bd/contact_content.php",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "ISU")!,
  {
    area: "Mohakhali C/A",
    address: "69 Mohakhali Commercial Area, Dhaka 1212, Bangladesh",
    logo: "https://www.isu.ac.bd/favicon.ico",
    programs: [
      "BBA",
      "English",
      "CSE",
      "Textile Engineering",
      "Apparel Merchandising & Management",
      "Law",
      "Artificial Intelligence & Data Science",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 132,
        semesters: 8,
        tuitionPerCredit: 2695,
        total: 441240,
      },
      {
        name: "English",
        credits: 141,
        semesters: 8,
        tuitionPerCredit: 1760,
        total: 330660,
      },
      {
        name: "CSE",
        credits: 154,
        semesters: 8,
        tuitionPerCredit: 2805,
        total: 510470,
      },
      {
        name: "Textile Engineering",
        credits: 162,
        semesters: 8,
        tuitionPerCredit: 2695,
        total: 515090,
      },
      {
        name: "Apparel Merchandising & Management",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 2600,
        total: 442500,
      },
      {
        name: "Law",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 4000,
        total: 642500,
      },
      {
        name: "Artificial Intelligence & Data Science",
        credits: 152,
        semesters: 8,
        tuitionPerCredit: 4000,
        total: 686500,
      },
    ],
    credits: 154,
    minGpa: 2.5,
    cost: 510470,
    totalCost: 510470,
    costLabel: "Published CSE total before result waiver",
    feeBreakdown: [
      "CSE published total: ৳5,10,470 for 154 credits",
      "CSE tuition: ৳2,805 × 154 credits = ৳4,31,970",
      "Admission and form fee: ৳10,500 once",
      "Registration: ৳7,000 × 8 semesters = ৳56,000",
      "Library fee: ৳500 × 8 semesters = ৳4,000",
      "Student activities fee: ৳1,000 × 8 semesters = ৳8,000",
      "CSE laboratory charges are included in tuition according to the official table",
    ],
    scholarships: [
      "SSC and HSC GPA 4.00–4.49: 30% tuition waiver",
      "SSC and HSC GPA 4.50–4.74: 40% tuition waiver",
      "SSC and HSC GPA 4.75–4.99: 50% tuition waiver",
      "GPA 5.00 in both SSC and HSC: 70% tuition waiver",
      "Golden GPA 5.00 in both SSC and HSC, excluding fourth subject: 80% tuition waiver",
      "The published result waiver stops if semester CGPA falls below 3.50",
      "Separate corporate-group and postgraduate-result waivers are published with their own conditions",
    ],
    status: "Official",
    facts: [
      "Seven current undergraduate programmes were reconciled from ISU's official admission and academic pages",
      "General eligibility: GPA 2.50 in both SSC and HSC, or GPA 2.00 in one with combined GPA 6.00",
      "Engineering applicants must satisfy the programme's science and mathematics subject requirements",
      "Current city campus: 69 Mohakhali Commercial Area, Dhaka 1212",
      "ISU states that its permanent-campus land is in Sector 11, Road 107, Plot 001, Purbachal, Dhaka",
    ],
    sources: [
      {
        label: "Official undergraduate programme and fee table",
        url: "https://admission.isu.ac.bd/tuition-fees",
      },
      {
        label: "Official scholarship and waiver policy",
        url: "https://admission.isu.ac.bd/scholarship-waiver",
      },
      {
        label: "Official programme catalogue and campus contact",
        url: "https://www.isu.ac.bd/",
      },
      {
        label: "Official admission requirements",
        url: "https://www.isu.ac.bd/academics/3/1/bachelor-of-business-administration",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "PUB")!,
  {
    area: "Asad Avenue, Mohammadpur",
    address: "3/2, Block A, Asad Avenue, Mohammadpur, Dhaka 1207, Bangladesh",
    programs: [
      "CSE",
      "Textile Engineering",
      "BBA",
      "Tourism & Hospitality Management",
      "Law",
      "Political Science",
      "Sociology & Social Work",
      "English",
      "Islamic History & Culture",
      "Islamic Studies",
    ],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "CSE",
        credits: 150,
        semesters: 8,
        tuitionPerCredit: 2400,
        total: 375000,
      },
      {
        name: "Textile Engineering",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 387000,
      },
      {
        name: "BBA",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 381600,
      },
      {
        name: "Tourism & Hospitality Management",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 351000,
      },
      {
        name: "Law",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 423900,
      },
      {
        name: "Political Science",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 184200,
      },
      {
        name: "Sociology & Social Work",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 187800,
      },
      {
        name: "English",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 226500,
      },
      {
        name: "Islamic History & Culture",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 113700,
      },
      {
        name: "Islamic Studies",
        credits: 0,
        semesters: 8,
        tuitionPerCredit: 0,
        total: 113700,
      },
    ],
    credits: 150,
    minGpa: 2.5,
    cost: 360000,
    admission: 15000,
    totalCost: 375000,
    costLabel: "Published CSE course fee plus admission",
    feeBreakdown: [
      "Published CSE course fee: ৳3,60,000",
      "Admission fee: ৳15,000",
      "Displayed payable total: ৳3,75,000 before any waiver",
      "CSE programme page lists 150 credits, while its degree-requirements text also mentions 148 credits; the published ৳3,60,000 course fee is used without recalculating it",
    ],
    scholarships: [
      "HSC GPA 4.50 holders may receive up to 50% tuition waiver",
      "HSC GPA 5.00 holders may receive up to 100% tuition waiver",
      "Children of freedom fighters: 100% tuition-fee waiver",
      "A sibling or spouse relationship may qualify for up to 30% tuition waiver",
      "Poor but meritorious students may apply for result-based assistance",
      "The words ‘up to’ are retained because the official policy does not guarantee the maximum award to every eligible applicant",
    ],
    status: "Official",
    facts: [
      "All ten undergraduate programmes on PUB's official programme directory are included",
      "CSE applicants need GPA 2.50 in both SSC and HSC and a science background",
      "The official CSE page lists a four-year programme and a published course fee of ৳3,60,000",
      "Dhaka campus: 3/2, Block A, Asad Avenue, Mohammadpur, Dhaka 1207",
      "PUB also lists a campus at Sristigar, Shibpur, Narsingdi",
    ],
    sources: [
      {
        label: "Official undergraduate programme directory",
        url: "https://www.pub.ac.bd/programs/",
      },
      {
        label: "Official programme-by-programme tuition table",
        url: "https://www.pub.ac.bd/tuition-fees/",
      },
      {
        label: "Official CSE programme, credits and eligibility",
        url: "https://www.pub.ac.bd/programs/undergraduate/bsc-in-cse/",
      },
      {
        label: "Official scholarship policy",
        url: "https://www.pub.ac.bd/scholarships/",
      },
    ],
    verifiedAt: "8 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BUFT")!,
  {
    area: "Nishatnagar, Turag",
    address: "Nishatnagar (west side of Uttara), Turag, Dhaka 1230, Bangladesh",
    logo: "https://buft.edu.bd/favicon.ico",
    programs: [
      "Apparel Manufacturing & Technology",
      "Apparel Merchandising & Management",
      "BBA",
      "CSE",
      "English",
      "Environmental Science",
      "Fashion Design & Technology",
      "Fashion Studies",
      "Industrial Engineering",
      "Knitwear Engineering",
      "Textile Engineering",
      "Textile Engineering & Management",
    ],
    programCatalogComplete: true,
    minGpa: 2.5,
    costLabel: "Complete programme cost pending",
    scholarships: [
      "GPA 5.00 excluding the fourth subject in both SSC and HSC: 100% tuition waiver at entry, under the current published policy",
      "GPA 5.00 including the fourth subject in both SSC and HSC: 25% first-semester tuition waiver",
      "Top three admission-test scorers with at least 75%: 50% tuition waiver",
      "Published programme discounts include 15% for CSE and Knitwear Engineering, 5% for BBA and Industrial Engineering, and 25% for Environmental Science",
      "Sibling, married-couple and tribal students may receive 25% tuition waiver subject to the published conditions",
      "Female students may receive a 10% entry-level tuition waiver",
      "Only one applicable scholarship or tuition-waiver category is awarded at a time",
    ],
    status: "Official",
    facts: [
      "All twelve currently offered bachelor programmes are included; proposed programmes are deliberately excluded",
      "Undergraduate applicants need GPA 2.50 separately in SSC and HSC or equivalent",
      "A science background is required for AMT, Knitwear Engineering, Fashion Design & Technology, CSE, Industrial Engineering, Textile Engineering and Textile Engineering & Management",
      "Applicants must meet the admission-test or published direct-admission route",
      "The current official pages do not provide a complete programme-by-programme payable-cost table, so no total is estimated",
      "Campus: Nishatnagar, Turag, Dhaka 1230",
    ],
    sources: [
      {
        label: "Official bachelor programme catalogue",
        url: "https://buft.edu.bd/programs",
      },
      {
        label: "Official undergraduate admission eligibility",
        url: "https://buft.edu.bd/admission/eligibility",
      },
      {
        label: "Official scholarship and tuition-waiver policy",
        url: "https://buft.edu.bd/scholarship",
      },
      {
        label: "Official university site and campus contact",
        url: "https://buft.edu.bd/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "CWU")!,
  {
    area: "Islamnagar, Matuail",
    address:
      "1/B Mir Sadek Road, Islamnagar, Matuail, Dhaka 1362, Bangladesh",
    logo: "https://www.cwu.edu.bd/favicon.ico",
    programs: [
      "CSE",
      "BBA",
      "English Language & Literature",
      "Sociology & Gender Studies",
      "Journalism & Media Studies",
    ],
    programCatalogComplete: true,
    costLabel: "Current programme costs pending",
    feeBreakdown: [
      "CWU's current public admission page directs applicants to the Admission Desk for its prospectus and further fee information",
      "No complete current programme total is displayed on the official public pages, so no cost is estimated",
    ],
    scholarships: [
      "CWU provides a Scholarship and Financial Assistance route through its official admission services",
      "Current award bands and continuation conditions remain pending until a complete official policy is publicly accessible",
    ],
    status: "Official",
    facts: [
      "CWU is an institution exclusively for women",
      "Five active undergraduate departments were verified from the university's current site and 2026 academic activity",
      "Current undergraduate subjects: CSE, BBA, English Language & Literature, Sociology & Gender Studies, and Journalism & Media Studies",
      "Permanent campus: 1/B Mir Sadek Road, Islamnagar, Matuail, Dhaka 1362",
      "The admission page also lists an admission office at 6 Hatkhola Road, Dhaka 1203",
    ],
    sources: [
      {
        label: "Official university and current department information",
        url: "https://www.cwu.edu.bd/",
      },
      {
        label: "Official admission instructions and campus contacts",
        url: "https://cwu.edu.bd/admission",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "CIU")!,
  {
    area: "Jamal Khan",
    address: "Minhaj Complex, 12 Jamal Khan Road, Chattogram, Bangladesh",
    logo: "https://ciu.edu.bd/favicon.ico",
    programs: ["BBA", "CSE", "EEE", "English", "Law"],
    programCatalogComplete: true,
    programCosts: [
      {
        name: "BBA",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 4000,
        total: 635000,
      },
      {
        name: "CSE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 4000,
        total: 635000,
      },
      {
        name: "EEE",
        credits: 140,
        semesters: 12,
        tuitionPerCredit: 4000,
        total: 635000,
      },
      {
        name: "English",
        credits: 141,
        semesters: 12,
        tuitionPerCredit: 4000,
        total: 357000,
        discounted: true,
      },
      {
        name: "Law",
        credits: 140,
        semesters: 8,
        tuitionPerCredit: 4000,
        total: 635000,
      },
    ],
    credits: 140,
    minGpa: 2.5,
    cost: 560000,
    admission: 15000,
    semester: 5000,
    totalCost: 635000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "CSE and EEE tuition: ৳4,000 × 140 credits = ৳5,60,000",
      "Admission fee: ৳15,000",
      "Activity fee: ৳5,000 × 12 semesters = ৳60,000",
      "Published CSE or EEE total before scholarship: ৳6,35,000",
      "BBA has the same published 140-credit, 12-semester total",
      "BA in English publishes a ৳6,39,000 standard total and a ৳3,57,000 total after its stated 50% tuition waiver",
      "LLB publishes a total of ৳6,35,000 across eight semesters",
    ],
    scholarships: [
      "Combined SSC and HSC GPA 10.00: 100% first-semester tuition waiver",
      "Combined GPA 9.50–9.99: 50% first-semester tuition waiver",
      "Combined GPA 9.00–9.49: 25% first-semester tuition waiver",
      "Youngone–CIU Academic Excellence Scholarship: four-year support for selected BBA, CSE and EEE entrants with aggregate SSC and HSC GPA 9.00 or the published equivalent",
      "Youngone applicants must qualify through admission and special selection; recipients must register at least 12 credits per semester and maintain CGPA 3.70",
      "Continuing-student merit awards range from 25% at CGPA 3.75–3.84 to 100% at CGPA 4.00",
      "Need-cum-merit assistance ranges from 10% to 75%, subject to CIU conditions",
      "Published categories also include freedom-fighter children, ethnic minorities or remote-area students, siblings and spouses",
    ],
    status: "Official",
    facts: [
      "All five current undergraduate degree groups are included; BBA concentrations remain grouped under BBA",
      "General admission requires combined SSC and HSC GPA 6.00 with at least GPA 2.50 in each examination",
      "Engineering applicants must have Mathematics and Physics in SSC and HSC or equivalent",
      "CIU follows an open-credit system, but its current fee pages calculate BBA, CSE and EEE across twelve semesters",
      "The Youngone scholarship is a competitive selected award, not an automatic result-based waiver",
      "Campus: Minhaj Complex, 12 Jamal Khan Road, Chattogram",
    ],
    sources: [
      {
        label: "Official undergraduate programme catalogue",
        url: "https://ciu.edu.bd/undergraduate-courses",
      },
      {
        label: "Official admission eligibility",
        url: "https://ciu.edu.bd/admission-eligibility",
      },
      {
        label: "Official CSE and EEE fee structure",
        url: "https://ciu.edu.bd/tuition-fees-sse-engineering",
      },
      {
        label: "Official BBA fee structure",
        url: "https://ciu.edu.bd/tuition-fees-ciubs-bba",
      },
      {
        label: "Official English fee structure",
        url: "https://ciu.edu.bd/tuition-fees-slass-ba-english",
      },
      {
        label: "Official LLB fee structure",
        url: "https://ciu.edu.bd/tuition-fees-sol-llb",
      },
      {
        label: "Official scholarship policy",
        url: "https://ciu.edu.bd/scholarship",
      },
      {
        label: "Official Youngone–CIU Academic Excellence Scholarship",
        url: "https://ciu.edu.bd/youngone-scholarship-program",
      },
      {
        label: "Official grading policy",
        url: "https://ciu.edu.bd/grading-policy",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "DIU-D")!,
  {
    programs: [
      "Law",
      "BBA",
      "CSE",
      "EEE",
      "Civil Engineering",
      "Pharmacy",
      "English",
      "Economics",
    ],
    programCosts: [
      { name: "Law", credits: 144, tuitionPerCredit: 0, total: 800000 },
      { name: "BBA", credits: 141, tuitionPerCredit: 0, total: 530000 },
      { name: "CSE", credits: 148, tuitionPerCredit: 0, total: 700000 },
      { name: "EEE", credits: 154, tuitionPerCredit: 0, total: 430000 },
      {
        name: "Civil Engineering",
        credits: 161.5,
        tuitionPerCredit: 0,
        total: 485000,
      },
      { name: "Pharmacy", credits: 165, tuitionPerCredit: 0, total: 800000 },
      { name: "English", credits: 141, tuitionPerCredit: 0, total: 400000 },
      { name: "Economics", credits: 120, tuitionPerCredit: 0, total: 370000 },
    ],
    credits: 148,
    totalCost: 700000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE programme total: ৳7,00,000",
      "CSE duration: 4 years · 148 credits",
      "CSE admission fee listed by the university: ৳25,000",
      "The university publishes complete programme totals, not a universal per-credit calculation",
    ],
    status: "Official",
    facts: [
      "Eight undergraduate programme totals are reproduced from the current official fee table",
      "Dhaka International University is kept distinct from Daffodil International University throughout the site",
      "Programmes without a clear current official total remain pending",
    ],
    sources: [
      {
        label: "Official programme fee structure",
        url: "https://diu.ac/program-fee-structure",
      },
      {
        label: "Official admission fee calculator",
        url: "https://admission.diu.ac/course-fee-calculation",
      },
    ],
    verifiedAt: "9 September 2026",
  },
);
const campus = (
  short: string,
  area: string,
  address: string,
  logo: string,
  source: string,
) => {
  const u = universities.find((x) => x.short === short)!;
  Object.assign(u, {
    area,
    address,
    logo,
    sources: [
      { label: "Official campus address", url: source },
      ...(u.sources ?? []),
    ],
  });
};
campus(
  "NSU",
  "Bashundhara R/A",
  "Plot 15, Block B, Bashundhara Residential Area, Dhaka 1229, Bangladesh",
  "https://www.northsouth.edu/favicon.ico",
  "https://www.northsouth.edu/contact-us.html",
);
campus(
  "BRACU",
  "Merul Badda",
  "Kha 224, Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh",
  "https://www.bracu.ac.bd/favicon.ico",
  "https://www.bracu.ac.bd/contact",
);
campus(
  "EWU",
  "Aftabnagar",
  "A/2, Jahurul Islam Avenue, Jahurul Islam City, Aftabnagar, Dhaka 1212, Bangladesh",
  "https://www.ewubd.edu/favicon.ico",
  "https://fbe.ewubd.edu/business-administration/contact-us",
);
campus(
  "AIUB",
  "Kuratoli, Khilkhet",
  "408/1 (Old KA 66/1), Kuratoli, Khilkhet, Dhaka 1229, Bangladesh",
  "https://www.aiub.edu/favicon.ico",
  "https://www.aiub.edu/contact-us",
);
campus(
  "UIU",
  "United City, Badda",
  "United City, Madani Avenue, Badda, Dhaka 1212, Bangladesh",
  "https://www.uiu.ac.bd/favicon.ico",
  "https://www.uiu.ac.bd/contact-us/",
);
campus(
  "AUST",
  "Tejgaon Industrial Area",
  "141 & 142, Love Road, Tejgaon Industrial Area, Dhaka 1208, Bangladesh",
  "https://www.aust.edu/favicon.ico",
  "https://admission.aust.edu/",
);
campus(
  "UAP",
  "Green Road, Farmgate",
  "74/A, Green Road, Farmgate, Dhaka 1205, Bangladesh",
  "https://www.uap-bd.edu/favicon.ico",
  "https://cse.uap-bd.edu/office/posts/122/",
);
campus(
  "IIUC",
  "Kumira",
  "IIUC Campus, Kumira, Chattogram 4318, Bangladesh",
  "https://www.iiuc.ac.bd/favicon.ico",
  "https://library.iiuc.ac.bd/",
);
campus(
  "EDU",
  "East Nasirabad, Khulshi",
  "Abdullah Al Noman Road, Noman Society, East Nasirabad, Khulshi, Chattogram 4209, Bangladesh",
  "https://www.eastdelta.edu.bd/favicon.ico",
  "https://www.eastdelta.edu.bd/",
);
campus(
  "LU",
  "Ragibnagar, South Surma",
  "Ragibnagar, South Surma, Sylhet 3112, Bangladesh",
  "https://lus.ac.bd/favicon.ico",
  "https://lus.ac.bd/admission/contact/",
);
campus(
  "DIU",
  "Daffodil Smart City, Birulia",
  "Daffodil Smart City, Birulia, Savar, Dhaka, Bangladesh",
  "https://daffodilvarsity.edu.bd/favicon.ico",
  "https://daffodilvarsity.edu.bd/",
);
campus(
  "IUB",
  "Bashundhara R/A",
  "Plot 16, Block B, Aftabuddin Ahmed Road, Bashundhara Residential Area, Dhaka 1245, Bangladesh",
  "",
  "https://iub.ac.bd/",
);
campus(
  "ULAB",
  "Mohammadpur",
  "688 Beribadh Road, Mohammadpur, Dhaka 1207, Bangladesh",
  "",
  "https://ulab.edu.bd/where-is-ulab",
);
campus(
  "GUB",
  "Kanchan, Rupganj",
  "Purbachal American City, Kanchan, Rupganj, Narayanganj 1461, Bangladesh",
  "",
  "https://green.edu.bd/",
);
campus(
  "UITS",
  "Maddha Nayanagar, Vatara",
  "Holding 153 (Old 190), Road 5, Block J, Baridhara, Maddha Nayanagar, Vatara, Dhaka 1212, Bangladesh",
  "",
  "https://uits.ac.bd/",
);
campus(
  "BUBT",
  "Rupnagar, Mirpur-2",
  "Rupnagar, Mirpur-2, Dhaka 1216, Bangladesh",
  "",
  "https://bubt.edu.bd/page/tuition-and-fees",
);
campus(
  "SEU",
  "Tejgaon Industrial Area",
  "251/A and 252, Tejgaon Industrial Area, Dhaka 1208, Bangladesh",
  "https://seu.edu.bd/favicon.ico",
  "https://seu.edu.bd/",
);
campus(
  "SUBD",
  "Kanchan, Rupganj",
  "696 Kendua, Kanchan, Rupganj, Narayanganj 1461, Bangladesh",
  "",
  "https://sub.ac.bd/",
);
campus(
  "DIU-D",
  "Satarkul, Badda",
  "Permanent Campus, Satarkul, Badda, Dhaka 1212, Bangladesh",
  "",
  "https://diu.ac/",
);
campus(
  "WUB",
  "Sector 17/H, Uttara",
  "Avenue 6 Road and Lake Drive Road, Sector 17/H, Uttara, Dhaka 1230, Bangladesh",
  "",
  "https://wub.edu.bd/",
);
campus(
  "UU",
  "Turag, Uttara",
  "Holding 77, Beribadh Road, Turag, Uttara, Dhaka 1230, Bangladesh",
  "",
  "https://uttarauniversity.edu.bd/contact-us/",
);
campus(
  "NUB",
  "Ashkona, Dakshinkhan",
  "111/2 Kawlar Jame Mosjid Road, Ashkona, near Hajj Camp, Dakshinkhan, Dhaka 1230, Bangladesh",
  "",
  "https://nub.ac.bd/contact",
);
campus(
  "CUB",
  "Pragati Sharani, Badda",
  "201/1 Pragati Sharani (Bir Uttam Rafiqul Islam Avenue), Badda, Dhaka 1212, Bangladesh",
  "",
  "https://www.cub.edu.bd/",
);
campus(
  "CU",
  "Khagan, Birulia",
  "Khagan, Birulia, Savar, Dhaka 1340, Bangladesh",
  "",
  "https://www.cityuniversity.ac.bd/contact",
);
campus(
  "UGV",
  "C&B Road",
  "874/322, C&B Road, Barishal 8200, Bangladesh",
  "https://ugv.edu.bd/favicon.ico",
  "https://ugv.edu.bd/admission/show",
);
campus(
  "VU",
  "Chandrima, Paba",
  "Rajshahi Bypass Road, Chandrima, Paba, Rajshahi 6204, Bangladesh",
  "https://vu.edu.bd/favicon.ico",
  "https://vu.edu.bd/",
);
campus(
  "PUC",
  "Prabartak Circle, Panchlaish",
  "1/A O.R. Nizam Road, Prabartak Circle, Panchlaish, Chattogram, Bangladesh",
  "https://www.puc.ac.bd/favicon.ico",
  "https://www.puc.ac.bd/",
);
campus(
  "NWU",
  "Sonadanga",
  "236, M. A. Bari Road, Sonadanga, Khulna 9100, Bangladesh",
  "https://www.nwu.ac.bd/favicon.ico",
  "https://www.nwu.ac.bd/",
);
campus(
  "NEUB",
  "Telihaor, Sheikhghat",
  "Telihaor, Sheikhghat, Sylhet 3100, Bangladesh",
  "https://www.neub.edu.bd/favicon.ico",
  "https://www.neub.edu.bd/contact-us",
);

Object.assign(
  universities.find((u) => u.short === "PUST")!,
  {
    area: "Baghopara, Gokul",
    address: "Rangpur Road, Baghopara, Gokul, Bogura, Bangladesh",
    logo: "https://pundrauniversity.ac.bd/favicon.ico",
    programs: [
      "BBA",
      "CSE",
      "CSE — Diploma Entry",
      "EEE",
      "EEE — Diploma Entry",
      "Civil Engineering",
      "Civil Engineering — Diploma Entry",
      "Islamic Studies",
      "English",
      "Law",
      "Journalism & Media Studies",
      "Bangla",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 140, semesters: 8, tuitionPerCredit: 0, total: 315000 },
      { name: "CSE", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 427000 },
      { name: "CSE — Diploma Entry", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 294800 },
      { name: "EEE", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 420000 },
      { name: "EEE — Diploma Entry", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 311000 },
      { name: "Civil Engineering", credits: 164, semesters: 8, tuitionPerCredit: 0, total: 430000 },
      { name: "Civil Engineering — Diploma Entry", credits: 164, semesters: 8, tuitionPerCredit: 0, total: 430000 },
      { name: "Islamic Studies", credits: 145, semesters: 8, tuitionPerCredit: 0, total: 160000 },
      { name: "English", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 330000 },
      { name: "Law", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 350000 },
      { name: "Journalism & Media Studies", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 320000 },
      { name: "Bangla", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 200000 },
    ],
    credits: 161,
    minGpa: 2.5,
    totalCost: 427000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE total: ৳4,27,000 for 161 credits across 8 semesters",
      "Each selected undergraduate route uses the exact total displayed on its official programme page",
      "The official pages publish whole-program totals but do not expose a reliable tuition-only split, so waiver-adjusted payable totals are not calculated",
      "The Civil diploma-entry page currently displays the same 164-credit, ৳4,30,000 figure as the regular route; it is reproduced as published and flagged for direct confirmation",
    ],
    scholarships: [
      "Current official scholarship percentage bands and continuation conditions require verification before any result-based payable amount is shown",
    ],
    status: "Official",
    facts: [
      "All twelve undergraduate and diploma-entry routes in the current official catalogue are included",
      "General admission: GPA 2.50 in both SSC and HSC; some non-engineering pages allow GPA 2.00 in one examination where the combined GPA is at least 6.00",
      "Engineering applicants require a science background with the programme's stated Mathematics, Physics and Chemistry preparation",
      "Law publishes a separate minimum: combined GPA 8.00 with at least 3.50 in each SSC and HSC result, followed by an admission test",
      "The university's complete current grade scale is now available in Grade Charts",
      "Campus: Rangpur Road, Baghopara, Gokul, Bogura",
    ],
    sources: [
      { label: "Official complete programme catalogue", url: "https://pundrauniversity.ac.bd/programs" },
      { label: "Official BBA fees, admission and grading", url: "https://pundrauniversity.ac.bd/programs/bba" },
      { label: "Official CSE fees and admission", url: "https://pundrauniversity.ac.bd/programs/cse" },
      { label: "Official engineering and diploma programme pages", url: "https://pundrauniversity.ac.bd/programs/eee" },
      { label: "Official arts, law and media programme pages", url: "https://pundrauniversity.ac.bd/programs/llb" },
      { label: "Official campus and contact information", url: "https://pundrauniversity.ac.bd/" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "EBAUB")!,
  {
    area: "Boro Indara Moor",
    address: "69-69/1, Boro Indara Moor, Chapainawabganj 6300, Bangladesh",
    logo: "https://ebaub.ac.bd/favicon.ico",
    programs: [
      "Agriculture",
      "Agricultural Economics",
      "BBA",
      "Law",
      "CSE",
    ],
    programCatalogComplete: true,
    costLabel: "Programme cost verification pending",
    feeBreakdown: [
      "EBAUB links a current official fee-structure page, but its programme figures are published as an image that could not be reliably transcribed in this verification pass",
      "All five confirmed undergraduate routes remain selectable; their calculator totals stay pending until the university supplies a readable current fee table",
      "No temporary admission-fair discount is treated as the normal four-year programme cost",
    ],
    scholarships: [
      "EBAUB provides an official scholarship and fee-waiver form, but a current rule table with exact result bands and continuation conditions has not yet been verified",
    ],
    status: "Official",
    facts: [
      "Five active undergraduate programmes are confirmed by the university's official programme catalogue",
      "Agriculture, Agricultural Economics, BBA, Law and CSE are now selectable in the finder and cost calculator",
      "Fisheries and English are excluded because the official catalogue labels them as programmes intended to start in the future",
      "Published whole-program fees, admission thresholds, scholarship bands and a university-wide grade chart remain pending until readable current official policies are available",
      "Campus: 69-69/1, Boro Indara Moor, Chapainawabganj 6300",
    ],
    sources: [
      { label: "Official university home and current activity", url: "https://ebaub.ac.bd/" },
      { label: "Official undergraduate programme catalogue", url: "https://ebaub.ac.bd/old/academics/programs.php" },
      { label: "Official fee-structure page", url: "https://ebaub.ac.bd/about/costing.html" },
      { label: "Official Faculty of Agriculture page", url: "https://ebaub.ac.bd/facultypages/agriculture/agriculture.html" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "KYAU")!,
  {
    area: "Enayetpur, Chauhali",
    address: "Enayetpur, Chauhali, Sirajganj 6751, Bangladesh",
    logo: "https://kyau.edu.bd/favicon.ico",
    programs: [
      "English",
      "CSE",
      "BBA",
      "Pharmacy",
      "Biochemistry & Biotechnology",
      "Microbiology",
      "EEE",
      "Law",
      "Islamic Studies",
      "Mechatronics Engineering",
      "Information & Communication Technology",
      "Electronics & Telecommunication Engineering",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "English", credits: 140, semesters: 8, tuitionPerCredit: 0, total: 322000 },
      { name: "CSE", credits: 150, semesters: 8, tuitionPerCredit: 0, total: 502500 },
      { name: "BBA", credits: 141, semesters: 8, tuitionPerCredit: 0, total: 373650 },
      { name: "Pharmacy", credits: 159, semesters: 8, tuitionPerCredit: 0, total: 516750 },
      { name: "Biochemistry & Biotechnology", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 460000 },
      { name: "Microbiology", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 448000 },
      { name: "EEE", credits: 163, semesters: 8, tuitionPerCredit: 0, total: 467810 },
      { name: "Law", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 381600 },
      { name: "Islamic Studies", credits: 140, semesters: 8, tuitionPerCredit: 0, total: 126000 },
      { name: "Mechatronics Engineering", credits: 167, semesters: 8, tuitionPerCredit: 0, total: 517700 },
      { name: "Information & Communication Technology", credits: 150, semesters: 8, tuitionPerCredit: 0, total: 502500 },
      { name: "Electronics & Telecommunication Engineering", credits: 180, semesters: 8, tuitionPerCredit: 0, total: 502500 },
    ],
    credits: 150,
    minGpa: 2.5,
    totalCost: 502500,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE total: ৳5,02,500 for 150 credits across 8 semesters",
      "KYAU publishes a ৳12,000 admission fee for eleven listed programmes and ৳6,500 for Islamic Studies",
      "Every selected programme uses its exact university-published whole-program total",
      "The official table does not publish a tuition-only split, so scholarship-adjusted payable totals are not inferred",
    ],
    scholarships: [
      "Meritorious but financially disadvantaged quota: 3% of students may receive full tuition waiver under the university's published process",
      "Applicants for that quota must have combined SSC and HSC GPA 9.00 without the fourth subject",
      "Continuation requires at least CGPA 3.00 and no failed or absent semester-final examination",
      "Children of freedom fighters have a separate 3% full-tuition quota under the published university rules",
    ],
    status: "Official",
    facts: [
      "All twelve undergraduate programmes in KYAU's current official fee table are included",
      "General admission: GPA 2.50 in both SSC and HSC, or combined GPA 6.00 where one result is at least 2.00",
      "Pharmacy requires at least GPA 3.00 in both SSC and HSC and a combined GPA of at least 6.50",
      "KYAU's academic policy confirms D as a passing grade and 2.00 as the course passing point, but no complete numeric marks-to-grade table is published; Grade Charts therefore remains pending",
      "Campus: Enayetpur, Chauhali, Sirajganj 6751",
    ],
    sources: [
      { label: "Official undergraduate fees and admission criteria", url: "https://kyau.edu.bd/undergraduate" },
      { label: "Official admission and waiver information", url: "https://kyau.edu.bd/admission-information" },
      { label: "Official academic policy", url: "https://kyau.edu.bd/academic-policy" },
      { label: "Official university and campus information", url: "https://kyau.edu.bd/" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BAUET")!,
  {
    area: "Qadirabad Cantonment, Dayarampur",
    address: "Qadirabad Cantonment, Dayarampur, Natore 6431, Bangladesh",
    logo: "https://bauet.ac.bd/favicon.ico",
    programs: [
      "Civil Engineering",
      "CSE",
      "EEE",
      "Information & Communication Engineering",
      "Electronics & Telecommunication Engineering",
      "Mechanical Engineering",
      "AME",
      "Economics",
      "English",
      "Mathematics",
      "Physics",
      "Sociology",
      "BBA",
      "Law",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "Civil Engineering", credits: 163, semesters: 8, tuitionPerCredit: 0, total: 640000 },
      { name: "CSE", credits: 163, semesters: 8, tuitionPerCredit: 0, total: 700000 },
      { name: "EEE", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 640000 },
      { name: "Information & Communication Engineering", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 640000 },
      { name: "Mechanical Engineering", credits: 0, semesters: 8, tuitionPerCredit: 0, total: 580000 },
      { name: "BBA", credits: 126, semesters: 8, tuitionPerCredit: 0, total: 450000 },
      { name: "English", credits: 132, semesters: 8, tuitionPerCredit: 0, total: 350000 },
      { name: "Law", credits: 134, semesters: 8, tuitionPerCredit: 0, total: 500000 },
    ],
    credits: 163,
    minGpa: 3,
    totalCost: 700000,
    costLabel: "Winter-2026 published CSE total",
    feeBreakdown: [
      "Published CSE total: ৳7,00,000; first-semester payment ৳98,000 and remaining-semester payment ৳86,000",
      "Civil Engineering, EEE and ICE publish ৳6,40,000 totals after the stated special waiver",
      "Mechanical Engineering publishes a ৳5,80,000 total after the stated special waiver",
      "BBA, English and Law publish totals of ৳4,50,000, ৳3,50,000 and ৳5,00,000 respectively",
      "The six wider-catalogue programmes absent from the Winter-2026 fee table remain selectable with costs marked pending",
    ],
    scholarships: [
      "Mechanical Engineering: published 40% tuition-fee waiver; its advertised total already reflects the waiver",
      "Civil Engineering, EEE and ICE: published 20% tuition-fee waiver; their advertised totals already reflect it",
      "Meritorious, financially disadvantaged and other approved categories: up to 100% waiver",
      "Last sibling: 25% waiver; children or spouse of Army personnel: 10% waiver",
      "GPA 5.00 in both SSC and HSC: published fixed ৳25,000 benefit",
    ],
    status: "Official",
    facts: [
      "All fourteen undergraduate programmes in BAUET's current academic catalogue are included",
      "Eight programmes appear in the Winter-2026 admission and fee table; the other programme totals stay pending",
      "Engineering entry requires Science with Mathematics, Physics and Chemistry, GPA 3.00 in both SSC and HSC and combined GPA 6.00",
      "BBA, English and Law require GPA 2.50 in both examinations, or combined GPA 6.00 when one result is at least 2.00",
      "The Winter-2026 notice publishes an application deadline of 6 January 2027 and admission test on 10 January 2027",
      "BAUET's current Civil Engineering regulations publish the complete numerical grade scale now available in Grade Charts",
      "Campus: Qadirabad Cantonment, Dayarampur, Natore 6431",
    ],
    sources: [
      { label: "Official Winter-2026 admission, fees and scholarships", url: "https://bauet.ac.bd/admission/admission-information/" },
      { label: "Official complete academic programme catalogue", url: "https://bauet.ac.bd/academic/faculty-department-offered-programs/" },
      { label: "Official tuition and fees page", url: "https://bauet.ac.bd/admission/tuition-fees/" },
      { label: "Official scholarship and waiver page", url: "https://bauet.ac.bd/admission/scholarships-waiver/" },
      { label: "Official undergraduate grading scale", url: "https://bauet.ac.bd/ce/program/under-graduate/b-sc-in-ce/" },
      { label: "Official university and campus information", url: "https://bauet.ac.bd/" },
    ],
    verifiedAt: "14 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "BAUST")!,
  {
    area: "Saidpur Cantonment",
    address: "Saidpur Cantonment, Saidpur, Nilphamari, Bangladesh",
    logo: "https://www.baust.edu.bd/favicon.ico",
    programs: [
      "CSE",
      "EEE",
      "Mechanical Engineering",
      "Industrial & Production Engineering",
      "Civil Engineering",
      "Information & Communication Technology",
      "BBA",
      "Accounting & Information Systems",
      "English",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 695000 },
      { name: "EEE", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 695000 },
      { name: "Mechanical Engineering", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 695000 },
      { name: "Industrial & Production Engineering", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 695000 },
      { name: "Civil Engineering", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 695000 },
      { name: "Information & Communication Technology", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 695000 },
      { name: "BBA", credits: 140, semesters: 8, tuitionPerCredit: 0, total: 525000 },
      { name: "Accounting & Information Systems", credits: 132, semesters: 8, tuitionPerCredit: 0, total: 525000 },
      { name: "English", credits: 140, semesters: 8, tuitionPerCredit: 0, total: 450000 },
    ],
    credits: 161,
    minGpa: 3,
    totalCost: 695000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published engineering total: ৳6,95,000 for CSE, EEE, ME, IPE, CE and ICT, including ৳5,000 refundable caution money",
      "Published BBA and BBA in AIS total: ৳5,25,000, including ৳5,000 refundable caution money",
      "Published BA (Hons) in English total: ৳4,50,000, including ৳5,000 refundable caution money",
      "Engineering payment schedule: ৳65,000 during admission and ৳90,000 in each of the remaining seven semesters",
      "The listed totals exclude separately published annual medical-insurance, BNCC and Scout charges where applicable",
    ],
    scholarships: [
      "Semester merit waiver: 25% of tuition for the student securing first position in each batch",
      "Semester merit waiver: 15% of tuition for the student securing second position in each batch",
      "Semester merit waiver: 10% of tuition for the student securing third position in each batch",
      "Admission-stage waiver documents are linked by BAUST, but no result-based payable total is calculated until their current terms can be fully verified",
    ],
    status: "Official",
    facts: [
      "All nine undergraduate programmes in BAUST's official programme catalogue are included with their published credits and totals",
      "Engineering applicants need Science with Mathematics, Physics and Chemistry, HSC GPA 3.00 and combined SSC-HSC GPA 7.00",
      "Non-engineering applicants need HSC GPA 3.00 and combined SSC-HSC GPA 6.00",
      "Combined GPA 9.00 provides direct-admission eligibility for engineering; combined GPA 8.00 provides it for non-engineering programmes",
      "BAUST states that all undergraduate programmes run for four years across eight semesters",
      "A current complete numerical marks-to-grade table has not been verified, so BAUST remains pending in Grade Charts",
      "Campus: Saidpur Cantonment, Saidpur, Nilphamari",
    ],
    sources: [
      { label: "Official undergraduate programme catalogue", url: "https://www.baust.edu.bd/admission/program-offering/" },
      { label: "Official semester fees and payments", url: "https://www.baust.edu.bd/admission/tuition-fees/" },
      { label: "Official admission requirements", url: "https://www.baust.edu.bd/admission/admission-requirment/" },
      { label: "Official waiver and financial-aid page", url: "https://www.baust.edu.bd/admission/waiver-and-financial-aid/" },
      { label: "Official examination-policy page", url: "https://www.baust.edu.bd/academic/examination-policies/" },
      { label: "Official university and campus information", url: "https://www.baust.edu.bd/" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "RTM-AKTU")!,
  {
    area: "East Shahi Eidgah, TB Gate",
    address: "RTM Point, East Shahi Eidgah, TB Gate, Sylhet 3100, Bangladesh",
    logo: "https://www.rtm-aktu.ac.bd/favicon.ico",
    programs: [
      "CSE",
      "EEE",
      "BBA",
      "Fashion Design",
      "English",
      "Demography & Public Health",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 145, semesters: 8, tuitionPerCredit: 1500, total: 388500 },
      { name: "EEE", credits: 156, semesters: 8, tuitionPerCredit: 1500, total: 405000 },
      { name: "BBA", credits: 132, semesters: 8, tuitionPerCredit: 1500, total: 369000 },
      { name: "Fashion Design", credits: 146, semesters: 8, tuitionPerCredit: 1500, total: 390000 },
      { name: "English", credits: 128, semesters: 8, tuitionPerCredit: 1500, total: 295000 },
      { name: "Demography & Public Health", credits: 145, semesters: 8, tuitionPerCredit: 1500, total: 388500 },
    ],
    credits: 145,
    minGpa: 2.5,
    totalCost: 388500,
    costLabel: "University-published CSE gross total",
    feeBreakdown: [
      "Published CSE gross total: ৳3,88,500 for 145 credits across 8 semesters",
      "Undergraduate tuition: ৳1,500 per credit; admission and registration: ৳15,000",
      "CSE, EEE, BBA and Fashion Design publish ৳10,500 semester fee and ৳9,000 skill/practice charge per semester",
      "English publishes ৳4,500 semester fee and ৳6,500 development/skill charge per semester",
      "The separate ৳1,000 library caution money is refundable and excluded from the published totals",
    ],
    scholarships: [
      "Demography & Public Health publishes a ৳2,37,750 payable route for combined SSC-HSC GPA 9.00",
      "Demography & Public Health publishes a ৳2,07,600 payable route for combined SSC-HSC GPA 10.00",
      "The university's general 40% and additional GPA-waiver text is explicitly tied to 2021 admissions and is not applied as a current university-wide discount",
      "Other scholarship and waiver applications require current confirmation from the university",
    ],
    status: "Official",
    facts: [
      "Six currently evidenced undergraduate programmes are included, including the later-added Demography and Public Health degree",
      "General undergraduate entry requires GPA 2.50 in both SSC and HSC, or combined GPA 6.00 when one result is at least 2.00",
      "Fashion Design alternatively permits GPA 2.00 in both SSC and HSC; recognised diploma applicants may apply with GPA 2.00",
      "The current fee page publishes gross totals alongside 2021-only discounted totals; UniVerse BD uses the gross totals",
      "A current complete numerical grading table has not been verified, so RTM-AKTU remains pending in Grade Charts",
      "Campus: RTM Point, East Shahi Eidgah, TB Gate, Sylhet 3100",
    ],
    sources: [
      { label: "Official undergraduate admission and programme catalogue", url: "https://www.rtm-aktu.edu.bd/4001/" },
      { label: "Official fees and payments", url: "https://www.rtm-aktu.edu.bd/4004/" },
      { label: "Official Demography and Public Health programme", url: "https://www.rtm-aktu.edu.bd/3210/?id=20230806134023" },
      { label: "Official university and campus information", url: "https://www.rtm-aktu.ac.bd/" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "SU")!,
  {
    area: "Green Road, Panthapath",
    address: "147/I Green Road, Panthapath, Tejgaon, Dhaka, Bangladesh",
    logo: "https://su.edu.bd/favicon.ico",
    programs: [
      "Civil Engineering",
      "Mechanical Engineering",
      "CSE",
      "Naval Architecture & Marine Engineering",
      "Textile Engineering",
      "Fashion Design & Technology",
      "Apparel Manufacture & Technology",
      "EEE",
      "Architecture",
      "BBA",
      "Journalism & Media Studies",
      "Law",
      "Bangla",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "Civil Engineering", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 224098 },
      { name: "Mechanical Engineering", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 252020 },
      { name: "CSE", credits: 162, semesters: 8, tuitionPerCredit: 0, total: 374018 },
      { name: "Naval Architecture & Marine Engineering", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 146715 },
      { name: "Textile Engineering", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 201880 },
      { name: "Fashion Design & Technology", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 220500 },
      { name: "Apparel Manufacture & Technology", credits: 160, semesters: 8, tuitionPerCredit: 0, total: 220500 },
      { name: "EEE", credits: 161, semesters: 8, tuitionPerCredit: 0, total: 221200 },
      { name: "Architecture", credits: 196, semesters: 10, tuitionPerCredit: 0, total: 330068 },
      { name: "BBA", credits: 141, semesters: 8, tuitionPerCredit: 0, total: 324371 },
      { name: "Journalism & Media Studies", credits: 146, semesters: 8, tuitionPerCredit: 0, total: 220920 },
      { name: "Law", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 550004 },
      { name: "Bangla", credits: 142, semesters: 8, tuitionPerCredit: 0, total: 173346 },
    ],
    credits: 162,
    minGpa: 2.5,
    totalCost: 374018,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "The official tuition page publishes complete programme totals for all thirteen current undergraduate degrees",
      "Published totals range from ৳1,46,715 for Naval Architecture and Marine Engineering to ৳5,50,004 for Law",
      "Architecture runs for five years; the other listed undergraduate programmes run for four years",
      "The calculator uses each published full-programme total without inventing a tuition-only split",
    ],
    scholarships: [
      "The current Fall 2026 admission page advertises 50%–100% scholarships",
      "The detailed waiver table varies by academic result and named admission batch",
      "No payable total is calculated until Sonargaon confirms which published batch column applies to the applicant",
    ],
    status: "Official",
    facts: [
      "All thirteen current undergraduate degrees are searchable with official credits and published totals",
      "General undergraduate entry requires GPA 2.50 separately in SSC and HSC",
      "Fashion Design and Technology permits GPA 2.00 separately; engineering applicants need Physics and Mathematics at HSC or equivalent level",
      "The university also publishes an alternative freedom-fighter-child route based on combined GPA 5.00",
      "Green Road campus: 147/I Green Road, Panthapath, Tejgaon, Dhaka",
      "A current complete numerical grading scale has not been verified, so SU remains pending in Grade Charts",
    ],
    sources: [
      { label: "Official current undergraduate programme catalogue", url: "https://su.edu.bd/" },
      { label: "Official programme tuition and total-fee table", url: "https://su.edu.bd/Admission/tution_fee" },
      { label: "Official undergraduate admission requirements", url: "https://su.edu.bd/Admission/requirement" },
      { label: "Official scholarship and waiver policy", url: "https://su.edu.bd/Admission/waiver_policy" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "NDUB")!,
  {
    area: "Arambagh, Motijheel",
    address: "2/A, Arambagh, Motijheel, GPO Box 7, Dhaka 1000, Bangladesh",
    logo: "https://ndub.edu.bd/favicon.ico",
    programs: ["BBA", "Economics", "Law", "English", "CSE", "Microbiology"],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 130, semesters: 8, tuitionPerCredit: 4400, total: 630000 },
      { name: "Economics", credits: 130, semesters: 8, tuitionPerCredit: 3300, total: 487000 },
      { name: "Law", credits: 143, semesters: 8, tuitionPerCredit: 3850, total: 608550 },
      { name: "English", credits: 141, semesters: 8, tuitionPerCredit: 3300, total: 523300 },
      { name: "CSE", credits: 148, semesters: 8, tuitionPerCredit: 4950, total: 790600 },
      { name: "Microbiology", credits: 135, semesters: 8, tuitionPerCredit: 4950, total: 726250 },
    ],
    credits: 148,
    minGpa: 2.5,
    totalCost: 790600,
    costLabel: "Calculated from NDUB's published CSE fees",
    feeBreakdown: [
      "Calculated CSE total: ৳7,90,600 = 148 credits × ৳4,950 + ৳10,000 admission + eight ৳6,000 semester fees",
      "The same official components produce programme totals for BBA, Economics, Law, English and Microbiology",
      "The separate ৳1,000 application fee is excluded because it is not part of admission, semester or tuition charges",
      "NDUB states that programme fees may be paid in two instalments each semester",
    ],
    scholarships: [
      "GPA 5.00 in both SSC and HSC: 50% tuition scholarship for the first semester",
      "Golden GPA 5.00 in both SSC and HSC: 20% tuition scholarship for the whole programme, subject to maintaining CGPA 3.70",
      "Christian missionary school or college: 10%; sibling routes: up to 40% for the second sibling and 75% for the third",
      "Physically challenged students: up to 70%; qualifying faculty or employee offspring or siblings: up to 50%",
      "Scholarships apply to tuition only; published overall support is capped at 80% and is subject to application and continuation rules",
    ],
    status: "Official",
    facts: [
      "All six UGC-approved undergraduate programmes on NDUB's current admission page are included",
      "Admission requires GPA 2.50 separately in SSC and HSC, qualifying written and oral tests, and generally no more than a three-year study gap",
      "CSE requires a science background with Mathematics and Physics; Microbiology requires Biology, Chemistry and Physics",
      "The university's current fee table is used where another page contains older or conflicting credit counts",
      "Campus: 2/A, Arambagh, Motijheel, Dhaka 1000",
      "NDUB's official numerical grading chart is available in Grade Charts",
    ],
    sources: [
      { label: "Official undergraduate programmes and admission requirements", url: "https://ndub.edu.bd/admission-and-aid/undergraduate-admission/" },
      { label: "Official current tuition and recurring-fee table", url: "https://ndub.edu.bd/admission-and-aid/tuition-fees/" },
      { label: "Official financial aid and scholarships", url: "https://ndub.edu.bd/admission-and-aid/financial-aid-and-scholarships/" },
      { label: "Official grading system", url: "https://ndub.edu.bd/academics/examinations/grading-system/" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "FIU")!,
  {
    area: "Banani",
    address: "House 87, Road 6, Block C, Banani, Dhaka 1213, Bangladesh",
    logo: "https://fiu.edu.bd/favicon.ico",
    programs: [
      "BBA",
      "Tourism & Hospitality Management",
      "English",
      "Islamic Studies",
      "Physics",
      "Law",
      "Civil & Environmental Engineering",
      "CSE",
      "EEE",
      "Textile Engineering",
      "Architecture",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Tourism & Hospitality Management", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Islamic Studies", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Physics", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Law", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Civil & Environmental Engineering", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Textile Engineering", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Architecture", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    minGpa: 2.5,
    costLabel: "Fall 2026 programme costs under verification",
    feeBreakdown: [
      "FIU publishes a Fall 2026 tuition page for its undergraduate programmes",
      "Complete programme totals remain pending until the current credit, tuition and recurring-fee components can be reconciled without estimation",
      "No FIU programme is used for budget matching or price sorting while its total is pending",
    ],
    scholarships: [
      "FIU publishes financial assistance ranging from 25% to 100% of tuition fees",
      "Categories include previous academic results and admission-test merit, FIU academic performance, financial need, merit plus need, and siblings",
      "The current admissions campaign advertises scholarships up to 100%; exact payable totals remain pending until the award bands and tuition components are both verified",
    ],
    status: "Official",
    facts: [
      "All eleven undergraduate programmes documented in FIU's official admission rules are searchable",
      "General entry requires GPA 2.50 in both SSC and HSC, or combined GPA 6.00 when one examination is at least 2.00",
      "Engineering applicants require Mathematics and Physics at HSC or equivalent level",
      "Physics requires Science and GPA 3.00 in both SSC and HSC; programme-specific requirements apply to engineering, architecture and diploma routes",
      "FIU operates three semesters each year: Spring, Summer and Fall",
      "FIU's official numerical grading scale is available in Grade Charts",
      "Campus: House 87, Road 6, Block C, Banani, Dhaka 1213",
    ],
    sources: [
      { label: "Official Fall 2026 tuition-fee page", url: "https://fiu.edu.bd/tuition-fees/" },
      { label: "Official admission rules, programme eligibility and grading", url: "https://fiu.edu.bd/legacy/admission_requirements.pdf" },
      { label: "Official programme syllabus directory", url: "https://fiu.edu.bd/program-syllabuses/" },
      { label: "Official university and campus information", url: "https://fiu.edu.bd/" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "CCNUST")!,
  {
    area: "Kotbari",
    address: "Chowdhury Estate, CCN Road, Kotbari, Cumilla, Bangladesh",
    logo: "https://ccnust.ac.bd/favicon.ico",
    programs: [
      "CSE",
      "EEE",
      "Civil Engineering",
      "BBA",
      "Law",
      "English",
      "Bangla",
      "Mathematics",
      "Economics",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 158.75, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE", credits: 164, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Civil Engineering", credits: 158, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BBA", credits: 120, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Law", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Bangla", credits: 141, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Mathematics", credits: 157, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Economics", credits: 144, semesters: 8, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    costLabel: "Complete programme cost pending verification",
    feeBreakdown: [
      "The official Fall 2026 portal publishes ৳50,000 tuition per semester for CSE, EEE, Civil Engineering and Mathematics",
      "It publishes ৳45,000 tuition per semester for BBA, Law, English, Bangla and Economics",
      "All nine undergraduate programmes are listed as four-year degrees with official credit totals",
      "Complete payable totals remain pending because admission, registration, laboratory and other recurring charges are not disclosed in the accessible fee table",
    ],
    scholarships: [
      "CCNUST provides an official scholarship calculator using HSC batch, technology, SSC GPA and HSC GPA",
      "No percentage is shown until applicant data is submitted, so no scholarship band or payable total is inferred",
      "Applicants should confirm the generated award and applicable fee components directly with the university",
    ],
    status: "Official",
    facts: [
      "Nine current undergraduate programmes are searchable with their official credits",
      "Engineering and Mathematics programmes publish ৳50,000 tuition per semester; the five other undergraduate programmes publish ৳45,000",
      "Fall 2026 admission is published for the July–December semester",
      "A current public programme-specific admission threshold has not been verified and therefore remains pending",
      "A complete official numerical grading scale has not been verified, so CCNUST remains pending in Grade Charts",
      "Campus: Chowdhury Estate, CCN Road, Kotbari, Cumilla",
    ],
    sources: [
      { label: "Official Fall 2026 programme, credit and tuition portal", url: "https://admission.ccnust.ac.bd/fee" },
      { label: "Official scholarship calculator", url: "https://ccnust.ac.bd/scholarship" },
      { label: "Official academic departments and campus information", url: "https://ccnust.ac.bd/" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "CWU")!,
  {
    area: "Hatkhola Road",
    address: "6 Hatkhola Road, Dhaka 1203, Bangladesh",
    logo: "https://www.cwu.edu.bd/favicon.ico",
    programs: [
      "CSE",
      "BBA",
      "English Language & Literature",
      "Journalism & Media Studies",
      "Sociology & Gender Studies",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BBA", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English Language & Literature", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Journalism & Media Studies", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Sociology & Gender Studies", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    costLabel: "Official programme costs pending verification",
    feeBreakdown: [
      "Five undergraduate departments are active on CWU's current 2026 official website",
      "No complete current tuition, credit and recurring-charge table is publicly accessible",
      "Every CWU programme remains selectable, but no amount is used for budget matching or price sorting",
    ],
    scholarships: [
      "CWU publishes admission-waiver notices and external scholarship opportunities",
      "Current numerical eligibility bands and applicable fee components are not publicly documented in a complete table",
      "No result-based payable amount is calculated until an official current policy can be verified",
    ],
    status: "Official",
    facts: [
      "CWU is an undergraduate university exclusively for women",
      "Five active academic areas are evidenced by the university's current 2026 department activities and admissions site",
      "The online admission form remains active and the official site advertises ongoing admission",
      "Admission GPA thresholds and the numerical grading scale remain pending until CWU publishes current official tables",
      "City campus: 6 Hatkhola Road, Dhaka 1203",
      "Permanent campus: 1/B Mir Sadek Road, Islamnagar, Matuail, Dhaka 1362",
    ],
    sources: [
      { label: "Official current university and active-department information", url: "https://www.cwu.edu.bd/" },
      { label: "Official online admission and campus information", url: "https://cwu.edu.bd/online_admission" },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "HUB")!,
  {
    area: "Hamdard City, Gazaria",
    address:
      "Hamdard City of Science, Education & Culture, Gazaria, Munshiganj 1510, Bangladesh",
    logo: "https://hamdarduniversity.edu.bd/favicon.ico",
    programs: [
      "CSE",
      "CSE — Diploma Entry",
      "EEE",
      "EEE — Diploma Entry",
      "Mathematics",
      "BBA",
      "English",
      "Economics",
      "Islamic Studies",
      "BUMS",
      "BAMS",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 152, tuitionPerCredit: 0, total: 500000 },
      {
        name: "CSE — Diploma Entry",
        credits: 135,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      { name: "EEE", credits: 154.5, tuitionPerCredit: 0, total: 450000 },
      {
        name: "EEE — Diploma Entry",
        credits: 139.5,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      { name: "Mathematics", credits: 141, tuitionPerCredit: 0, total: 238050 },
      { name: "BBA", credits: 141, tuitionPerCredit: 0, total: 392000 },
      { name: "English", credits: 140, tuitionPerCredit: 0, total: 334000 },
      { name: "Economics", credits: 140, tuitionPerCredit: 0, total: 244000 },
      { name: "Islamic Studies", credits: 144, tuitionPerCredit: 0, total: 168800 },
      { name: "BUMS", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "BAMS", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    credits: 152,
    cost: 360000,
    totalCost: 500000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "CSE: ৳3,60,000 tuition + ৳1,40,000 other fees = ৳5,00,000",
      "EEE: ৳3,10,000 tuition + ৳1,40,000 other fees = ৳4,50,000",
      "BBA: ৳2,82,000 tuition + ৳1,10,000 other fees = ৳3,92,000",
      "English: ৳2,24,000 tuition + ৳1,10,000 other fees = ৳3,34,000",
      "Mathematics: ৳1,48,050 tuition + ৳90,000 other fees = ৳2,38,050",
      "Economics: ৳1,54,000 tuition + ৳90,000 other fees = ৳2,44,000",
      "Islamic Studies: ৳1,00,800 tuition + ৳64,000 other fees = ৳1,68,800",
      "Diploma-entry and medical-programme totals stay pending where the current table does not publish every required fee component",
    ],
    scholarships: [
      "Combined SSC and HSC GPA 10.00: 100% tuition waiver",
      "Combined GPA 9.50–9.99: 40%; 9.00–9.49: 30%; 8.50–8.99: 20%",
      "Combined GPA 8.00–8.49: 15%; 7.00–7.99: 10%",
      "The official calculator requests SSC and HSC GPA without the fourth subject",
      "Continuation from the second semester is subject to the university's published retention and penalty policy",
      "Separate published routes include underprivileged, freedom-fighter, sibling, spouse, alumni-sibling, diploma-engineer and sister-concern waivers",
    ],
    status: "Official",
    facts: [
      "Fall 2026 programme fees were updated by the university on 9 June 2026",
      "Nine standard undergraduate programmes plus separate CSE and EEE diploma-entry routes are searchable",
      "B.Pharm is marked as an upcoming programme by the university and is therefore not presented as currently available",
      "HUB publishes complete totals for seven undergraduate programmes; unresolved routes remain excluded from budget and price ranking",
      "The official academic page confirms a 4.00 GPA system and a 2.00 minimum for academic progression, but does not publish a complete numerical letter-grade table",
      "Campus: Hamdard City of Science, Education & Culture, Gazaria, Munshiganj 1510",
    ],
    sources: [
      {
        label: "Official Fall 2026 programme fee structure",
        url: "https://hamdarduniversity.edu.bd/admission/tuition_fees",
      },
      {
        label: "Official financial-aid and tuition-waiver structure",
        url: "https://www.admission.hamdarduniversity.edu.bd/waiver.php",
      },
      {
        label: "Official merit-waiver calculator",
        url: "https://www.admission.hamdarduniversity.edu.bd/calculator.php",
      },
      {
        label: "Official undergraduate programme catalogue",
        url: "https://hamdarduniversity.edu.bd/",
      },
      {
        label: "Official academic system",
        url: "https://hamdarduniversity.edu.bd/academic/system",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "RPSU")!,
  {
    area: "Shitalakhya",
    address:
      "25 Sultan Giasuddin Road, Shitalakhya, Narayanganj 1400, Bangladesh",
    logo: "https://rpsu.ac.bd/favicon.ico",
    programs: [
      "BBA",
      "Law & Human Rights",
      "English",
      "CSE",
      "EEE",
      "Pharmacy",
      "Fashion & Design",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 140, tuitionPerCredit: 2800, total: 492000 },
      { name: "Law & Human Rights", credits: 141, tuitionPerCredit: 3600, total: 607600 },
      { name: "English", credits: 141, tuitionPerCredit: 2100, total: 396100 },
      { name: "CSE", credits: 160, tuitionPerCredit: 3200, total: 692000 },
      { name: "EEE", credits: 160, tuitionPerCredit: 1700, total: 420000 },
      { name: "Pharmacy", credits: 165, tuitionPerCredit: 3200, total: 748000 },
      { name: "Fashion & Design", credits: 158, tuitionPerCredit: 1700, total: 408600 },
    ],
    credits: 160,
    admission: 20000,
    cost: 512000,
    totalCost: 692000,
    costLabel: "University-published estimated CSE total",
    feeBreakdown: [
      "CSE: ৳5,12,000 tuition + ৳1,80,000 basic and lab fees = ৳6,92,000",
      "BBA: ৳3,92,000 tuition + ৳1,00,000 basic fees = ৳4,92,000",
      "Law & Human Rights: ৳5,07,600 tuition + ৳1,00,000 basic fees = ৳6,07,600",
      "English: ৳2,96,100 tuition + ৳1,00,000 basic fees = ৳3,96,100",
      "EEE: ৳2,72,000 tuition + ৳1,48,000 basic and lab fees = ৳4,20,000",
      "Pharmacy: ৳5,28,000 tuition + ৳2,20,000 basic and lab fees = ৳7,48,000",
      "Fashion & Design: ৳2,68,600 tuition + ৳1,40,000 basic and lab fees = ৳4,08,600",
      "Optional, penalty and document charges listed separately by RPSU are not added to the standard programme total",
    ],
    scholarships: [
      "HSC GPA 5.00: fixed 40% tuition waiver per semester",
      "HSC GPA 4.90–4.99: 25%; 4.80–4.89: 20%; 4.50–4.79: 15%; 4.00–4.49: 10%",
      "The published waiver applies only to tuition fees",
      "Continuation requires the university's stated credit load, course results, attendance and conduct conditions",
      "Additional continuing-student merit awards are published for semester CGPA 3.50, 3.75 and 4.00",
    ],
    status: "Official",
    facts: [
      "Seven undergraduate programmes have complete university-published standard totals",
      "The fee table separates admission, tuition, semester and applicable laboratory charges",
      "The current undergraduate admission page lists Fall 2026 routes for business, engineering, arts and social sciences, and Pharmacy",
      "Programme-specific admission thresholds and a complete numerical grading table remain pending where the public page does not expose their values",
      "Campus: 25 Sultan Giasuddin Road, Shitalakhya, Narayanganj 1400",
    ],
    sources: [
      {
        label: "Official undergraduate tuition and complete programme totals",
        url: "https://rpsu.ac.bd/admissions/tuition-and-other-fees",
      },
      {
        label: "Official merit waiver and scholarship policy",
        url: "https://rpsu.ac.bd/admissions/waiver-and-scholarship",
      },
      {
        label: "Official Fall 2026 undergraduate admission routes",
        url: "https://rpsu.ac.bd/admissions/undergraduate-admission",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "IUS")!,
  {
    area: "Banani",
    address: "40 Kemal Ataturk Avenue, Banani, Dhaka 1213, Bangladesh",
    logo: "https://ius.edu.bd/favicon.ico",
    minGpa: 3,
    programs: ["CSE", "EEE", "Textile Engineering", "English", "BBA", "EEE — Diploma Entry"],
    programCatalogComplete: true,
    programCosts: [
      { name: "CSE", credits: 140, tuitionPerCredit: 0, total: 500000 },
      { name: "EEE", credits: 153, tuitionPerCredit: 0, total: 500000 },
      { name: "Textile Engineering", credits: 142, tuitionPerCredit: 0, total: 500000 },
      { name: "English", credits: 141, tuitionPerCredit: 0, total: 400000 },
      { name: "BBA", credits: 141, tuitionPerCredit: 0, total: 400000 },
      { name: "EEE — Diploma Entry", credits: 141, tuitionPerCredit: 0, total: 250000 },
    ],
    credits: 140,
    totalCost: 500000,
    costLabel: "Fall 2026 university-published regular CSE fee",
    feeBreakdown: [
      "CSE regular fee: ৳5,00,000; advertised after-waiver fee: ৳4,20,000",
      "EEE regular fee: ৳5,00,000; advertised after-waiver fee: ৳4,00,000",
      "Textile Engineering regular fee: ৳5,00,000; advertised after-waiver fee: ৳4,00,000",
      "English regular fee: ৳4,00,000; advertised after-waiver fee: ৳3,00,000",
      "BBA regular fee: ৳4,00,000; advertised after-waiver fee: ৳3,40,000",
      "Diploma-entry EEE regular fee: ৳2,50,000; advertised after-waiver fee: ৳1,90,000",
      "Regular fees are used for budget comparison because the published page does not assign each advertised discounted total to a precise applicant result band",
    ],
    scholarships: [
      "The university publishes up to 100% result-based tuition waiver",
      "Freedom-fighter children: 100% waiver subject to government rules",
      "Players: up to 100% waiver; need-based scholarship: up to 20%",
      "An application to the university is required for additional scholarship offers",
      "No exact SSC/HSC result-band table is published on the current scholarship page, so no GPA-based payable total is inferred",
    ],
    status: "Official",
    facts: [
      "Five standard four-year undergraduate programmes and the separate diploma-entry EEE route have Fall 2026 fee records",
      "Local applicants require combined SSC and HSC GPA 6.00 with at least 3.00 in each examination",
      "Engineering applicants require a science background",
      "Diploma engineering applicants require a recognized three- or four-year diploma with at least CGPA 2.50 out of 4.00",
      "The public official pages do not provide a complete numerical letter-grade chart, so the Grade Charts section remains pending",
      "Campus: 40 Kemal Ataturk Avenue, Banani, Dhaka 1213",
    ],
    sources: [
      {
        label: "Official Fall 2026 tuition-fee structure",
        url: "https://ius.edu.bd/tuition-fees",
      },
      {
        label: "Official undergraduate admission requirements",
        url: "https://ius.edu.bd/admission-requirements",
      },
      {
        label: "Official scholarship categories",
        url: "https://ius.edu.bd/scholarships",
      },
      {
        label: "Official programme catalogue and campus information",
        url: "https://ius.edu.bd/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "RUD")!,
  {
    area: "Tejgaon Industrial Area",
    address: "Plot 404, Tejgaon Industrial Area, Dhaka 1208, Bangladesh",
    logo: "https://www.royal.edu.bd/favicon.ico",
    minGpa: 2.5,
    programs: [
      "BBA",
      "CSE",
      "Computer Science & Information Technology",
      "English",
      "Hotel Management & Tourism",
      "Education",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 126, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 147, tuitionPerCredit: 0, total: 0, pending: true },
      {
        name: "Computer Science & Information Technology",
        credits: 147,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      { name: "English", credits: 126, tuitionPerCredit: 0, total: 0, pending: true },
      {
        name: "Hotel Management & Tourism",
        credits: 126,
        tuitionPerCredit: 0,
        total: 0,
        pending: true,
      },
      { name: "Education", credits: 36, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    costLabel: "Current official programme costs pending verification",
    feeBreakdown: [
      "Six undergraduate or bachelor's-level routes are confirmed on the current university website",
      "The official programme pages verify curriculum credits but do not publish a complete current fee table",
      "All RUD costs remain excluded from budget matching and price sorting until a complete official total is available",
    ],
    scholarships: [
      "The Fall 2026 admission notice advertises merit and need-based tuition-waiver opportunities",
      "A complete current result-band table and applicable fee components are not publicly available in readable form",
      "No scholarship percentage or payable amount is calculated until the detailed official policy is verified",
    ],
    status: "Official",
    facts: [
      "Fall 2026 admission is currently advertised by Royal University of Dhaka",
      "The programme catalogue confirms BBA, CSE, CSIT, English, Hotel Management & Tourism, and Education routes",
      "CSE and CSIT are published as 147-credit programmes; BBA and Hotel Management & Tourism are published as 126 credits",
      "CSE applicants require the university's published minimum GPA and Mathematics and Physics background conditions",
      "The complete official numerical grading scale is available in Grade Charts",
      "Permanent campus: Plot 404, Tejgaon Industrial Area, Dhaka 1208",
    ],
    sources: [
      {
        label: "Official current university and Fall 2026 admission information",
        url: "https://www.royal.edu.bd/",
      },
      {
        label: "Official BBA curriculum and grading policy",
        url: "https://www.royal.edu.bd/bachelor-of-business-administration-bba/",
      },
      {
        label: "Official CSE curriculum, admission and grading policy",
        url: "https://www.royal.edu.bd/bsc-in-cse/",
      },
      {
        label: "Official CSIT programme information",
        url: "https://www.royal.edu.bd/bsc-in-csit/",
      },
      {
        label: "Official English programme information",
        url: "https://www.royal.edu.bd/ba-in-english-program/",
      },
      {
        label: "Official Hotel Management and Tourism programme information",
        url: "https://www.royal.edu.bd/bachelor-of-hotel-management-and-tourism/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "GUB-G")!,
  {
    area: "Chandna Chowrasta",
    address:
      "38 T & T Road, Telepara, Chandna Chowrasta, Joydebpur, Gazipur 1702, Bangladesh",
    programs: [
      "Food Science & Engineering",
      "Food Science & Engineering — Diploma Entry",
      "CSE",
      "CSE — Diploma Entry",
      "Environmental Protection Technology",
      "Environmental Protection Technology — Diploma Entry",
      "Biotechnology",
      "Public Health",
      "Public Health — Diploma Entry",
      "BBA",
      "Sociology",
      "Public Administration",
      "English",
      "Economics",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "Food Science & Engineering", credits: 156, tuitionPerCredit: 0, total: 245000 },
      { name: "Food Science & Engineering — Diploma Entry", credits: 136, tuitionPerCredit: 0, total: 215000 },
      { name: "CSE", credits: 165, tuitionPerCredit: 0, total: 240000 },
      { name: "CSE — Diploma Entry", credits: 145, tuitionPerCredit: 0, total: 210000 },
      { name: "Environmental Protection Technology", credits: 136, tuitionPerCredit: 0, total: 230000 },
      { name: "Environmental Protection Technology — Diploma Entry", credits: 116, tuitionPerCredit: 0, total: 190000 },
      { name: "Biotechnology", credits: 136, tuitionPerCredit: 0, total: 230000 },
      { name: "Public Health", credits: 155, tuitionPerCredit: 0, total: 235000 },
      { name: "Public Health — Diploma Entry", credits: 135, tuitionPerCredit: 0, total: 190000 },
      { name: "BBA", credits: 137, tuitionPerCredit: 0, total: 185000 },
      { name: "Sociology", credits: 130, tuitionPerCredit: 0, total: 160000 },
      { name: "Public Administration", credits: 130, tuitionPerCredit: 0, total: 160000 },
      { name: "English", credits: 125, tuitionPerCredit: 0, total: 170000 },
      { name: "Economics", credits: 131, tuitionPerCredit: 0, total: 160000 },
    ],
    credits: 165,
    totalCost: 240000,
    costLabel: "University-published CSE total",
    feeBreakdown: [
      "Published CSE total: ৳2,40,000, including ৳2,30,000 tuition and other fees plus ৳10,000 admission fee",
      "The university publishes a complete total and credit count for each of the fourteen listed undergraduate and diploma-entry routes",
      "The combined tuition-and-other-fees column is not treated as tuition alone, so result-based payable totals are not inferred",
    ],
    scholarships: [
      "The current official scholarship page does not yet publish award bands or conditions",
      "Scholarship percentages and result-based payable totals remain pending until a complete official policy is published",
    ],
    status: "Official",
    facts: [
      "Fourteen current undergraduate and diploma-entry routes have university-published credits and complete totals",
      "Every published total is available in the finder, university details and cost calculator",
      "The university fee table separately identifies a ৳10,000 admission fee for every listed route",
      "Campus: 38 T & T Road, Telepara, Chandna Chowrasta, Joydebpur, Gazipur 1702",
    ],
    sources: [
      {
        label: "Official tuition, admission fee and programme total table",
        url: "https://gub.edu.bd/admission/tuition-fees-payment/",
      },
      {
        label: "Official scholarship and financial-aid status",
        url: "https://gub.edu.bd/admission/scholarship-and-financial-aid/",
      },
      {
        label: "Official university and campus information",
        url: "https://gub.edu.bd/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);
Object.assign(
  universities.find((u) => u.short === "ZHSUST")!,
  {
    area: "Madhupur, Kartikpur",
    address:
      "Village Madhupur, Post Office Kartikpur, Bhedarganj, Shariatpur 8024, Bangladesh",
    programs: [
      "BBA",
      "Chemical Engineering",
      "Civil Engineering",
      "CSE",
      "EEE",
      "English",
      "Law",
    ],
    programCatalogComplete: true,
    programCosts: [
      { name: "BBA", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Chemical Engineering", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Civil Engineering", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "CSE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "EEE", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "English", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
      { name: "Law", credits: 0, tuitionPerCredit: 0, total: 0, pending: true },
    ],
    costLabel: "Current official programme costs pending verification",
    feeBreakdown: [
      "Seven current undergraduate departments are confirmed by the official university website",
      "A complete current programme-wise fee and credit table is not publicly readable, so no cost is estimated",
      "Pending routes remain excluded from budget matching and price sorting",
    ],
    scholarships: [
      "The university publishes a Fall 2026 notice for poor and meritorious students to apply for tuition-fee waivers",
      "The public notice does not provide a complete universal SSC/HSC result-band table",
      "No scholarship percentage or payable amount is calculated without the applicable official award rules",
    ],
    status: "Official",
    facts: [
      "All seven departments listed by the current official university site are searchable throughout the site",
      "ZHSUST states that its programmes and curricula are accredited by the University Grants Commission",
      "The university operates two semesters: Spring from January to June and Fall from July to December",
      "Permanent campus: Madhupur, Kartikpur, Bhedarganj, Shariatpur 8024",
    ],
    sources: [
      {
        label: "Official programme catalogue, academic cycle and campus information",
        url: "https://zhsust.ac.bd/",
      },
      {
        label: "Official tuition policy page",
        url: "https://zhsust.ac.bd/tuition-policy/",
      },
      {
        label: "Official financial-assistance page",
        url: "https://zhsust.ac.bd/financial-assistance/",
      },
    ],
    verifiedAt: "10 September 2026",
  },
);

universities.push(
  {
    id: 89,
    name: "Bangladesh University of Engineering and Technology",
    short: "BUET",
    institutionType: "Public",
    district: "Dhaka",
    division: "Dhaka",
    area: "Palashi",
    address: "BUET Central Road, Dhaka 1000, Bangladesh",
    programs: [
      "Architecture", "Biomedical Engineering", "Chemical Engineering",
      "Civil Engineering", "CSE", "EEE", "Industrial & Production Engineering",
      "Materials & Metallurgical Engineering", "Mechanical Engineering",
      "Nanomaterials & Ceramic Engineering", "Naval Architecture & Marine Engineering",
      "Urban & Regional Planning", "Water Resources Engineering",
    ],
    programCatalogComplete: false,
    status: "Official",
    costLabel: "Current programme costs pending verification",
    facts: [
      "Public engineering university in Dhaka",
      "Undergraduate departments are being reconciled across BUET's official university and department pages",
      "No programme total is shown until an official current fee schedule is verified",
    ],
    sources: [
      { label: "Official university website", url: "https://www.buet.ac.bd/web/" },
      { label: "Official undergraduate admission portal", url: "https://ugadmission.buet.ac.bd/" },
    ],
    verifiedAt: "16 September 2026",
  },
  {
    id: 90,
    name: "Chittagong University of Engineering and Technology",
    short: "CUET",
    institutionType: "Public",
    district: "Chattogram",
    division: "Chattogram",
    area: "Pahartali, Raozan",
    address: "Pahartali, Raozan, Chattogram 4349, Bangladesh",
    programs: [
      "Architecture", "Biomedical Engineering", "Civil Engineering", "CSE",
      "Electrical & Electronic Engineering", "Electronics & Telecommunication Engineering",
      "Industrial & Production Engineering", "Materials Science & Engineering",
      "Mechanical Engineering", "Mechatronics & Industrial Engineering",
      "Petroleum & Mining Engineering", "Urban & Regional Planning",
      "Water Resources Engineering",
    ],
    programCatalogComplete: true,
    status: "Official",
    costLabel: "Current programme costs pending verification",
    facts: [
      "CUET's official site confirms undergraduate study in engineering, architecture and urban and regional planning",
      "No programme total is inserted without a current official fee schedule",
    ],
    sources: [
      { label: "Official programme and department catalogue", url: "https://cuet.ac.bd/" },
      { label: "Official undergraduate admission portal", url: "https://admissioncuet.ac.bd/" },
    ],
    verifiedAt: "16 September 2026",
  },
  {
    id: 91,
    name: "Khulna University of Engineering and Technology",
    short: "KUET",
    institutionType: "Public",
    district: "Khulna",
    division: "Khulna",
    area: "Fulbarigate",
    address: "Khulna University of Engineering & Technology, Khulna 9203, Bangladesh",
    programs: [
      "Architecture", "Biomedical Engineering", "Building Engineering & Construction Management",
      "Chemical Engineering", "Civil Engineering", "CSE", "Electrical & Electronic Engineering",
      "Electronics & Communication Engineering", "Energy Science & Engineering",
      "Industrial Engineering & Management", "Leather Engineering", "Materials Science & Engineering",
      "Mechanical Engineering", "Mechatronics Engineering", "Textile Engineering",
      "Urban & Regional Planning",
    ],
    programCatalogComplete: false,
    status: "Official",
    costLabel: "Current programme costs pending verification",
    facts: [
      "Public engineering university in Khulna",
      "The active undergraduate admission portal is linked for current intake notices",
      "Programme totals remain pending until a current official fee table is verified",
    ],
    sources: [
      { label: "Official university academics and departments", url: "https://kuet.ac.bd/" },
      { label: "Official undergraduate admission portal", url: "https://admission.kuet.ac.bd/" },
    ],
    verifiedAt: "16 September 2026",
  },
  {
    id: 92,
    name: "Rajshahi University of Engineering and Technology",
    short: "RUET",
    institutionType: "Public",
    district: "Rajshahi",
    division: "Rajshahi",
    area: "Kazla",
    address: "Kazla, Rajshahi 6204, Bangladesh",
    programs: [
      "Architecture", "Building Engineering & Construction Management",
      "Ceramic & Metallurgical Engineering", "Chemical Engineering", "Civil Engineering",
      "CSE", "Electrical & Computer Engineering", "Electrical & Electronic Engineering",
      "Electronics & Telecommunication Engineering", "Glass & Ceramic Engineering",
      "Industrial & Production Engineering", "Materials Science & Engineering",
      "Mechanical Engineering", "Mechatronics Engineering", "Urban & Regional Planning",
    ],
    programCatalogComplete: true,
    status: "Official",
    costLabel: "Current programme costs pending verification",
    facts: [
      "RUET's official site identifies it as a public engineering university",
      "The official department directory is searchable through UniVerse BD",
      "No cost estimate is produced without a current official programme fee source",
    ],
    sources: [
      { label: "Official university and department directory", url: "https://www.ruet.ac.bd/" },
      { label: "Official undergraduate admission information", url: "https://www.ruet.ac.bd/page/undergraduate-admission" },
    ],
    verifiedAt: "16 September 2026",
  },
);

universities.forEach((university) => {
  university.institutionType ??= "Private";
});

// Public admission is intentionally kept on its own dedicated page.
universities.splice(
  0,
  universities.length,
  ...universities.filter((university) => university.institutionType === "Private"),
);

// Keep every indexed programme usable in the calculator while preserving a
// strict distinction between published totals and records still under review.
// A pending route is deliberately numeric-free: it must never be interpreted
// as an estimate or an official fee.
universities.forEach((university) => {
  const publishedCosts = university.programCosts ?? [];
  const missingRoutes = university.programs
    .filter(
      (program) =>
        !publishedCosts.some(
          (cost) =>
            cost.name === program ||
            (program === "BBA" &&
              (cost.name === "BBA General" || cost.name.startsWith("BBA in "))),
        ),
    )
    .map((program) => ({
      name: program,
      credits: 0,
      tuitionPerCredit: 0,
      total: 0,
      pending: true,
    }));

  university.programCosts = [...publishedCosts, ...missingRoutes];
});

const verifiedCalculatorUniversities = universities.filter((university) =>
  university.programCosts?.some(
    (program) => !program.pending && program.total > 0,
  ),
).length;

const verifiedProgrammeTotals = universities.reduce(
  (total, university) =>
    total +
    (university.programCosts?.filter(
      (program) => !program.pending && program.total > 0,
    ).length ?? 0),
  0,
);

const money = (n: number) =>
  n === 0
    ? "Not published"
    : `৳${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

const programMatches = (name: string, selected: string) =>
  name === selected ||
  (selected === "BBA" &&
    (name === "BBA General" || name.startsWith("BBA in ")));

const matchingProgramCost = (university: University, selected: string) => {
  const costs = university.programCosts ?? [];
  return (
    costs.find((item) => item.name === selected) ??
    (selected === "BBA"
      ? costs.find((item) => item.name === "BBA General") ??
        costs.find((item) => item.name.startsWith("BBA in "))
      : undefined)
  );
};

function SearchSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  // Keep the searchable text aligned when a parent filter is reset.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setQuery(value), [value]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions =
    !normalizedQuery || normalizedQuery === value.toLocaleLowerCase()
      ? options
      : options.filter((option) =>
          option.toLocaleLowerCase().includes(normalizedQuery),
        );

  return (
    <Field label={label}>
      <Combobox
        items={filteredOptions}
        value={value}
        inputValue={query}
        onInputValueChange={setQuery}
        onValueChange={(v) => {
          if (!v) return;
          setQuery(v);
          onChange(v);
        }}
      >
        <ComboboxInput
          aria-label={label}
          placeholder={placeholder ?? `Search ${label.toLowerCase()}…`}
          className="search-select"
        />
        <ComboboxContent className="max-h-72 w-[var(--anchor-width)] border border-slate-500 bg-[#0f1928] text-slate-100 shadow-2xl shadow-black/50">
          <ComboboxEmpty>No matching {label.toLowerCase()}</ComboboxEmpty>
          <ComboboxList className="max-h-72 overscroll-contain">
            {filteredOptions.map((option) => (
              <ComboboxItem
                key={option}
                value={option}
                className="data-highlighted:bg-blue-500/20 data-highlighted:text-white"
              >
                {option}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

function ExactGpaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const update = (next: number) => {
    if (!Number.isFinite(next)) return;
    onChange(Math.min(5, Math.max(2, Math.round(next * 100) / 100)));
  };
  return (
    <Field label={label} value={value.toFixed(2)}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          aria-label={`${label} slider`}
          min="2"
          max="5"
          step="0.05"
          value={value}
          onChange={(event) => update(Number(event.target.value))}
          className="min-w-0 flex-1"
        />
        <input
          type="number"
          inputMode="decimal"
          aria-label={`${label} exact value`}
          min="2"
          max="5"
          step="0.01"
          value={value}
          onChange={(event) => update(Number(event.target.value))}
          className="h-10 w-20 shrink-0 rounded-lg border border-slate-600 bg-[#111b2a] px-2 text-center text-sm font-semibold text-slate-100 outline-none focus:border-blue-400"
        />
      </div>
    </Field>
  );
}

const universityCatalog = buildUniversityCatalog(universities);
const dataQualityReport = validateUniversityData(universityCatalog.records);

export default function Home() {
  const router = useRouter();
  const [program, setProgram] = useState(""),
    [institutionType, setInstitutionType] = useState(""),
    [division, setDivision] = useState(""),
    [district, setDistrict] = useState(""),
    [area, setArea] = useState(""),
    [budget, setBudget] = useState(800000),
    [gpa, setGpa] = useState(4),
    [universityLookup, setUniversityLookup] = useState(""),
    [universitySearch, setUniversitySearch] = useState(""),
    [sortBy, setSortBy] = useState<"match" | "price-asc" | "price-desc">(
      "match",
    ),
    [visible, setVisible] = useState(9);
  const [compare, setCompare] = useState<number[]>([]),
    [detail, setDetail] = useState<University | null>(null),
    [directProfile, setDirectProfile] = useState(false),
    [compareOpen, setCompareOpen] = useState(false),
    [waiver, setWaiver] = useState(0),
    [calcId, setCalcId] = useState<number | null>(null),
    [calcProgram, setCalcProgram] = useState("");
  const [shortlistStages, setShortlistStages] = useState<Record<number, "researching" | "ready" | "applied">>({});
  const [shortlistLoaded, setShortlistLoaded] = useState(false);
  const [aidUniversity, setAidUniversity] = useState(""),
    [aidProgram, setAidProgram] = useState(""),
    [gradeUniversity, setGradeUniversity] = useState(""),
    [detailProgram, setDetailProgram] = useState(""),
    [ssc, setSsc] = useState(4.5),
    [hsc, setHsc] = useState(4.5),
    [golden, setGolden] = useState(false),
    [oneGolden, setOneGolden] = useState(false),
    [female, setFemale] = useState(false),
    [secondChild, setSecondChild] = useState(false),
    [admissionScore, setAdmissionScore] = useState(0),
    [livingUniversity, setLivingUniversity] = useState(""),
    [livingProgram, setLivingProgram] = useState(""),
    [accommodationMode, setAccommodationMode] =
      useState<AccommodationMode>("mess"),
    [studyMonths, setStudyMonths] = useState(48),
    [annualFeeIncrease, setAnnualFeeIncrease] = useState(5),
    [contingency, setContingency] = useState(8),
    [planningScholarship, setPlanningScholarship] = useState(0);
  const [readinessUniversity, setReadinessUniversity] = useState("");
  const [readinessProgram, setReadinessProgram] = useState("");
  const [readinessSsc, setReadinessSsc] = useState(4);
  const [readinessHsc, setReadinessHsc] = useState(4);
  const programFilter = program === "All programmes" ? "" : program;
  const institutionTypeFilter = institutionType === "All institution types" ? "" : institutionType;
  const divisionFilter = division === "All divisions" ? "" : division;
  const districtFilter = district === "All districts" ? "" : district;
  const areaFilter = area === "All areas" ? "" : area;
  const filtersChanged =
    Boolean(programFilter) ||
    Boolean(institutionTypeFilter) ||
    Boolean(divisionFilter) ||
    Boolean(districtFilter) ||
    Boolean(areaFilter) ||
    budget !== 800000 ||
    gpa !== 4 ||
    sortBy !== "match";
  const resetFilters = () => {
    setProgram("");
    setInstitutionType("");
    setDivision("");
    setDistrict("");
    setArea("");
    setBudget(800000);
    setGpa(4);
    setSortBy("match");
    setVisible(9);
  };
  const calculatorUniversities = [...universities].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const universityOptionLabel = (u: University) => `${u.name} (${u.short})`;
  const calculatorUniversityOptions = calculatorUniversities.map(
    (u) => `${u.short} — ${u.name}`,
  );
  const directoryUniversityOptions = calculatorUniversities.map(
    universityOptionLabel,
  );
  const livingProfile = universities.find(
    (u) => universityOptionLabel(u) === livingUniversity,
  );
  const livingPrograms = livingProfile
    ? [...new Set(livingProfile.programs)].sort((a, b) => a.localeCompare(b))
    : [];
  const livingProgrammeCost = livingProfile
    ? matchingProgramCost(livingProfile, livingProgram)
    : undefined;
  const livingAcademicTotal =
    livingProgrammeCost && !livingProgrammeCost.pending
      ? livingProgrammeCost.total
      : undefined;
  const livingTuitionBase =
    livingProgrammeCost &&
    !livingProgrammeCost.pending &&
    livingProgrammeCost.credits > 0 &&
    livingProgrammeCost.tuitionPerCredit > 0
      ? livingProgrammeCost.credits * livingProgrammeCost.tuitionPerCredit
      : undefined;
  const livingModel = livingProfile
    ? districtLivingCosts[livingProfile.district] ?? districtLivingCosts.default
    : districtLivingCosts.default;
  const livingMonthlyLow = livingProfile
    ? livingModel.rent[accommodationMode][0] +
      livingModel.food[0] +
      livingModel.transport[0] +
      livingModel.personal[0]
    : 0;
  const livingMonthlyHigh = livingProfile
    ? livingModel.rent[accommodationMode][1] +
      livingModel.food[1] +
      livingModel.transport[1] +
      livingModel.personal[1]
    : 0;
  const completeFinancialPlan =
    livingAcademicTotal !== undefined
      ? createFinancialPlan({
          academicTotal: livingAcademicTotal,
          studyMonths,
          monthlyLiving: {
            low: livingMonthlyLow,
            high: livingMonthlyHigh,
          },
          annualAcademicIncreasePercent: annualFeeIncrease,
          contingencyPercent: contingency,
          scholarshipPercent:
            livingTuitionBase === undefined ? 0 : planningScholarship,
          scholarshipAppliesTo: livingTuitionBase,
          setupCost: {
            low: accommodationSetupCosts[accommodationMode][0],
            high: accommodationSetupCosts[accommodationMode][1],
          },
        })
      : undefined;
  const readinessProfile = universityCatalog.records.find(
    (university) => universityOptionLabel(university) === readinessUniversity,
  );
  const readinessPrograms = readinessProfile
    ? [...new Set(readinessProfile.programs)].sort((a, b) => a.localeCompare(b))
    : [];
  const readinessProgrammeCost = readinessProfile
    ? matchingProgramCost(readinessProfile, readinessProgram)
    : undefined;
  const readinessResult =
    readinessProfile && readinessProgram
      ? evaluateAdmissionReadiness({
          universityName: readinessProfile.name,
          programmeName: readinessProgram,
          programmeAvailable: readinessProfile.programs.some((name) =>
            programMatches(name, readinessProgram),
          ),
          programmeCatalogComplete: Boolean(readinessProfile.programCatalogComplete),
          minimumGpa: readinessProfile.minGpa,
          sscGpa: readinessSsc,
          hscGpa: readinessHsc,
          hasVerifiedCost: Boolean(
            readinessProgrammeCost &&
              !readinessProgrammeCost.pending &&
              readinessProgrammeCost.total > 0,
          ),
          hasAdmissionSource: readinessProfile.sourceCoverage.admissions,
          hasScholarshipSource: readinessProfile.sourceCoverage.scholarships,
          requiresScienceReview: /engineering|cse|computer|pharmacy|science|biology|biochemistry|microbiology|mathematics|physics|chemistry|architecture/i.test(
            readinessProgram,
          ),
        })
      : undefined;
  const programOptions = useMemo(
    () =>
      [...new Set(universities.flatMap((u) => u.programs))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [],
  );
  const universitySearchResults = useMemo(() => {
    const search = universitySearch.trim().toLocaleLowerCase();
    if (!search) return [];

    const normalizedSearch = search.replace(/[^a-z0-9]/g, "");
    const isSubsequence = (needle: string, haystack: string) => {
      if (needle.length < 3) return false;
      let index = 0;
      for (const character of haystack) {
        if (character === needle[index]) index += 1;
        if (index === needle.length) return true;
      }
      return false;
    };
    const rank = (u: (typeof universities)[number]) => {
      const name = u.name.toLocaleLowerCase();
      const short = u.short.toLocaleLowerCase();
      const compactName = name.replace(/[^a-z0-9]/g, "");
      const compactShort = short.replace(/[^a-z0-9]/g, "");
      if (short === search || name === search) return 0;
      if (short.startsWith(search) || name.startsWith(search)) return 1;
      if (short.includes(search) || name.includes(search)) return 2;
      if (
        isSubsequence(normalizedSearch, compactShort) ||
        isSubsequence(normalizedSearch, compactName)
      )
        return 3;
      return Infinity;
    };

    return universities
      .map((u) => ({ university: u, rank: rank(u) }))
      .filter((item) => Number.isFinite(item.rank))
      .sort(
        (a, b) =>
          a.rank - b.rank || a.university.name.localeCompare(b.university.name),
      )
      .slice(0, 8)
      .map((item) => item.university);
  }, [universitySearch]);
  const districtOptions = useMemo(
    () =>
      [
        ...new Set(
          universities
            .filter((u) => !divisionFilter || u.division === divisionFilter)
            .map((u) => u.district),
        ),
      ].sort(),
    [divisionFilter],
  );
  const areaOptions = useMemo(
    () =>
      [
        ...new Set(
          universities
            .filter(
              (u) =>
                (!divisionFilter || u.division === divisionFilter) &&
                (!districtFilter || u.district === districtFilter),
            )
            .map((u) => u.area)
            .filter((x): x is string => !!x),
        ),
      ].sort(),
    [divisionFilter, districtFilter],
  );
  const evaluatedResults = useMemo(() => {
    return universities
      .filter(
        (u) =>
          !programFilter ||
          u.programs.some((name) => programMatches(name, programFilter)),
      )
      .filter((u) => !institutionTypeFilter || u.institutionType === institutionTypeFilter)
      .filter((u) => !divisionFilter || u.division === divisionFilter)
      .filter((u) => !districtFilter || u.district === districtFilter)
      .filter((u) => !areaFilter || u.area === areaFilter)
      .map((u) => {
        const verifiedProgrammeCosts = (u.programCosts ?? []).filter(
          (item) => !item.pending && item.total > 0,
        );
        const bestWithinBudget = verifiedProgrammeCosts
          .filter((item) => item.total <= budget)
          .sort((a, b) => b.total - a.total)[0];
        const nearestAboveBudget = verifiedProgrammeCosts
          .filter((item) => item.total > budget)
          .sort((a, b) => a.total - b.total)[0];
        const subjectCost = programFilter
          ? matchingProgramCost(u, programFilter)
          : (bestWithinBudget ?? nearestAboveBudget);
        const fallbackReferenceTotal =
          !programFilter && !subjectCost ? u.totalCost : undefined;
        const matchedTotal = subjectCost?.pending
            ? undefined
            : (subjectCost?.total ??
              (programFilter === "CSE"
                ? u.totalCost
                : fallbackReferenceTotal));
        return {
          ...u,
          totalCost: matchedTotal,
          credits:
            subjectCost && subjectCost.credits > 0
              ? subjectCost.credits
              : u.credits,
          matchedProgram:
            subjectCost?.name ??
            (!programFilter && fallbackReferenceTotal !== undefined
              ? u.programs.includes("CSE")
                ? "CSE"
                : undefined
              : undefined),
          publishedMinimumCost: subjectCost?.minimum
            ? subjectCost.total
            : programFilter === "CSE"
              ? u.publishedMinimumCost
              : undefined,
          costLabel: subjectCost
            ? subjectCost.pending
              ? `${subjectCost.name} total verification pending`
              : subjectCost.discounted
                ? `${programFilter ? "Published" : "Best verified fit:"} ${subjectCost.name} discounted total`
                : subjectCost.minimum
                ? `${programFilter ? "Published" : "Best verified fit:"} ${subjectCost.name} minimum`
                : `${programFilter ? "Published" : "Best verified fit:"} ${subjectCost.name} total`
            : u.costLabel,
          gpaMet: u.minGpa === undefined ? null : gpa >= u.minGpa,
        };
      })
      .map((u) => {
        if (u.totalCost === undefined) return { ...u, score: null };
        const budgetDistance = Math.max(
          0,
          Math.round(((budget - u.totalCost) / budget) * 100),
        );
        const budgetFit = Math.max(0, 100 - budgetDistance);
        const eligibility = u.gpaMet === null ? 75 : u.gpaMet ? 100 : 0;
        const score = Math.round(55 + budgetFit * 0.3 + eligibility * 0.15);
        return { ...u, score };
      })
      .sort(
        (a, b) =>
          (b.gpaMet === true ? 2 : b.gpaMet === null ? 1 : 0) -
            (a.gpaMet === true ? 2 : a.gpaMet === null ? 1 : 0) ||
          Number(b.totalCost !== undefined) -
            Number(a.totalCost !== undefined) ||
          (b.score ?? -1) - (a.score ?? -1) ||
          (a.totalCost ?? Infinity) - (b.totalCost ?? Infinity) ||
          Number(b.status === "Official") - Number(a.status === "Official") ||
          a.name.localeCompare(b.name),
      );
  }, [programFilter, institutionTypeFilter, divisionFilter, districtFilter, areaFilter, budget, gpa]);
  const results = evaluatedResults.filter(
    (u) =>
      u.totalCost !== undefined && u.totalCost <= budget && u.gpaMet === true,
  );
  const displayResults = evaluatedResults.filter(
    (u) => u.totalCost === undefined || u.totalCost <= budget,
  );
  const sortedResults = useMemo(() => {
    const sorted = [...displayResults];
    const byMatchThenName = (
      a: (typeof displayResults)[number],
      b: (typeof displayResults)[number],
    ) =>
      Number(b.totalCost !== undefined) - Number(a.totalCost !== undefined) ||
      (b.score ?? -1) - (a.score ?? -1) ||
      a.name.localeCompare(b.name);
    if (sortBy === "price-asc") {
      return sorted.sort(
        (a, b) =>
          (a.totalCost ?? Infinity) - (b.totalCost ?? Infinity) ||
          byMatchThenName(a, b),
      );
    }
    if (sortBy === "price-desc") {
      return sorted.sort(
        (a, b) =>
          (b.totalCost ?? -Infinity) - (a.totalCost ?? -Infinity) ||
          byMatchThenName(a, b),
      );
    }
    return sorted.sort(byMatchThenName);
  }, [displayResults, sortBy]);
  const closestSuggestions = useMemo(() => {
    if (results.length) return [];
    return universities
      .filter((u) => !institutionTypeFilter || u.institutionType === institutionTypeFilter)
      .map((u) => {
        const nearestVerifiedProgramme = !programFilter
          ? (u.programCosts ?? [])
              .filter((item) => !item.pending && item.total > 0)
              .sort((a, b) => a.total - b.total)[0]
          : undefined;
        const subjectCost = programFilter
          ? matchingProgramCost(u, programFilter)
          : nearestVerifiedProgramme;
        const total = !programFilter
          ? (nearestVerifiedProgramme?.total ?? u.totalCost)
          : subjectCost?.pending
            ? undefined
            : (subjectCost?.total ??
              (programFilter === "CSE" ? u.totalCost : undefined));
        const reasons: string[] = [];
        let distance = 0;
        if (
          programFilter &&
          !u.programs.some((name) => programMatches(name, programFilter))
        ) {
          reasons.push(`${programFilter} is not verified`);
          distance += 50;
        }
        if (divisionFilter && u.division !== divisionFilter) {
          reasons.push(`in ${u.division} Division`);
          distance += 18;
        } else if (districtFilter && u.district !== districtFilter) {
          reasons.push(`in ${u.district} District`);
          distance += 10;
        } else if (areaFilter && u.area !== areaFilter) {
          reasons.push(`in ${u.area ?? u.district}`);
          distance += 5;
        }
        if (u.minGpa === undefined) {
          reasons.push("GPA rule pending");
          distance += 12;
        } else if (gpa < u.minGpa) {
          reasons.push(`needs GPA ${u.minGpa.toFixed(1)}`);
          distance += 20 + (u.minGpa - gpa) * 10;
        }
        if (total === undefined) {
          reasons.push("complete cost pending");
          distance += 16;
        } else if (total > budget) {
          reasons.push(`${money(total - budget)} over budget`);
          distance += 10 + Math.min(20, ((total - budget) / budget) * 20);
        }
        return {
          ...u,
          totalCost: total,
          credits:
            subjectCost && subjectCost.credits > 0
              ? subjectCost.credits
              : u.credits,
          matchedProgram: subjectCost?.name,
          costLabel: subjectCost
            ? `Nearest verified option: ${subjectCost.name} total`
            : u.costLabel,
          reasons,
          distance,
        };
      })
      .filter((u) => {
        const subjectClose =
          !programFilter ||
          u.programs.some((name) => programMatches(name, programFilter));
        const locationClose =
          (!divisionFilter || u.division === divisionFilter) &&
          (!districtFilter || u.district === districtFilter) &&
          (!areaFilter || u.area === areaFilter);
        const gpaClose = u.minGpa !== undefined && gpa >= u.minGpa - 0.5;
        const budgetClose =
          u.totalCost !== undefined &&
          u.totalCost <= budget + Math.max(150000, budget * 0.25);
        return subjectClose && locationClose && gpaClose && budgetClose;
      })
      .sort(
        (a, b) =>
          a.distance - b.distance ||
          Number(b.totalCost !== undefined) -
            Number(a.totalCost !== undefined) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, 3);
  }, [results.length, programFilter, institutionTypeFilter, divisionFilter, districtFilter, areaFilter, budget, gpa]);
  const confirmedWithinBudget = results.length;
  const pendingBudgetCheck = evaluatedResults.filter(
    (u) => u.totalCost === undefined,
  ).length;
  const gpaEligible = evaluatedResults.filter((u) => u.gpaMet === true).length;
  const gpaNotMet = evaluatedResults.filter((u) => u.gpaMet === false).length;
  const gpaPending = evaluatedResults.filter((u) => u.gpaMet === null).length;
  const activeSubject = programFilter || "programme";
  const publishedSubjectTotals = evaluatedResults.filter(
    (u) => u.totalCost !== undefined,
  ).length;
  useEffect(() => {
    if (!detail) return;
    const matchingFilteredProgram = programFilter
      ? detail.programs.find((name) => programMatches(name, programFilter))
      : undefined;
    const initialProgram =
      matchingFilteredProgram
        ? matchingFilteredProgram
        : detail.matchedProgram && detail.programs.includes(detail.matchedProgram)
          ? detail.matchedProgram
        : detail.programs.includes("CSE")
          ? "CSE"
          : (detail.programs[0] ?? "");
    // Reset the programme tab when a different university profile opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetailProgram(initialProgram);
  }, [detail, programFilter]);
  const selectedDetailProgram =
    detail?.programs.includes(detailProgram) === true
      ? detailProgram
      : (detail?.programs[0] ?? "");
  const selectedDetailCost = detail
    ? matchingProgramCost(detail, selectedDetailProgram)
    : undefined;
  const selectedDetailTotal = selectedDetailCost?.pending
    ? undefined
    : (selectedDetailCost?.total ??
      (selectedDetailProgram === "CSE" ? detail?.totalCost : undefined));
  const selected = calculatorUniversities.find((u) => u.id === calcId);
  const calculatorPrograms = selected
    ? [
        ...new Set([
          ...selected.programs,
          ...(selected.programCosts?.map((p) => p.name) ?? []),
        ]),
      ].sort((a, b) => a.localeCompare(b))
    : [];
  const selectedProgramCost = selected
    ? matchingProgramCost(selected, calcProgram)
    : undefined;
  const selectedFeeSource = selected?.sources?.find((source) =>
    /fee|tuition|financial|cost/i.test(source.label),
  );
  const calculatorBaseTotal = selectedProgramCost?.pending
    ? undefined
    : (selectedProgramCost?.total ??
      (calcProgram === "CSE" ? selected?.totalCost : undefined));
  const calculatorTuition =
    selectedProgramCost &&
    !selectedProgramCost.pending &&
    selectedProgramCost.credits > 0 &&
    selectedProgramCost.tuitionPerCredit > 0
      ? selectedProgramCost.credits * selectedProgramCost.tuitionPerCredit
      : calcProgram === "CSE" && !selectedProgramCost?.pending
        ? selected?.cost
        : undefined;
  const fullCost =
    calculatorBaseTotal === undefined
      ? undefined
      : calculatorBaseTotal - ((calculatorTuition ?? 0) * waiver) / 100;
  const chosen = compare
    .map((id) => universities.find((u) => u.id === id))
    .filter((u): u is University => Boolean(u))
    .map((u) => {
      if (!programFilter) {
        return evaluatedResults.find((result) => result.id === u.id) ?? u;
      }
      const programmeCost = matchingProgramCost(u, programFilter);
      const verifiedTotal = programmeCost?.pending
        ? undefined
        : (programmeCost?.total ??
          (programFilter === "CSE" ? u.totalCost : undefined));
      return {
        ...u,
        totalCost: verifiedTotal,
        credits:
          programmeCost && programmeCost.credits > 0
            ? programmeCost.credits
            : programFilter === "CSE"
              ? u.credits
              : undefined,
      };
    });
  const luResult = (() => {
    let result = ssc >= 3.5 && hsc >= 3.5 ? 10 : 0;
    if (ssc >= 4 && hsc >= 4) result = 15;
    if (ssc >= 4.5 && hsc >= 4.5) result = 25;
    if (ssc === 5 && hsc === 5) result = golden ? 60 : oneGolden ? 45 : 40;
    if (female) result = Math.max(result, 10);
    if (secondChild) result = Math.max(result, 30);
    return result;
  })();
  const gubResult =
    golden && ssc === 5 && hsc === 5
      ? {
          title: "Published highest result band",
          amount: 188750,
          note: "Green University publishes this CSE total for SSC and HSC GPA 5.00 with A+ in every subject.",
        }
      : hsc === 5 && golden
        ? {
            title: "Published HSC Golden GPA 5 band",
            amount: 620750,
            note: "Green University publishes this CSE total for HSC GPA 5.00 with A+ in every subject.",
          }
        : ssc + hsc === 10
          ? {
              title: "Published combined GPA 10 band",
              amount: 647750,
              note: "Green University publishes this CSE total for combined SSC and HSC GPA 10 including the fourth subject.",
            }
          : ssc + hsc >= 8
            ? {
                title: "Published combined GPA 8.00–9.99 band",
                amount: 674750,
                note: "Green University publishes this CSE total for combined SSC and HSC GPA from 8.00 to 9.99.",
              }
            : {
                title: "Base published CSE total",
                amount: 728750,
                note: "No published result band matches these entries; this is Green University's base CSE total before result-based waiver.",
              };
  const bracAidProfile = universities.find((u) => u.short === "BRACU");
  const bracAidCost = bracAidProfile
    ? matchingProgramCost(bracAidProfile, aidProgram)
    : undefined;
  const bracPublishedTuition =
    bracAidCost &&
    !bracAidCost.pending &&
    bracAidCost.credits > 0 &&
    bracAidCost.tuitionPerCredit > 0
      ? bracAidCost.credits * bracAidCost.tuitionPerCredit
      : undefined;
  const bracResult =
    bracAidCost &&
    !bracAidCost.pending &&
    bracPublishedTuition !== undefined
      ? golden && ssc === 5 && hsc === 5
        ? {
            title: "Published 25% entry tuition waiver",
            amount:
              bracAidCost.total - bracPublishedTuition * 0.25,
            note: `BRAC University's published 25% undergraduate entry waiver is applied only to the verified ${aidProgram} tuition component. The displayed amount keeps the programme's published fixed non-tuition charges; recurring semester fees and any admission-test-assigned courses remain extra, and continuation conditions apply.`,
          }
        : {
            title: `Published ${aidProgram} minimum before waiver`,
            amount: bracAidCost.total,
            note: `No verified academic-result entry band matches these selections. This is BRAC University's published fixed minimum for ${aidProgram}; recurring semester fees and any admission-test-assigned courses remain extra.`,
          }
      : {
          title: "Programme cost verification pending",
          amount: null,
          note: `BRAC University lists ${aidProgram || "this programme"}, but its full programme-specific tuition split is not complete enough for a responsible result-based total.`,
        };
  const uitsWaiver =
    golden && ssc === 5 && hsc === 5
      ? 100
      : ssc + hsc >= 10
        ? 40
        : ssc + hsc >= 9.5
          ? 30
          : ssc + hsc >= 9
            ? 20
            : ssc + hsc >= 8.5
              ? 15
              : ssc + hsc >= 8
                ? 10
                : 0;
  const uitsResult = {
    title: uitsWaiver
      ? `Published ${uitsWaiver}% entry tuition waiver`
      : "No published SSC/HSC waiver band",
    amount: 640200 - (576000 * uitsWaiver) / 100,
    note: `UITS applies this band to the ৳5,76,000 CSE tuition component. The published ৳64,200 admission and other fees remain payable. Award and continuation remain subject to the university policy.`,
  };
  const subWaiver =
    golden && ssc === 5 && hsc === 5
      ? 75
      : golden && hsc === 5
        ? 65
        : ssc === 5 && hsc === 5
          ? 60
          : hsc === 5
            ? 50
            : hsc >= 4.8
              ? 35
              : hsc >= 4.5
                ? 25
                : hsc >= 4
                  ? 15
                  : 0;
  const subResult = {
    title: subWaiver
      ? `Published ${subWaiver}% result scholarship`
      : "No published HSC result band",
    amount: 594000 - (357000 * subWaiver) / 100,
    note: "The waiver is applied only to SUB's published ৳3,57,000 tuition component. The remaining admission, semester, lab, ethics and transport charges stay included; continuation requires semester GPA 3.50.",
  };
  const wubResult =
    golden && ssc === 5 && hsc === 5
      ? {
          title: "Founder’s 100% tuition scholarship route",
          amount: 245500,
          note: "This leaves WUB's published ৳2,45,500 basic-fee component. The award requires GPA 5.00 in both exams without fourth subject and continuing academic, credit-load, attendance and conduct conditions.",
        }
      : {
          title: "Published base CSE total",
          amount: 714500,
          note: "No exact result-percentage band is published for these entries. Other WUB merit and need-based routes require individual assessment.",
        };
  const cubCombined = ssc + hsc;
  const cubResult =
    golden && ssc === 5 && hsc === 5
      ? {
          title: "Published Golden GPA 10 total",
          amount: 72000,
          note: "CUB publishes ৳72,000 as the payable CSE total for the Golden GPA 10 band; this equals its admission and registration fees after the tuition waiver.",
        }
      : cubCombined === 10
        ? {
            title: "Published 40% tuition-waiver total",
            amount: 369000,
            note: "CUB publishes this payable CSE total for combined GPA 10 without the Golden result condition.",
          }
        : cubCombined >= 9.5
          ? {
              title: "Published 25% tuition-waiver total",
              amount: 443250,
              note: "CUB publishes this payable total for combined SSC and HSC GPA 9.50–9.99.",
            }
          : cubCombined >= 9
            ? {
                title: "Published 20% tuition-waiver total",
                amount: 468000,
                note: "CUB publishes this payable total for combined SSC and HSC GPA 9.00–9.49.",
              }
            : cubCombined >= 8
              ? {
                  title: "Published 15% tuition-waiver total",
                  amount: 492750,
                  note: "CUB publishes this payable total for combined SSC and HSC GPA 8.00–8.99.",
                }
              : cubCombined >= 7.5
                ? {
                    title: "Published 10% tuition-waiver total",
                    amount: 517500,
                    note: "CUB publishes this payable total for combined SSC and HSC GPA 7.50–7.99.",
                  }
                : {
                    title: "Published base CSE total",
                    amount: 567000,
                    note: "No result band on CUB's Fall 2026 fee table matches these entries, so the full published CSE total is shown.",
                  };
  const siuCombinedGpa = ssc + hsc;
  const siuResult =
    siuCombinedGpa >= 10
      ? {
          title: "80% published tuition waiver",
          amount: 191400,
          note: "SIU's published CSE day-programme table applies this amount when SSC and HSC GPA are both 5.00.",
        }
      : siuCombinedGpa >= 9
        ? {
            title: "50% published tuition waiver",
            amount: 239400,
            note: "Published CSE day-programme total for combined SSC and HSC GPA 9.00–9.99.",
          }
        : siuCombinedGpa >= 8
          ? {
              title: "40% published tuition waiver",
              amount: 255400,
              note: "Published CSE day-programme total for combined SSC and HSC GPA 8.00–8.99.",
            }
          : siuCombinedGpa >= 7
            ? {
                title: "30% published tuition waiver",
                amount: 271400,
                note: "Published CSE day-programme total for combined SSC and HSC GPA 7.00–7.99.",
              }
            : siuCombinedGpa >= 6
              ? {
                  title: "25% published tuition waiver",
                  amount: 279400,
                  note: "Published CSE day-programme total for combined SSC and HSC GPA 6.00–6.99.",
                }
              : siuCombinedGpa >= 5
                ? {
                    title: "20% published tuition waiver",
                    amount: 287400,
                    note: "Published CSE day-programme total for combined SSC and HSC GPA 5.00–5.99.",
                  }
                : {
                    title: "Admission requirement not met",
                    amount: null,
                    note: "SIU requires at least GPA 2.50 separately in SSC and HSC for undergraduate admission.",
                  };
  const aidProfile = universities.find((u) => u.short === aidUniversity);
  const aidPrograms = aidProfile
    ? [...new Set(aidProfile.programs)].sort((a, b) => a.localeCompare(b))
    : [];
  const selectedAidCost = aidProfile
    ? matchingProgramCost(aidProfile, aidProgram)
    : undefined;
  const ewuPublishedTuition =
    aidProgram === "CSE"
      ? 904000
      : selectedAidCost &&
          !selectedAidCost.pending &&
          selectedAidCost.credits > 0 &&
          selectedAidCost.tuitionPerCredit > 0
        ? selectedAidCost.credits * selectedAidCost.tuitionPerCredit
        : undefined;
  const ewuResult =
    golden && ssc === 5 && hsc === 5
      ? {
          title: "Potential 100% tuition scholarship",
          amount:
            selectedAidCost &&
            !selectedAidCost.pending &&
            ewuPublishedTuition !== undefined
              ? Math.max(0, selectedAidCost.total - ewuPublishedTuition)
              : null,
          note: `Possible four-year tuition-free entry scholarship for ${aidProgram || "the selected programme"}. EWU requires A+ in every SSC and HSC subject, including the fourth subject; admission-test and continuation conditions apply.`,
        }
      : ssc === 5 && hsc === 5
        ? {
            title: "Potential 50% first-year tuition waiver",
            amount: null,
            note: "EWU limits this entry waiver to the first year, so a responsible full-degree total cannot be calculated without guessing first-year registered credits.",
          }
        : {
            title:
              admissionScore >= 75
                ? "Admission-test scholarship consideration"
                : "No published entry-band match",
            amount: null,
            note:
              admissionScore >= 75
                ? "A score of at least 75% can qualify top-position candidates for limited full tuition coverage across three semesters. Reaching 75% does not guarantee the award."
                : "EWU also publishes district, continuing-student and financial-assistance routes that require separate assessment.",
          };
  const aidSource = aidProfile?.sources?.find((source) =>
    /scholarship|waiver|financial aid/i.test(source.label),
  );
  const aidProfileSource =
    aidSource ??
    aidProfile?.sources?.find((source) =>
      /admission|programme|program|official university|university site/i.test(
        source.label,
      ),
    ) ??
    aidProfile?.sources?.[0];
  const supportsVerifiedResultInputs = [
    "LU",
    "GUB",
    "BRACU",
    "UITS",
    "SUBD",
    "WUB",
    "CUB",
    "EWU",
    "SIU",
    "AUB",
    "BUFT",
    "CU",
    "PAU",
    "FU",
    "KYAU",
    "BAUET",
    "RTM-AKTU",
    "SU",
    "NDUB",
    "FIU",
    "CCNUST",
    "CWU",
    "HUB",
    "RPSU",
    "IUS",
    "RUD",
  ].includes(aidUniversity);
  const aubCombinedGpa = ssc + hsc;
  const aubResult = golden && ssc === 5 && hsc === 5
    ? {
        title: "Published 100% scholarship route",
        amount: null,
        note: "AUB publishes a 100% scholarship route for Golden GPA in both SSC and HSC. Its calculator describes the entry benefit as an up-to-100% first-semester tuition waiver, so no full-degree payable total is inferred.",
      }
    : ssc === 5 && hsc === 5
      ? {
          title: "Published 50% entry-waiver route",
          amount: null,
          note: "AUB publishes a 50% waiver for GPA 5.00 in both SSC and HSC. The official calculator applies entry waivers to first-semester tuition, so the full-degree total remains unchanged here.",
        }
      : aubCombinedGpa >= 8
        ? {
            title: "Published 25% entry-waiver route",
            amount: null,
            note: "AUB publishes a 25% waiver for a combined GPA of at least 8.00 without the fourth subject. The full-degree payable amount is not calculated because the official route applies at entry level.",
          }
        : {
            title: "No published entry-band match",
            amount: null,
            note: "No AUB result-based entry-waiver band matches the entered SSC and HSC results. Other assistance routes may require a separate assessment.",
          };
  const buftResult = golden && ssc === 5 && hsc === 5
    ? {
        title: "Published 100% first-semester tuition waiver",
        amount: null,
        note: "BUFT publishes this entry route for GPA 5.00 in both SSC and HSC excluding the fourth subject. A payable amount is not calculated because the current public pages do not expose a complete programme fee total.",
      }
    : ssc === 5 && hsc === 5
      ? {
          title: "Published 25% first-semester tuition waiver",
          amount: null,
          note: "BUFT publishes this special entry route for GPA 5.00 in both examinations including the fourth subject. Programme-specific discounts and continuation conditions may also apply.",
        }
      : {
          title: "No published GPA entry-band match",
          amount: null,
          note: "No BUFT SSC/HSC entry-waiver band matches these results. Admission-test, programme, female-student, sibling, couple and other published categories require separate assessment.",
        };
  const cityCombinedGpa = ssc + hsc;
  const cityWaiver = golden && ssc === 5 && hsc === 5
    ? 100
    : ssc === 5 && hsc === 5
      ? 75
      : cityCombinedGpa >= 9
        ? 30
        : cityCombinedGpa >= 8
          ? 25
          : cityCombinedGpa >= 7
            ? 20
            : cityCombinedGpa >= 6
              ? 15
              : cityCombinedGpa >= 5
                ? 10
                : 0;
  const cityResult = {
    title: cityWaiver
      ? `Published ${cityWaiver}% tuition-waiver route`
      : "No published result-band match",
    amount: null,
    note: cityWaiver
      ? `City University publishes this entry waiver for the entered results. Its current programme fee table is image-based and has not been reconciled into a verified tuition component, so no payable total is calculated.`
      : "No City University SSC/HSC result band matches the entered values. Special-category waivers require separate assessment.",
  };
  const primeasiaPublishedTuition =
    selectedAidCost &&
    !selectedAidCost.pending &&
    selectedAidCost.credits > 0 &&
    selectedAidCost.tuitionPerCredit > 0
      ? selectedAidCost.credits * selectedAidCost.tuitionPerCredit
      : undefined;
  const primeasiaResult = golden && ssc === 5 && hsc === 5
    ? {
        title: "Published 100% tuition-waiver route",
        amount:
          selectedAidCost &&
          !selectedAidCost.pending &&
          primeasiaPublishedTuition !== undefined
            ? Math.max(0, selectedAidCost.total - primeasiaPublishedTuition)
            : null,
        note: `Primeasia publishes a 100% tuition-waiver route for Golden GPA 5.00 in both SSC and HSC. ${selectedAidCost?.pending ? "This programme's complete official total remains pending." : "Verified non-tuition charges remain payable; award and continuation conditions must be confirmed."}`,
      }
    : {
        title: "No verified SSC/HSC waiver total",
        amount: null,
        note: "Primeasia publishes programme and category-specific waivers, but no other university-wide SSC/HSC result band has been verified for a responsible payable-total calculation.",
      };
  const feniWaiver = golden && ssc === 5 && hsc === 5
    ? 100
    : ssc === 5 && hsc === 5
      ? 50
      : ssc >= 4.8 && hsc >= 4.8
        ? 30
        : ssc >= 4.5 && hsc >= 4.5
          ? 20
          : ssc >= 4 && hsc >= 4
            ? 10
            : ssc >= 3.5 && hsc >= 3.5
              ? 5
              : 0;
  const feniResult = {
    title: feniWaiver
      ? `Published ${feniWaiver}% tuition-waiver route`
      : "No published result-band match",
    amount: null,
    note: feniWaiver
      ? "Feni University publishes this band for the entered result in both SSC and HSC. Its 2026 table publishes complete programme totals without a separate tuition subtotal, so no payable total is inferred."
      : "No Feni University SSC/HSC result band matches both entered GPA values. Other assistance categories require separate assessment.",
  };
  const kyauCombinedGpa = ssc + hsc;
  const kyauResult = {
    title: kyauCombinedGpa >= 9
      ? "Published full-tuition quota eligibility"
      : "Published quota threshold not met",
    amount: null,
    note: kyauCombinedGpa >= 9
      ? "KYAU permits meritorious but financially disadvantaged applicants with combined SSC and HSC GPA 9.00 without the fourth subject to apply for its 3% full-tuition quota. Selection and financial-need approval are required; the published total has no tuition-only split, so no payable amount is inferred."
      : "KYAU's meritorious-and-poor quota requires combined SSC and HSC GPA 9.00 without the fourth subject, plus financial-need assessment. Other waiver eligibility requires separate review.",
  };
  const bauetResult = {
    title: ssc === 5 && hsc === 5
      ? "Published ৳25,000 result benefit"
      : "No published SSC/HSC result-band match",
    amount: null,
    note: ssc === 5 && hsc === 5
      ? "BAUET publishes a fixed ৳25,000 benefit for GPA 5.00 in both SSC and HSC. A payable total is not calculated because the notice does not state how this benefit combines with programme-specific waivers."
      : "BAUET's current intake notice publishes a result benefit only for GPA 5.00 in both SSC and HSC. Programme, sibling, Army-family and assessed-need waivers require separate eligibility review.",
  };
  const rtmCombinedGpa = ssc + hsc;
  const rtmResult = aidProgram === "Demography & Public Health"
    ? {
        title: rtmCombinedGpa >= 10
          ? "Published GPA 10 payable total"
          : rtmCombinedGpa >= 9
            ? "Published GPA 9 payable total"
            : "No published result-band match",
        amount: rtmCombinedGpa >= 10 ? 207600 : rtmCombinedGpa >= 9 ? 237750 : null,
        note: rtmCombinedGpa >= 9
          ? "RTM-AKTU publishes this full-programme amount specifically for Demography and Public Health. Award confirmation remains subject to the university's admission review."
          : "No Demography and Public Health GPA-waiver band matches the entered combined SSC and HSC result.",
      }
    : {
        title: "Current result-based calculation pending",
        amount: null,
        note: "RTM-AKTU's university-wide GPA discount text is explicitly tied to 2021 admissions, so it is not applied to this programme as a current waiver.",
      };
  const ndubPublishedTuition =
    selectedAidCost && !selectedAidCost.pending
      ? selectedAidCost.credits * selectedAidCost.tuitionPerCredit
      : undefined;
  const ndubResult = golden && ssc === 5 && hsc === 5
    ? {
        title: "Published 20% full-programme tuition scholarship",
        amount:
          selectedAidCost && ndubPublishedTuition !== undefined
            ? selectedAidCost.total - ndubPublishedTuition * 0.2
            : null,
        note: "NDUB publishes this route for Golden GPA 5.00 in both SSC and HSC. It applies to tuition only and requires CGPA 3.70 for continuation; admission and semester fees remain payable.",
      }
    : ssc === 5 && hsc === 5
      ? {
          title: "Published 50% first-semester tuition scholarship",
          amount: null,
          note: "NDUB publishes this award for GPA 5.00 in both SSC and HSC. No full-degree payable total is inferred because the official fee table does not allocate credits by semester.",
        }
      : {
          title: "No published SSC/HSC merit-band match",
          amount: null,
          note: "NDUB also publishes missionary-school, sibling, disability, employee-family and assessed-need routes that require separate eligibility review.",
        };
  const hubCombinedGpa = ssc + hsc;
  const hubWaiver = hubCombinedGpa >= 10
    ? 100
    : hubCombinedGpa >= 9.5
      ? 40
      : hubCombinedGpa >= 9
        ? 30
        : hubCombinedGpa >= 8.5
          ? 20
          : hubCombinedGpa >= 8
            ? 15
            : hubCombinedGpa >= 7
              ? 10
              : 0;
  const hubTuitionByProgram: Record<string, number> = {
    CSE: 360000,
    EEE: 310000,
    Mathematics: 148050,
    BBA: 282000,
    English: 224000,
    Economics: 154000,
    "Islamic Studies": 100800,
  };
  const hubPublishedTuition = hubTuitionByProgram[aidProgram];
  const hubResult = hubWaiver
    ? {
        title: `Published ${hubWaiver}% tuition-waiver route`,
        amount:
          selectedAidCost &&
          !selectedAidCost.pending &&
          hubPublishedTuition !== undefined
            ? selectedAidCost.total - hubPublishedTuition * (hubWaiver / 100)
            : null,
        note: hubPublishedTuition !== undefined
          ? "HUB applies this combined SSC and HSC GPA band to tuition only. The displayed amount retains the university-published other fees; continuation is subject to the published semester-result policy. Enter both GPAs without the fourth subject."
          : "HUB publishes this result band, but the selected programme does not yet have a complete verified tuition and other-fee split, so no payable total is calculated.",
      }
    : {
        title: "No published result-band match",
        amount: null,
        note: "HUB's published merit table begins at a combined SSC and HSC GPA of 7.00, calculated without the fourth subject. Other special-category waivers require separate review.",
      };
  const rpsuWaiver = hsc >= 5
    ? 40
    : hsc >= 4.9
      ? 25
      : hsc >= 4.8
        ? 20
        : hsc >= 4.5
          ? 15
          : hsc >= 4
            ? 10
            : 0;
  const rpsuPublishedTuition =
    selectedAidCost && !selectedAidCost.pending
      ? selectedAidCost.credits * selectedAidCost.tuitionPerCredit
      : undefined;
  const rpsuResult = rpsuWaiver
    ? {
        title: `Published ${rpsuWaiver}% fixed tuition-waiver route`,
        amount:
          selectedAidCost && rpsuPublishedTuition !== undefined
            ? selectedAidCost.total - rpsuPublishedTuition * (rpsuWaiver / 100)
            : null,
        note: "RPSU bases this entry band on HSC GPA and applies it only to tuition fees. The displayed amount retains admission, semester and applicable lab fees; continuation conditions apply.",
      }
    : {
        title: "No published HSC merit-band match",
        amount: null,
        note: "RPSU's published fixed entry-waiver table begins at HSC GPA 4.00. Continuing-student and special-category awards require separate eligibility review.",
      };
  const calculatedAidResult =
    aidUniversity === "RPSU"
      ? rpsuResult
      : aidUniversity === "HUB"
      ? hubResult
      : aidUniversity === "NDUB"
        ? ndubResult
        : aidUniversity === "RTM-AKTU"
          ? rtmResult
          : aidUniversity === "BAUET"
            ? bauetResult
            : aidUniversity === "KYAU"
              ? kyauResult
              : aidUniversity === "FU"
                ? feniResult
                : aidUniversity === "PAU"
                  ? primeasiaResult
                  : aidUniversity === "CU"
                    ? cityResult
                    : aidUniversity === "BUFT"
                      ? buftResult
                      : aidUniversity === "AUB"
                        ? aubResult
                        : aidUniversity === "LU"
                          ? {
          title: luResult
            ? `${luResult}% potential tuition waiver`
            : "No published result-band match",
          amount: 515764 - (360000 * luResult) / 100,
          note: "Leading University applies only the highest applicable waiver. This estimate subtracts the waiver from its published ৳3,60,000 CSE tuition component.",
        }
      : aidUniversity === "GUB"
        ? gubResult
        : aidUniversity === "BRACU"
          ? bracResult
          : aidUniversity === "UITS"
            ? uitsResult
            : aidUniversity === "SUBD"
              ? subResult
              : aidUniversity === "WUB"
                ? wubResult
                : aidUniversity === "CUB"
                  ? cubResult
                  : aidUniversity === "EWU"
                    ? ewuResult
                    : aidUniversity === "SIU"
                      ? siuResult
                      : {
                        title: aidProfile?.scholarships?.length
                          ? "Published scholarship routes available"
                          : "Scholarship verification pending",
                        amount: null,
                        note: aidProfile?.scholarships?.length
                          ? `${aidProfile.name} publishes the routes listed below, but its current result bands and fee components are not complete enough for a responsible payable-total calculation.`
                          : `${aidProfile?.name ?? "This university"} is included, but a current official scholarship policy has not yet been verified.`,
                      };
  const aidResult = aidProfile && aidPrograms.length === 0
    ? {
        title: "Programme catalogue verification pending",
        amount: null,
        note: `${aidProfile.name} remains searchable, but no subject or scholarship amount will be shown until its current official undergraduate catalogue is verified.`,
      }
    : !aidProgram
    ? {
        title: "Select a subject",
        amount: null,
        note: "Choose the programme you want to study so the scholarship result can use its matching published cost.",
      }
    : aidProgram === "CSE" || ["BRACU", "EWU", "AUB", "BUFT", "CU", "PAU", "FU", "KYAU", "BAUET", "BAUST", "RTM-AKTU", "SU", "NDUB", "FIU", "CCNUST", "CWU", "HUB", "RPSU", "IUS", "RUD"].includes(aidUniversity)
      ? calculatedAidResult
      : {
          title: "Programme-specific calculation pending",
          amount: null,
          note: `${aidProgram} is available for selection, but a payable scholarship total will appear only after this university's programme-specific fee components and waiver application are verified.`,
        };
  const toggle = (id: number) =>
    setCompare((c) =>
      c.includes(id)
        ? c.filter((x) => x !== id)
        : c.length < 3
          ? [...c, id]
          : c,
    );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("universe-bd-shortlist");
        if (saved) {
          const parsed = JSON.parse(saved) as {
            ids?: number[];
            stages?: Record<number, "researching" | "ready" | "applied">;
          };
          setCompare(
            (parsed.ids ?? [])
              .filter((id) => universities.some((university) => university.id === id))
              .slice(0, 3),
          );
          setShortlistStages(parsed.stages ?? {});
        }
      } catch {
        // Ignore damaged browser storage and begin with a clean shortlist.
      } finally {
        setShortlistLoaded(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shortlistLoaded) return;
    window.localStorage.setItem(
      "universe-bd-shortlist",
      JSON.stringify({ ids: compare, stages: shortlistStages }),
    );
  }, [compare, shortlistLoaded, shortlistStages]);

  return (
    <main className="soft-dark min-h-screen bg-[#101827] text-slate-100">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-700/70 bg-[#101827]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-2 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="logo-mark" aria-hidden="true">
              <i>U</i>
              <em>BD</em>
            </span>
            <span>
              <b className="block leading-5">UniVerse BD</b>
              <small className="text-xs text-slate-400">
                University decision guide
              </small>
            </span>
          </a>
          <div className="order-3 w-full md:order-none md:w-72 lg:w-80">
            <Combobox
              items={universitySearchResults.map(
                (u) => `${u.name} (${u.short})`,
              )}
              value={universityLookup}
              inputValue={universitySearch}
              onInputValueChange={(value) => setUniversitySearch(value)}
              onValueChange={(value) => {
                if (!value) {
                  setUniversityLookup("");
                  return;
                }
                setUniversityLookup(value);
                setUniversitySearch(value);
                const found = universities.find(
                  (u) => `${u.name} (${u.short})` === value,
                );
                if (found) {
                  setDirectProfile(true);
                  setDetail(found);
                }
              }}
            >
              <ComboboxInput
                aria-label="Search the complete university directory"
                placeholder="Search any university…"
                className="search-select"
              />
              <ComboboxContent className="max-h-72 w-[var(--anchor-width)] border border-slate-500 bg-[#0f1928] text-slate-100 shadow-2xl shadow-black/50">
                <ComboboxEmpty>No university found</ComboboxEmpty>
                <ComboboxList className="max-h-72 overscroll-contain">
                  {universitySearchResults.map((u) => (
                    <ComboboxItem
                      key={u.id}
                      value={`${u.name} (${u.short})`}
                      className="data-highlighted:bg-blue-500/20 data-highlighted:text-white"
                    >
                      <span className="font-semibold">{u.name}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {u.short} · {u.district}
                      </span>
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <nav className="hidden gap-5 text-sm font-semibold text-slate-300 xl:flex">
            <a href="#universities">Universities</a>
            <a href="#shortlist">My shortlist</a>
            <a href="#living-cost">Cost plan</a>
            <a href="#scholarship">Funding</a>
            <a href="#readiness">Admission readiness</a>
            <a href="#about">About</a>
          </nav>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            aria-label={`Open comparison with ${compare.length} selected ${compare.length === 1 ? "university" : "universities"}`}
            className="flex items-center gap-2 rounded-lg border border-slate-600 bg-[#172337] px-3 py-2 text-sm font-semibold text-slate-200 hover:border-blue-400"
          >
            <GitCompareArrows size={16} /> Compare{" "}
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
              {compare.length}
            </span>
          </button>
        </div>
      </header>

      <section id="main-content" tabIndex={-1} className="border-b border-slate-700/70 bg-[#121c2b] outline-none">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold text-blue-400">
              PRIVATE UNIVERSITY FINDER
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-[-.035em] sm:text-5xl">
              Find a university with less confusion.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Official-source facts, clear verification dates and no hidden
              guesses—built to make a stressful decision easier.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-blue-400" />
                Official sources linked
              </span>
              <span className="flex items-center gap-2">
                <CircleDollarSign size={17} className="text-blue-400" />
                Only published fees shown
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
            <h2 className="text-xl font-bold">Tell us what you need</h2>
            <p className="mt-1 text-sm text-slate-400">
              Your filters update the recommendations below.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <SearchSelect
                label="Programme"
                placeholder="Search programme…"
                value={program}
                options={["All programmes", ...programOptions]}
                onChange={(value) => {
                  setProgram(value);
                  setVisible(9);
                }}
              />
              <SearchSelect
                label="Institution type"
                placeholder="Search institution type…"
                value={institutionType}
                options={["All institution types", "Public", "Private"]}
                onChange={(value) => {
                  if (value === "Public") {
                    router.push("/public-universities");
                    return;
                  }
                  setInstitutionType(value);
                  setVisible(9);
                }}
              />
              <SearchSelect
                label="Division"
                placeholder="Search division…"
                value={division}
                options={[
                  "All divisions",
                  "Dhaka",
                  "Chattogram",
                  "Sylhet",
                  "Rajshahi",
                  "Khulna",
                  "Barishal",
                  "Rangpur",
                  "Mymensingh",
                ]}
                onChange={(value) => {
                  setDivision(value);
                  setDistrict("");
                  setArea("");
                  setVisible(9);
                }}
              />
              <Field label="Maximum budget" value={money(budget)}>
                <input
                  type="range"
                  aria-label="Maximum budget"
                  aria-valuetext={`${money(budget)} maximum total academic budget`}
                  min="200000"
                  max="2000000"
                  step="50000"
                  value={budget}
                  onChange={(e) => {
                    setBudget(Number(e.target.value));
                    setVisible(9);
                  }}
                />
                <span className="mt-2 flex justify-between text-xs text-slate-500" aria-hidden="true">
                  <span>৳2 lakh</span>
                  <span>৳10 lakh</span>
                  <span>৳20 lakh</span>
                </span>
              </Field>
              <ExactGpaField
                label="Academic GPA"
                value={gpa}
                onChange={(value) => {
                  setGpa(value);
                  setVisible(9);
                }}
              />
              <details className="group rounded-xl border border-slate-700 bg-[#111b2a]/60 sm:col-span-2">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  <span>
                    More location filters
                    {(districtFilter || areaFilter) && (
                      <small className="ml-2 rounded-full bg-blue-400/15 px-2 py-1 text-blue-200">
                        Active
                      </small>
                    )}
                  </span>
                  <span className="text-slate-400 transition group-open:rotate-180" aria-hidden="true">⌄</span>
                </summary>
                <div className="grid gap-5 border-t border-slate-700 p-4 sm:grid-cols-2">
                  <SearchSelect
                    label="District"
                    placeholder="Search district…"
                    value={district}
                    options={["All districts", ...districtOptions]}
                    onChange={(value) => {
                      setDistrict(value);
                      setArea("");
                      setVisible(9);
                    }}
                  />
                  <SearchSelect
                    label="Area"
                    placeholder="Search area…"
                    value={area}
                    options={["All areas", ...areaOptions]}
                    onChange={(value) => {
                      setArea(value);
                      setVisible(9);
                    }}
                  />
                </div>
              </details>
            </div>
            <div className="mt-5 flex items-center justify-end border-t border-slate-700/70 pt-4">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!filtersChanged}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset all filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Page sections" className="border-b border-slate-700 bg-[#0d1522] xl:hidden">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Start here</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["1. Find", "#universities"],
              ["2. Shortlist", "#shortlist"],
              ["3. Plan costs", "#living-cost"],
              ["4. Check admission", "#readiness"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="flex min-h-11 items-center justify-center rounded-lg border border-slate-700 bg-[#172337] px-3 py-2 text-center text-sm font-semibold text-slate-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                {label}
              </a>
            ))}
          </div>
          <details className="group mt-2 rounded-lg border border-slate-800 bg-[#111b2a]/60">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              More tools
              <span className="text-slate-500 transition group-open:rotate-180" aria-hidden="true">⌄</span>
            </summary>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-800 p-2 sm:grid-cols-4">
              {[
                ["Funding", "#scholarship"],
                ["Grade charts", "#grades"],
                ["Data policy", "#about"],
                ["About", "#about"],
              ].map(([label, href]) => (
                <a key={href} href={href} className="flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-center text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  {label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </nav>

      <section
        id="universities"
        className="mx-auto max-w-7xl px-5 py-14 lg:px-8"
      >
        <div>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-blue-400">
                UNIVERSITY RESULTS
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {!programFilter
                  ? "University options"
                  : `${programFilter} options`} within{" "}
                {money(budget)}
              </h2>
              <div
                className="mt-3 text-sm"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="text-slate-300">
                  <b className="text-emerald-300">{confirmedWithinBudget} verified options</b>
                  {pendingBudgetCheck > 0 && <> · {pendingBudgetCheck} costs still being checked</>}
                </p>
                <details className="mt-2 w-fit text-xs text-slate-400">
                  <summary className="min-h-8 cursor-pointer py-1 font-semibold text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                    View eligibility summary
                  </summary>
                  <p className="mt-1 leading-5">
                    {gpaEligible} GPA met · {gpaNotMet} not met · {gpaPending} pending · {universities.length} private universities indexed
                  </p>
                </details>
              </div>
            </div>
            <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-slate-300">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(
                    event.target.value as "match" | "price-asc" | "price-desc",
                  );
                  setVisible(9);
                }}
                className="h-11 rounded-lg border border-slate-600 bg-[#111b2a] px-3 text-sm text-slate-100 outline-none focus:border-blue-400"
              >
                <option value="match">Best match</option>
                <option value="price-desc">Highest tuition first</option>
                <option value="price-asc">Lowest tuition first</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-slate-800 py-3 text-sm">
          <span className="inline-flex items-center gap-2 text-slate-400">
            <ShieldCheck size={15} className="text-emerald-400" />
            <b className="text-slate-200">{publishedSubjectTotals} verified</b>
            {programFilter
              ? ` ${activeSubject} totals in these filters · others pending`
              : " reference totals in these filters · programme-specific amounts vary"}
          </span>
          <a
            href="https://www.ugc-universities.gov.bd/private-universities"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-300 hover:text-blue-200"
          >
            UGC directory <ExternalLink size={13} />
          </a>
        </div>
        {displayResults.length === 0 ? (
          <div className="mt-4">
            <div className="rounded-lg border border-slate-600 bg-slate-800/40 px-4 py-3 text-sm leading-6 text-slate-200">
              <b>No university meets every selected requirement.</b> Results
              with an unknown cost or admission rule are not presented as
              matches.
            </div>
            {closestSuggestions.length > 0 && (
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-100">
                  Closest alternatives
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  These are suggestions only. Each card explains what does not
                  match.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {closestSuggestions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setDirectProfile(false);
                        setDetail(u);
                      }}
                      className="rounded-xl border border-slate-700 bg-[#172337] p-4 text-left transition hover:border-blue-400"
                    >
                      <div className="flex items-start gap-3">
                        <UniversityMark university={u} />
                        <div>
                          <b className="block text-slate-100">{u.name}</b>
                          <span className="mt-1 block text-sm text-slate-400">
                            {u.area ?? u.district}, {u.division}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {u.reasons.slice(0, 3).map((reason) => (
                          <span
                            key={reason}
                            className="rounded-md bg-amber-400/10 px-2 py-1 text-xs text-amber-200"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          results.length === 0 && (
            <div className="mt-4 rounded-lg border border-amber-400/25 bg-amber-300/5 px-4 py-3 text-sm leading-6 text-amber-100">
              <b>No university below meets every selected requirement.</b>{" "}
              Relevant universities remain visible so you can see whether the
              blocker is GPA eligibility or a cost that still needs verification.
            </div>
          )
        )}
        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sortedResults.slice(0, visible).map((u) => (
            <article
              key={u.id}
              className="flex h-full flex-col rounded-xl border border-slate-700 bg-[#172337] p-4 shadow-sm transition hover:border-blue-500/70 sm:p-5"
            >
              <div className="flex items-start justify-between">
                <UniversityMark university={u} />
                <div className="text-right">
                  {u.gpaMet === false ? (
                    <span className="rounded-full bg-rose-400/10 px-2.5 py-1 text-xs font-semibold text-rose-300">
                      GPA NOT MET
                    </span>
                  ) : u.gpaMet === null ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.status === "Official" ? "bg-amber-400/10 text-amber-200" : "bg-slate-700 text-slate-300"}`}
                    >
                      {u.status === "Official" ? "GPA PENDING" : "DIRECTORY"}
                    </span>
                  ) : u.score === null ? (
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      GPA MET
                    </span>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-slate-400">
                        MATCH
                      </span>
                      <b className="block text-2xl text-blue-400">{u.score}%</b>
                    </>
                  )}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-bold leading-6 sm:min-h-12">
                {u.name}
              </h3>
              <span className="mb-3 w-fit rounded-full bg-slate-700/70 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {u.institutionType ?? "Private"} university
              </span>
              {u.gpaMet === false && (
                <div className="mb-3 rounded-lg border border-rose-400/25 bg-rose-400/5 px-3 py-2 text-sm text-rose-200">
                  Your GPA {gpa.toFixed(1)} does not meet the verified minimum
                  of {u.minGpa?.toFixed(1)}.
                </div>
              )}
              {u.gpaMet === true && (
                <div className="mb-3 text-xs font-semibold text-emerald-300">
                  GPA requirement met · minimum {u.minGpa?.toFixed(1)}
                </div>
              )}
              <div className="mt-2 flex items-start gap-1.5 text-sm text-slate-400 sm:min-h-8">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>
                  <b className="font-medium text-slate-300">
                    {u.area ? `${u.area}, ${u.district}` : u.district}
                  </b>
                  <span className="text-slate-500"> · {u.division} Division</span>
                </span>
              </div>
              <div className="mt-4 flex min-h-7 flex-wrap gap-2">
                {u.programs.length ? (
                  <>
                  {[
                    ...(u.matchedProgram ? [u.matchedProgram] : []),
                    ...u.programs.filter((p) => p !== u.matchedProgram),
                  ].slice(0, 2).map((p) => (
                    <span
                      key={p}
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${p === u.matchedProgram ? "bg-blue-400/15 text-blue-200 ring-1 ring-blue-400/30" : "bg-slate-700/70 text-slate-300"}`}
                    >
                      {p === u.matchedProgram && !programFilter
                        ? `${p} · budget fit`
                        : p}
                    </span>
                  ))}
                  {u.programs.length > 2 && (
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-400">
                      +{u.programs.length - 2} more
                    </span>
                  )}
                  </>
                ) : (
                  <span className="text-xs text-slate-500">
                    Program verification queued
                  </span>
                )}
              </div>
              <div className="mt-auto border-t border-slate-700 pt-4">
                <span className="text-xs text-slate-400">
                  {u.totalCost !== undefined
                    ? (u.costLabel ?? `Verified ${activeSubject} total`)
                    : u.publishedMinimumCost !== undefined
                      ? "Verified published minimum"
                      : `${activeSubject} total cost`}
                </span>
                <b
                  className={`mt-1 block ${u.totalCost !== undefined ? "text-xl text-blue-300" : "text-base text-slate-300"}`}
                >
                  {u.totalCost !== undefined
                    ? money(u.totalCost)
                    : u.publishedMinimumCost !== undefined
                      ? `${money(u.publishedMinimumCost)}+`
                      : "Cost verification pending"}
                </b>
                {u.totalCost === undefined && (
                  <small className="mt-1 block text-xs text-amber-200/80">
                    {u.publishedMinimumCost !== undefined
                      ? "Final amount varies; not treated as confirmed affordable"
                      : "Not confirmed within your selected budget"}
                  </small>
                )}
                {u.status === "Official" && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                    <ShieldCheck size={13} /> Checked {u.verifiedAt}
                  </span>
                )}
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDirectProfile(false);
                    setDetail(u);
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#173b68] px-3 py-2.5 text-sm font-semibold text-white"
                >
                  View details <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(u.id)}
                  aria-label={`${compare.includes(u.id) ? "Remove" : "Add"} ${u.name} ${compare.includes(u.id) ? "from" : "to"} comparison`}
                  aria-pressed={compare.includes(u.id)}
                  className={`grid size-11 place-items-center rounded-lg border transition ${compare.includes(u.id) ? "border-blue-400 bg-blue-400/15 text-blue-200" : "border-slate-600 text-slate-300 hover:border-blue-400 hover:text-blue-200"}`}
                >
                  {compare.includes(u.id) ? (
                    <Check size={17} />
                  ) : (
                    <GitCompareArrows size={17} />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
        {visible < sortedResults.length && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + 9)}
              className="min-h-11 rounded-lg border border-slate-600 bg-[#172337] px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-blue-400"
            >
              Show more · {sortedResults.length - visible} remaining
            </button>
          </div>
        )}
      </section>

      <section id="shortlist" className="border-y border-slate-700 bg-[#121c2b]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-400">MY SHORTLIST</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Keep your top choices in one place.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Save up to three universities for comparison and track whether you are researching, ready to apply or already applied. This shortlist stays in this browser.
              </p>
            </div>
            {compare.length >= 2 && (
              <button type="button" onClick={() => setCompareOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#173b68] px-4 py-2.5 text-sm font-semibold text-white">
                <GitCompareArrows size={16} aria-hidden="true" /> Compare saved choices
              </button>
            )}
          </div>
          {compare.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {compare.map((id) => universities.find((university) => university.id === id)).filter((university): university is University => Boolean(university)).map((university) => (
                <article key={university.id} className="rounded-xl border border-slate-700 bg-[#172337] p-5">
                  <div className="flex items-start gap-3">
                    <UniversityMark university={university} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-100">{university.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{university.district} · {university.programs.length} programmes listed</p>
                    </div>
                  </div>
                  <label className="mt-5 block text-sm font-semibold text-slate-300">
                    Application stage
                    <select
                      value={shortlistStages[university.id] ?? "researching"}
                      onChange={(event) => setShortlistStages((current) => ({ ...current, [university.id]: event.target.value as "researching" | "ready" | "applied" }))}
                      className="field mt-2"
                    >
                      <option value="researching">Researching</option>
                      <option value="ready">Ready to apply</option>
                      <option value="applied">Applied</option>
                    </select>
                  </label>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => { setDirectProfile(true); setDetail(university); }} className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-blue-400">View profile</button>
                    <button type="button" onClick={() => toggle(university.id)} className="rounded-lg border border-rose-400/30 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-400/10" aria-label={`Remove ${university.name} from shortlist`}>Remove</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-600 bg-[#111b2a] p-8 text-center">
              <BookmarkCheck className="mx-auto text-slate-500" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-slate-200">Your shortlist is empty</h3>
              <p className="mt-2 text-sm text-slate-400">Use the comparison button on a university card to save it here.</p>
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-500">Shortlist information is stored only in this browser. Clearing browser data or using another device will remove it.</p>
        </div>
      </section>

      <section
        id="calculator"
        className="border-y border-slate-700 bg-[#121c2b]"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
          <div>
            <p className="text-sm font-bold text-blue-400">COST CALCULATOR</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Plan the complete study cost.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Combine tuition, admission, laboratory and semester fees. Adjust
              the possible tuition waiver to understand its impact.
            </p>
            <p className="mt-4 text-sm font-semibold text-emerald-300">
              {verifiedCalculatorUniversities} universities currently have at
              least one verified programme total.
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              All {universities.length} directory profiles and their listed
              programmes remain searchable; unverified costs are clearly
              marked pending.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <SearchSelect
                label="University"
                value={selected ? `${selected.short} — ${selected.name}` : ""}
                options={calculatorUniversityOptions}
                onChange={(value) => {
                  const next = calculatorUniversities.find(
                    (u) => `${u.short} — ${u.name}` === value,
                  );
                  if (!next) return;
                  setCalcId(next.id);
                  setCalcProgram("");
                  setWaiver(0);
                }}
              />
              <SearchSelect
                label="Subject"
                value={calcProgram}
                options={calculatorPrograms}
                onChange={(value) => {
                  setCalcProgram(value);
                  setWaiver(0);
                }}
              />
              <Field
                label="Explore tuition waiver"
                value={
                  calculatorTuition !== undefined
                    ? `${waiver}%`
                    : "Tuition split unavailable"
                }
              >
                <input
                  disabled={calculatorTuition === undefined}
                  type="range"
                  aria-label="Explore tuition waiver"
                  min="0"
                  max="100"
                  step="5"
                  value={calculatorTuition === undefined ? 0 : waiver}
                  onChange={(e) => setWaiver(Number(e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Cost
                label={
                  selectedProgramCost?.pending
                    ? "Total verification pending"
                    : selectedProgramCost?.discounted
                    ? "Published discounted total"
                    : selectedProgramCost?.minimum
                    ? "Published minimum"
                    : "Published total"
                }
                value={calculatorBaseTotal}
              />
              <Cost label="Published tuition" value={calculatorTuition} />
              <Cost
                label="Tuition after waiver"
                value={
                  calculatorTuition === undefined
                    ? undefined
                    : calculatorTuition * (1 - waiver / 100)
                }
              />
              <Info
                label="Programme credits"
                value={
                  selectedProgramCost?.credits
                    ? String(selectedProgramCost.credits)
                    : !selectedProgramCost &&
                        calcProgram === "CSE" &&
                        selected?.credits
                      ? String(selected.credits)
                      : selected
                        ? "See official curriculum"
                        : "Select a university"
                }
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-700 pt-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {selected && calcProgram
                    ? `Estimated payable total for ${calcProgram}`
                    : "Choose a university and subject"}
                </p>
                <p className="mt-1 text-3xl font-bold text-blue-300">
                  {fullCost === undefined
                    ? "Cost verification pending"
                    : money(fullCost)}
                </p>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-400">
                A waiver changes only a separately verified tuition component.
                Published totals without a tuition split remain unchanged.
                Confirm the awarded percentage before payment.
              </p>
            </div>
            {selected?.status === "Directory" && (
              <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-300/5 px-4 py-3 text-sm leading-6 text-amber-100">
                This university is included in the directory. Its programme
                costs are still being verified from official sources.
              </div>
            )}
            {selected && calcProgram && calculatorBaseTotal === undefined && (
              <div className="mt-4 flex flex-col gap-2 rounded-lg border border-amber-400/20 bg-amber-300/5 px-4 py-3 text-sm leading-6 text-amber-100 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  This programme is selectable, but its complete official cost
                  has not yet been verified. No estimate has been inserted.
                </span>
                {selectedFeeSource && (
                  <a
                    href={selectedFeeSource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 font-semibold text-blue-300 hover:text-blue-200"
                  >
                    Check official fees ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="living-cost" className="border-y border-slate-700 bg-[#121c2b]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-sm font-bold text-blue-400">TOTAL STUDENT BUDGET</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Add living costs to the study plan.
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Compare university hall, private hostel, shared mess and family or rented-flat living. Results are monthly and full-study ranges—not fixed promises.
              </p>
              <div className="mt-5 rounded-lg border border-amber-400/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
                Hall availability and seat allocation must be confirmed by the university. Selecting “University hall” estimates cost only; it does not claim that a hall or seat is available.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <SearchSelect
                  label="University"
                  placeholder="Search university…"
                  value={livingUniversity}
                  options={directoryUniversityOptions}
                  onChange={(value) => {
                    setLivingUniversity(value);
                    setLivingProgram("");
                  }}
                />
                {livingPrograms.length ? (
                  <SearchSelect
                    label="Programme"
                    placeholder="Search programme…"
                    value={livingProgram}
                    options={livingPrograms}
                    onChange={setLivingProgram}
                  />
                ) : (
                  <Info label="Programme" value="Select a university" />
                )}
                <SearchSelect
                  label="Living arrangement"
                  value={accommodationLabels[accommodationMode]}
                  options={Object.values(accommodationLabels)}
                  onChange={(value) => {
                    const mode = (Object.entries(accommodationLabels).find(([, label]) => label === value)?.[0] ?? "mess") as AccommodationMode;
                    setAccommodationMode(mode);
                  }}
                />
                <Field label="Study period" value={`${studyMonths} months`}>
                  <input
                    type="range"
                    aria-label="Study period in months"
                    min="12"
                    max="72"
                    step="6"
                    value={studyMonths}
                    onChange={(event) => setStudyMonths(Number(event.target.value))}
                  />
                </Field>
                <Field label="Possible annual fee increase" value={`${annualFeeIncrease}%`}>
                  <input
                    type="range"
                    aria-label="Possible annual academic fee increase"
                    min="0"
                    max="15"
                    step="1"
                    value={annualFeeIncrease}
                    onChange={(event) => setAnnualFeeIncrease(Number(event.target.value))}
                  />
                </Field>
                <Field
                  label="Expected tuition scholarship"
                  value={livingTuitionBase === undefined ? "Tuition split required" : `${planningScholarship}%`}
                >
                  <input
                    type="range"
                    aria-label="Expected tuition scholarship percentage"
                    disabled={livingTuitionBase === undefined}
                    min="0"
                    max="100"
                    step="5"
                    value={livingTuitionBase === undefined ? 0 : planningScholarship}
                    onChange={(event) => setPlanningScholarship(Number(event.target.value))}
                  />
                </Field>
                <Field label="Safety allowance" value={`${contingency}%`}>
                  <input
                    type="range"
                    aria-label="Contingency safety allowance percentage"
                    min="0"
                    max="20"
                    step="1"
                    value={contingency}
                    onChange={(event) => setContingency(Number(event.target.value))}
                  />
                </Field>
                <Info
                  label="Location model"
                  value={livingProfile ? `${livingProfile.district}, ${livingProfile.division}` : "Select a university"}
                />
              </div>

              {livingProfile ? (
                <div className="mt-6" aria-live="polite">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-400/10 p-5">
                      <WalletCards className="text-blue-300" aria-hidden="true" />
                      <p className="mt-3 text-sm text-blue-200">Probable monthly living cost</p>
                      <p className="mt-1 text-2xl font-bold text-blue-100">
                        {money(livingMonthlyLow)}–{money(livingMonthlyHigh)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-400/10 p-5">
                      {accommodationMode === "hall" ? <Building2 className="text-emerald-300" aria-hidden="true" /> : <House className="text-emerald-300" aria-hidden="true" />}
                      <p className="mt-3 text-sm text-emerald-200">Estimated {studyMonths}-month living total</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-100">
                        {money(livingMonthlyLow * studyMonths)}–{money(livingMonthlyHigh * studyMonths)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-600 bg-[#111b2a] p-5">
                      <CircleDollarSign className="text-slate-300" aria-hidden="true" />
                      <p className="mt-3 text-sm text-slate-300">Verified academic cost</p>
                      <p className="mt-1 text-2xl font-bold text-slate-100">
                        {!livingProgram
                          ? "Select a programme"
                          : livingAcademicTotal === undefined
                            ? "Verification pending"
                            : money(livingAcademicTotal)}
                      </p>
                      {completeFinancialPlan && (
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Projected academic amount: {money(completeFinancialPlan.projectedAcademic)} after the selected scholarship and annual increase assumptions.
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl border border-violet-500/30 bg-violet-400/10 p-5">
                      <WalletCards className="text-violet-300" aria-hidden="true" />
                      <p className="mt-3 text-sm text-violet-200">Academic + living plan</p>
                      <p className="mt-1 text-2xl font-bold text-violet-100">
                        {!completeFinancialPlan
                          ? "Select a verified programme"
                          : `${money(completeFinancialPlan.grandTotal.low)}–${money(completeFinancialPlan.grandTotal.high)}`}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <Info label="Accommodation / month" value={`${money(livingModel.rent[accommodationMode][0])}–${money(livingModel.rent[accommodationMode][1])}`} />
                    <Info label="Food / month" value={`${money(livingModel.food[0])}–${money(livingModel.food[1])}`} />
                    <Info label="Transport / month" value={`${money(livingModel.transport[0])}–${money(livingModel.transport[1])}`} />
                    <Info label="Personal, mobile & study / month" value={`${money(livingModel.personal[0])}–${money(livingModel.personal[1])}`} />
                    <Info label="One-time setup estimate" value={`${money(accommodationSetupCosts[accommodationMode][0])}–${money(accommodationSetupCosts[accommodationMode][1])}`} />
                    <Info label="Scholarship saving assumption" value={completeFinancialPlan ? money(completeFinancialPlan.scholarshipSaving) : "Select a verified programme"} />
                    <Info label="Safety allowance" value={completeFinancialPlan ? `${money(completeFinancialPlan.contingency.low)}–${money(completeFinancialPlan.contingency.high)}` : "Select a verified programme"} />
                  </dl>
                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Planning estimate checked {livingCostChecked}. Scholarship, annual increase and safety allowance are user-selected scenarios—not university promises. Actual rent, meals, utilities, transport, deposits and lifestyle costs vary by campus area and room sharing. Confirm halls and awarded waivers directly before relying on the plan.
                  </p>
                  {completeFinancialPlan && (
                    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-700">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <caption className="bg-[#111b2a] px-4 py-3 text-left font-bold text-slate-100">
                          Year-by-year planning schedule
                        </caption>
                        <thead className="border-y border-slate-700 bg-[#111b2a] text-xs uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-4 py-3">Period</th>
                            <th className="px-4 py-3">Academic</th>
                            <th className="px-4 py-3">Living range</th>
                            <th className="px-4 py-3">With safety allowance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/70">
                          {completeFinancialPlan.yearBreakdown.map((year) => (
                            <tr key={year.year}>
                              <th className="px-4 py-3 font-semibold text-slate-200">
                                Year {year.year} <span className="font-normal text-slate-500">· {year.months} months</span>
                              </th>
                              <td className="px-4 py-3 text-slate-300">{money(year.academic)}</td>
                              <td className="px-4 py-3 text-slate-300">{money(year.living.low)}–{money(year.living.high)}</td>
                              <td className="px-4 py-3 font-semibold text-blue-200">{money(year.total.low)}–{money(year.total.high)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-slate-600 bg-[#111b2a] p-7 text-center">
                  <House className="mx-auto text-slate-500" aria-hidden="true" />
                  <h3 className="mt-3 font-bold text-slate-200">Select a university to estimate living costs</h3>
                  <p className="mt-2 text-sm text-slate-400">Nothing is selected by default.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="scholarship"
        className="mx-auto max-w-7xl px-5 py-14 lg:px-8"
      >
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="text-sm font-bold text-blue-400">FUNDING OPPORTUNITIES</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Find ways to reduce tuition and fund your study.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Check published merit scholarships, tuition waivers, need-based aid,
              special-category support, stipends and verified internship routes.
              This is an eligibility guide—not an award promise.
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-lg border border-slate-700 bg-[#172337] p-4">
                <b className="text-slate-100">University funding</b>
                <p className="mt-1 leading-6 text-slate-400">Result-based waivers, continuing merit awards, need-based aid and special-category support.</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-[#172337] p-4">
                <b className="text-slate-100">External opportunities</b>
                <p className="mt-1 leading-6 text-slate-400">Government, UGC, employer and foundation scholarships or stipends are shown only with an official application source.</p>
              </div>
              <a
                href="https://ssiicsetep.ugc.gov.bd/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-emerald-500/20 bg-emerald-400/5 p-4 hover:border-emerald-400/40"
              >
                <b className="inline-flex items-center gap-2 text-emerald-200"><BriefcaseBusiness size={16} /> UGC internship and stipend portal <ExternalLink size={13} /></b>
                <p className="mt-1 leading-6 text-slate-300">Official eligibility and application information for available UGC-supported routes.</p>
              </a>
            </div>
            <div className="mt-5 rounded-lg border border-amber-400/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
              {verifiedProgrammeTotals} programme totals across {verifiedCalculatorUniversities}{" "}
              universities are currently verified. Every directory university
              remains searchable, but a calculated amount appears only when
              its result bands and fee components are verified.
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <SearchSelect
                label="University"
                value={aidProfile ? universityOptionLabel(aidProfile) : ""}
                options={directoryUniversityOptions}
                onChange={(value) => {
                  const next = universities.find(
                    (u) => universityOptionLabel(u) === value,
                  );
                  if (next) {
                    setAidUniversity(next.short);
                    setAidProgram("");
                    setGolden(false);
                    setOneGolden(false);
                    setAdmissionScore(0);
                  }
                }}
              />
              {aidPrograms.length ? (
                <SearchSelect
                  label="Subject"
                  value={aidProgram}
                  options={aidPrograms}
                  onChange={setAidProgram}
                />
              ) : (
                <Info
                  label="Subject"
                  value="Official programme catalogue pending"
                />
              )}
              <ExactGpaField
                label="SSC GPA"
                value={ssc}
                onChange={(value) => {
                  setSsc(value);
                  if (value < 5) setGolden(false);
                }}
              />
              <ExactGpaField
                label="HSC GPA"
                value={hsc}
                onChange={(value) => {
                  setHsc(value);
                  if (value < 5) setGolden(false);
                }}
              />
              {aidUniversity === "EWU" && (
                <Field
                  label="Admission-test score"
                  value={`${admissionScore}%`}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={admissionScore}
                    onChange={(e) => setAdmissionScore(Number(e.target.value))}
                  />
                </Field>
              )}
            </div>
            {aidUniversity ? (
              <>
            {aidProgram && supportsVerifiedResultInputs && (
            <div className="mt-5 flex flex-wrap gap-3">
              <CheckOption
                checked={golden}
                onChange={(v) => {
                  setGolden(v);
                  if (v) {
                    setSsc(5);
                    setHsc(5);
                    setOneGolden(false);
                  }
                }}
                label={
                  aidUniversity === "EWU"
                    ? "A+ in every SSC & HSC subject (including 4th subject)"
                    : aidUniversity === "AUB"
                      ? "Golden GPA 5.00 in both SSC & HSC"
                    : "GPA 5.00 in SSC & HSC without 4th subject"
                }
              />
              {aidUniversity === "LU" && (
                <>
                  <CheckOption
                    checked={oneGolden}
                    onChange={(v) => {
                      setOneGolden(v);
                      if (v) setGolden(false);
                    }}
                    label="One Golden GPA 5.00"
                  />
                  <CheckOption
                    checked={female}
                    onChange={setFemale}
                    label="Female student"
                  />
                  <CheckOption
                    checked={secondChild}
                    onChange={setSecondChild}
                    label="Second child of same parents"
                  />
                </>
              )}
            </div>
            )}
            <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-400/10 p-5">
              <p className="text-sm font-semibold text-blue-200">
                {aidResult.title}
              </p>
              {aidResult.amount !== null && (
                <>
                  <p className="mt-1 text-3xl font-bold text-blue-100">
                    {money(aidResult.amount)}
                  </p>
                  <p className="mt-1 text-xs text-blue-200/80">
                    {aidUniversity === "BRACU"
                      ? `Calculated ${aidProgram} tuition only; compulsory non-tuition fees are extra`
                      : `Possible ${aidProgram} degree cost after the published tuition waiver`}
                  </p>
                </>
              )}
              <p className="mt-4 text-sm leading-6 text-slate-200">
                {aidResult.note}
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-slate-700 bg-[#111b2a] p-5">
              <h4 className="font-bold text-slate-100">
                Published scholarship and waiver routes
              </h4>
              {aidProfile?.scholarships?.length ? (
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {aidProfile.scholarships.map((route) => (
                    <li key={route} className="flex gap-2">
                      <Check
                        size={15}
                        className="mt-1 shrink-0 text-emerald-300"
                      />
                      <span>{route}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-amber-200">
                  Official scholarship-route verification is pending for this university.
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {aidProfileSource ? (
                <a
                  href={aidProfileSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-300"
                >
                  {aidSource ? "Official scholarship rules" : "Official university source"}{" "}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <span className="font-semibold text-amber-200">
                  Official scholarship source pending
                </span>
              )}
              <span className="text-slate-400">
                {aidProfile?.verifiedAt
                  ? `Profile checked ${aidProfile.verifiedAt}`
                  : "Verification queued"}
              </span>
            </div>
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-600 bg-[#111b2a] p-7 text-center">
                <CircleDollarSign className="mx-auto text-slate-500" />
                <h3 className="mt-3 font-bold text-slate-200">
                  Select a university to check result-based costs
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Search by university name or initials above. Nothing is selected by default.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="grades" className="border-y border-slate-700 bg-[#121c2b]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="text-sm font-bold text-blue-400">
                OFFICIAL GRADE CHARTS
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Understand the scale before comparing CGPAs.
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Select any university in the directory. A chart appears only
                when its current official grading policy has been checked—never
                copied from another university.
              </p>
              <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-100">
                <b>{Object.keys(gradeCharts).length} charts verified.</b> All {universities.length}{" "}
                universities remain selectable; unchecked charts stay pending
                until an official policy is available.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
              <SearchSelect
                label="University"
                value={
                  gradeUniversity
                    ? universityOptionLabel(
                        universities.find((u) => u.short === gradeUniversity)!,
                      )
                    : ""
                }
                options={directoryUniversityOptions}
                onChange={(value) => {
                  const next = universities.find(
                    (u) => universityOptionLabel(u) === value,
                  );
                  if (next) setGradeUniversity(next.short);
                }}
              />
              {gradeUniversity && gradeCharts[gradeUniversity] ? (
                <div className="mt-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold">
                        {
                          universities.find((u) => u.short === gradeUniversity)
                            ?.name
                        }
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Official chart checked{" "}
                        {gradeCharts[gradeUniversity].checked}
                      </p>
                    </div>
                    <a
                      href={gradeCharts[gradeUniversity].source}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-300"
                    >
                      Official grading policy <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full min-w-[420px] text-sm">
                      <thead className="bg-[#111b2a] text-left text-slate-300">
                        <tr>
                          <th className="px-4 py-3">Numerical score</th>
                          <th className="px-4 py-3">Letter grade</th>
                          <th className="px-4 py-3">Grade point</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeCharts[gradeUniversity].bands.map((b) => (
                          <tr
                            key={`${b.score}-${b.letter}`}
                            className="border-t border-slate-700"
                          >
                            <td className="px-4 py-3 text-slate-200">
                              {b.score}
                            </td>
                            <td className="px-4 py-3 font-bold text-blue-300">
                              {b.letter}
                            </td>
                            <td className="px-4 py-3 text-slate-200">
                              {b.point}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {gradeCharts[gradeUniversity].note}
                  </p>
                </div>
              ) : gradeUniversity ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-600 bg-[#111b2a] p-7 text-center">
                  <ShieldCheck className="mx-auto text-slate-500" />
                  <h3 className="mt-3 font-bold text-slate-200">
                    Official grade chart verification pending
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    This university remains in the directory, but no grading
                    scale will be displayed until its official academic policy
                    is checked.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-slate-600 bg-[#111b2a] p-7 text-center">
                  <ShieldCheck className="mx-auto text-slate-500" />
                  <h3 className="mt-3 font-bold text-slate-200">
                    Select a university to view its grade chart
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Search by university name or initials above. Nothing is selected by default.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="readiness" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="text-sm font-bold text-blue-400">ADMISSION READINESS</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Check the next steps before applying.</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Review programme availability, the university’s general GPA reference, programme costs, subject requirements and official admission sources in one checklist.
            </p>
            <div className="mt-5 rounded-lg border border-amber-400/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
              This planner is a preparation aid, not an admission decision. Department-specific subject grades, passing years, admission tests, quotas and intake rules must be confirmed on the official page.
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <SearchSelect
                label="University"
                placeholder="Search university…"
                value={readinessUniversity}
                options={directoryUniversityOptions}
                onChange={(value) => {
                  setReadinessUniversity(value);
                  setReadinessProgram("");
                }}
              />
              {readinessPrograms.length ? (
                <SearchSelect
                  label="Programme"
                  placeholder="Search programme…"
                  value={readinessProgram}
                  options={readinessPrograms}
                  onChange={setReadinessProgram}
                />
              ) : (
                <Info label="Programme" value="Select a university" />
              )}
              <ExactGpaField label="SSC GPA" value={readinessSsc} onChange={setReadinessSsc} />
              <ExactGpaField label="HSC GPA" value={readinessHsc} onChange={setReadinessHsc} />
            </div>
            {readinessResult && readinessProfile ? (
              <div className="mt-6" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-5">
                  <div>
                    <p className="text-sm text-slate-400">Readiness summary</p>
                    <p className="mt-1 text-xl font-bold text-slate-100">
                      {readinessResult.status === "not-listed"
                        ? "Programme not found in verified catalogue"
                        : readinessResult.status === "needs-attention"
                          ? "Important requirement needs attention"
                          : "Ready for final official review"}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-400/10 px-3 py-1 text-sm font-semibold text-blue-200">
                    {readinessResult.completedChecks}/{readinessResult.checks.length} checks complete
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  {readinessResult.checks.map((check) => (
                    <div key={check.label} className={`rounded-lg border p-4 ${check.state === "complete" ? "border-emerald-500/20 bg-emerald-400/5" : check.state === "attention" ? "border-rose-400/20 bg-rose-400/5" : "border-amber-400/20 bg-amber-300/5"}`}>
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs ${check.state === "complete" ? "bg-emerald-400/20 text-emerald-200" : check.state === "attention" ? "bg-rose-400/20 text-rose-200" : "bg-amber-400/20 text-amber-100"}`} aria-hidden="true">
                          {check.state === "complete" ? "✓" : "!"}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-100">{check.label}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{check.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-400">Print or save as PDF from your browser for a personal application checklist.</p>
                  <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-400/20">
                    <Printer size={16} aria-hidden="true" /> Print checklist
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-600 bg-[#111b2a] p-7 text-center">
                <Check className="mx-auto text-slate-500" aria-hidden="true" />
                <h3 className="mt-3 font-bold text-slate-200">Select a university and programme</h3>
                <p className="mt-2 text-sm text-slate-400">Your readiness checklist will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-slate-700 bg-[#121c2b]">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="grid gap-6 rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="flex items-start gap-4">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200 sm:flex">
                <BriefcaseBusiness size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-300">About UniVerse BD</p>
                <h2 className="mt-1 text-xl font-bold">Built by Md Iftee Raiyan</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  A student-built guide that makes university programmes, costs and admission information easier to compare.
                </p>
                <a
                  href="https://www.linkedin.com/in/md-iftee-raiyan-b20336386/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-400"
                >
                  View LinkedIn <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-400/5 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={20} aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-emerald-100">Simple, source-checked information</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Published facts link to official sources and show when they were checked. Missing fees or rules stay marked as pending—never guessed.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-slate-900/50 px-3 py-1.5 text-slate-200">{dataQualityReport.universityCount} universities</span>
                <span className="rounded-full bg-slate-900/50 px-3 py-1.5 text-slate-200">{dataQualityReport.verifiedProgrammeCount} verified programme totals</span>
                <span className="rounded-full bg-slate-900/50 px-3 py-1.5 text-slate-200">{universityCatalog.stats.total - universityCatalog.stats.pending}/{universityCatalog.stats.total} profiles source-checked</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-700 bg-[#0d1522]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-sm text-slate-400 sm:flex-row sm:justify-between lg:px-8">
          <b className="text-slate-100">UniVerse BD</b>
          <span>Not the best university. The best fit for you.</span>
          <span>Data build · 2026</span>
        </div>
      </footer>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-[#172337] text-slate-100 sm:max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">
                  {detail.name}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {detail.district} ·{" "}
                  {detail.status === "Official"
                    ? `Official sources checked ${detail.verifiedAt}`
                    : "Detailed verification pending"}
                </DialogDescription>
              </DialogHeader>
              {detail.status === "Official" && (
                <div
                  className={`mt-3 rounded-lg border px-4 py-3 text-sm ${detail.minGpa === undefined ? "border-amber-400/25 bg-amber-400/5 text-amber-100" : directProfile ? "border-blue-400/25 bg-blue-400/5 text-blue-100" : gpa >= detail.minGpa ? "border-emerald-400/25 bg-emerald-400/5 text-emerald-100" : "border-rose-400/25 bg-rose-400/5 text-rose-100"}`}
                >
                  {detail.minGpa === undefined ? (
                    <b>Minimum GPA verification is still pending.</b>
                  ) : directProfile ? (
                    <b>
                      Verified general minimum GPA: {detail.minGpa.toFixed(1)}
                    </b>
                  ) : gpa >= detail.minGpa ? (
                    <b>
                      GPA requirement met: your {gpa.toFixed(1)} is at or above
                      the verified {detail.minGpa.toFixed(1)} minimum.
                    </b>
                  ) : (
                    <b>
                      GPA requirement not met: your {gpa.toFixed(1)} is below
                      the verified {detail.minGpa.toFixed(1)} minimum.
                    </b>
                  )}
                  <p className="mt-1 text-xs leading-5 opacity-80">
                    Subject prerequisites and admission-test requirements may
                    still apply separately.
                  </p>
                </div>
              )}
              {detail.status === "Directory" ? (
                <div className="mt-4 rounded-lg border border-slate-600 bg-[#111b2a] p-5 text-sm leading-6 text-slate-300">
                  <b className="text-slate-100">Directory identity only.</b>
                  <p className="mt-2">
                    Subjects, fees, admission rules, scholarships and facilities
                    will appear only after their official pages are checked.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-400/10 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
                      {selectedDetailTotal !== undefined
                        ? `Published ${selectedDetailProgram} total`
                        : `${selectedDetailProgram || "Programme"} cost`}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-blue-200">
                      {selectedDetailTotal !== undefined
                        ? money(selectedDetailTotal)
                        : "Verification pending"}
                    </p>
                    {selectedDetailTotal === undefined && (
                      <p className="mt-2 text-sm leading-5 text-blue-100/80">
                        A complete official total has not been verified for this
                        subject. The CSE cost is never reused here.
                      </p>
                    )}
                  </div>
                  <section className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold">Undergraduate subjects</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${detail.programCatalogComplete ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}
                      >
                        {detail.programCatalogComplete
                          ? "Complete official catalogue"
                          : "Verification in progress"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detail.programs.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setDetailProgram(p)}
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${selectedDetailProgram === p ? "border-blue-400 bg-blue-400/15 text-blue-100" : "border-slate-700 bg-[#111b2a] text-slate-300 hover:border-slate-500"}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </section>
                  {selectedDetailCost && (
                    <section className="mt-5">
                      <h3 className="font-bold">
                        {selectedDetailProgram} cost summary
                      </h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg bg-[#111b2a] p-3 text-sm text-slate-200">
                          <span className="block text-xs text-slate-400">
                            Credits
                          </span>
                          <b>
                            {selectedDetailCost.credits > 0
                              ? selectedDetailCost.credits
                              : "Not published"}
                          </b>
                        </div>
                        <div className="rounded-lg bg-[#111b2a] p-3 text-sm text-slate-200">
                          <span className="block text-xs text-slate-400">
                            Tuition per credit
                          </span>
                          <b>
                            {selectedDetailCost.tuitionPerCredit > 0
                              ? money(selectedDetailCost.tuitionPerCredit)
                              : "Not published separately"}
                          </b>
                        </div>
                        <div className="rounded-lg bg-[#111b2a] p-3 text-sm text-slate-200">
                          <span className="block text-xs text-slate-400">
                            {selectedDetailCost.pending
                              ? "Total verification pending"
                              : selectedDetailCost.discounted
                              ? "Published discounted total"
                              : selectedDetailCost.minimum
                              ? "Published minimum"
                              : "Published total"}
                          </span>
                          <b className="text-blue-300">
                            {money(selectedDetailCost.total)}
                          </b>
                        </div>
                      </div>
                    </section>
                  )}
                  {selectedDetailProgram === "CSE" &&
                    detail.feeBreakdown?.length && (
                      <section className="mt-5">
                        <h3 className="font-bold">Published fee details</h3>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {detail.feeBreakdown.map((f) => (
                            <div
                              key={f}
                              className="rounded-lg bg-[#111b2a] p-3 text-sm text-slate-200"
                            >
                              {f}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  {detail.scholarships?.length && (
                    <section className="mt-5">
                      <h3 className="font-bold">Scholarships and waivers</h3>
                      <div className="mt-3 grid gap-2">
                        {detail.scholarships.map((s) => (
                          <div
                            key={s}
                            className="flex gap-3 rounded-lg border border-emerald-500/20 bg-emerald-400/5 p-3 text-sm text-slate-200"
                          >
                            <Check
                              size={16}
                              className="mt-0.5 shrink-0 text-emerald-400"
                            />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Eligibility does not guarantee an award. Confirm the
                        active intake policy before applying.
                      </p>
                    </section>
                  )}
                  <section className="mt-5">
                    <h3 className="font-bold">Other verified facts</h3>
                    <div className="mt-3 grid gap-2">
                      {detail.facts?.map((f) => (
                        <div
                          key={f}
                          className="flex gap-3 rounded-lg bg-[#111b2a] p-3 text-sm text-slate-200"
                        >
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-400"
                          />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                    <b>Official sources</b>
                    <div className="mt-2 grid gap-2">
                      {detail.sources?.map((s) => (
                        <a
                          key={s.url}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-semibold text-blue-300"
                        >
                          {s.label} <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-700 bg-[#172337] text-slate-100 sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Compare your shortlist
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Select up to three universities from the results.
            </DialogDescription>
          </DialogHeader>
          {chosen.length < 2 ? (
            <div className="my-5 rounded-xl border border-dashed border-slate-600 p-8 text-center text-slate-400">
              Add at least two universities to compare them.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead>
                  <tr>
                    <th className="compare-cell text-left">Factor</th>
                    {chosen.map((u) => (
                      <th key={u.id} className="compare-cell text-left">
                        {u.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <Row label="University" values={chosen.map((u) => u.name)} />
                  <Row
                    label="Institution type"
                    values={chosen.map((u) => `${u.institutionType ?? "Private"} university`)}
                  />
                  <Row
                    label="Location"
                    values={chosen.map((u) =>
                      [u.area, u.district, u.division]
                        .filter(Boolean)
                        .join(", "),
                    )}
                  />
                  <Row
                    label="Data stage"
                    values={chosen.map((u) =>
                      u.status === "Official"
                        ? `Official · ${u.verifiedAt}`
                        : "Pending",
                    )}
                  />
                  <Row
                    label="Undergraduate programmes"
                    values={chosen.map((u) =>
                      u.programs.length
                        ? `${u.programs.length} listed${u.programCatalogComplete ? " · catalogue verified" : " · catalogue verification pending"}`
                        : "Catalogue pending",
                    )}
                  />
                  {programFilter && (
                    <Row
                      label={`${activeSubject} availability`}
                      values={chosen.map((u) =>
                        u.programs.some((name) =>
                          programMatches(name, programFilter),
                        )
                          ? "Listed by university"
                          : "Not listed",
                      )}
                    />
                  )}
                  <Row
                    label={
                      programFilter
                        ? `${activeSubject} total cost`
                        : "Published reference total"
                    }
                    values={chosen.map((u) =>
                      u.totalCost === undefined
                        ? "Verification pending"
                        : money(u.totalCost),
                    )}
                  />
                  <Row
                    label={programFilter ? `${activeSubject} credits` : "Reference credits"}
                    values={chosen.map((u) =>
                      u.credits === undefined
                        ? "Not yet verified"
                        : String(u.credits),
                    )}
                  />
                  <Row
                    label="Scholarship information"
                    values={chosen.map((u) =>
                      u.scholarships?.length
                        ? `${u.scholarships.length} verified rules`
                        : "Verification pending",
                    )}
                  />
                  <Row
                    label="Minimum GPA"
                    values={chosen.map((u) =>
                      u.minGpa === undefined
                        ? "Not yet verified"
                        : u.minGpa.toFixed(1),
                    )}
                  />
                  <Row
                    label={`Your GPA (${gpa.toFixed(1)})`}
                    values={chosen.map((u) =>
                      u.minGpa === undefined
                        ? "Requirement pending"
                        : gpa >= u.minGpa
                          ? "Requirement met"
                          : "Requirement not met",
                    )}
                  />
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

const markTones: Record<string, string> = {
  NSU: "bg-[#802b35] text-white",
  BRACU: "bg-[#00a89c] text-white",
  EWU: "bg-[#173f73] text-white",
  AIUB: "bg-[#ee3524] text-white",
  UIU: "bg-[#ef7d00] text-white",
  AUST: "bg-[#1d4b8f] text-white",
  UAP: "bg-[#176b52] text-white",
  IIUC: "bg-[#14743c] text-white",
  EDU: "bg-[#66318f] text-white",
  LU: "bg-[#006b5b] text-white",
  DIU: "bg-[#62a744] text-white",
  IUB: "bg-[#173b72] text-white",
  ULAB: "bg-[#ef4b23] text-white",
  GUB: "bg-[#1f7a3f] text-white",
  UITS: "bg-[#6b2834] text-white",
  BUBT: "bg-[#155e75] text-white",
  SEU: "bg-[#c69214] text-slate-950",
  SUBD: "bg-[#153f7a] text-white",
  "DIU-D": "bg-[#7b1f35] text-white",
  WUB: "bg-[#314c8a] text-white",
  UGV: "bg-[#12625f] text-white",
  VU: "bg-[#143f74] text-white",
  PUC: "bg-[#7d2331] text-white",
  NWU: "bg-[#1c4d7d] text-white",
  NEUB: "bg-[#176b52] text-white",
};
function UniversityMark({
  university,
  large = false,
}: {
  university: University;
  large?: boolean;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const isReliableLogo =
    !!university.logo &&
    !logoFailed &&
    !/favicon\.ico(?:\?|$)/i.test(university.logo);
  return (
    <span
      role="img"
      aria-label={`${university.name} university mark`}
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-white/15 shadow-sm ${large ? "h-16 min-w-16 px-2" : "h-12 min-w-12 px-2"} ${markTones[university.short] ?? "bg-[#24344d] text-slate-100"}`}
    >
      <b
        className={`${university.short.length > 4 ? "text-[10px]" : "text-xs"} tracking-tight`}
      >
        {university.short}
      </b>
      {isReliableLogo && (
        <>
          {/* University logos are remote, variable-source assets without a
              compatible fixed Next image-loader contract. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={university.logo}
            alt=""
            className="absolute inset-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] rounded-lg bg-white object-contain p-1"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              setLogoFailed(true);
            }}
          />
        </>
      )}
    </span>
  );
}
function CheckOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${checked ? "border-blue-400 bg-blue-400/10 text-blue-100" : "border-slate-600 text-slate-300"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-500"
      />
      {label}
    </label>
  );
}
function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-sm font-semibold text-slate-300">
        <span>{label}</span>
        {value && <b className="text-blue-300">{value}</b>}
      </span>
      {children}
    </label>
  );
}
function Cost({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-[#111b2a] p-3">
      <span className="text-xs text-slate-400">{label}</span>
      <b className="mt-1 block text-sm">
        {value === undefined ? "Included in total" : money(value)}
      </b>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111b2a] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-100">{value}</p>
    </div>
  );
}
function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <th className="compare-cell text-left">{label}</th>
      {values.map((v, i) => (
        <td className="compare-cell" key={i}>
          {v}
        </td>
      ))}
    </tr>
  );
}
