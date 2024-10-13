export function deepEqual(a: object, b: object): boolean {
  if (typeof a === 'object' && typeof b === 'object') {
    if (a === null || b === null) {
      return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      return isArrayEqual(a, b);
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key as keyof typeof a], b[key as keyof typeof b])) {
        return false;
      }
    }

    return true;
  }

  return a === b;
}

function isArrayEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    const aValue = a[i];
    const bValue = b[i];

    if (typeof aValue === 'object' && typeof bValue === 'object') {
      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        if (!isArrayEqual(aValue, bValue)) {
          return false;
        }
        continue;
      }
      if (!deepEqual(aValue, bValue)) {
        return false;
      }
      continue;
    }
    if (aValue !== bValue) {
      return false;
    }
  }

  return true;
}
