import React, { useState } from "react";
import { validateUsername } from "../../lib/username-validation.js";
import { MenuButton } from "../components/menu-button.js";
import { ScreenShell } from "../components/screen-shell.js";

export const SettingsScreen = ({
  currentUsername,
  onSave,
  onBack
}: {
  readonly currentUsername: string;
  readonly onSave: (username: string) => void;
  readonly onBack: () => void;
}): React.ReactElement => {
  const [username, setUsername] = useState<string>(currentUsername);
  const [error, setError] = useState<string | null>(null);

  const submit = (): void => {
    const result = validateUsername(username);
    if (!result.valid) {
      setError(result.message);
      return;
    }

    setError(null);
    onSave(result.normalized);
  };

  return (
    <ScreenShell title="Settings" subtitle="Update your local profile username.">
      <label className="field-label" htmlFor="settings-username">
        Username
      </label>
      <input
        id="settings-username"
        className="text-input"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        maxLength={20}
      />
      {error ? <p className="field-error">{error}</p> : null}
      <div className="button-row">
        <MenuButton label="Save" onClick={submit} />
        <MenuButton label="Back" onClick={onBack} />
      </div>
    </ScreenShell>
  );
};
