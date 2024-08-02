export type Categorized<T> = {
  [k: string]: T[];
};
type CategorizeParams<T, K extends keyof T> = {
  items: T[];
  categoryKey: K;
  getCategoryValue: (item: T) => string;
  orderReferenceArr?: string[];
};
export const categorize = <T, K extends keyof T>({
  items,
  categoryKey,
  getCategoryValue = (element) => element[categoryKey] as string,
  orderReferenceArr,
}: CategorizeParams<T, K>): Categorized<T> => {
  const categories = orderReferenceArr || Array.from(new Set(items.map(getCategoryValue)));

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter((item) => getCategoryValue(item) === category);
    return acc;
  }, {} as Record<string, T[]>);

  return Object.fromEntries(categories.map((category) => [category, groupedItems[category]]));
};
