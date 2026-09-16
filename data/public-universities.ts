import type { University } from "./models";

const cohort = (
  id: number,
  name: string,
  short: string,
  district: string,
  division: string,
  area: string,
  address: string,
  programs: string[],
  sources: { label: string; url: string }[],
  complete: boolean,
): University => ({
  id,
  name,
  short,
  institutionType: "Public",
  district,
  division,
  area,
  address,
  programs,
  programCatalogComplete: complete,
  status: "Official",
  costLabel: "Current official programme costs pending verification",
  facts: [
    `Public engineering university in ${district}`,
    "Admission rules and department allocation are session-specific",
    "Detailed current-session verification is in progress",
  ],
  sources,
  verifiedAt: "16 September 2026",
});

export const publicUniversities: University[] = [
  cohort(89, "Bangladesh University of Engineering and Technology", "BUET", "Dhaka", "Dhaka", "Palashi", "BUET Central Road, Dhaka 1000, Bangladesh", ["Architecture", "Biomedical Engineering", "Chemical Engineering", "Civil Engineering", "CSE", "EEE", "Industrial & Production Engineering", "Materials & Metallurgical Engineering", "Mechanical Engineering", "Nanomaterials & Ceramic Engineering", "Naval Architecture & Marine Engineering", "Urban & Regional Planning", "Water Resources Engineering"], [{ label: "Official university website", url: "https://www.buet.ac.bd/web/" }, { label: "Official undergraduate admission portal", url: "https://ugadmission.buet.ac.bd/" }], false),
  cohort(90, "Chittagong University of Engineering and Technology", "CUET", "Chattogram", "Chattogram", "Pahartali, Raozan", "Pahartali, Raozan, Chattogram 4349, Bangladesh", ["Architecture", "Biomedical Engineering", "Civil Engineering", "CSE", "Electrical & Electronic Engineering", "Electronics & Telecommunication Engineering", "Industrial & Production Engineering", "Materials Science & Engineering", "Mechanical Engineering", "Mechatronics & Industrial Engineering", "Petroleum & Mining Engineering", "Urban & Regional Planning", "Water Resources Engineering"], [{ label: "Official programme and department catalogue", url: "https://cuet.ac.bd/" }, { label: "Official undergraduate admission portal", url: "https://admissioncuet.ac.bd/" }], true),
  cohort(91, "Khulna University of Engineering and Technology", "KUET", "Khulna", "Khulna", "Fulbarigate", "Khulna University of Engineering & Technology, Khulna 9203, Bangladesh", ["Architecture", "Biomedical Engineering", "Building Engineering & Construction Management", "Chemical Engineering", "Civil Engineering", "CSE", "Electrical & Electronic Engineering", "Electronics & Communication Engineering", "Energy Science & Engineering", "Industrial Engineering & Management", "Leather Engineering", "Materials Science & Engineering", "Mechanical Engineering", "Mechatronics Engineering", "Textile Engineering", "Urban & Regional Planning"], [{ label: "Official university academics and departments", url: "https://kuet.ac.bd/" }, { label: "Official undergraduate admission portal", url: "https://admission.kuet.ac.bd/" }], false),
  cohort(92, "Rajshahi University of Engineering and Technology", "RUET", "Rajshahi", "Rajshahi", "Kazla", "Kazla, Rajshahi 6204, Bangladesh", ["Architecture", "Building Engineering & Construction Management", "Ceramic & Metallurgical Engineering", "Chemical Engineering", "Civil Engineering", "CSE", "Electrical & Computer Engineering", "Electrical & Electronic Engineering", "Electronics & Telecommunication Engineering", "Glass & Ceramic Engineering", "Industrial & Production Engineering", "Materials Science & Engineering", "Mechanical Engineering", "Mechatronics Engineering", "Urban & Regional Planning"], [{ label: "Official university and department directory", url: "https://www.ruet.ac.bd/" }, { label: "Official undergraduate admission information", url: "https://www.ruet.ac.bd/page/undergraduate-admission" }], true),
];
