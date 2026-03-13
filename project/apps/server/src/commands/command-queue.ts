import { PlayerCommand } from "@tdpvp/shared";

export interface QueuedPlayerCommand {
  readonly clientSessionId: string;
  readonly receivedAtTick: number;
  readonly queueOrder: number;
  readonly command: PlayerCommand;
}

export class CommandQueue {
  private readonly commands: QueuedPlayerCommand[] = [];
  private queueCounter = 0;

  public enqueue(
    clientSessionId: string,
    receivedAtTick: number,
    command: PlayerCommand
  ): void {
    this.commands.push({
      clientSessionId,
      receivedAtTick,
      queueOrder: this.queueCounter++,
      command
    });
  }

  public drainOrdered(): QueuedPlayerCommand[] {
    const ordered = [...this.commands].sort((a, b) => {
      if (a.receivedAtTick !== b.receivedAtTick) {
        return a.receivedAtTick - b.receivedAtTick;
      }

      if (a.queueOrder !== b.queueOrder) {
        return a.queueOrder - b.queueOrder;
      }

      return a.clientSessionId.localeCompare(b.clientSessionId);
    });

    this.commands.length = 0;
    return ordered;
  }
}
