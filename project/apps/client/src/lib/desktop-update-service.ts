const DESKTOP_UPDATE_ERROR_PREFIX = "Desktop updater failed";

export type DesktopUpdateStatus = "skipped" | "up-to-date" | "deferred" | "installed" | "error";

export type DesktopUpdateResult = {
  readonly status: DesktopUpdateStatus;
  readonly message: string | null;
};

type WindowWithTauriInternals = Window & {
  readonly __TAURI_INTERNALS__?: unknown;
  readonly __TAURI__?: unknown;
};

const isDesktopRuntime = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const tauriWindow = window as WindowWithTauriInternals;
  return Boolean(tauriWindow.__TAURI_INTERNALS__ ?? tauriWindow.__TAURI__);
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown updater error.";
};

export const runDesktopUpdateStartupCheck = async (): Promise<DesktopUpdateResult> => {
  if (!isDesktopRuntime()) {
    return {
      status: "skipped",
      message: null
    };
  }

  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();

    if (!update) {
      return {
        status: "up-to-date",
        message: null
      };
    }

    const versionLabel = update.version.trim().length > 0 ? update.version : "a newer version";
    const shouldInstall = window.confirm(
      `A desktop update (${versionLabel}) is available. Install and relaunch now?`
    );

    if (!shouldInstall) {
      return {
        status: "deferred",
        message: "Desktop update deferred. Restart later to install the newest release."
      };
    }

    await update.downloadAndInstall();

    const { relaunch } = await import("@tauri-apps/plugin-process");
    await relaunch();

    return {
      status: "installed",
      message: "Desktop update installed. Relaunching now."
    };
  } catch (error) {
    return {
      status: "error",
      message: `${DESKTOP_UPDATE_ERROR_PREFIX}: ${getErrorMessage(error)}`
    };
  }
};
