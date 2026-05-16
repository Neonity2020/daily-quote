const favoriteKey = "daily-quotes:favorites";
const reminderKey = "daily-quotes:reminder";

export type ReminderSettings = {
  enabled: boolean;
  time: "06:30";
  permission: NotificationPermission | "unsupported";
};

export function readFavorites() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(favoriteKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]) {
  window.localStorage.setItem(favoriteKey, JSON.stringify(ids));
}

export function readReminder(): ReminderSettings {
  const permission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported";

  if (typeof window === "undefined") {
    return { enabled: false, time: "06:30", permission: "default" };
  }

  try {
    const raw = window.localStorage.getItem(reminderKey);
    const stored = raw ? (JSON.parse(raw) as Partial<ReminderSettings>) : {};
    return {
      enabled: Boolean(stored.enabled),
      time: "06:30",
      permission
    };
  } catch {
    return { enabled: false, time: "06:30", permission };
  }
}

export function writeReminder(settings: ReminderSettings) {
  window.localStorage.setItem(reminderKey, JSON.stringify(settings));
}
