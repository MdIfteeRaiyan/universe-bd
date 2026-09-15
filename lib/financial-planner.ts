export type MoneyRange = { low: number; high: number };

export type FinancialPlanInput = {
  academicTotal: number;
  studyMonths: number;
  monthlyLiving: MoneyRange;
  annualAcademicIncreasePercent: number;
  contingencyPercent: number;
  scholarshipPercent?: number;
  scholarshipAppliesTo?: number;
  setupCost?: MoneyRange;
};

const academicSchedule = (
  base: number,
  months: number,
  annualIncreasePercent: number,
) => {
  const years = Math.max(1, Math.ceil(months / 12));
  const annualBase = base / years;
  const rate = Math.max(0, annualIncreasePercent) / 100;
  return Array.from(
    { length: years },
    (_, year) => annualBase * (1 + rate) ** year,
  );
};

export function createFinancialPlan(input: FinancialPlanInput) {
  const scholarshipPercent = Math.min(
    100,
    Math.max(0, input.scholarshipPercent ?? 0),
  );
  const scholarshipBase = Math.min(
    input.academicTotal,
    Math.max(0, input.scholarshipAppliesTo ?? input.academicTotal),
  );
  const scholarshipSaving = scholarshipBase * (scholarshipPercent / 100);
  const academicAfterScholarship = Math.max(
    0,
    input.academicTotal - scholarshipSaving,
  );
  const academicByYear = academicSchedule(
    academicAfterScholarship,
    input.studyMonths,
    input.annualAcademicIncreasePercent,
  );
  const projectedAcademic = academicByYear.reduce(
    (total, amount) => total + amount,
    0,
  );
  const living = {
    low: input.monthlyLiving.low * input.studyMonths,
    high: input.monthlyLiving.high * input.studyMonths,
  };
  const setup = input.setupCost ?? { low: 0, high: 0 };
  const subtotal = {
    low: projectedAcademic + living.low + setup.low,
    high: projectedAcademic + living.high + setup.high,
  };
  const contingencyRate = Math.max(0, input.contingencyPercent) / 100;
  const yearBreakdown = academicByYear.map((academic, index) => {
    const months = Math.min(12, input.studyMonths - index * 12);
    const livingLow = input.monthlyLiving.low * months;
    const livingHigh = input.monthlyLiving.high * months;
    const setupLow = index === 0 ? setup.low : 0;
    const setupHigh = index === 0 ? setup.high : 0;
    const subtotalLow = academic + livingLow + setupLow;
    const subtotalHigh = academic + livingHigh + setupHigh;
    return {
      year: index + 1,
      months,
      academic,
      living: { low: livingLow, high: livingHigh },
      contingency: {
        low: subtotalLow * contingencyRate,
        high: subtotalHigh * contingencyRate,
      },
      total: {
        low: subtotalLow * (1 + contingencyRate),
        high: subtotalHigh * (1 + contingencyRate),
      },
    };
  });

  return {
    academicAfterScholarship,
    projectedAcademic,
    scholarshipSaving,
    living,
    setup,
    yearBreakdown,
    contingency: {
      low: subtotal.low * contingencyRate,
      high: subtotal.high * contingencyRate,
    },
    grandTotal: {
      low: subtotal.low * (1 + contingencyRate),
      high: subtotal.high * (1 + contingencyRate),
    },
  };
}
