export interface ValidationResult {
  readonly valid: boolean;
  readonly message: string | null;
  readonly normalized: string;
}

export const validateUsername = (value: string): ValidationResult => {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return {
      valid: false,
      message: "Username is required.",
      normalized
    };
  }

  if (normalized.length < 2) {
    return {
      valid: false,
      message: "Username must be at least 2 characters.",
      normalized
    };
  }

  if (normalized.length > 20) {
    return {
      valid: false,
      message: "Username must be 20 characters or less.",
      normalized
    };
  }

  return {
    valid: true,
    message: null,
    normalized
  };
};
