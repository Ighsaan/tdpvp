import http from "node:http";
import { matchMaker, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import cors from "cors";
import {
  BATTLE_ROOM_NAME,
  MAX_LOBBY_LANE_COUNT,
  MIN_LOBBY_LANE_COUNT
} from "@tdpvp/shared";
import { BattleRoom } from "./rooms/BattleRoom.js";
import {
  generateAvailableMatchCode,
  isValidMatchCode,
  matchCodeService,
  normalizeMatchCode
} from "./services/match-code-service.js";
import { normalizeUsername } from "./services/player-identity-service.js";

const DEFAULT_PORT = 2567;
const port = Number(process.env["PORT"] ?? DEFAULT_PORT);

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_request, response) => {
  response.status(200).json({ ok: true });
});

app.post("/lobby/create", async (request, response) => {
  const body = request.body as Record<string, unknown> | undefined;
  const username = normalizeUsername(body?.["username"]);
  if (!username) {
    response.status(400).json({
      message: "Username is required and must be between 2 and 20 characters."
    });
    return;
  }

  const requestedLaneCount = body?.["laneCount"];
  const laneCount =
    typeof requestedLaneCount === "number" &&
    Number.isInteger(requestedLaneCount) &&
    requestedLaneCount >= MIN_LOBBY_LANE_COUNT &&
    requestedLaneCount <= MAX_LOBBY_LANE_COUNT
      ? requestedLaneCount
      : MAX_LOBBY_LANE_COUNT;

  try {
    const matchCode = generateAvailableMatchCode();
    const room = await matchMaker.createRoom(BATTLE_ROOM_NAME, {
      matchCode,
      laneCount
    });
    matchCodeService.register(room.roomId, matchCode);

    response.status(201).json({
      roomId: room.roomId,
      matchCode,
      laneCount
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create lobby.";
    response.status(500).json({ message });
  }
});

app.post("/lobby/join", async (request, response) => {
  const body = request.body as Record<string, unknown> | undefined;
  const rawCode = typeof body?.["matchCode"] === "string" ? body["matchCode"] : "";
  const normalizedCode = normalizeMatchCode(rawCode);
  if (!isValidMatchCode(normalizedCode)) {
    response.status(400).json({
      message: "Match code must be exactly 5 uppercase alphanumeric characters."
    });
    return;
  }

  const roomId = matchCodeService.getRoomIdByCode(normalizedCode);
  if (!roomId) {
    response.status(404).json({ message: "Match code was not found." });
    return;
  }

  try {
    const room = await matchMaker.getRoomById(roomId);
    if (!room) {
      matchCodeService.unregisterByRoomId(roomId);
      response.status(404).json({ message: "Match lobby is no longer available." });
      return;
    }

    if (room.clients >= room.maxClients) {
      response.status(409).json({ message: "Match lobby is already full." });
      return;
    }

    response.status(200).json({
      roomId: room.roomId,
      matchCode: normalizedCode
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to join lobby.";
    response.status(500).json({ message });
  }
});

const httpServer = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

gameServer.define(BATTLE_ROOM_NAME, BattleRoom);

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on ws://localhost:${port}`);
});

const shutdown = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log("[server] shutting down...");
  await gameServer.gracefullyShutdown(false);
  httpServer.close();
  process.exit(0);
};

process.once("SIGINT", () => {
  void shutdown();
});

process.once("SIGTERM", () => {
  void shutdown();
});
