const USERNAME_KEY = "tdpvp.profile.username";
const ONBOARDING_KEY = "tdpvp.profile.onboarded";

export interface LocalProfile {
  readonly username: string;
  readonly onboarded: boolean;
}

const hasStorage = (): boolean => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

export const loadLocalProfile = (): LocalProfile => {
  if (!hasStorage()) {
    return {
      username: "",
      onboarded: false
    };
  }

  const username = window.localStorage.getItem(USERNAME_KEY) ?? "";
  const onboardedRaw = window.localStorage.getItem(ONBOARDING_KEY) ?? "false";

  return {
    username,
    onboarded: onboardedRaw === "true"
  };
};

export const saveUsername = (username: string): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(USERNAME_KEY, username);
};

export const saveOnboarded = (onboarded: boolean): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(ONBOARDING_KEY, onboarded ? "true" : "false");
};
