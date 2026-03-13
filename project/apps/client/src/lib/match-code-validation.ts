export const normalizeMatchCode = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
};

export const validateMatchCode = (value: string): string | null => {
  const normalized = normalizeMatchCode(value);
  if (normalized.length !== 5) {
    return "Match code must be exactly 5 characters.";
  }

  return null;
};
