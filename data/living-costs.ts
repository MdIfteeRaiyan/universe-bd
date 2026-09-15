import type { AccommodationMode } from "./models";

export const accommodationLabels: Record<AccommodationMode, string> = {
  hall: "University hall",
  hostel: "Private hostel",
  mess: "Shared mess",
  family: "Family / rented flat",
};

type LivingCostModel = {
  rent: Record<AccommodationMode, [number, number]>;
  food: [number, number];
  transport: [number, number];
  personal: [number, number];
};

export const districtLivingCosts: Record<string, LivingCostModel> = {
  Dhaka: {
    rent: { hall: [1200, 3500], hostel: [5000, 10000], mess: [4000, 8000], family: [0, 15000] },
    food: [4500, 8000], transport: [1200, 3000], personal: [1200, 3000],
  },
  Chattogram: {
    rent: { hall: [1000, 3000], hostel: [4000, 8500], mess: [3500, 7000], family: [0, 12000] },
    food: [4200, 7500], transport: [1000, 2500], personal: [1200, 2800],
  },
  default: {
    rent: { hall: [800, 2500], hostel: [3000, 6500], mess: [2500, 5500], family: [0, 9000] },
    food: [3800, 6500], transport: [800, 2000], personal: [1000, 2500],
  },
};

export const livingCostChecked = "15 September 2026";

