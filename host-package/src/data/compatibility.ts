export interface FitmentRule {
  productId: string;
  fits: string[];
  crossRef: CrossRef[];
}

export interface CrossRef {
  originalPart: string;
  altBrand: string;
  altPartNumber: string;
  altProductId?: string;
  note: string;
}

export const fitmentDatabase: FitmentRule[] = [
  {
    productId: "p1",
    fits: [
      "volkswagen/polo", "volkswagen/golf", "volkswagen/tiguan", "volkswagen/passat",
      "skoda/octavia", "skoda/rapid", "skoda/kodiaq",
      "audi/a3", "audi/a4", "audi/q5",
      "hyundai/solaris", "hyundai/creta", "kia/rio", "kia/ceed",
    ],
    crossRef: [
      { originalPart: "W 712/75", altBrand: "Bosch", altPartNumber: "F 026 407 116", note: "Полный аналог" },
      { originalPart: "W 712/75", altBrand: "Mahle", altPartNumber: "OC 593/4", note: "Аналог, OEM качество" },
      { originalPart: "W 712/75", altBrand: "Filtron", altPartNumber: "OP 641/1", note: "Бюджетный аналог" },
    ],
  },
  {
    productId: "p2",
    fits: [
      "toyota/corolla", "toyota/camry", "toyota/rav4",
      "honda/civic", "honda/crv", "honda/accord",
      "nissan/almera", "nissan/qashqai",
      "mitsubishi/lancer", "mitsubishi/asx",
      "mazda/3", "mazda/6", "mazda/cx5",
    ],
    crossRef: [
      { originalPart: "BKR6E-11", altBrand: "Denso", altPartNumber: "IK20TT", note: "Иридиевый аналог" },
      { originalPart: "BKR6E-11", altBrand: "Bosch", altPartNumber: "FR7LDC+", note: "Платиновый аналог" },
    ],
  },
  {
    productId: "p3",
    fits: [
      "volkswagen/polo", "volkswagen/golf",
      "skoda/octavia", "skoda/rapid",
      "audi/a3",
      "ford/focus",
    ],
    crossRef: [
      { originalPart: "5533XS", altBrand: "Continental", altPartNumber: "CT1028", note: "OEM поставщик для VW" },
      { originalPart: "5533XS", altBrand: "Dayco", altPartNumber: "94817", note: "Итальянский аналог" },
    ],
  },
  {
    productId: "p4",
    fits: [
      "bmw/3series", "bmw/5series", "bmw/x3", "bmw/x5",
      "toyota/camry", "toyota/rav4",
      "ford/focus", "ford/kuga",
    ],
    crossRef: [
      { originalPart: "P 06 010", altBrand: "TRW", altPartNumber: "GDB1550", note: "Аналог, немецкое качество" },
      { originalPart: "P 06 010", altBrand: "ATE", altPartNumber: "13.0460-7184.2", note: "OEM для BMW" },
      { originalPart: "P 06 010", altBrand: "Ferodo", altPartNumber: "FDB1641", note: "Британский аналог" },
    ],
  },
  {
    productId: "p5",
    fits: [
      "hyundai/tucson", "hyundai/santafe",
      "kia/sportage", "kia/sorento",
      "toyota/camry", "toyota/rav4",
      "nissan/xtrail", "nissan/qashqai",
    ],
    crossRef: [
      { originalPart: "DF4076", altBrand: "Brembo", altPartNumber: "09.A820.10", note: "Премиум аналог" },
      { originalPart: "DF4076", altBrand: "Zimmermann", altPartNumber: "150.3434.20", note: "Немецкий аналог" },
    ],
  },
  {
    productId: "p6",
    fits: [
      "volkswagen/golf", "volkswagen/tiguan", "volkswagen/passat",
      "skoda/octavia", "skoda/kodiaq",
      "audi/a3", "audi/a4", "audi/q5",
    ],
    crossRef: [
      { originalPart: "311 521", altBrand: "KYB", altPartNumber: "344459", note: "Японский аналог" },
      { originalPart: "311 521", altBrand: "Bilstein", altPartNumber: "24-178396", note: "Премиум спорт" },
      { originalPart: "311 521", altBrand: "Monroe", altPartNumber: "G2252", note: "Бюджетный аналог" },
    ],
  },
  {
    productId: "p7",
    fits: [
      "honda/civic", "honda/crv", "honda/accord",
      "toyota/corolla", "toyota/rav4",
      "mitsubishi/outlander", "mitsubishi/asx",
    ],
    crossRef: [
      { originalPart: "HO-BJ-8031", altBrand: "TRW", altPartNumber: "JBJ7577", note: "Немецкий аналог" },
      { originalPart: "HO-BJ-8031", altBrand: "555", altPartNumber: "SB-6252", note: "Японский OEM" },
    ],
  },
  {
    productId: "p8",
    fits: [
      "toyota/camry", "toyota/corolla", "toyota/rav4", "toyota/landcruiser",
      "hyundai/solaris", "hyundai/creta", "hyundai/tucson",
      "kia/rio", "kia/ceed", "kia/sportage",
      "volkswagen/polo", "volkswagen/golf", "volkswagen/tiguan",
      "bmw/3series", "bmw/5series",
      "mercedes/cclass", "mercedes/eclass",
      "lada/vesta", "lada/granta",
    ],
    crossRef: [
      { originalPart: "152559", altBrand: "Shell", altPartNumber: "Helix Ultra 5W-30", note: "Аналогичная вязкость" },
      { originalPart: "152559", altBrand: "Castrol", altPartNumber: "EDGE 5W-30", note: "Аналогичная вязкость" },
      { originalPart: "152559", altBrand: "Лукойл", altPartNumber: "Genesis Armortech 5W-30", note: "Российский аналог" },
    ],
  },
  {
    productId: "p9",
    fits: [
      "volkswagen/polo", "volkswagen/golf", "volkswagen/tiguan", "volkswagen/passat",
      "skoda/octavia", "skoda/rapid",
      "hyundai/solaris", "hyundai/creta", "hyundai/tucson",
      "kia/rio", "kia/ceed", "kia/sportage",
      "toyota/camry", "toyota/corolla",
      "lada/vesta", "lada/granta",
      "ford/focus",
    ],
    crossRef: [
      { originalPart: "0 092 S50 090", altBrand: "Varta", altPartNumber: "E11 Blue Dynamic", note: "Тот же завод (Clarios)" },
      { originalPart: "0 092 S50 090", altBrand: "Mutlu", altPartNumber: "L3.75.072.A", note: "Турецкий аналог" },
    ],
  },
  {
    productId: "p10",
    fits: [
      "volkswagen/golf", "volkswagen/tiguan", "volkswagen/passat",
      "audi/a3", "audi/a4", "audi/q5",
      "skoda/octavia", "skoda/kodiaq",
      "ford/focus", "ford/kuga",
    ],
    crossRef: [
      { originalPart: "33-2865", altBrand: "MANN-FILTER", altPartNumber: "C 35 154", note: "OEM замена" },
      { originalPart: "33-2865", altBrand: "Mahle", altPartNumber: "LX 1566", note: "OEM качество" },
      { originalPart: "33-2865", altBrand: "Filtron", altPartNumber: "AP 183/1", note: "Бюджетный аналог" },
    ],
  },
];

export function getProductFitment(productId: string): FitmentRule | undefined {
  return fitmentDatabase.find((f) => f.productId === productId);
}

export function doesProductFitCar(productId: string, brandId: string, modelId: string): boolean {
  const rule = getProductFitment(productId);
  if (!rule) return false;
  return rule.fits.includes(`${brandId}/${modelId}`);
}

export function getProductsForCar(brandId: string, modelId: string): string[] {
  return fitmentDatabase
    .filter((f) => f.fits.includes(`${brandId}/${modelId}`))
    .map((f) => f.productId);
}

export function getCrossReferences(productId: string): CrossRef[] {
  return getProductFitment(productId)?.crossRef ?? [];
}
