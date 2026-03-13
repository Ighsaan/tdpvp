export const laneToWorldZ = (
  laneIndex: number,
  laneCount: number,
  laneSpacing: number
): number => {
  const centerOffset = (laneCount - 1) / 2;
  return (laneIndex - centerOffset) * laneSpacing;
};

export const laneBoundaryToWorldZ = (
  boundaryIndex: number,
  laneCount: number,
  laneSpacing: number
): number => {
  const centerOffset = laneCount / 2;
  return (boundaryIndex - centerOffset) * laneSpacing;
};

export const serverXToWorldX = (serverX: number, laneLength: number): number => {
  return serverX - laneLength * 0.5;
};
