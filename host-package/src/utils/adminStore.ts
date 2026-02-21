export interface ApiKeyEntry {
  id: string;
  name: string;
  provider: string;
  key: string;
  active: boolean;
  createdAt: string;
}

export interface AdminSettings {
  markupPercent: number;
  apiKeys: ApiKeyEntry[];
  storeName: string;
  supportLink: string;
  deliveryText: string;
  minOrderAmount: number;
}

const STORAGE_KEY = "cartech_admin_settings";

const defaultSettings: AdminSettings = {
  markupPercent: 0,
  apiKeys: [],
  storeName: "CarTech",
  supportLink: "https://t.me/CMOLEHCK",
  deliveryText: "По всему СНГ. СДЭК, Почта, ПВЗ",
  minOrderAmount: 0,
};

export function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: AdminSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applyMarkup(basePrice: number, markupPercent: number): number {
  return Math.round(basePrice * (1 + markupPercent / 100));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
