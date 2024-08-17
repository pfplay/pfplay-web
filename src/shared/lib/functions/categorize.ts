export type Categorized<T> = {
  [k: string]: T[];
};
type CategorizeParams<T> = {
  items: T[];
  categoryKey: keyof T;
  getCategoryValue?: (item: T) => T[keyof T];
  orderReferenceArr?: T[keyof T][];
};
export const categorize = <T>({
  items,
  categoryKey,
  getCategoryValue = (element) => element[categoryKey],
  orderReferenceArr,
}: CategorizeParams<T>): Categorized<T> => {
  const categories = orderReferenceArr || Array.from(new Set(items.map(getCategoryValue)));

  const groupedItems = categories.reduce((acc, category) => {
    const filteredItems = items.filter((item) => getCategoryValue(item) === category);
    if (filteredItems.length > 0) {
      acc[String(category)] = filteredItems;
    }
    return acc;
  }, {} as Record<string, T[]>);

  return groupedItems;
};
