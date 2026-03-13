import React, { useState } from "react";
import { validateUsername } from "../../lib/username-validation.js";
import { MenuButton } from "../components/menu-button.js";
import { ScreenShell } from "../components/screen-shell.js";

export const OnboardingScreen = ({
  initialUsername,
  onComplete
}: {
  readonly initialUsername: string;
  readonly onComplete: (username: string) => void;
}): React.ReactElement => {
  const [username, setUsername] = useState<string>(initialUsername);
  const [error, setError] = useState<string | null>(null);

  const submit = (): void => {
    const result = validateUsername(username);
    if (!result.valid) {
      setError(result.message);
      return;
    }

    setError(null);
    onComplete(result.normalized);
  };

  return (
    <ScreenShell
      title="Welcome Commander"
      subtitle="Set a username to continue into the PvP menu flow."
    >
      <label className="field-label" htmlFor="onboarding-username">
        Username
      </label>
      <input
        id="onboarding-username"
        className="text-input"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        maxLength={20}
      />
      {error ? <p className="field-error">{error}</p> : null}
      <div className="button-row">
        <MenuButton label="Continue" onClick={submit} />
      </div>
    </ScreenShell>
  );
};
