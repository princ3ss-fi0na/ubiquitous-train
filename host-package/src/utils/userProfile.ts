export interface UserProfile {
  telegramId: number | null;
  name: string;
  phone: string;
  region: string;
  city: string;
  address: string;
  email: string;
  savedAt: string;
}

const STORAGE_KEY = "cartech_user_profile";

const emptyProfile: UserProfile = {
  telegramId: null,
  name: "",
  phone: "",
  region: "",
  city: "",
  address: "",
  email: "",
  savedAt: "",
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyProfile };
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch {
    return { ...emptyProfile };
  }
}

export function saveProfile(profile: UserProfile): void {
  profile.savedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function isProfileComplete(p: UserProfile): boolean {
  return !!(p.name && p.phone && p.address);
}
