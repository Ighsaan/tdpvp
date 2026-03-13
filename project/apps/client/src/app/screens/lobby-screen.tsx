import React from "react";
import {
  BattleRoomSnapshot,
  CommandRejectedEvent,
  MAX_LOBBY_LANE_COUNT,
  MIN_LOBBY_LANE_COUNT,
  RoomPhase
} from "@tdpvp/shared";
import { MenuButton } from "../components/menu-button.js";
import { ScreenShell } from "../components/screen-shell.js";

export const LobbyScreen = ({
  snapshot,
  localSessionId,
  lastError,
  lastRejectedCommand,
  onLeave,
  onUpdateLaneCount,
  onStart
}: {
  readonly snapshot: BattleRoomSnapshot;
  readonly localSessionId: string | null;
  readonly lastError: string | null;
  readonly lastRejectedCommand: CommandRejectedEvent | null;
  readonly onLeave: () => void;
  readonly onUpdateLaneCount: (laneCount: number) => void;
  readonly onStart: () => void;
}): React.ReactElement => {
  const players = Object.values(snapshot.players);
  const hostSessionId = snapshot.hostSessionId;
  const localIsHost = localSessionId !== null && hostSessionId === localSessionId;
  const laneCount = snapshot.battlefield.laneCount;
  const rejectSummary = lastRejectedCommand
    ? `${lastRejectedCommand.commandType}:${lastRejectedCommand.reason}`
    : null;

  return (
    <ScreenShell
      title="Lobby"
      subtitle={`Match Code ${snapshot.matchCode} | Phase ${snapshot.phase}`}
    >
      <div className="lobby-row">
        <span>Host</span>
        <strong>
          {hostSessionId
            ? snapshot.players[hostSessionId]?.username ?? hostSessionId
            : "none"}
        </strong>
      </div>
      <div className="lobby-row">
        <span>Players</span>
        <strong>{players.length}</strong>
      </div>

      <ul className="player-list">
        {players.map((player) => {
          const isHost = player.sessionId === hostSessionId;
          return (
            <li key={player.sessionId} className="player-item">
              <span>{player.username}</span>
              <span>{isHost ? "HOST" : player.side}</span>
            </li>
          );
        })}
      </ul>

      <div className="lane-control">
        <span>Lane Count</span>
        <div className="lane-control-buttons">
          <MenuButton
            label="-"
            onClick={() => onUpdateLaneCount(Math.max(MIN_LOBBY_LANE_COUNT, laneCount - 1))}
            disabled={!localIsHost}
          />
          <strong>{laneCount}</strong>
          <MenuButton
            label="+"
            onClick={() => onUpdateLaneCount(Math.min(MAX_LOBBY_LANE_COUNT, laneCount + 1))}
            disabled={!localIsHost}
          />
        </div>
      </div>

      <div className="button-row">
        <MenuButton label="Leave Lobby" onClick={onLeave} />
        <MenuButton
          label="Start Game"
          onClick={onStart}
          disabled={!localIsHost || players.length < 2 || snapshot.phase === RoomPhase.Active}
        />
      </div>

      {lastError ? <p className="field-error">{lastError}</p> : null}
      {rejectSummary ? <p className="field-error">Rejected: {rejectSummary}</p> : null}
    </ScreenShell>
  );
};
