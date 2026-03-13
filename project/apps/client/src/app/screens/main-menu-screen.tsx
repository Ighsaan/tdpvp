import React from "react";
import { MenuButton } from "../components/menu-button.js";
import { ScreenShell } from "../components/screen-shell.js";

export const MainMenuScreen = ({
  username,
  onPlay,
  onSettings
}: {
  readonly username: string;
  readonly onPlay: () => void;
  readonly onSettings: () => void;
}): React.ReactElement => {
  return (
    <ScreenShell
      title="Main Menu"
      subtitle={`Signed in as ${username}`}
    >
      <div className="button-column">
        <MenuButton label="Play" onClick={onPlay} />
        <MenuButton label="Settings" onClick={onSettings} />
      </div>
    </ScreenShell>
  );
};
