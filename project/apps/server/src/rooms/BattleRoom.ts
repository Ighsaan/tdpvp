import { Client, Room } from "@colyseus/core";
import {
  BattleRoomSnapshot,
  CLIENT_MESSAGE_PLAYER_COMMAND,
  CommandRejectedEvent,
  CommandRejectedReason,
  MAX_LOBBY_LANE_COUNT,
  MAX_BATTLE_PLAYERS,
  MIN_LOBBY_LANE_COUNT,
  MAX_TOWERS_PER_PLAYER,
  PlaceTowerCommand,
  PlayerCommand,
  PlayerCommandType,
  RemoveTowerCommand,
  StartMatchCommand,
  RoomEvent,
  RoomPhase,
  SERVER_MESSAGE_COMMAND_REJECTED,
  SERVER_MESSAGE_PONG,
  SERVER_MESSAGE_ROOM_SNAPSHOT,
  SERVER_TICK_INTERVAL_MS,
  SNAPSHOT_BROADCAST_EVERY_TICKS,
  TowerDefinition,
  TowerStateStatus,
  UpdateLobbyLaneCountCommand,
  isPlayerCommand
} from "@tdpvp/shared";
import { CommandQueue, QueuedPlayerCommand } from "../commands/command-queue.js";
import { MIN_TOWER_SPACING, MAX_RECENT_EVENTS, RECONNECT_WINDOW_SECONDS } from "../config/simulation-config.js";
import { towerDefinitions, unitDefinitions } from "../data/game-definitions.js";
import {
  checkWinCondition,
  isPlacementPositionValid,
  processBaseInteractions,
  processTowerSpawning,
  processUnitCombat,
  processUnitMovement,
  removeDestroyedEntities
} from "../simulation/simulation-pipeline.js";
import {
  MutableBattleRoomState,
  getNextSide,
  recalculatePlayerEntityCounts,
  setBattlefieldLaneCount,
  toSnapshot,
  createInitialBattleRoomState
} from "../state/battle-room-state.js";
import {
  generateAvailableMatchCode,
  isValidMatchCode,
  matchCodeService,
  normalizeMatchCode
} from "../services/match-code-service.js";
import {
  fallbackUsernameForSession,
  normalizeUsername
} from "../services/player-identity-service.js";

interface BattleRoomCreateOptions {
  readonly matchCode?: string;
  readonly laneCount?: number;
}

interface BattleRoomJoinOptions {
  readonly username?: string;
}

const asObject = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

/**
 * Authoritative Colyseus room with lane-based deterministic simulation.
 */
export class BattleRoom extends Room {
  public override maxClients = MAX_BATTLE_PLAYERS;

  private stateModel: MutableBattleRoomState = createInitialBattleRoomState(
    "pending",
    "PEND0"
  );
  private readonly commandQueue = new CommandQueue();
  private nextTowerId = 1;
  private nextUnitId = 1;
  private pendingSnapshot = false;

  public override onCreate(options: unknown): void {
    const parsed = this.parseCreateOptions(options);
    this.stateModel = createInitialBattleRoomState(
      this.roomId,
      parsed.matchCode,
      parsed.laneCount
    );
    matchCodeService.register(this.roomId, parsed.matchCode);
    this.setMetadata({
      matchCode: parsed.matchCode
    });
    this.onMessage(
      CLIENT_MESSAGE_PLAYER_COMMAND,
      (client: Client, payload: unknown) => {
        this.handleIncomingCommand(client, payload);
      }
    );

    this.setSimulationInterval(() => {
      this.runSimulationTick();
    }, SERVER_TICK_INTERVAL_MS);

    this.markDirty();
  }

  public override onJoin(client: Client, options: unknown): void {
    const parsed = this.parseJoinOptions(options);
    const side = getNextSide(Object.values(this.stateModel.players));
    this.stateModel.players[client.sessionId] = {
      sessionId: client.sessionId,
      username: parsed.username ?? fallbackUsernameForSession(client.sessionId),
      side,
      ready: false,
      connected: true,
      joinedAtTick: this.stateModel.tick,
      lastCommandTick: null,
      towerCount: 0,
      unitCount: 0
    };

    if (!this.stateModel.hostSessionId) {
      this.stateModel.hostSessionId = client.sessionId;
    }

    this.addEvent({
      tick: this.stateModel.tick,
      type: "player_joined",
      playerSessionId: client.sessionId,
      message: `Player ${client.sessionId} joined on side ${side}.`
    });

    this.recalculatePhaseForPlayerCount();
    recalculatePlayerEntityCounts(this.stateModel);
    this.markDirty();
  }

  public override async onLeave(
    client: Client,
    consented: boolean
  ): Promise<void> {
    const player = this.stateModel.players[client.sessionId];
    if (!player) {
      return;
    }

    player.connected = false;
    player.ready = false;
    this.addEvent({
      tick: this.stateModel.tick,
      type: "player_left",
      playerSessionId: client.sessionId,
      message: consented
        ? `Player ${client.sessionId} left the room.`
        : `Player ${client.sessionId} disconnected.`
    });
    this.markDirty();

    if (consented) {
      this.removePlayerAndOwnedEntities(client.sessionId);
      return;
    }

    try {
      await this.allowReconnection(client, RECONNECT_WINDOW_SECONDS);
      const reconnectedPlayer = this.stateModel.players[client.sessionId];
      if (!reconnectedPlayer) {
        return;
      }

      reconnectedPlayer.connected = true;
      this.addEvent({
        tick: this.stateModel.tick,
        type: "player_reconnected",
        playerSessionId: client.sessionId,
        message: `Player ${client.sessionId} reconnected.`
      });
      this.markDirty();
    } catch {
      this.removePlayerAndOwnedEntities(client.sessionId);
    }
  }

  public override onDispose(): void {
    matchCodeService.unregisterByRoomId(this.roomId);
    this.stateModel.events.length = 0;
    for (const lane of this.stateModel.battlefield.lanes) {
      lane.towers.length = 0;
      lane.units.length = 0;
    }
  }

  private runSimulationTick(): void {
    this.stateModel.tick += 1;

    this.processPlayerCommands();
    processTowerSpawning(
      this.stateModel,
      towerDefinitions,
      unitDefinitions,
      () => this.generateUnitId(),
      (event) => this.addEvent(event)
    );
    processUnitMovement(this.stateModel);
    processUnitCombat(this.stateModel, (event) => this.addEvent(event));
    processBaseInteractions(this.stateModel, (event) => this.addEvent(event));
    removeDestroyedEntities(this.stateModel);
    checkWinCondition(this.stateModel, (event) => this.addEvent(event));
    recalculatePlayerEntityCounts(this.stateModel);

    if (
      this.pendingSnapshot ||
      this.stateModel.tick % SNAPSHOT_BROADCAST_EVERY_TICKS === 0
    ) {
      this.broadcastSnapshot();
      this.pendingSnapshot = false;
    }
  }

  private processPlayerCommands(): void {
    const queuedCommands = this.commandQueue.drainOrdered();
    for (const queued of queuedCommands) {
      this.applyCommand(queued);
    }
  }

  private applyCommand(queued: QueuedPlayerCommand): void {
    const player = this.stateModel.players[queued.clientSessionId];
    if (!player || !player.connected) {
      this.rejectCommandForSession(
        queued.clientSessionId,
        "unknown",
        "unknown_player",
        "Player is not active."
      );
      return;
    }

    const command: PlayerCommand = queued.command;
    player.lastCommandTick = this.stateModel.tick;

    switch (command.type) {
      case PlayerCommandType.Ready: {
        if (
          this.stateModel.phase === RoomPhase.Active ||
          this.stateModel.phase === RoomPhase.Ended
        ) {
          this.rejectCommandForSession(
            queued.clientSessionId,
            PlayerCommandType.Ready,
            "invalid_phase",
            "Ready state cannot be changed during or after match."
          );
          return;
        }

        player.ready = command.ready;
        this.addEvent({
          tick: this.stateModel.tick,
          type: "player_ready_changed",
          playerSessionId: queued.clientSessionId,
          message: `Player ${queued.clientSessionId} ready=${command.ready}.`
        });
        this.markDirty();
        return;
      }

      case PlayerCommandType.Ping: {
        const client = this.getClient(queued.clientSessionId);
        if (client) {
          client.send(SERVER_MESSAGE_PONG, {
            nonce: command.nonce,
            serverTick: this.stateModel.tick,
            serverTimeMs: Date.now()
          });
        }
        return;
      }

      case PlayerCommandType.PlaceTower: {
        this.processPlaceTowerCommand(queued.clientSessionId, command);
        return;
      }

      case PlayerCommandType.RemoveTower: {
        this.processRemoveTowerCommand(queued.clientSessionId, command);
        return;
      }

      case PlayerCommandType.UpdateLobbyLaneCount: {
        this.processUpdateLobbyLaneCountCommand(queued.clientSessionId, command);
        return;
      }

      case PlayerCommandType.StartMatch: {
        this.processStartMatchCommand(queued.clientSessionId, command);
        return;
      }
    }
  }

  private processPlaceTowerCommand(
    sessionId: string,
    command: PlaceTowerCommand
  ): void {
    if (this.stateModel.phase !== RoomPhase.Active) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "invalid_phase",
        "Towers can only be placed during active phase."
      );
      return;
    }

    const player = this.stateModel.players[sessionId];
    if (!player) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "unknown_player",
        "Player is unknown."
      );
      return;
    }

    if (
      command.laneIndex < 0 ||
      command.laneIndex >= this.stateModel.battlefield.laneCount
    ) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "invalid_lane",
        "Lane index is out of bounds."
      );
      return;
    }

    const definition: TowerDefinition | undefined =
      towerDefinitions[command.towerType];
    if (!definition) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "invalid_tower_type",
        "Unknown tower type."
      );
      return;
    }

    if (!Number.isFinite(command.positionX)) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "invalid_placement_zone",
        "Tower position is invalid."
      );
      return;
    }

    if (!isPlacementPositionValid(this.stateModel, player.side, command.positionX)) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "invalid_placement_zone",
        "Tower must be placed in player's valid side placement zone."
      );
      return;
    }

    if (player.towerCount >= MAX_TOWERS_PER_PLAYER) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "rate_limited",
        "Tower limit reached."
      );
      return;
    }

    const lane = this.stateModel.battlefield.lanes[command.laneIndex];
    if (!lane) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "invalid_lane",
        "Lane index is out of bounds."
      );
      return;
    }

    const hasConflictingTower = lane.towers.some(
      (tower) => Math.abs(tower.positionX - command.positionX) < MIN_TOWER_SPACING
    );
    if (hasConflictingTower) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.PlaceTower,
        "invalid_placement_zone",
        "Another tower already occupies this position."
      );
      return;
    }

    const towerId = this.generateTowerId();
    lane.towers.push({
      towerId,
      ownerSessionId: sessionId,
      ownerSide: player.side,
      laneIndex: command.laneIndex,
      positionX: command.positionX,
      towerType: command.towerType,
      status: TowerStateStatus.Active,
      spawnIntervalTicks: definition.spawnIntervalTicks,
      spawnProgressTicks: 0,
      spawnedUnitType: definition.spawnedUnitType
    });

    this.addEvent({
      tick: this.stateModel.tick,
      type: "tower_placed",
      playerSessionId: sessionId,
      message: `Placed ${command.towerType} tower ${towerId} in lane ${command.laneIndex}.`
    });
    this.markDirty();
  }

  private processRemoveTowerCommand(
    sessionId: string,
    command: RemoveTowerCommand
  ): void {
    if (this.stateModel.phase !== RoomPhase.Active) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.RemoveTower,
        "invalid_phase",
        "Towers can only be removed during active phase."
      );
      return;
    }

    for (const lane of this.stateModel.battlefield.lanes) {
      const towerIndex = lane.towers.findIndex(
        (tower) => tower.towerId === command.towerId
      );
      if (towerIndex === -1) {
        continue;
      }

      const tower = lane.towers[towerIndex];
      if (!tower) {
        continue;
      }

      if (tower.ownerSessionId !== sessionId) {
        this.rejectCommandForSession(
          sessionId,
          PlayerCommandType.RemoveTower,
          "invalid_tower_ownership",
          "Player can only remove owned towers."
        );
        return;
      }

      lane.towers.splice(towerIndex, 1);
      this.addEvent({
        tick: this.stateModel.tick,
        type: "tower_removed",
        playerSessionId: sessionId,
        message: `Removed tower ${tower.towerId} from lane ${tower.laneIndex}.`
      });
      this.markDirty();
      return;
    }

    this.rejectCommandForSession(
      sessionId,
      PlayerCommandType.RemoveTower,
      "invalid_tower_not_found",
      "Tower could not be found."
    );
  }

  private processUpdateLobbyLaneCountCommand(
    sessionId: string,
    command: UpdateLobbyLaneCountCommand
  ): void {
    if (this.stateModel.phase === RoomPhase.Active || this.stateModel.phase === RoomPhase.Ended) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.UpdateLobbyLaneCount,
        "invalid_phase",
        "Lane count can only be changed while in lobby."
      );
      return;
    }

    if (this.stateModel.hostSessionId !== sessionId) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.UpdateLobbyLaneCount,
        "invalid_host_permission",
        "Only host can change lobby lane count."
      );
      return;
    }

    if (
      command.laneCount < MIN_LOBBY_LANE_COUNT ||
      command.laneCount > MAX_LOBBY_LANE_COUNT
    ) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.UpdateLobbyLaneCount,
        "invalid_lane_count",
        `Lane count must be between ${MIN_LOBBY_LANE_COUNT} and ${MAX_LOBBY_LANE_COUNT}.`
      );
      return;
    }

    setBattlefieldLaneCount(this.stateModel, command.laneCount);
    this.addEvent({
      tick: this.stateModel.tick,
      type: "lane_count_updated",
      playerSessionId: sessionId,
      message: `Host updated lane count to ${command.laneCount}.`
    });
    this.markDirty();
  }

  private processStartMatchCommand(
    sessionId: string,
    _command: StartMatchCommand
  ): void {
    if (this.stateModel.phase === RoomPhase.Active || this.stateModel.phase === RoomPhase.Ended) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.StartMatch,
        "invalid_phase",
        "Match can only be started from lobby."
      );
      return;
    }

    if (this.stateModel.hostSessionId !== sessionId) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.StartMatch,
        "invalid_host_permission",
        "Only host can start the match."
      );
      return;
    }

    const connectedPlayers = Object.values(this.stateModel.players).filter(
      (player) => player.connected
    );
    if (connectedPlayers.length < MAX_BATTLE_PLAYERS) {
      this.rejectCommandForSession(
        sessionId,
        PlayerCommandType.StartMatch,
        "invalid_player_count",
        `Need ${MAX_BATTLE_PLAYERS} connected players to start.`
      );
      return;
    }

    this.stateModel.countdownEndsAtTick = null;
    this.setPhase(RoomPhase.Active);
    this.addEvent({
      tick: this.stateModel.tick,
      type: "match_started",
      playerSessionId: sessionId,
      message: `Host ${sessionId} started the match.`
    });
    this.markDirty();
  }

  private handleIncomingCommand(client: Client, payload: unknown): void {
    const player = this.stateModel.players[client.sessionId];
    if (!player || !player.connected) {
      this.rejectCommand(
        client,
        "unknown_player",
        "Player is not active.",
        "unknown"
      );
      return;
    }

    if (!isPlayerCommand(payload)) {
      this.rejectCommand(
        client,
        "invalid_payload",
        "Payload did not match PlayerCommand contract."
      );
      return;
    }

    this.commandQueue.enqueue(client.sessionId, this.stateModel.tick, payload);
  }

  private recalculatePhaseForPlayerCount(): void {
    if (this.stateModel.phase === RoomPhase.Ended) {
      return;
    }

    const connectedCount = Object.values(this.stateModel.players).filter(
      (player) => player.connected
    ).length;

    if (connectedCount < MAX_BATTLE_PLAYERS) {
      this.stateModel.countdownEndsAtTick = null;
      this.setPhase(RoomPhase.WaitingForPlayers);
      return;
    }

    if (
      this.stateModel.phase === RoomPhase.WaitingForPlayers ||
      this.stateModel.phase === RoomPhase.Preparing
    ) {
      this.setPhase(RoomPhase.Preparing);
    }
  }

  private setPhase(phase: RoomPhase): void {
    if (this.stateModel.phase === phase) {
      return;
    }

    this.stateModel.phase = phase;
    this.addEvent({
      tick: this.stateModel.tick,
      type: "phase_changed",
      message: `Room phase changed to ${phase}.`
    });
    this.markDirty();
  }

  private removePlayerAndOwnedEntities(sessionId: string): void {
    delete this.stateModel.players[sessionId];

    if (this.stateModel.hostSessionId === sessionId) {
      const nextHost = Object.values(this.stateModel.players).find(
        (player) => player.connected
      );
      this.stateModel.hostSessionId = nextHost?.sessionId ?? null;
    }

    for (const lane of this.stateModel.battlefield.lanes) {
      lane.towers = lane.towers.filter((tower) => tower.ownerSessionId !== sessionId);
      lane.units = lane.units.filter((unit) => unit.ownerSessionId !== sessionId);
    }

    this.recalculatePhaseForPlayerCount();
    recalculatePlayerEntityCounts(this.stateModel);
    this.markDirty();
  }

  private getClient(sessionId: string): Client | undefined {
    return this.clients.find((entry) => entry.sessionId === sessionId);
  }

  private rejectCommandForSession(
    sessionId: string,
    commandType: PlayerCommandType | "unknown",
    reason: CommandRejectedReason,
    message: string
  ): void {
    const client = this.getClient(sessionId);
    if (!client) {
      return;
    }

    this.rejectCommand(client, reason, message, commandType);
  }

  private rejectCommand(
    client: Client,
    reason: CommandRejectedReason,
    message: string,
    commandType: PlayerCommandType | "unknown" = "unknown"
  ): void {
    const payload: CommandRejectedEvent = {
      commandType,
      reason,
      message,
      serverTick: this.stateModel.tick
    };
    client.send(SERVER_MESSAGE_COMMAND_REJECTED, payload);

    this.addEvent({
      tick: this.stateModel.tick,
      type: "command_rejected",
      playerSessionId: client.sessionId,
      message: `Rejected command (${commandType}): ${reason}.`
    });
    this.markDirty();
  }

  private broadcastSnapshot(): void {
    const snapshot: BattleRoomSnapshot = toSnapshot(this.stateModel);
    this.broadcast(SERVER_MESSAGE_ROOM_SNAPSHOT, snapshot);
  }

  private addEvent(event: RoomEvent): void {
    this.stateModel.events.push(event);
    if (this.stateModel.events.length > MAX_RECENT_EVENTS) {
      this.stateModel.events.splice(
        0,
        this.stateModel.events.length - MAX_RECENT_EVENTS
      );
    }
  }

  private generateTowerId(): string {
    const towerId = `t-${this.nextTowerId}`;
    this.nextTowerId += 1;
    return towerId;
  }

  private generateUnitId(): string {
    const unitId = `u-${this.nextUnitId}`;
    this.nextUnitId += 1;
    return unitId;
  }

  private parseCreateOptions(options: unknown): {
    readonly matchCode: string;
    readonly laneCount: number;
  } {
    const fallbackCode = generateAvailableMatchCode();
    const fallbackLaneCount = MAX_LOBBY_LANE_COUNT;
    const objectOptions = asObject(options) as BattleRoomCreateOptions | null;
    if (!objectOptions) {
      return {
        matchCode: fallbackCode,
        laneCount: fallbackLaneCount
      };
    }

    const laneCount =
      typeof objectOptions.laneCount === "number" &&
      Number.isInteger(objectOptions.laneCount) &&
      objectOptions.laneCount >= MIN_LOBBY_LANE_COUNT &&
      objectOptions.laneCount <= MAX_LOBBY_LANE_COUNT
        ? objectOptions.laneCount
        : fallbackLaneCount;

    const providedMatchCode =
      typeof objectOptions.matchCode === "string" &&
      isValidMatchCode(objectOptions.matchCode)
        ? normalizeMatchCode(objectOptions.matchCode)
        : null;

    return {
      matchCode: providedMatchCode ?? fallbackCode,
      laneCount
    };
  }

  private parseJoinOptions(options: unknown): {
    readonly username: string | null;
  } {
    const objectOptions = asObject(options) as BattleRoomJoinOptions | null;
    if (!objectOptions) {
      return {
        username: null
      };
    }

    return {
      username: normalizeUsername(objectOptions.username)
    };
  }

  private markDirty(): void {
    this.pendingSnapshot = true;
  }
}
