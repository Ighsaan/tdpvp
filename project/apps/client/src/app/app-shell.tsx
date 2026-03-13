import React, { useEffect, useMemo, useState } from "react";
import { RoomPhase, TowerType } from "@tdpvp/shared";
import { BattleRendererPanel } from "./components/battle-renderer-panel.js";
import { MainMenuScreen } from "./screens/main-menu-screen.js";
import { JoinMatchScreen } from "./screens/join-match-screen.js";
import { LobbyScreen } from "./screens/lobby-screen.js";
import { OnboardingScreen } from "./screens/onboarding-screen.js";
import { PlayMenuScreen } from "./screens/play-menu-screen.js";
import { SettingsScreen } from "./screens/settings-screen.js";
import { useProfile } from "./providers/profile-provider.js";
import { AppScreen } from "./routes/app-screen.js";
import { MultiplayerService, MultiplayerServiceState } from "../network/multiplayer-service.js";
import { runDesktopUpdateStartupCheck } from "../lib/desktop-update-service.js";

const initialNetworkState: MultiplayerServiceState = {
  connectionStatus: "idle",
  localSessionId: null,
  currentMatchCode: null,
  lastError: null,
  latestSnapshot: null,
  lastPong: null,
  lastRejectedCommand: null
};

export const AppShell = (): React.ReactElement => {
  const profile = useProfile();
  const multiplayer = useMemo(() => new MultiplayerService(), []);
  const [networkState, setNetworkState] = useState<MultiplayerServiceState>(initialNetworkState);
  const [menuScreen, setMenuScreen] = useState<AppScreen>("main_menu");
  const [loadingLobbyAction, setLoadingLobbyAction] = useState<boolean>(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [desktopUpdateNotice, setDesktopUpdateNotice] = useState<string | null>(null);
  const [desktopUpdateError, setDesktopUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = multiplayer.subscribe((state) => {
      setNetworkState(state);
    });

    return () => {
      unsubscribe();
      void multiplayer.leave();
    };
  }, [multiplayer]);

  useEffect(() => {
    let disposed = false;

    void (async () => {
      const updateResult = await runDesktopUpdateStartupCheck();
      if (disposed) {
        return;
      }

      if (updateResult.status === "error") {
        setDesktopUpdateError(updateResult.message);
        setDesktopUpdateNotice(null);
        return;
      }

      if (updateResult.status === "deferred" || updateResult.status === "installed") {
        setDesktopUpdateNotice(updateResult.message);
        setDesktopUpdateError(null);
        return;
      }

      setDesktopUpdateNotice(null);
      setDesktopUpdateError(null);
    })();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (networkState.latestSnapshot || networkState.connectionStatus !== "connecting") {
      setLoadingLobbyAction(false);
    }
  }, [networkState.connectionStatus, networkState.latestSnapshot]);

  const currentScreen: AppScreen = (() => {
    if (!profile.onboarded) {
      return "onboarding";
    }

    if (networkState.latestSnapshot?.phase === RoomPhase.Active) {
      return "battle";
    }

    if (networkState.latestSnapshot) {
      return "lobby";
    }

    return menuScreen;
  })();

  const runLobbyAction = async (action: () => Promise<void>): Promise<void> => {
    setLoadingLobbyAction(true);
    setUiError(null);
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lobby action failed.";
      setUiError(message);
      setLoadingLobbyAction(false);
    }
  };

  const createMatch = async (): Promise<void> => {
    await runLobbyAction(async () => {
      await multiplayer.createMatch(profile.username);
    });
  };

  const joinMatch = async (matchCode: string): Promise<void> => {
    await runLobbyAction(async () => {
      await multiplayer.joinMatch(matchCode, profile.username);
    });
  };

  const leaveLobby = async (): Promise<void> => {
    await multiplayer.leave();
    setMenuScreen("main_menu");
    setLoadingLobbyAction(false);
  };

  const networkError = networkState.lastError;
  const combinedError = uiError ?? networkError;
  const topError = combinedError ?? desktopUpdateError;

  return (
    <main className="app-shell-root">
      {topError ? <p className="global-error">{topError}</p> : null}
      {!topError && desktopUpdateNotice ? <p className="global-notice">{desktopUpdateNotice}</p> : null}

      {currentScreen === "onboarding" ? (
        <OnboardingScreen
          initialUsername={profile.username}
          onComplete={(username) => {
            profile.completeOnboarding(username);
            setMenuScreen("main_menu");
          }}
        />
      ) : null}

      {currentScreen === "main_menu" ? (
        <MainMenuScreen
          username={profile.username}
          onPlay={() => setMenuScreen("play_menu")}
          onSettings={() => setMenuScreen("settings")}
        />
      ) : null}

      {currentScreen === "play_menu" ? (
        <PlayMenuScreen
          loading={loadingLobbyAction}
          onCreateMatch={() => {
            void createMatch();
          }}
          onJoinMatch={() => setMenuScreen("join_match")}
          onBack={() => setMenuScreen("main_menu")}
        />
      ) : null}

      {currentScreen === "join_match" ? (
        <JoinMatchScreen
          loading={loadingLobbyAction}
          onJoin={(matchCode) => {
            void joinMatch(matchCode);
          }}
          onBack={() => setMenuScreen("play_menu")}
        />
      ) : null}

      {currentScreen === "settings" ? (
        <SettingsScreen
          currentUsername={profile.username}
          onSave={(username) => {
            profile.updateUsername(username);
            setMenuScreen("main_menu");
          }}
          onBack={() => setMenuScreen("main_menu")}
        />
      ) : null}

      {currentScreen === "lobby" && networkState.latestSnapshot ? (
        <LobbyScreen
          snapshot={networkState.latestSnapshot}
          localSessionId={networkState.localSessionId}
          lastError={networkState.lastError}
          lastRejectedCommand={networkState.lastRejectedCommand}
          onLeave={() => {
            void leaveLobby();
          }}
          onUpdateLaneCount={(laneCount) => multiplayer.sendUpdateLobbyLaneCount(laneCount)}
          onStart={() => multiplayer.sendStartMatch()}
        />
      ) : null}

      {currentScreen === "battle" && networkState.latestSnapshot ? (
        <BattleRendererPanel
          snapshot={networkState.latestSnapshot}
          localSessionId={networkState.localSessionId}
          lastError={networkState.lastError}
          lastRejectedCommand={networkState.lastRejectedCommand}
          onSendPing={() => multiplayer.sendPing()}
          onPlaceTower={(towerType: TowerType, laneIndex: number, positionX: number) => {
            multiplayer.sendPlaceTower(towerType, laneIndex, positionX);
          }}
          onRemoveTower={(towerId: string) => multiplayer.sendRemoveTower(towerId)}
        />
      ) : null}
    </main>
  );
};
