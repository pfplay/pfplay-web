export function decoder(value: string) {
  if (/^(\d+|\d*\.\d+)$/.test(value)) {
    return parseFloat(value);
  }

  const keywords: Record<string, unknown> = {
    true: true,
    false: false,
    null: null,
    undefined: undefined,
  };
  if (value in keywords) {
    return keywords[value];
  }

  return value;
}
