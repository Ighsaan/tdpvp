import React, { createContext, useContext, useMemo, useState } from "react";
import { loadLocalProfile, saveOnboarded, saveUsername } from "../../lib/profile-storage.js";

interface ProfileContextValue {
  readonly username: string;
  readonly onboarded: boolean;
  readonly completeOnboarding: (username: string) => void;
  readonly updateUsername: (username: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const ProfileProvider = ({
  children
}: {
  readonly children: React.ReactNode;
}): React.ReactElement => {
  const loaded = loadLocalProfile();
  const [username, setUsername] = useState<string>(loaded.username);
  const [onboarded, setOnboarded] = useState<boolean>(loaded.onboarded);

  const value = useMemo<ProfileContextValue>(() => {
    return {
      username,
      onboarded,
      completeOnboarding: (nextUsername: string) => {
        setUsername(nextUsername);
        setOnboarded(true);
        saveUsername(nextUsername);
        saveOnboarded(true);
      },
      updateUsername: (nextUsername: string) => {
        setUsername(nextUsername);
        saveUsername(nextUsername);
      }
    };
  }, [onboarded, username]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextValue => {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error("useProfile must be used inside ProfileProvider.");
  }

  return value;
};
