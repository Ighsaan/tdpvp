import { PlayerSide } from "../enums/player-side.js";

export interface EntityOwner {
  readonly sessionId: string;
  readonly side: PlayerSide;
}
