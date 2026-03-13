const MATCH_CODE_LENGTH = 5;
const MATCH_CODE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * In-memory authoritative mapping between shareable lobby code and room id.
 */
class MatchCodeService {
  private readonly roomIdByCode = new Map<string, string>();
  private readonly codeByRoomId = new Map<string, string>();

  public register(roomId: string, matchCode: string): void {
    const normalized = normalizeMatchCode(matchCode);
    this.roomIdByCode.set(normalized, roomId);
    this.codeByRoomId.set(roomId, normalized);
  }

  public unregisterByRoomId(roomId: string): void {
    const code = this.codeByRoomId.get(roomId);
    if (!code) {
      return;
    }

    this.codeByRoomId.delete(roomId);
    this.roomIdByCode.delete(code);
  }

  public getRoomIdByCode(matchCode: string): string | null {
    return this.roomIdByCode.get(normalizeMatchCode(matchCode)) ?? null;
  }

  public isCodeInUse(matchCode: string): boolean {
    return this.roomIdByCode.has(normalizeMatchCode(matchCode));
  }
}

export const matchCodeService = new MatchCodeService();

export const normalizeMatchCode = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, MATCH_CODE_LENGTH);
};

export const isValidMatchCode = (value: string): boolean => {
  return /^[A-Z0-9]{5}$/.test(normalizeMatchCode(value));
};

export const generateAvailableMatchCode = (): string => {
  for (let attempt = 0; attempt < 256; attempt += 1) {
    let code = "";
    for (let index = 0; index < MATCH_CODE_LENGTH; index += 1) {
      const randomIndex = Math.floor(Math.random() * MATCH_CODE_CHARSET.length);
      code += MATCH_CODE_CHARSET[randomIndex] ?? "A";
    }

    if (!matchCodeService.isCodeInUse(code)) {
      return code;
    }
  }

  throw new Error("Unable to allocate match code.");
};
