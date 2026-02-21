// Russian phone: +7 followed by 10 digits, or 8 followed by 10 digits
const PHONE_RE = /^(\+7|8)\s*\(?\d{3}\)?\s*\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
const PHONE_DIGITS_RE = /^[78]\d{10}$/;

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s()\-+]/g, "");
}

export function validatePhone(raw: string): string | null {
  if (!raw.trim()) return "Введите номер телефона";
  const clean = normalizePhone(raw);
  if (PHONE_RE.test(raw.trim())) return null;
  if (PHONE_DIGITS_RE.test(clean)) return null;
  if (clean.length < 11) return "Номер слишком короткий";
  if (clean.length > 12) return "Номер слишком длинный";
  return "Формат: +7 (9XX) XXX-XX-XX";
}

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  let d = digits;
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ") ";
  if (d.length > 4) result += d.slice(4, 7);
  if (d.length > 7) result += "-" + d.slice(7, 9);
  if (d.length > 9) result += "-" + d.slice(9, 11);
  return result;
}

// Name: at least 2 words, only letters, spaces, hyphens. No digits/random chars.
const NAME_RE = /^[A-Za-zА-Яа-яЁёÀ-ÿ'-]+(\s+[A-Za-zА-Яа-яЁёÀ-ÿ'-]+)+$/;

export function validateName(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Введите имя и фамилию";
  if (s.length < 3) return "Слишком короткое имя";
  if (/\d/.test(s)) return "Имя не может содержать цифры";
  if (!NAME_RE.test(s)) return "Введите имя и фамилию";
  return null;
}

// Cities: comprehensive list of Russian cities (population > ~50k) + major CIS cities
export const RUSSIAN_CITIES: string[] = [
  "Москва","Санкт-Петербург","Новосибирск","Екатеринбург","Казань",
  "Нижний Новгород","Челябинск","Самара","Омск","Ростов-на-Дону",
  "Уфа","Красноярск","Воронеж","Пермь","Волгоград",
  "Краснодар","Саратов","Тюмень","Тольятти","Ижевск",
  "Барнаул","Ульяновск","Иркутск","Хабаровск","Ярославль",
  "Владивосток","Махачкала","Томск","Оренбург","Кемерово",
  "Новокузнецк","Рязань","Астрахань","Набережные Челны","Пенза",
  "Липецк","Тула","Киров","Чебоксары","Калининград",
  "Брянск","Курск","Иваново","Магнитогорск","Улан-Удэ",
  "Тверь","Ставрополь","Нижний Тагил","Белгород","Архангельск",
  "Владимир","Сочи","Курган","Смоленск","Калуга",
  "Чита","Орёл","Волжский","Череповец","Владикавказ",
  "Мурманск","Сургут","Вологда","Саранск","Тамбов",
  "Стерлитамак","Грозный","Якутск","Кострома","Петрозаводск",
  "Комсомольск-на-Амуре","Таганрог","Нижневартовск","Йошкар-Ола","Братск",
  "Новороссийск","Дзержинск","Шахты","Нальчик","Орск",
  "Энгельс","Благовещенск","Сыктывкар","Ангарск","Старый Оскол",
  "Великий Новгород","Псков","Бийск","Прокопьевск","Рыбинск",
  "Балаково","Мытищи","Люберцы","Красногорск","Подольск",
  "Химки","Королёв","Балашиха","Одинцово","Домодедово",
  "Электросталь","Коломна","Серпухов","Долгопрудный","Реутов",
  "Жуковский","Пушкино","Раменское","Ногинск","Щёлково",
  "Обнинск","Батайск","Новочеркасск","Каменск-Уральский","Златоуст",
  "Миасс","Копейск","Первоуральск","Альметьевск","Нефтекамск",
  "Хасавюрт","Дербент","Кисловодск","Пятигорск","Ессентуки",
  "Невинномысск","Минеральные Воды","Назрань","Черкесск",
  "Элиста","Абакан","Кызыл","Горно-Алтайск","Майкоп",
  "Нарьян-Мар","Салехард","Анадырь","Магадан","Петропавловск-Камчатский",
  "Южно-Сахалинск","Биробиджан",
  "Минск","Алматы","Астана","Ташкент","Бишкек","Душанбе","Ереван","Тбилиси","Баку",
];

const CITIES_LOWER = RUSSIAN_CITIES.map((c) => c.toLowerCase());

export function validateCity(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Введите населённый пункт";
  if (s.length < 2) return "Слишком короткое название";
  if (/^\d+$/.test(s)) return "Введите название, а не число";
  if (!/[а-яА-ЯёЁa-zA-Z]/.test(s)) return "Введите название населённого пункта";
  return null;
}

export function isCityKnown(raw: string): boolean {
  return CITIES_LOWER.includes(raw.trim().toLowerCase());
}

export function searchCities(query: string): string[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return RUSSIAN_CITIES.filter((c) => c.toLowerCase().startsWith(q)).slice(0, 8);
}

export function validateAddress(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Введите адрес доставки";
  if (s.length < 5) return "Адрес слишком короткий";
  if (!/[а-яА-ЯёЁa-zA-Z]/.test(s)) return "Введите корректный адрес";
  const hasStreet = /[а-яА-ЯёЁ]{2,}/.test(s);
  const hasNumber = /\d/.test(s);
  if (!hasStreet || !hasNumber) return "Укажите улицу и номер дома";
  return null;
}

export function validateEmail(raw: string): string | null {
  if (!raw.trim()) return null; // optional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(raw.trim())) return "Некорректный email";
  return null;
}

// Car brand: must be at least 2 chars, only letters/digits/spaces
export function validateCarBrand(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Введите марку";
  if (s.length < 2) return "Слишком короткое название";
  if (!/^[A-Za-zА-Яа-яЁё0-9\s\-]+$/.test(s)) return "Недопустимые символы";
  return null;
}

// Car model: must be at least 1 char, letters/digits/spaces
export function validateCarModel(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Введите модель";
  if (s.length < 1) return "Слишком короткое название";
  if (!/^[A-Za-zА-Яа-яЁё0-9\s\-/.]+$/.test(s)) return "Недопустимые символы";
  return null;
}

export function validateEngine(raw: string): string | null {
  const s = raw.trim();
  if (!s) return "Введите двигатель";
  if (s.length < 2) return "Слишком короткое значение";
  return null;
}

// All 89 subjects of the Russian Federation, grouped by federal district
export const RUSSIAN_REGIONS: { code: string; name: string; district: string }[] = [
  // Центральный ФО
  { code: "77", name: "Москва", district: "ЦФО" },
  { code: "50", name: "Московская область", district: "ЦФО" },
  { code: "31", name: "Белгородская область", district: "ЦФО" },
  { code: "32", name: "Брянская область", district: "ЦФО" },
  { code: "33", name: "Владимирская область", district: "ЦФО" },
  { code: "36", name: "Воронежская область", district: "ЦФО" },
  { code: "37", name: "Ивановская область", district: "ЦФО" },
  { code: "40", name: "Калужская область", district: "ЦФО" },
  { code: "44", name: "Костромская область", district: "ЦФО" },
  { code: "46", name: "Курская область", district: "ЦФО" },
  { code: "48", name: "Липецкая область", district: "ЦФО" },
  { code: "57", name: "Орловская область", district: "ЦФО" },
  { code: "62", name: "Рязанская область", district: "ЦФО" },
  { code: "67", name: "Смоленская область", district: "ЦФО" },
  { code: "68", name: "Тамбовская область", district: "ЦФО" },
  { code: "69", name: "Тверская область", district: "ЦФО" },
  { code: "71", name: "Тульская область", district: "ЦФО" },
  { code: "76", name: "Ярославская область", district: "ЦФО" },
  // Северо-Западный ФО
  { code: "78", name: "Санкт-Петербург", district: "СЗФО" },
  { code: "47", name: "Ленинградская область", district: "СЗФО" },
  { code: "29", name: "Архангельская область", district: "СЗФО" },
  { code: "35", name: "Вологодская область", district: "СЗФО" },
  { code: "39", name: "Калининградская область", district: "СЗФО" },
  { code: "10", name: "Республика Карелия", district: "СЗФО" },
  { code: "11", name: "Республика Коми", district: "СЗФО" },
  { code: "51", name: "Мурманская область", district: "СЗФО" },
  { code: "83", name: "Ненецкий АО", district: "СЗФО" },
  { code: "53", name: "Новгородская область", district: "СЗФО" },
  { code: "60", name: "Псковская область", district: "СЗФО" },
  // Южный ФО
  { code: "01", name: "Республика Адыгея", district: "ЮФО" },
  { code: "30", name: "Астраханская область", district: "ЮФО" },
  { code: "34", name: "Волгоградская область", district: "ЮФО" },
  { code: "08", name: "Республика Калмыкия", district: "ЮФО" },
  { code: "23", name: "Краснодарский край", district: "ЮФО" },
  { code: "82", name: "Республика Крым", district: "ЮФО" },
  { code: "61", name: "Ростовская область", district: "ЮФО" },
  { code: "92", name: "Севастополь", district: "ЮФО" },
  // Северо-Кавказский ФО
  { code: "05", name: "Республика Дагестан", district: "СКФО" },
  { code: "06", name: "Республика Ингушетия", district: "СКФО" },
  { code: "07", name: "Кабардино-Балкарская Респ.", district: "СКФО" },
  { code: "09", name: "Карачаево-Черкесская Респ.", district: "СКФО" },
  { code: "15", name: "Республика Северная Осетия", district: "СКФО" },
  { code: "26", name: "Ставропольский край", district: "СКФО" },
  { code: "20", name: "Чеченская Республика", district: "СКФО" },
  // Приволжский ФО
  { code: "02", name: "Республика Башкортостан", district: "ПФО" },
  { code: "43", name: "Кировская область", district: "ПФО" },
  { code: "12", name: "Республика Марий Эл", district: "ПФО" },
  { code: "13", name: "Республика Мордовия", district: "ПФО" },
  { code: "52", name: "Нижегородская область", district: "ПФО" },
  { code: "56", name: "Оренбургская область", district: "ПФО" },
  { code: "58", name: "Пензенская область", district: "ПФО" },
  { code: "59", name: "Пермский край", district: "ПФО" },
  { code: "63", name: "Самарская область", district: "ПФО" },
  { code: "64", name: "Саратовская область", district: "ПФО" },
  { code: "16", name: "Республика Татарстан", district: "ПФО" },
  { code: "18", name: "Удмуртская Республика", district: "ПФО" },
  { code: "73", name: "Ульяновская область", district: "ПФО" },
  { code: "21", name: "Чувашская Республика", district: "ПФО" },
  // Уральский ФО
  { code: "45", name: "Курганская область", district: "УФО" },
  { code: "66", name: "Свердловская область", district: "УФО" },
  { code: "72", name: "Тюменская область", district: "УФО" },
  { code: "74", name: "Челябинская область", district: "УФО" },
  { code: "86", name: "Ханты-Мансийский АО", district: "УФО" },
  { code: "89", name: "Ямало-Ненецкий АО", district: "УФО" },
  // Сибирский ФО
  { code: "04", name: "Республика Алтай", district: "СФО" },
  { code: "22", name: "Алтайский край", district: "СФО" },
  { code: "38", name: "Иркутская область", district: "СФО" },
  { code: "42", name: "Кемеровская область", district: "СФО" },
  { code: "24", name: "Красноярский край", district: "СФО" },
  { code: "54", name: "Новосибирская область", district: "СФО" },
  { code: "55", name: "Омская область", district: "СФО" },
  { code: "70", name: "Томская область", district: "СФО" },
  { code: "17", name: "Республика Тыва", district: "СФО" },
  { code: "19", name: "Республика Хакасия", district: "СФО" },
  // Дальневосточный ФО
  { code: "28", name: "Амурская область", district: "ДФО" },
  { code: "03", name: "Республика Бурятия", district: "ДФО" },
  { code: "79", name: "Еврейская АО", district: "ДФО" },
  { code: "75", name: "Забайкальский край", district: "ДФО" },
  { code: "41", name: "Камчатский край", district: "ДФО" },
  { code: "49", name: "Магаданская область", district: "ДФО" },
  { code: "25", name: "Приморский край", district: "ДФО" },
  { code: "14", name: "Республика Саха (Якутия)", district: "ДФО" },
  { code: "65", name: "Сахалинская область", district: "ДФО" },
  { code: "27", name: "Хабаровский край", district: "ДФО" },
  { code: "87", name: "Чукотский АО", district: "ДФО" },
];

export function searchRegions(query: string): typeof RUSSIAN_REGIONS {
  if (!query.trim()) return RUSSIAN_REGIONS;
  const q = query.trim().toLowerCase();
  return RUSSIAN_REGIONS.filter(
    (r) => r.name.toLowerCase().includes(q) || r.district.toLowerCase().includes(q)
  );
}

export function validateRegion(raw: string): string | null {
  if (!raw.trim()) return "Выберите регион";
  const match = RUSSIAN_REGIONS.some(
    (r) => r.name === raw.trim() || r.code === raw.trim()
  );
  if (!match) return "Выберите регион из списка";
  return null;
}

export interface FieldError {
  field: string;
  message: string;
}

export type ValidationErrors = Record<string, string | null>;
