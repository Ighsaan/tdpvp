const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 20;

export const normalizeUsername = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length < USERNAME_MIN_LENGTH || trimmed.length > USERNAME_MAX_LENGTH) {
    return null;
  }

  return trimmed;
};

export const fallbackUsernameForSession = (sessionId: string): string => {
  return `Player-${sessionId.slice(0, 5)}`;
};
