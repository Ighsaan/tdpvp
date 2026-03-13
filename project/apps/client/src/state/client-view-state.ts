import {
  BattleRoomSnapshot,
  CommandRejectedEvent,
  PlayerSide
} from "@tdpvp/shared";
import { ConnectionStatus } from "../network/multiplayer-service.js";

export interface ClientViewState {
  readonly connectionStatus: ConnectionStatus;
  readonly localSessionId: string | null;
  readonly localSide: PlayerSide | null;
  readonly selectedLane: number;
  readonly latestSnapshot: BattleRoomSnapshot | null;
  readonly lastError: string | null;
  readonly lastRejectedCommand: CommandRejectedEvent | null;
  readonly localHint: string | null;
}
