import { Client as ColyseusClient, Room } from "colyseus.js";
import {
  BATTLE_ROOM_NAME,
  BattleRoomSnapshot,
  CLIENT_MESSAGE_PLAYER_COMMAND,
  CommandRejectedEvent,
  MAX_LOBBY_LANE_COUNT,
  PlaceTowerCommand,
  PingCommand,
  PlayerCommand,
  PlayerCommandType,
  PongEvent,
  RemoveTowerCommand,
  SERVER_MESSAGE_COMMAND_REJECTED,
  SERVER_MESSAGE_PONG,
  SERVER_MESSAGE_ROOM_SNAPSHOT,
  StartMatchCommand,
  TowerType,
  UpdateLobbyLaneCountCommand
} from "@tdpvp/shared";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface MultiplayerServiceState {
  readonly connectionStatus: ConnectionStatus;
  readonly localSessionId: string | null;
  readonly currentMatchCode: string | null;
  readonly lastError: string | null;
  readonly latestSnapshot: BattleRoomSnapshot | null;
  readonly lastPong: PongEvent | null;
  readonly lastRejectedCommand: CommandRejectedEvent | null;
}

interface CreateLobbyResponse {
  readonly roomId: string;
  readonly matchCode: string;
  readonly laneCount: number;
}

interface JoinLobbyResponse {
  readonly roomId: string;
  readonly matchCode: string;
}

type StateListener = (state: MultiplayerServiceState) => void;

const defaultServerEndpoint = (): string => {
  const explicit = import.meta.env["VITE_SERVER_URL"];
  if (typeof explicit === "string" && explicit.length > 0) {
    return explicit;
  }

  return "ws://localhost:2567";
};

const defaultHttpEndpoint = (wsEndpoint: string): string => {
  const explicit = import.meta.env["VITE_SERVER_HTTP_URL"];
  if (typeof explicit === "string" && explicit.length > 0) {
    return explicit;
  }

  if (wsEndpoint.startsWith("wss://")) {
    return wsEndpoint.replace("wss://", "https://");
  }

  if (wsEndpoint.startsWith("ws://")) {
    return wsEndpoint.replace("ws://", "http://");
  }

  return "http://localhost:2567";
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { message?: string };
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
  } catch {
    // ignore json parsing errors
  }

  return `${response.status} ${response.statusText}`;
};

export class MultiplayerService {
  private readonly client: ColyseusClient;
  private readonly httpEndpoint: string;
  private room: Room | null = null;
  private readonly listeners = new Set<StateListener>();
  private state: MultiplayerServiceState = {
    connectionStatus: "idle",
    localSessionId: null,
    currentMatchCode: null,
    lastError: null,
    latestSnapshot: null,
    lastPong: null,
    lastRejectedCommand: null
  };

  public constructor(
    wsEndpoint = defaultServerEndpoint(),
    httpEndpoint = defaultHttpEndpoint(wsEndpoint)
  ) {
    this.client = new ColyseusClient(wsEndpoint);
    this.httpEndpoint = httpEndpoint;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async createMatch(username: string): Promise<void> {
    this.setState({
      connectionStatus: "connecting",
      lastError: null
    });

    const response = await fetch(`${this.httpEndpoint}/lobby/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        laneCount: MAX_LOBBY_LANE_COUNT
      })
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      this.setState({
        connectionStatus: "error",
        lastError: message
      });
      throw new Error(message);
    }

    const payload = (await response.json()) as CreateLobbyResponse;
    await this.joinRoomById(payload.roomId, payload.matchCode, username);
  }

  public async joinMatch(matchCode: string, username: string): Promise<void> {
    this.setState({
      connectionStatus: "connecting",
      lastError: null
    });

    const response = await fetch(`${this.httpEndpoint}/lobby/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        matchCode
      })
    });

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      this.setState({
        connectionStatus: "error",
        lastError: message
      });
      throw new Error(message);
    }

    const payload = (await response.json()) as JoinLobbyResponse;
    await this.joinRoomById(payload.roomId, payload.matchCode, username);
  }

  public sendReady(ready: boolean): void {
    this.sendCommand({
      type: PlayerCommandType.Ready,
      ready
    });
  }

  public sendPing(): void {
    const command: PingCommand = {
      type: PlayerCommandType.Ping,
      nonce: crypto.randomUUID(),
      sentAtClientMs: Date.now()
    };
    this.sendCommand(command);
  }

  public sendPlaceTower(
    towerType: TowerType,
    laneIndex: number,
    positionX: number
  ): void {
    const command: PlaceTowerCommand = {
      type: PlayerCommandType.PlaceTower,
      towerType,
      laneIndex,
      positionX
    };
    this.sendCommand(command);
  }

  public sendRemoveTower(towerId: string): void {
    const command: RemoveTowerCommand = {
      type: PlayerCommandType.RemoveTower,
      towerId
    };
    this.sendCommand(command);
  }

  public sendUpdateLobbyLaneCount(laneCount: number): void {
    const command: UpdateLobbyLaneCountCommand = {
      type: PlayerCommandType.UpdateLobbyLaneCount,
      laneCount
    };
    this.sendCommand(command);
  }

  public sendStartMatch(): void {
    const command: StartMatchCommand = {
      type: PlayerCommandType.StartMatch
    };
    this.sendCommand(command);
  }

  public async leave(): Promise<void> {
    if (!this.room) {
      this.setState({
        connectionStatus: "disconnected",
        localSessionId: null,
        currentMatchCode: null,
        latestSnapshot: null
      });
      return;
    }

    const room = this.room;
    this.room = null;
    await room.leave();
    this.setState({
      connectionStatus: "disconnected",
      localSessionId: null,
      currentMatchCode: null,
      latestSnapshot: null
    });
  }

  private async joinRoomById(
    roomId: string,
    matchCode: string,
    username: string
  ): Promise<void> {
    if (this.room) {
      await this.leave();
    }

    try {
      this.room = await this.client.joinById(roomId, {
        username
      });
      this.wireRoomHandlers(this.room);
      this.setState({
        connectionStatus: "connected",
        localSessionId: this.room.sessionId,
        currentMatchCode: matchCode,
        lastError: null
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown connection error";
      this.setState({
        connectionStatus: "error",
        lastError: message
      });
      throw error;
    }
  }

  private wireRoomHandlers(room: Room): void {
    room.onMessage(
      SERVER_MESSAGE_ROOM_SNAPSHOT,
      (snapshot: BattleRoomSnapshot) => {
        this.setState({
          latestSnapshot: snapshot,
          currentMatchCode: snapshot.matchCode
        });
      }
    );

    room.onMessage(SERVER_MESSAGE_PONG, (event: PongEvent) => {
      this.setState({
        lastPong: event
      });
    });

    room.onMessage(
      SERVER_MESSAGE_COMMAND_REJECTED,
      (event: CommandRejectedEvent) => {
        this.setState({
          lastRejectedCommand: event
        });
      }
    );

    room.onLeave((code) => {
      this.room = null;
      this.setState({
        connectionStatus: "disconnected",
        localSessionId: null,
        currentMatchCode: null,
        latestSnapshot: null,
        lastError: `Left room with code ${code}`
      });
    });
  }

  private sendCommand(command: PlayerCommand): void {
    if (!this.room) {
      this.setState({
        connectionStatus: "error",
        lastError: "Not connected to room."
      });
      return;
    }

    this.room.send(CLIENT_MESSAGE_PLAYER_COMMAND, command);
  }

  private setState(partial: Partial<MultiplayerServiceState>): void {
    this.state = {
      ...this.state,
      ...partial
    };

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
