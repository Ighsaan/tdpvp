import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BattleRoomSnapshot,
  CommandRejectedEvent,
  PlayerSide,
  RoomPhase,
  TowerType
} from "@tdpvp/shared";
import { ThreeBattlefieldScene } from "../../game/rendering/three-battlefield-scene.js";

interface BattleRendererPanelProps {
  readonly snapshot: BattleRoomSnapshot;
  readonly localSessionId: string | null;
  readonly lastError: string | null;
  readonly lastRejectedCommand: CommandRejectedEvent | null;
  readonly onSendPing: () => void;
  readonly onPlaceTower: (
    towerType: TowerType,
    laneIndex: number,
    positionX: number
  ) => void;
  readonly onRemoveTower: (towerId: string) => void;
}

export const BattleRendererPanel = ({
  snapshot,
  localSessionId,
  lastError,
  lastRejectedCommand,
  onSendPing,
  onPlaceTower,
  onRemoveTower
}: BattleRendererPanelProps): React.ReactElement => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<ThreeBattlefieldScene | null>(null);
  const [selectedLane, setSelectedLane] = useState<number>(0);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const scene = new ThreeBattlefieldScene(viewport);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const laneCount = snapshot.battlefield.laneCount;
    setSelectedLane((current) => {
      if (laneCount <= 0) {
        return 0;
      }
      return ((current % laneCount) + laneCount) % laneCount;
    });
  }, [snapshot.battlefield.laneCount]);

  useEffect(() => {
    sceneRef.current?.renderSnapshot(snapshot, selectedLane);
  }, [selectedLane, snapshot]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const key = event.key.toLowerCase();

      if (key === "a") {
        setSelectedLane((lane) => {
          const laneCount = snapshot.battlefield.laneCount;
          return (lane - 1 + laneCount) % laneCount;
        });
        return;
      }

      if (key === "d") {
        setSelectedLane((lane) => {
          const laneCount = snapshot.battlefield.laneCount;
          return (lane + 1) % laneCount;
        });
        return;
      }

      if (key === "p") {
        onSendPing();
        return;
      }

      if (event.key === "1") {
        tryPlaceTower(TowerType.BasicSpawner);
        return;
      }

      if (event.key === "2") {
        tryPlaceTower(TowerType.FastSpawner);
        return;
      }

      if (key === "x") {
        tryRemoveLatestOwnedTower();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const localPlayer = useMemo(() => {
    if (!localSessionId) {
      return null;
    }

    return snapshot.players[localSessionId] ?? null;
  }, [localSessionId, snapshot.players]);

  const tryPlaceTower = (towerType: TowerType): void => {
    if (!localSessionId || !localPlayer) {
      return;
    }

    if (snapshot.phase !== RoomPhase.Active) {
      setHint("Tower placement allowed only during active phase.");
      return;
    }

    const positionX = getNextPlacementX(localPlayer.side, snapshot, selectedLane);
    onPlaceTower(towerType, selectedLane, positionX);
    setHint(null);
  };

  const tryRemoveLatestOwnedTower = (): void => {
    if (!localSessionId) {
      return;
    }

    if (snapshot.phase !== RoomPhase.Active) {
      setHint("Tower removal allowed only during active phase.");
      return;
    }

    const lane = snapshot.battlefield.lanes[selectedLane];
    if (!lane) {
      return;
    }

    const ownedTowers = lane.towers.filter(
      (tower) => tower.ownerSessionId === localSessionId
    );
    const latestTower = ownedTowers[ownedTowers.length - 1];
    if (!latestTower) {
      setHint("No owned tower in selected lane.");
      return;
    }

    onRemoveTower(latestTower.towerId);
    setHint(null);
  };

  const rejectSummary = lastRejectedCommand
    ? `${lastRejectedCommand.commandType}:${lastRejectedCommand.reason}`
    : "none";

  return (
    <div className="battle-screen-layout">
      <div className="battlefield-viewport" ref={viewportRef} />
      <aside className="hud-panel">
        <pre className="status-panel">
          {[
            `phase=${snapshot.phase}`,
            `matchCode=${snapshot.matchCode}`,
            `lane=${selectedLane}`,
            `localSide=${localPlayer?.side ?? "n/a"}`,
            `bases left=${snapshot.battlefield.bases.left.hp} right=${snapshot.battlefield.bases.right.hp}`,
            `error=${lastError ?? "none"}`,
            `reject=${rejectSummary}`,
            `hint=${hint ?? "none"}`
          ].join("\n")}
        </pre>
        <pre className="controls-panel">
          {[
            "Battle Controls",
            "A/D - Change lane",
            "1 - Place basic spawner",
            "2 - Place fast spawner",
            "X - Remove latest owned tower",
            "P - Ping"
          ].join("\n")}
        </pre>
      </aside>
    </div>
  );
};

const getNextPlacementX = (
  side: PlayerSide,
  snapshot: BattleRoomSnapshot,
  laneIndex: number
): number => {
  const lane = snapshot.battlefield.lanes[laneIndex];
  const existingCountForSide =
    lane?.towers.filter((tower) => tower.ownerSide === side).length ?? 0;
  const step = 3;

  if (side === PlayerSide.Left) {
    const start = snapshot.battlefield.leftPlacementZoneStartX + 2;
    const end = snapshot.battlefield.leftPlacementZoneEndX - 2;
    return Math.min(end, start + existingCountForSide * step);
  }

  const start = snapshot.battlefield.rightPlacementZoneEndX - 2;
  const end = snapshot.battlefield.rightPlacementZoneStartX + 2;
  return Math.max(end, start - existingCountForSide * step);
};
