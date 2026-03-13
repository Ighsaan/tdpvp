import React, { useState } from "react";
import {
  normalizeMatchCode,
  validateMatchCode
} from "../../lib/match-code-validation.js";
import { MenuButton } from "../components/menu-button.js";
import { ScreenShell } from "../components/screen-shell.js";

export const JoinMatchScreen = ({
  loading,
  onJoin,
  onBack
}: {
  readonly loading: boolean;
  readonly onJoin: (matchCode: string) => void;
  readonly onBack: () => void;
}): React.ReactElement => {
  const [matchCode, setMatchCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const submit = (): void => {
    const normalized = normalizeMatchCode(matchCode);
    const validationError = validateMatchCode(normalized);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onJoin(normalized);
  };

  return (
    <ScreenShell title="Join Match" subtitle="Enter a 5-character lobby code.">
      <label className="field-label" htmlFor="join-match-code">
        Match Code
      </label>
      <input
        id="join-match-code"
        className="text-input code-input"
        value={matchCode}
        onChange={(event) => setMatchCode(normalizeMatchCode(event.target.value))}
        maxLength={5}
      />
      {error ? <p className="field-error">{error}</p> : null}
      <div className="button-row">
        <MenuButton label="Join" onClick={submit} disabled={loading} />
        <MenuButton label="Back" onClick={onBack} disabled={loading} />
      </div>
    </ScreenShell>
  );
};
