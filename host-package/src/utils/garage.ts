export interface UserCar {
  id: string;
  brandId: string;
  brandName: string;
  model: string;
  year: number;
  engine: string;
  isPrimary: boolean;
}

const STORAGE_KEY = "cartech_garage";

export function loadGarage(): UserCar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGarage(cars: UserCar[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

export function addCarToGarage(car: Omit<UserCar, "id">): UserCar[] {
  const garage = loadGarage();
  const newCar: UserCar = { ...car, id: Date.now().toString(36) };
  if (garage.length === 0) newCar.isPrimary = true;
  garage.push(newCar);
  saveGarage(garage);
  return garage;
}

export function removeCarFromGarage(carId: string): UserCar[] {
  let garage = loadGarage().filter((c) => c.id !== carId);
  if (garage.length > 0 && !garage.some((c) => c.isPrimary)) {
    garage[0].isPrimary = true;
  }
  saveGarage(garage);
  return garage;
}

export function setPrimaryCar(carId: string): UserCar[] {
  const garage = loadGarage().map((c) => ({ ...c, isPrimary: c.id === carId }));
  saveGarage(garage);
  return garage;
}

export function getPrimaryCar(): UserCar | null {
  return loadGarage().find((c) => c.isPrimary) ?? null;
}

export interface CarModel {
  id: string;
  name: string;
  years: [number, number];
  engines: string[];
}

export const CAR_MODELS: Record<string, CarModel[]> = {
  toyota: [
    { id: "camry", name: "Camry", years: [2006, 2025], engines: ["2.0L", "2.5L", "3.5L V6"] },
    { id: "corolla", name: "Corolla", years: [2000, 2025], engines: ["1.6L", "1.8L", "2.0L"] },
    { id: "rav4", name: "RAV4", years: [2005, 2025], engines: ["2.0L", "2.5L", "2.5L Hybrid"] },
    { id: "landcruiser", name: "Land Cruiser", years: [2000, 2025], engines: ["4.0L V6", "4.5L V8 Diesel", "3.5L V6 Twin-Turbo"] },
    { id: "hilux", name: "Hilux", years: [2005, 2025], engines: ["2.4L Diesel", "2.7L", "2.8L Diesel"] },
  ],
  nissan: [
    { id: "xtrail", name: "X-Trail", years: [2007, 2025], engines: ["2.0L", "2.5L", "1.5L Turbo"] },
    { id: "qashqai", name: "Qashqai", years: [2007, 2025], engines: ["1.2L Turbo", "1.6L", "2.0L"] },
    { id: "almera", name: "Almera", years: [2000, 2018], engines: ["1.6L", "1.8L"] },
    { id: "teana", name: "Teana", years: [2003, 2020], engines: ["2.0L", "2.5L", "3.5L V6"] },
  ],
  hyundai: [
    { id: "solaris", name: "Solaris", years: [2010, 2025], engines: ["1.4L", "1.6L"] },
    { id: "creta", name: "Creta", years: [2016, 2025], engines: ["1.6L", "2.0L"] },
    { id: "tucson", name: "Tucson", years: [2004, 2025], engines: ["1.6L Turbo", "2.0L", "2.0L Diesel"] },
    { id: "santafe", name: "Santa Fe", years: [2006, 2025], engines: ["2.0L Turbo", "2.2L Diesel", "2.5L"] },
  ],
  kia: [
    { id: "rio", name: "Rio", years: [2005, 2025], engines: ["1.4L", "1.6L"] },
    { id: "ceed", name: "Ceed", years: [2007, 2025], engines: ["1.4L", "1.6L", "2.0L"] },
    { id: "sportage", name: "Sportage", years: [2004, 2025], engines: ["1.6L Turbo", "2.0L", "2.0L Diesel"] },
    { id: "sorento", name: "Sorento", years: [2002, 2025], engines: ["2.2L Diesel", "2.5L", "3.5L V6"] },
  ],
  volkswagen: [
    { id: "polo", name: "Polo", years: [2010, 2025], engines: ["1.4L", "1.6L"] },
    { id: "golf", name: "Golf", years: [2003, 2025], engines: ["1.4L TSI", "1.6L", "2.0L TSI"] },
    { id: "tiguan", name: "Tiguan", years: [2007, 2025], engines: ["1.4L TSI", "2.0L TSI", "2.0L TDI"] },
    { id: "passat", name: "Passat", years: [2005, 2025], engines: ["1.4L TSI", "1.8L TSI", "2.0L TDI"] },
  ],
  bmw: [
    { id: "3series", name: "3 серия", years: [2005, 2025], engines: ["2.0L", "2.0L Diesel", "3.0L"] },
    { id: "5series", name: "5 серия", years: [2003, 2025], engines: ["2.0L", "2.0L Diesel", "3.0L", "4.4L V8"] },
    { id: "x3", name: "X3", years: [2010, 2025], engines: ["2.0L", "2.0L Diesel", "3.0L"] },
    { id: "x5", name: "X5", years: [2006, 2025], engines: ["3.0L", "3.0L Diesel", "4.4L V8"] },
  ],
  mercedes: [
    { id: "cclass", name: "C-класс", years: [2007, 2025], engines: ["1.6L", "2.0L", "2.0L Diesel"] },
    { id: "eclass", name: "E-класс", years: [2002, 2025], engines: ["2.0L", "2.0L Diesel", "3.0L V6"] },
    { id: "glc", name: "GLC", years: [2015, 2025], engines: ["2.0L", "2.0L Diesel", "3.0L V6"] },
    { id: "gle", name: "GLE", years: [2011, 2025], engines: ["2.0L Diesel", "3.0L V6", "3.0L Diesel V6"] },
  ],
  audi: [
    { id: "a3", name: "A3", years: [2012, 2025], engines: ["1.4L TFSI", "1.8L TFSI", "2.0L TFSI"] },
    { id: "a4", name: "A4", years: [2007, 2025], engines: ["1.8L TFSI", "2.0L TFSI", "2.0L TDI"] },
    { id: "q5", name: "Q5", years: [2008, 2025], engines: ["2.0L TFSI", "2.0L TDI", "3.0L TDI V6"] },
    { id: "q7", name: "Q7", years: [2005, 2025], engines: ["2.0L TFSI", "3.0L TDI V6", "4.2L TDI V8"] },
  ],
  lada: [
    { id: "vesta", name: "Vesta", years: [2015, 2025], engines: ["1.6L", "1.8L"] },
    { id: "granta", name: "Granta", years: [2011, 2025], engines: ["1.6L 8V", "1.6L 16V"] },
    { id: "niva", name: "Niva Travel", years: [2020, 2025], engines: ["1.7L"] },
    { id: "largus", name: "Largus", years: [2012, 2025], engines: ["1.6L 8V", "1.6L 16V"] },
  ],
  ford: [
    { id: "focus", name: "Focus", years: [2004, 2025], engines: ["1.6L", "2.0L", "1.5L EcoBoost"] },
    { id: "kuga", name: "Kuga", years: [2008, 2025], engines: ["1.5L EcoBoost", "2.0L TDCi", "2.5L Hybrid"] },
    { id: "mondeo", name: "Mondeo", years: [2007, 2022], engines: ["1.6L", "2.0L", "2.0L TDCi"] },
  ],
  chevrolet: [
    { id: "cruze", name: "Cruze", years: [2009, 2020], engines: ["1.6L", "1.8L", "1.4L Turbo"] },
    { id: "niva", name: "Niva", years: [2002, 2025], engines: ["1.7L"] },
    { id: "captiva", name: "Captiva", years: [2006, 2018], engines: ["2.4L", "3.0L V6", "2.2L Diesel"] },
  ],
  renault: [
    { id: "duster", name: "Duster", years: [2010, 2025], engines: ["1.6L", "2.0L", "1.5L dCi"] },
    { id: "logan", name: "Logan", years: [2004, 2025], engines: ["1.4L", "1.6L"] },
    { id: "kaptur", name: "Kaptur", years: [2016, 2025], engines: ["1.6L", "2.0L", "1.3L TCe"] },
  ],
  mazda: [
    { id: "3", name: "Mazda 3", years: [2003, 2025], engines: ["1.5L", "2.0L", "2.5L"] },
    { id: "cx5", name: "CX-5", years: [2012, 2025], engines: ["2.0L", "2.5L", "2.2L Diesel"] },
    { id: "6", name: "Mazda 6", years: [2002, 2023], engines: ["2.0L", "2.5L", "2.5L Turbo"] },
  ],
  honda: [
    { id: "civic", name: "Civic", years: [2006, 2025], engines: ["1.5L Turbo", "1.8L", "2.0L"] },
    { id: "crv", name: "CR-V", years: [2002, 2025], engines: ["2.0L", "2.4L", "1.5L Turbo"] },
    { id: "accord", name: "Accord", years: [2003, 2025], engines: ["2.0L", "2.4L", "1.5L Turbo"] },
  ],
  mitsubishi: [
    { id: "outlander", name: "Outlander", years: [2003, 2025], engines: ["2.0L", "2.4L", "3.0L V6"] },
    { id: "asx", name: "ASX", years: [2010, 2025], engines: ["1.6L", "2.0L"] },
    { id: "lancer", name: "Lancer", years: [2003, 2017], engines: ["1.5L", "1.8L", "2.0L"] },
    { id: "pajero", name: "Pajero Sport", years: [2008, 2025], engines: ["2.4L Diesel", "3.0L V6"] },
  ],
  skoda: [
    { id: "octavia", name: "Octavia", years: [2004, 2025], engines: ["1.4L TSI", "1.6L", "2.0L TSI"] },
    { id: "rapid", name: "Rapid", years: [2012, 2025], engines: ["1.4L", "1.6L"] },
    { id: "kodiaq", name: "Kodiaq", years: [2016, 2025], engines: ["1.4L TSI", "2.0L TSI", "2.0L TDI"] },
  ],
  geely: [
    { id: "coolray", name: "Coolray", years: [2020, 2025], engines: ["1.5L Turbo"] },
    { id: "atlas", name: "Atlas", years: [2018, 2025], engines: ["2.0L", "2.4L"] },
    { id: "monjaro", name: "Monjaro", years: [2022, 2025], engines: ["2.0L Turbo"] },
  ],
  chery: [
    { id: "tiggo7pro", name: "Tiggo 7 Pro", years: [2020, 2025], engines: ["1.5L Turbo"] },
    { id: "tiggo4", name: "Tiggo 4", years: [2018, 2025], engines: ["1.5L Turbo", "2.0L"] },
    { id: "tiggo8", name: "Tiggo 8 Pro", years: [2019, 2025], engines: ["1.6L Turbo", "2.0L Turbo"] },
  ],
  byd: [
    { id: "song", name: "Song Plus", years: [2021, 2025], engines: ["1.5L Turbo DM-i", "EV"] },
    { id: "han", name: "Han", years: [2020, 2025], engines: ["EV", "DM-i"] },
    { id: "seal", name: "Seal", years: [2022, 2025], engines: ["EV"] },
  ],
};
