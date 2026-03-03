export const CATEGORY_NAMES = [
  'Slab & Structure',
  'Framing',
  'Roofing',
  'Windows & Doors',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Joinery',
  'Tiling',
  'Flooring',
  'Painting',
  'Landscaping',
  'Site Costs'
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];
export type CategoryPercents = Record<CategoryName, number>;

export type NormalizationResult = {
  raw: CategoryPercents;
  normalized: CategoryPercents;
  warnings: string[];
};

export function normalizeCategoryPercents(raw: CategoryPercents): NormalizationResult {
  const sum = Object.values(raw).reduce((acc, value) => acc + value, 0);
  const warnings: string[] = [];

  if (Math.abs(sum - 1) > 0.01) {
    warnings.push('Category percentages normalized because they did not sum to 100%.');
  }

  const normalized = Object.fromEntries(
    CATEGORY_NAMES.map((name) => [name, sum === 0 ? 0 : raw[name] / sum])
  ) as CategoryPercents;

  return { raw, normalized, warnings };
}
