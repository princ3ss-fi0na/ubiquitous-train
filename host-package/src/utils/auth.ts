export const ADMIN_TELEGRAM_IDS: number[] = [1696302243];

export function getTelegramUser(): TelegramWebAppUser | null {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
  } catch {
    return null;
  }
}

export function getTelegramUserId(): number | null {
  return getTelegramUser()?.id ?? null;
}

export function isAdmin(userId?: number | null): boolean {
  const id = userId ?? getTelegramUserId();
  if (!id) return false;
  return ADMIN_TELEGRAM_IDS.includes(id);
}

export function getUserDisplayName(): string {
  const user = getTelegramUser();
  if (!user) return "Гость";
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || `ID ${user.id}`;
}
