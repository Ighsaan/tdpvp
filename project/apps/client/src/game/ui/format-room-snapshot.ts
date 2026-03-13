import { BattleRoomSnapshot } from "@tdpvp/shared";

export const formatRoomSnapshot = (snapshot: BattleRoomSnapshot): string => {
  const playerRows = Object.values(snapshot.players).map((player) => {
    return [
      `${player.side}`,
      `ready=${player.ready}`,
      `connected=${player.connected}`,
      `towers=${player.towerCount}`,
      `units=${player.unitCount}`,
      `session=${player.sessionId.slice(0, 8)}`
    ].join(" | ");
  });

  const totalTowers = snapshot.battlefield.lanes.reduce(
    (total, lane) => total + lane.towers.length,
    0
  );
  const totalUnits = snapshot.battlefield.lanes.reduce(
    (total, lane) => total + lane.units.length,
    0
  );

  const latestEvent =
    snapshot.events.length > 0
      ? snapshot.events[snapshot.events.length - 1]?.message
      : "no events yet";

  return [
    `phase: ${snapshot.phase}`,
    `tick: ${snapshot.tick}`,
    `countdownEndsAtTick: ${snapshot.countdownEndsAtTick ?? "n/a"}`,
    `winnerSide: ${snapshot.winnerSide ?? "n/a"}`,
    `bases: left=${snapshot.battlefield.bases.left.hp} right=${snapshot.battlefield.bases.right.hp}`,
    `battlefield: lanes=${snapshot.battlefield.laneCount} length=${snapshot.battlefield.laneLength}`,
    `players: ${playerRows.length}`,
    ...playerRows,
    `entities: towers=${totalTowers} units=${totalUnits}`,
    `lastEvent: ${latestEvent ?? "n/a"}`
  ].join("\n");
};
