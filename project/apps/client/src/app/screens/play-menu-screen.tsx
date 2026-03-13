import React from "react";
import { MenuButton } from "../components/menu-button.js";
import { ScreenShell } from "../components/screen-shell.js";

export const PlayMenuScreen = ({
  loading,
  onCreateMatch,
  onJoinMatch,
  onBack
}: {
  readonly loading: boolean;
  readonly onCreateMatch: () => void;
  readonly onJoinMatch: () => void;
  readonly onBack: () => void;
}): React.ReactElement => {
  return (
    <ScreenShell title="Play Menu" subtitle="Create a lobby or join by code.">
      <div className="button-column">
        <MenuButton label="Create Match" onClick={onCreateMatch} disabled={loading} />
        <MenuButton label="Join Match" onClick={onJoinMatch} disabled={loading} />
        <MenuButton label="Back" onClick={onBack} disabled={loading} />
      </div>
    </ScreenShell>
  );
};
