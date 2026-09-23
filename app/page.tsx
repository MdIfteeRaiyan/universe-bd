"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
  Share2,
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
import type { AccommodationMode, University } from "@/data/models";
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
import { universityProfilePath } from "@/lib/university-profile";
import {
  createSharedShortlistUrl,
  createDecisionReportUrl,
  parseSharedShortlist,
} from "@/lib/shortlist-share";

import { gradeCharts } from "@/data/grade-charts";
import { privateUniversities } from "@/data/private-universities";

const universities = privateUniversities;

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
  const [program, setProgram] = useState(""),
    [division, setDivision] = useState(""),
    [district, setDistrict] = useState(""),
    [area, setArea] = useState(""),
    [budget, setBudget] = useState(800000),
    [gpa, setGpa] = useState(4),
    [useGpa, setUseGpa] = useState(false),
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
    [compareProgram, setCompareProgram] = useState(""),
    [waiver, setWaiver] = useState(0),
    [calcId, setCalcId] = useState<number | null>(null),
    [calcProgram, setCalcProgram] = useState("");
  const [shortlistStages, setShortlistStages] = useState<Record<number, "researching" | "ready" | "applied">>({});
  const [shortlistLoaded, setShortlistLoaded] = useState(false);
  const [shortlistMessage, setShortlistMessage] = useState("");
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
  const divisionFilter = division === "All divisions" ? "" : division;
  const districtFilter = district === "All districts" ? "" : district;
  const areaFilter = area === "All areas" ? "" : area;
  const filtersChanged =
    Boolean(programFilter) ||
    Boolean(divisionFilter) ||
    Boolean(districtFilter) ||
    Boolean(areaFilter) ||
    budget !== 800000 ||
    useGpa ||
    sortBy !== "match";
  const resetFilters = () => {
    setProgram("");
    setDivision("");
    setDistrict("");
    setArea("");
    setBudget(800000);
    setGpa(4);
    setUseGpa(false);
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
  const readinessProgrammeRule = readinessProfile?.admissionRules?.programmeRules?.find(
    (rule) => rule.programmes.some((programme) => programMatches(programme, readinessProgram)),
  );
  const readinessResult =
    readinessProfile && readinessProgram
      ? evaluateAdmissionReadiness({
          universityName: readinessProfile.name,
          programmeName: readinessProgram,
          programmeAvailable: readinessProfile.programs.some((name) =>
            programMatches(name, readinessProgram),
          ),
          programmeCatalogComplete: Boolean(readinessProfile.programCatalogComplete),
          minimumGpa: readinessProfile.admissionRules
            ? undefined
            : readinessProfile.minGpa,
          minimumSscGpa:
            readinessProgrammeRule?.minimumSscGpa ??
            readinessProfile.admissionRules?.minimumSscGpa,
          minimumHscGpa:
            readinessProgrammeRule?.minimumHscGpa ??
            readinessProfile.admissionRules?.minimumHscGpa,
          minimumCombinedGpa:
            readinessProgrammeRule?.minimumCombinedGpa ??
            readinessProfile.admissionRules?.minimumCombinedGpa,
          gpaPaths: readinessProgrammeRule?.gpaPaths ??
            (readinessProgrammeRule?.minimumSscGpa !== undefined ||
            readinessProgrammeRule?.minimumHscGpa !== undefined ||
            readinessProgrammeRule?.minimumCombinedGpa !== undefined
              ? undefined
              : readinessProfile.admissionRules?.gpaPaths),
          generalGpaRule:
            readinessProgrammeRule?.minimumSscGpa !== undefined ||
            readinessProgrammeRule?.minimumHscGpa !== undefined ||
            readinessProgrammeRule?.minimumCombinedGpa !== undefined
            ? `${readinessProfile.admissionRules?.generalRule}. ${readinessProgrammeRule.summary}.`
            : readinessProfile.admissionRules?.generalRule,
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
          programmeSubjectRule: readinessProgrammeRule
            ? `${readinessProgrammeRule.summary}. Admission test: ${readinessProgrammeRule.admissionTest ?? "confirm on the official page"}.`
            : undefined,
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
          gpaMet:
            !useGpa || u.minGpa === undefined ? null : gpa >= u.minGpa,
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
  }, [programFilter, divisionFilter, districtFilter, areaFilter, budget, gpa, useGpa]);
  const results = evaluatedResults.filter(
    (u) =>
      u.totalCost !== undefined &&
      u.totalCost <= budget &&
      u.gpaMet !== false,
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
        if (useGpa) {
          if (u.minGpa === undefined) {
            reasons.push("GPA rule pending");
            distance += 12;
          } else if (gpa < u.minGpa) {
            reasons.push(`needs GPA ${u.minGpa.toFixed(1)}`);
            distance += 20 + (u.minGpa - gpa) * 10;
          }
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
        const gpaClose =
          !useGpa || (u.minGpa !== undefined && gpa >= u.minGpa - 0.5);
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
  }, [results.length, programFilter, divisionFilter, districtFilter, areaFilter, budget, gpa, useGpa]);
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
  const chosenBase = compare
    .map((id) => universities.find((u) => u.id === id))
    .filter((u): u is University => Boolean(u));
  const comparisonProgramOptions = [
    "General overview",
    ...new Set([
      ...(programFilter ? [programFilter] : []),
      ...chosenBase.flatMap((u) => u.programs),
    ]),
  ].sort((a, b) =>
    a === "General overview"
      ? -1
      : b === "General overview"
        ? 1
        : a.localeCompare(b),
  );
  const comparisonSubject =
    compareProgram === "General overview"
      ? ""
      : (compareProgram || programFilter);
  const chosen = chosenBase
    .map((u) => {
      if (!comparisonSubject) {
        return evaluatedResults.find((result) => result.id === u.id) ?? u;
      }
      const programmeCost = matchingProgramCost(u, comparisonSubject);
      const verifiedTotal = programmeCost?.pending
        ? undefined
        : (programmeCost?.total ??
          (comparisonSubject === "CSE" ? u.totalCost : undefined));
      return {
        ...u,
        totalCost: verifiedTotal,
        credits:
          programmeCost && programmeCost.credits > 0
            ? programmeCost.credits
            : comparisonSubject === "CSE"
              ? u.credits
              : undefined,
      };
    });
  const verifiedComparisonCosts = chosen
    .filter((u) => u.totalCost !== undefined)
    .sort((a, b) => (a.totalCost ?? Infinity) - (b.totalCost ?? Infinity));
  const lowestVerifiedComparisonCost =
    verifiedComparisonCosts.length >= 2 ? verifiedComparisonCosts[0] : null;
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
        const shared = parseSharedShortlist(
          window.location.search,
          new Set(universities.map((university) => university.id)),
        );
        if (shared) {
          setCompare(shared.ids);
          if (shared.programme) setCompareProgram(shared.programme);
          setShortlistMessage(
            `${shared.ids.length} shared ${shared.ids.length === 1 ? "choice" : "choices"} loaded.`,
          );
          setShortlistLoaded(true);
          return;
        }
        const saved = window.localStorage.getItem("campuschoice-bd-shortlist") ?? window.localStorage.getItem("universe-bd-shortlist");
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
      "campuschoice-bd-shortlist",
      JSON.stringify({ ids: compare, stages: shortlistStages }),
    );
  }, [compare, shortlistLoaded, shortlistStages]);

  const shareShortlist = async () => {
    if (!compare.length) return;
    const url = createSharedShortlistUrl(
      window.location.href,
      compare,
      compareProgram || programFilter,
    );
    try {
      await window.navigator.clipboard.writeText(url);
      setShortlistMessage("Share link copied. Application stages stay private.");
    } catch {
      window.prompt("Copy this shortlist link", url);
      setShortlistMessage("Share link created. Application stages stay private.");
    }
  };

  return (
    <main className="site-shell soft-dark min-h-screen bg-[#101827] text-slate-100">
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <header className="premium-header sticky top-0 z-40 border-b border-slate-700/70 bg-[#101827]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-2 lg:px-8">
          <a href="#top" className="brand-lockup flex items-center gap-3">
            <span className="brand-mark-wrap"><Image className="logo-mark" src="/logo-mark.svg" alt="" width={44} height={44} priority /></span>
            <span>
              <b className="block leading-5">CampusChoice BD</b>
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
          <a
            href="#shortlist"
            aria-label={`Open shortlist with ${compare.length} saved ${compare.length === 1 ? "university" : "universities"}`}
            className="shortlist-button flex items-center gap-2 rounded-full border border-slate-600 bg-[#172337] px-4 py-2 text-sm font-semibold text-slate-200 hover:border-blue-400"
          >
            <BookmarkCheck size={16} /> Shortlist{" "}
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
              {compare.length}
            </span>
          </a>
        </div>
      </header>

      <section id="main-content" tabIndex={-1} className="hero-zone border-b border-slate-700/70 bg-[#121c2b] outline-none">
        <span className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <span className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <span className="hero-doodle hero-doodle-a" aria-hidden="true">✦</span>
        <span className="hero-doodle hero-doodle-b" aria-hidden="true">↗</span>
        <div className="relative z-[1] mx-auto grid max-w-7xl gap-9 px-5 py-12 lg:grid-cols-[.85fr_1.15fr] lg:px-8 lg:py-16">
          <div className="hero-copy flex flex-col justify-center">
            <p className="hero-eyebrow text-sm font-bold text-blue-300">
              YOUR NEXT CHAPTER STARTS HERE
            </p>
            <h1 className="hero-title mt-3 max-w-xl text-4xl font-bold leading-[.98] tracking-[-.045em] sm:text-6xl">
              Choose your campus with <span className="hero-gradient-text">a clearer head.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Official-source facts, clear verification dates and no hidden
              guesses—built to make a stressful decision easier.
            </p>
            <div className="campus-note mt-6" aria-label="CampusChoice promise">
              <span aria-hidden="true">CC</span>
              <p><b>Not a ranking.</b> A calmer way to find what fits your life.</p>
            </div>
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
            <div className="mt-7 grid max-w-xl grid-cols-3 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/25 backdrop-blur-sm">
              <div className="hero-proof px-3 py-3 sm:px-4">
                <b className="block text-lg text-white">{dataQualityReport.universityCount}</b>
                <span className="text-xs text-slate-400">universities</span>
              </div>
              <div className="hero-proof border-x border-slate-700/80 px-3 py-3 sm:px-4">
                <b className="block text-lg text-emerald-300">{dataQualityReport.verifiedProgrammeCount}</b>
                <span className="text-xs text-slate-400">verified totals</span>
              </div>
              <div className="hero-proof px-3 py-3 sm:px-4">
                <b className="block text-lg text-blue-300">0</b>
                <span className="text-xs text-slate-400">hidden guesses</span>
              </div>
            </div>
          </div>
          <div className="hero-panel surface-card rounded-[1.6rem] p-5 sm:p-7">
            <div className="choice-desk-label" aria-hidden="true">START HERE</div>
            <h2 className="text-xl font-bold">Build your first shortlist</h2>
            <p className="mt-1 text-sm text-slate-400">
              Start with three choices. Refine only if you need to.
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
              <details className="group rounded-xl border border-slate-700 bg-[#111b2a]/60 sm:col-span-2">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  <span>
                    Refine by GPA or exact location
                    {(useGpa || districtFilter || areaFilter) && (
                      <small className="ml-2 rounded-full bg-blue-400/15 px-2 py-1 text-blue-200">
                        Active
                      </small>
                    )}
                  </span>
                  <span className="text-slate-400 transition group-open:rotate-180" aria-hidden="true">⌄</span>
                </summary>
                <div className="grid gap-5 border-t border-slate-700 p-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
                    <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm font-semibold text-slate-200">
                      <input
                        type="checkbox"
                        checked={useGpa}
                        onChange={(event) => {
                          setUseGpa(event.target.checked);
                          setVisible(9);
                        }}
                        className="size-4 accent-blue-500"
                      />
                      Check my GPA eligibility
                    </label>
                    {!useGpa && (
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Off by default—no hidden GPA filter is applied.
                      </p>
                    )}
                    {useGpa && (
                      <div className="mt-3 border-t border-slate-700 pt-3">
                        <ExactGpaField
                          label="Academic GPA"
                          value={gpa}
                          onChange={(value) => {
                            setGpa(value);
                            setVisible(9);
                          }}
                        />
                      </div>
                    )}
                  </div>
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
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/70 pt-4">
              <a
                href="/public-universities"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-blue-300 hover:text-blue-200"
              >
                Looking for public universities? Open the separate guide
                <ArrowRight size={15} aria-hidden="true" />
              </a>
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
        <div className="hero-ribbon" aria-hidden="true">
          <div>
            <span>COMPARE CLEARLY</span><i>✦</i><span>PLAN THE REAL COST</span><i>✦</i><span>CHECK THE SOURCE</span><i>✦</i><span>CHOOSE WITH CONFIDENCE</span><i>✦</i>
            <span>COMPARE CLEARLY</span><i>✦</i><span>PLAN THE REAL COST</span><i>✦</i><span>CHECK THE SOURCE</span><i>✦</i><span>CHOOSE WITH CONFIDENCE</span><i>✦</i>
          </div>
        </div>
      </section>

      <nav aria-label="Your university decision path" className="decision-nav border-b border-slate-700 bg-[#0d1522]">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-300">Decision trail</p>
              <p className="mt-1 text-sm text-slate-400">Your simple decision path—from search to application.</p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1 text-xs font-semibold text-slate-300" aria-live="polite">
              {sortedResults.length} options in view · {compare.length}/3 saved
            </span>
          </div>
          <div className="decision-path relative grid grid-cols-2 gap-2 sm:grid-cols-4">
            <span className="decision-rail" aria-hidden="true"><span /></span>
            {[
              ["1", "Find", `${sortedResults.length} options`, "#universities", true],
              ["2", "Shortlist", compare.length ? `${compare.length} saved` : "Save up to 3", "#shortlist", compare.length > 0],
              ["3", "Plan costs", "Tuition + living", "#living-cost", false],
              ["4", "Check admission", "Rules + checklist", "#readiness", false],
            ].map(([number, label, detail, href, active]) => (
              <a key={String(href)} href={String(href)} className={`decision-step relative z-[1] flex min-h-[4.25rem] items-center gap-3 rounded-xl border px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? "is-active border-blue-400/60 bg-blue-400/10" : "border-slate-700 bg-[#172337]"}`}>
                <span className="decision-number" aria-hidden="true">{number}</span>
                <span className="min-w-0">
                  <b className="block text-sm text-slate-100">{label}</b>
                  <small className="mt-0.5 block truncate text-xs text-slate-400">{detail}</small>
                </span>
              </a>
            ))}
          </div>
          <details className="group mt-2 rounded-lg border border-slate-800 bg-[#111b2a]/60 xl:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              More tools
              <span className="text-slate-500 transition group-open:rotate-180" aria-hidden="true">⌄</span>
            </summary>
            <div className="grid grid-cols-3 gap-2 border-t border-slate-800 p-2">
              {[
                ["Funding", "#scholarship"],
                ["Grade charts", "#grades"],
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
        className="experience-section mx-auto max-w-7xl px-5 py-14 lg:px-8"
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
                    {useGpa
                      ? `${gpaEligible} GPA met · ${gpaNotMet} not met · ${gpaPending} pending`
                      : "Add your GPA in Refine results to check eligibility"}
                    {` · ${universities.length} private universities indexed`}
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
                      className="surface-card rounded-xl p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400"
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
              className="university-card content-defer surface-card flex h-full flex-col rounded-[1.35rem] p-4 transition hover:-translate-y-0.5 hover:border-blue-500/70 sm:p-5"
            >
              <div className="flex items-start justify-between">
                <UniversityMark university={u} />
                <div className="text-right">
                  {useGpa && u.gpaMet === false ? (
                    <span className="rounded-full bg-rose-400/10 px-2.5 py-1 text-xs font-semibold text-rose-300">
                      GPA NOT MET
                    </span>
                  ) : useGpa && u.gpaMet === null ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.status === "Official" ? "bg-amber-400/10 text-amber-200" : "bg-slate-700 text-slate-300"}`}
                    >
                      {u.status === "Official" ? "GPA PENDING" : "DIRECTORY"}
                    </span>
                  ) : useGpa && u.score === null ? (
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      GPA MET
                    </span>
                  ) : useGpa ? (
                    <>
                      <span className="text-xs font-semibold text-slate-400">
                        MATCH
                      </span>
                      <b className="block text-2xl text-blue-400">{u.score}%</b>
                    </>
                  ) : (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.totalCost !== undefined ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>
                      {u.totalCost !== undefined ? "COST CHECKED" : "COST PENDING"}
                    </span>
                  )}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-bold leading-6 sm:min-h-12">
                {u.name}
              </h3>
              <span className="mb-3 w-fit rounded-full bg-slate-700/70 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {u.institutionType ?? "Private"} university
              </span>
              {useGpa && u.gpaMet === false && (
                <div className="mb-3 rounded-lg border border-rose-400/25 bg-rose-400/5 px-3 py-2 text-sm text-rose-200">
                  Your GPA {gpa.toFixed(1)} does not meet the verified minimum
                  of {u.minGpa?.toFixed(1)}.
                </div>
              )}
              {useGpa && u.gpaMet === true && (
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
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDirectProfile(false);
                    setDetail(u);
                  }}
                  className="flex min-h-11 items-center justify-center gap-1 rounded-lg bg-[#173b68] px-3 py-2.5 text-sm font-semibold text-white"
                >
                  View details <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(u.id)}
                  aria-label={`${compare.includes(u.id) ? "Remove" : "Save"} ${u.name} ${compare.includes(u.id) ? "from" : "to"} shortlist`}
                  aria-pressed={compare.includes(u.id)}
                  disabled={compare.length >= 3 && !compare.includes(u.id)}
                  title={compare.length >= 3 && !compare.includes(u.id) ? "Remove one university before saving another" : undefined}
                  className={`flex min-h-11 min-w-[5.5rem] items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${compare.includes(u.id) ? "border-blue-400 bg-blue-400/15 text-blue-200" : "border-slate-600 text-slate-300 hover:border-blue-400 hover:text-blue-200"}`}
                >
                  {compare.includes(u.id) ? (
                    <><Check size={17} /> Saved</>
                  ) : (
                    <><BookmarkCheck size={17} /> Save</>
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

      <section id="shortlist" className="experience-section border-y border-slate-700 bg-[#121c2b]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-400">MY SHORTLIST</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Keep your top choices in one place.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Save up to three universities for comparison and track whether you are researching, ready to apply or already applied. This shortlist stays in this browser.
              </p>
            </div>
            {compare.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={shareShortlist} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-400/10 px-4 py-2.5 text-sm font-semibold text-blue-100 hover:bg-blue-400/20">
                  <Share2 size={16} aria-hidden="true" /> Share shortlist
                </button>
                {compare.length >= 2 && (
                  <>
                    <button type="button" onClick={() => setCompareOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#173b68] px-4 py-2.5 text-sm font-semibold text-white">
                      <GitCompareArrows size={16} aria-hidden="true" /> Compare saved choices
                    </button>
                    <a href={createDecisionReportUrl("https://campuschoice-bd.vercel.app", compare, compareProgram || programFilter)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-blue-400">
                      <Printer size={16} aria-hidden="true" /> Decision report
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="mt-3 min-h-5 text-sm font-medium text-emerald-300" aria-live="polite">
            {shortlistMessage}
          </p>
          {compare.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {compare.map((id) => universities.find((university) => university.id === id)).filter((university): university is University => Boolean(university)).map((university) => (
                <article key={university.id} className="shortlist-card rounded-xl border border-slate-700 bg-[#172337] p-5">
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
              <p className="mt-2 text-sm text-slate-400">Use the Save button on a university card to keep it here.</p>
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-500">Your shortlist and application stages are stored in this browser. A share link includes only university choices and the selected comparison programme—never your application stages.</p>
        </div>
      </section>

      <section
        id="calculator"
        className="experience-section border-y border-slate-700 bg-[#121c2b]"
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
          <div className="tool-panel rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
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

      <section id="living-cost" className="experience-section border-y border-slate-700 bg-[#121c2b]">
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
            <div className="tool-panel rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
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
                    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-700" role="region" aria-label="Year-by-year financial plan" tabIndex={0}>
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
        className="experience-section mx-auto max-w-7xl px-5 py-14 lg:px-8"
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
          <div className="tool-panel rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
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

      <section id="readiness" className="experience-section mx-auto max-w-7xl px-5 py-14 lg:px-8">
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
          <div className="tool-panel rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
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
                  <div className="flex flex-wrap gap-2">
                    {readinessProfile.admissionRules?.sourceUrl && (
                      <a href={readinessProfile.admissionRules.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-blue-400">
                        Official admission rules <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    )}
                    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-blue-400/40 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-400/20">
                      <Printer size={16} aria-hidden="true" /> Print checklist
                    </button>
                  </div>
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

      <section id="grades" className="experience-section border-y border-slate-700 bg-[#121c2b]">
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
                After choosing a university, review its own grading scale. A
                chart appears only when the current official policy has been
                checked—never copied from another university.
              </p>
              <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-100">
                <div className="flex items-center justify-between gap-3">
                  <b>{Object.keys(gradeCharts).length} of {universities.length} grading policies verified</b>
                  <span className="text-xs text-emerald-200">{universities.length - Object.keys(gradeCharts).length} pending</span>
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"
                  role="progressbar"
                  aria-label="Official university grading policies verified"
                  aria-valuemin={0}
                  aria-valuemax={universities.length}
                  aria-valuenow={Object.keys(gradeCharts).length}
                >
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                    style={{ width: `${(Object.keys(gradeCharts).length / universities.length) * 100}%` }}
                  />
                </div>
                <p className="mt-3 text-emerald-100">
                  This count covers grading policies—not university profiles or programme data. Every university remains searchable; an unverified scale stays hidden until its own official policy is available.
                </p>
              </div>
            </div>
            <div className="tool-panel rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
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
                  <div className="overflow-x-auto rounded-xl border border-slate-700" role="region" aria-label={`${gradeUniversity} official grade chart`} tabIndex={0}>
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

      <footer id="about" className="border-t border-slate-700 bg-[#0b1421]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
          <a href="#top" className="inline-flex items-center gap-3">
            <Image src="/logo-mark.svg" alt="" width={34} height={34} />
            <b className="text-slate-100">CampusChoice BD</b>
          </a>
          <div>
            <p className="text-sm text-slate-300">
              Built by <b className="text-slate-100">Md Iftee Raiyan</b>
            </p>
            <div className="mt-2 flex justify-center gap-4 sm:justify-start">
              <a
                href="https://www.linkedin.com/in/md-iftee-raiyan-b20336386/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
              >
                LinkedIn <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a
                href="https://github.com/MdIfteeRaiyan/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
              >
                GitHub <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <p className="max-w-xs text-xs leading-5 text-slate-500 sm:text-right">
            Source-checked guidance. Confirm final details with the university.
          </p>
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
                  className={`mt-3 rounded-lg border px-4 py-3 text-sm ${detail.minGpa === undefined ? "border-amber-400/25 bg-amber-400/5 text-amber-100" : directProfile || !useGpa ? "border-blue-400/25 bg-blue-400/5 text-blue-100" : gpa >= detail.minGpa ? "border-emerald-400/25 bg-emerald-400/5 text-emerald-100" : "border-rose-400/25 bg-rose-400/5 text-rose-100"}`}
                >
                  {detail.minGpa === undefined ? (
                    <b>Minimum GPA verification is still pending.</b>
                  ) : directProfile || !useGpa ? (
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
                  <a href={universityProfilePath(detail)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-400/40 bg-blue-400/10 px-4 py-2.5 text-sm font-semibold text-blue-100 hover:bg-blue-400/20">
                    Open permanent university profile <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="comparison-workspace max-h-[92vh] overflow-y-auto border-slate-700 bg-[#172337] text-slate-100 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Compare your shortlist
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Compare the same programme and scan only the facts that matter.
            </DialogDescription>
          </DialogHeader>
          {chosen.length < 2 ? (
            <div className="my-5 rounded-xl border border-dashed border-slate-600 p-7 text-center">
              <GitCompareArrows className="mx-auto text-slate-500" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-slate-200">Add one more university</h3>
              <p className="mt-2 text-sm text-slate-400">
                Choose two or three universities for a useful side-by-side comparison.
              </p>
              <a
                href="#universities"
                onClick={() => setCompareOpen(false)}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#173b68] px-4 py-2 text-sm font-semibold text-white"
              >
                Browse universities
              </a>
            </div>
          ) : (
            <div className="mt-4">
              <div className="grid gap-4 rounded-xl border border-slate-700 bg-[#111b2a]/70 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <SearchSelect
                  label="Compare programme"
                  value={compareProgram || programFilter || "General overview"}
                  options={comparisonProgramOptions}
                  onChange={setCompareProgram}
                />
                <p className="text-xs leading-5 text-slate-400 md:max-w-64 md:pb-2">
                  Costs stay pending when the same programme does not have a verified published total.
                </p>
              </div>

              {lowestVerifiedComparisonCost && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-400/5 px-4 py-3 text-sm">
                  <span className="text-slate-300">Lowest verified {comparisonSubject || "reference"} total</span>
                  <b className="text-emerald-300">
                    {lowestVerifiedComparisonCost.short} · {money(lowestVerifiedComparisonCost.totalCost!)}
                  </b>
                </div>
              )}

              <div className="mt-4 grid gap-4 md:hidden">
                {chosen.map((u) => {
                  const programmeAvailable =
                    !comparisonSubject ||
                    u.programs.some((name) =>
                      programMatches(name, comparisonSubject),
                    );
                  return (
                    <article key={u.id} className="surface-card rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <UniversityMark university={u} />
                          <div className="min-w-0">
                            <h3 className="font-bold leading-5 text-white">{u.name}</h3>
                            <p className="mt-1 text-xs text-slate-400">{u.area ?? u.district}, {u.division}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(u.id)}
                          className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-400/10"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Info label="Programme" value={comparisonSubject ? (programmeAvailable ? "Available" : "Not listed") : `${u.programs.length} listed`} />
                        <Info label="Verified cost" value={u.totalCost === undefined ? "Pending" : money(u.totalCost)} />
                        <Info label="Minimum GPA" value={u.minGpa === undefined ? "Pending" : u.minGpa.toFixed(1)} />
                        <Info label="Scholarships" value={u.scholarships?.length ? `${u.scholarships.length} rules` : "Pending"} />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-700 pt-3">
                        <span className={`text-xs font-semibold ${u.status === "Official" ? "text-emerald-300" : "text-amber-200"}`}>
                          {u.status === "Official" ? `Checked ${u.verifiedAt}` : "Verification pending"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCompareOpen(false);
                            setDirectProfile(true);
                            setDetail(u);
                          }}
                          className="text-sm font-semibold text-blue-300 hover:text-blue-200"
                        >
                          View profile
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-700 md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="bg-[#111b2a]">
                    <th className="compare-cell sticky left-0 z-10 bg-[#111b2a] text-left">Factor</th>
                    {chosen.map((u) => (
                      <th key={u.id} className="compare-cell text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span>{u.short}</span>
                          <button type="button" onClick={() => toggle(u.id)} className="rounded px-2 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-400/10">
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <Row label="University" values={chosen.map((u) => u.name)} />
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
                  {comparisonSubject && (
                    <Row
                      label={`${comparisonSubject} availability`}
                      values={chosen.map((u) =>
                        u.programs.some((name) =>
                          programMatches(name, comparisonSubject),
                        )
                          ? "Listed by university"
                          : "Not listed",
                      )}
                    />
                  )}
                  <Row
                    label={
                      comparisonSubject
                        ? `${comparisonSubject} total cost`
                        : "Published reference total"
                    }
                    values={chosen.map((u) =>
                      u.totalCost === undefined
                        ? "Verification pending"
                        : money(u.totalCost),
                    )}
                  />
                  <Row
                    label={comparisonSubject ? `${comparisonSubject} credits` : "Reference credits"}
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
                    label={useGpa ? `Your GPA (${gpa.toFixed(1)})` : "Your GPA"}
                    values={chosen.map((u) =>
                      !useGpa
                        ? "Not entered"
                        : u.minGpa === undefined
                        ? "Requirement pending"
                        : gpa >= u.minGpa
                          ? "Requirement met"
                          : "Requirement not met",
                    )}
                  />
                </tbody>
              </table>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                A lower cost or larger programme count does not automatically mean a better fit. Confirm the active intake with the linked official source before applying.
              </p>
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
    <tr className="comparison-row">
      <th className="compare-cell sticky left-0 z-[1] bg-[#152136] text-left">{label}</th>
      {values.map((v, i) => (
        <td className="compare-cell" key={i}>
          {v}
        </td>
      ))}
    </tr>
  );
}
