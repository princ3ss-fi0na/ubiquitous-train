export interface CarBrand {
  id: string;
  name: string;
  logo: string; // SVG path data or emoji fallback
  country: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  rating: number;
  inStock: boolean;
  brand: string;
  partNumber: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const carBrands: CarBrand[] = [
  // Российские марки
  { id: "lada", name: "LADA", logo: "🚗", country: "RU" },
  { id: "uaz", name: "UAZ", logo: "🚙", country: "RU" },
  { id: "gaz", name: "ГАЗ", logo: "🚗", country: "RU" },
  { id: "kamaz", name: "КАМАЗ", logo: "🚙", country: "RU" },
  
  // Китайские марки
  { id: "byd", name: "BYD", logo: "🚗", country: "CN" },
  { id: "geely", name: "Geely", logo: "🚙", country: "CN" },
  { id: "chery", name: "Chery", logo: "🚘", country: "CN" },
  { id: "greatwall", name: "Great Wall", logo: "🚗", country: "CN" },
  { id: "nio", name: "NIO", logo: "🚙", country: "CN" },
  { id: "xpeng", name: "XPeng", logo: "🚘", country: "CN" },
  { id: "li", name: "Li Auto", logo: "🚗", country: "CN" },
  { id: "zeekr", name: "Zeekr", logo: "🚙", country: "CN" },
  { id: "avatr", name: "Avatr", logo: "🚘", country: "CN" },
  
  // Японские марки
  { id: "toyota", name: "Toyota", logo: "🚗", country: "JP" },
  { id: "nissan", name: "Nissan", logo: "🚙", country: "JP" },
  { id: "mazda", name: "Mazda", logo: "🚘", country: "JP" },
  { id: "mitsubishi", name: "Mitsubishi", logo: "🚗", country: "JP" },
  { id: "honda", name: "Honda", logo: "🚙", country: "JP" },
  { id: "lexus", name: "Lexus", logo: "🚘", country: "JP" },
  
  // Немецкие марки
  { id: "volkswagen", name: "Volkswagen", logo: "🚗", country: "DE" },
  { id: "bmw", name: "BMW", logo: "🚙", country: "DE" },
  { id: "mercedes", name: "Mercedes", logo: "🚘", country: "DE" },
  { id: "audi", name: "Audi", logo: "🚗", country: "DE" },
  { id: "opel", name: "Opel", logo: "🚙", country: "DE" },
  { id: "porsche", name: "Porsche", logo: "🚘", country: "DE" },
  
  // Корейские марки
  { id: "kia", name: "KIA", logo: "🚗", country: "KR" },
  { id: "hyundai", name: "Hyundai", logo: "🚙", country: "KR" },
  { id: "genesis", name: "Genesis", logo: "🚘", country: "KR" },
  
  // Американские марки
  { id: "chevrolet", name: "Chevrolet", logo: "🚗", country: "US" },
  { id: "ford", name: "Ford", logo: "🚙", country: "US" },
  { id: "jeep", name: "Jeep", logo: "🚘", country: "US" },
  { id: "dodge", name: "Dodge", logo: "🚗", country: "US" },
  
  // Французские марки
  { id: "renault", name: "Renault", logo: "🚙", country: "FR" },
  { id: "peugeot", name: "Peugeot", logo: "🚘", country: "FR" },
  { id: "citroen", name: "Citroën", logo: "🚗", country: "FR" },
  
  // Чешские марки
  { id: "skoda", name: "Škoda", logo: "🚙", country: "CZ" },
  
  // Итальянские марки
  { id: "fiat", name: "Fiat", logo: "🚘", country: "IT" },
  { id: "alfaromeo", name: "Alfa Romeo", logo: "🚗", country: "IT" },
];

export const categories: Category[] = [
  { id: "engine", name: "Двигатель", icon: "engine", count: 0 },
  { id: "brakes", name: "Тормоза", icon: "brakes", count: 0 },
  { id: "suspension", name: "Подвеска", icon: "suspension", count: 0 },
  { id: "filters", name: "Фильтры", icon: "filters", count: 0 },
  { id: "electrics", name: "Электрика", icon: "electrics", count: 0 },
  { id: "body", name: "Кузов", icon: "body", count: 0 },
  { id: "exhaust", name: "Выхлоп", icon: "exhaust", count: 0 },
  { id: "cooling", name: "Охлаждение", icon: "cooling", count: 0 },
  { id: "oils", name: "Масла / Жидкости", icon: "oils", count: 0 },
  { id: "tyres", name: "Шины / Диски", icon: "tyres", count: 0 },
];

export const products: Product[] = [
  // ENGINE
  {
    id: "p1",
    name: "Масляный фильтр MANN-FILTER",
    price: 890,
    oldPrice: 1100,
    category: "filters",
    image: "🔧",
    rating: 4.8,
    inStock: true,
    brand: "MANN-FILTER",
    partNumber: "W 712/75",
    description: "Оригинальный масляный фильтр для широкого спектра автомобилей. Высокая степень фильтрации.",
  },
  {
    id: "p2",
    name: "Свечи зажигания NGK (комплект 4 шт)",
    price: 2400,
    oldPrice: 2900,
    category: "engine",
    image: "⚙️",
    rating: 4.9,
    inStock: true,
    brand: "NGK",
    partNumber: "BKR6E-11",
    description: "Иридиевые свечи зажигания NGK. Увеличенный ресурс до 100 000 км.",
  },
  {
    id: "p3",
    name: "Ремень ГРМ Gates",
    price: 3200,
    category: "engine",
    image: "⚙️",
    rating: 4.7,
    inStock: true,
    brand: "Gates",
    partNumber: "5533XS",
    description: "Ремень ГРМ высокого качества от мирового производителя. Гарантия 60 000 км.",
  },
  // BRAKES
  {
    id: "p4",
    name: "Тормозные колодки Brembo (передние)",
    price: 4500,
    oldPrice: 5200,
    category: "brakes",
    image: "🛑",
    rating: 4.9,
    inStock: true,
    brand: "Brembo",
    partNumber: "P 06 010",
    description: "Высокоэффективные тормозные колодки Brembo. Отличное торможение в любых условиях.",
  },
  {
    id: "p5",
    name: "Тормозной диск TRW (передний)",
    price: 3800,
    category: "brakes",
    image: "🛑",
    rating: 4.6,
    inStock: true,
    brand: "TRW",
    partNumber: "DF4076",
    description: "Вентилируемый тормозной диск. Устойчив к перегреву и деформации.",
  },
  // SUSPENSION
  {
    id: "p6",
    name: "Амортизатор SACHS (задний)",
    price: 5600,
    oldPrice: 6800,
    category: "suspension",
    image: "🔩",
    rating: 4.8,
    inStock: true,
    brand: "SACHS",
    partNumber: "311 521",
    description: "Газомасляный амортизатор SACHS. Плавный ход, отличная управляемость.",
  },
  {
    id: "p7",
    name: "Шаровая опора MOOG",
    price: 2100,
    category: "suspension",
    image: "🔩",
    rating: 4.7,
    inStock: false,
    brand: "MOOG",
    partNumber: "HO-BJ-8031",
    description: "Усиленная шаровая опора MOOG с пожизненной гарантией.",
  },
  // OILS
  {
    id: "p8",
    name: "Моторное масло Mobil 1 5W-30 (4л)",
    price: 4200,
    oldPrice: 4900,
    category: "oils",
    image: "🛢️",
    rating: 5.0,
    inStock: true,
    brand: "Mobil 1",
    partNumber: "152559",
    description: "Синтетическое моторное масло Mobil 1. Защита двигателя с первой секунды запуска.",
  },
  // ELECTRICS
  {
    id: "p9",
    name: "Аккумулятор Bosch Silver 74Ah",
    price: 8900,
    oldPrice: 10500,
    category: "electrics",
    image: "⚡",
    rating: 4.8,
    inStock: true,
    brand: "Bosch",
    partNumber: "0 092 S50 090",
    description: "Надёжный аккумулятор Bosch Silver. Оптимален для холодного климата СНГ.",
  },
  // FILTERS
  {
    id: "p10",
    name: "Воздушный фильтр K&N",
    price: 3600,
    category: "filters",
    image: "🔧",
    rating: 4.9,
    inStock: true,
    brand: "K&N",
    partNumber: "33-2865",
    description: "Спортивный воздушный фильтр K&N многоразового использования. Увеличивает мощность двигателя.",
  },
];

// Привязываем count к реальному количеству продуктов
categories.forEach(cat => {
  cat.count = products.filter(p => p.category === cat.id).length;
});
