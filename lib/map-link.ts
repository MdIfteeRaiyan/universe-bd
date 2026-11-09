import type { University } from "@/data/models";

export const universityMapQuery = (university: University) =>
  university.address ??
  [university.name, university.area, university.district, university.division, "Bangladesh"]
    .filter(Boolean)
    .join(", ");

export const universityMapUrl = (university: University) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(universityMapQuery(university))}`;
