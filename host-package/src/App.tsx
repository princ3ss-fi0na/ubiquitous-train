import React, { useState, useEffect, useMemo } from "react";
import { Logo } from "./components/Logo";
import { BrandSVGs } from "./components/BrandLogos";
import { OrderModal } from "./components/OrderModal";
import { AdminPanel } from "./components/AdminPanel";
import { ProfileTab } from "./components/ProfileTab";
import { GarageSection } from "./components/GarageSection";
import { carBrands, categories, products, Product } from "./data/cars";
import {
  HeadphonesIcon,
  CartIcon,
  HomeIcon,
  CatalogIcon,
  SearchIcon,
  StarIcon,
  FireIcon,
  ClockIcon,
  PackageIcon,
  RefreshIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  MessageIcon,
  AdminIcon,
  UserIcon,
  CheckIcon,
  CarIcon,
} from "./components/Icons";
import { categoryIconMap } from "./utils/categoryIcons";
import { isAdmin, getTelegramUserId } from "./utils/auth";
import { loadSettings, saveSettings, applyMarkup, AdminSettings } from "./utils/adminStore";
import { loadProfile, UserProfile } from "./utils/userProfile";
import { loadGarage, UserCar, getPrimaryCar, CAR_MODELS } from "./utils/garage";
import { doesProductFitCar, getProductsForCar, getCrossReferences, CrossRef } from "./data/compatibility";

type Tab = "home" | "catalog" | "cart" | "profile" | "support" | "admin";
type SortBy = "relevance" | "name" | "price-asc" | "price-desc" | "rating";

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(loadSettings);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [garage, setGarage] = useState<UserCar[]>(loadGarage);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    const tgId = getTelegramUserId();
    let admin = isAdmin(tgId);

    if (!admin && new URLSearchParams(window.location.search).get("admin") === "1696302243") {
      admin = true;
    }
    setUserIsAdmin(admin);

    // #region agent log
    fetch('http://127.0.0.1:7359/ingest/ffdf582f-c00f-428e-beaf-ff5f88c3abb0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6bb6d3'},body:JSON.stringify({sessionId:'6bb6d3',location:'App.tsx:useEffect',message:'telegram-auth-check',data:{tgId,admin,initData:window.Telegram?.WebApp?.initData?.slice(0,50)},timestamp:Date.now(),hypothesisId:'AUTH'})}).catch(()=>{});
    // #endregion
  }, []);

  const getPrice = (basePrice: number) => applyMarkup(basePrice, adminSettings.markupPercent);
  const getOldPrice = (baseOldPrice?: number) => baseOldPrice ? applyMarkup(baseOldPrice, adminSettings.markupPercent) : undefined;

  const primaryCar = garage.find((c) => c.isPrimary) ?? null;

  const recommendedProductIds = useMemo(() => {
    if (!primaryCar) return new Set<string>();
    return new Set(getProductsForCar(primaryCar.brandId, primaryCar.model));
  }, [primaryCar]);

  const recommendedProducts = useMemo(() => {
    return products.filter((p) => recommendedProductIds.has(p.id));
  }, [recommendedProductIds]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const cartTotal = cart.reduce((sum, i) => sum + getPrice(i.product.price) * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchCat = !selectedCategory || p.category === selectedCategory;
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    // Sorting
    switch (sortBy) {
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      case "price-asc":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      default:
        // relevance - keep original order
        break;
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleSupport = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({ action: "support_request" }));
    }
    window.open(adminSettings.supportLink || "https://t.me/CMOLEHCK", "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="bg-[#111] border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSupport}
              className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors active:scale-90"
              title="Техподдержка"
            >
              <HeadphonesIcon size={18} />
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className="relative w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors active:scale-90"
            >
              <CartIcon size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-0.5">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0000] via-[#111] to-[#0a0a0a] mx-4 mt-4 rounded-2xl border border-gray-800 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -translate-y-8 translate-x-8 blur-xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-600/5 rounded-full translate-y-6 -translate-x-6 blur-lg" />
              <p className="text-red-500 text-xs font-semibold tracking-widest uppercase mb-2">Запчасти по всему СНГ</p>
              <h1 className="text-white font-black text-2xl leading-tight mb-2">
                Оригинал и<br/>аналоги в наличии
              </h1>
              <p className="text-gray-400 text-sm mb-4">Быстрая доставка · Гарантия · Лучшие цены</p>
              <button
                onClick={() => setActiveTab("catalog")}
                className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                Перейти в каталог →
              </button>
            </div>

            {/* My Garage */}
            <div className="px-4 mt-6">
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <CarIcon size={18} className="text-red-500" />
                Мой гараж
              </h2>
              <GarageSection garage={garage} onGarageChange={setGarage} />
            </div>

            {/* Recommended for your car */}
            {primaryCar && recommendedProducts.length > 0 && (
              <div className="px-4 mt-6">
                <h2 className="text-white font-bold text-base mb-1 flex items-center gap-2">
                  <CheckIcon size={16} className="text-green-400" />
                  Подходит к вашему авто
                </h2>
                <p className="text-gray-500 text-xs mb-3">
                  {primaryCar.brandName} {CAR_MODELS[primaryCar.brandId]?.find((m) => m.id === primaryCar.model)?.name} {primaryCar.year}
                </p>
                <div className="space-y-3">
                  {recommendedProducts.slice(0, 4).map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      displayPrice={getPrice(product.price)}
                      displayOldPrice={getOldPrice(product.oldPrice)}
                      onOrder={() => setSelectedProduct(product)}
                      onAddToCart={() => addToCart(product)}
                      fitsBadge={true}
                      crossRefs={getCrossReferences(product.id)}
                    />
                  ))}
                </div>
                {recommendedProducts.length > 4 && (
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className="w-full mt-3 text-red-400 text-sm font-semibold py-2 hover:text-red-300 transition-colors"
                  >
                    Показать все ({recommendedProducts.length}) →
                  </button>
                )}
              </div>
            )}

            {/* Popular Brands */}
            <div className="px-4 mt-6">
              <h2 className="text-white font-bold text-base mb-3">Популярные марки</h2>
              <div className="grid grid-cols-4 gap-3">
                {carBrands.slice(0, 8).map(brand => {
                  const BrandLogo = BrandSVGs[brand.id];
                  return (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setSelectedBrand(brand.id);
                        setActiveTab("catalog");
                      }}
                      className="flex flex-col items-center gap-2 p-2 rounded-xl bg-[#111] border border-gray-800 hover:border-red-700 active:scale-95 transition-all"
                    >
                      {BrandLogo ? <BrandLogo size={38} /> : <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl">{brand.logo}</div>}
                      <span className="text-gray-400 text-[10px] font-semibold">{brand.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories preview */}
            <div className="px-4 mt-6">
              <h2 className="text-white font-bold text-base mb-3">Категории</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 6).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveTab("catalog");
                    }}
                    className="flex items-center gap-3 p-3.5 bg-[#111] border border-gray-800 hover:border-red-700 active:scale-95 rounded-xl transition-all text-left"
                  >
                    {categoryIconMap[cat.id] ? (
                      <div className="w-10 h-10 rounded-lg bg-gray-800/60 flex items-center justify-center text-gray-300 flex-shrink-0">
                        {React.createElement(categoryIconMap[cat.id], { size: 22 })}
                      </div>
                    ) : (
                      <span className="text-2xl">{cat.icon}</span>
                    )}
                    <div>
                      <p className="text-white text-sm font-semibold leading-tight">{cat.name}</p>
                      <p className="text-gray-600 text-xs">{cat.count} {cat.count === 1 ? "товар" : cat.count >= 2 && cat.count <= 4 ? "товара" : "товаров"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hot deals */}
            <div className="px-4 mt-6 mb-2">
              <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
                <FireIcon size={18} className="text-orange-500" />
                Горячие предложения
              </h2>
              <div className="space-y-3">
                {products.filter(p => p.oldPrice).map(product => {
                  const fits = primaryCar ? doesProductFitCar(product.id, primaryCar.brandId, primaryCar.model) : false;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      displayPrice={getPrice(product.price)}
                      displayOldPrice={getOldPrice(product.oldPrice)}
                      onOrder={() => setSelectedProduct(product)}
                      onAddToCart={() => addToCart(product)}
                      fitsBadge={fits}
                      crossRefs={getCrossReferences(product.id)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Support CTA */}
            <div className="px-4 mt-4 mb-2">
              <button
                onClick={handleSupport}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 hover:border-red-700 active:scale-95 rounded-2xl p-4 flex items-center gap-4 transition-all"
              >
                <div className="w-12 h-12 bg-red-600/20 border border-red-600/30 rounded-xl flex items-center justify-center">
                  <HeadphonesIcon size={24} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">Нужна помощь?</p>
                  <p className="text-gray-400 text-xs">Техническая поддержка 24/7</p>
                </div>
                <span className="ml-auto text-red-500 text-lg">→</span>
              </button>
            </div>
          </div>
        )}

        {/* CATALOG TAB */}
        {activeTab === "catalog" && (
          <div>
            {/* Search */}
            <div className="px-4 pt-4 pb-3 sticky top-[56px] bg-[#0a0a0a] z-30 border-b border-transparent">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <SearchIcon size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Поиск запчастей..."
                  className="w-full bg-[#111] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Sort & Filter */}
            <div className="px-4 pt-2 pb-3 mb-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSortBy("relevance")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${sortBy === "relevance" ? "bg-gray-700 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                >
                  По умолчанию
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${sortBy === "name" ? "bg-gray-700 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                >
                  По алфавиту
                </button>
                <button
                  onClick={() => setSortBy("price-asc")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${sortBy === "price-asc" ? "bg-gray-700 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                >
                  Цена ↑
                </button>
                <button
                  onClick={() => setSortBy("price-desc")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${sortBy === "price-desc" ? "bg-gray-700 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                >
                  Цена ↓
                </button>
                <button
                  onClick={() => setSortBy("rating")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${sortBy === "rating" ? "bg-gray-700 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                >
                  По рейтингу
                </button>
              </div>
            </div>

            {/* Brand filter */}
            <div className="px-4 mb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!selectedBrand ? "bg-red-600 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                >
                  Все марки
                </button>
                {carBrands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id === selectedBrand ? null : b.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedBrand === b.id ? "bg-red-600 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category pills */}
            <div className="px-4 mb-3">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!selectedCategory ? "bg-gray-700 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                >
                  Все
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id === selectedCategory ? null : c.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedCategory === c.id ? "bg-gray-700 text-white" : "bg-[#111] text-gray-400 border border-gray-800"}`}
                  >
                    {categoryIconMap[c.id] ? (
                      <>
                        <span className="text-sm">{React.createElement(categoryIconMap[c.id], { size: 14 })}</span>
                        <span>{c.name}</span>
                      </>
                    ) : (
                      <>
                        <span>{c.icon}</span>
                        <span>{c.name}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected brand info */}
            {selectedBrand && (
              <div className="px-4 mb-2">
                <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-3 flex items-center gap-3">
                  {(() => { const B = BrandSVGs[selectedBrand]; return B ? <B size={32} /> : null; })()}
                  <div>
                    <p className="text-red-400 text-xs font-semibold">Выбранная марка</p>
                    <p className="text-white font-bold">{carBrands.find(b => b.id === selectedBrand)?.name}</p>
                  </div>
                  <button onClick={() => setSelectedBrand(null)} className="ml-auto text-gray-500 text-xl">×</button>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="px-4 pt-2 space-y-3 pb-4">
              <p className="text-gray-500 text-xs">{filteredProducts.length} товаров</p>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-3 text-gray-500">
                    <SearchIcon size={48} />
                  </div>
                  <p className="text-gray-400 font-semibold">Ничего не найдено</p>
                  <p className="text-gray-600 text-sm mt-1">Попробуйте изменить фильтры или запрос</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const fits = primaryCar ? doesProductFitCar(product.id, primaryCar.brandId, primaryCar.model) : false;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      displayPrice={getPrice(product.price)}
                      displayOldPrice={getOldPrice(product.oldPrice)}
                      onOrder={() => setSelectedProduct(product)}
                      onAddToCart={() => addToCart(product)}
                      fitsBadge={fits}
                      crossRefs={getCrossReferences(product.id)}
                    />
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CART TAB */}
        {activeTab === "cart" && (
          <div className="px-4 pt-4">
            <h2 className="text-white font-black text-xl mb-4">Корзина</h2>
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-4 text-gray-500">
                  <CartIcon size={64} />
                </div>
                <p className="text-gray-400 font-bold text-lg mb-2">Корзина пуста</p>
                <p className="text-gray-600 text-sm mb-6">Добавьте запчасти из каталога</p>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl text-sm active:scale-95 transition-all"
                >
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex gap-3">
                      <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        {categoryIconMap[item.product.category] ? (
                          React.createElement(categoryIconMap[item.product.category], { size: 28 })
                        ) : (
                          <span className="text-2xl">{item.product.image}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold leading-tight truncate">{item.product.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{item.product.brand}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-red-500 font-black">{(getPrice(item.product.price) * item.qty).toLocaleString()} ₽</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (item.qty === 1) removeFromCart(item.product.id);
                                else setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, qty: i.qty - 1 } : i));
                              }}
                              className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 font-bold active:scale-90 transition-transform"
                            >−</button>
                            <span className="text-white font-bold text-sm w-4 text-center">{item.qty}</span>
                            <button
                              onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, qty: i.qty + 1 } : i))}
                              className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold active:scale-90 transition-transform"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-sm">Товаров: {cartCount}</span>
                    <span className="text-gray-400 text-sm">Доставка: уточняется</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                    <span className="text-white font-bold">Итого</span>
                    <span className="text-white font-black text-2xl">{cartTotal.toLocaleString()} ₽</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(cart[0].product)}
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-4 rounded-2xl text-base transition-all"
                >
                  Оформить заказ →
                </button>
                <button
                  onClick={() => setCart([])}
                  className="w-full mt-2 text-gray-500 text-sm py-2 active:scale-95 transition-all"
                >
                  Очистить корзину
                </button>
              </>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            onProfileChange={setProfile}
          />
        )}

        {/* ADMIN TAB */}
        {activeTab === "admin" && userIsAdmin && (
          <AdminPanel
            settings={adminSettings}
            onSettingsChange={(s) => {
              setAdminSettings(s);
              saveSettings(s);
            }}
          />
        )}

        {/* SUPPORT TAB */}
        {activeTab === "support" && (
          <div className="px-4 pt-4">
            <h2 className="text-white font-black text-xl mb-4">Поддержка</h2>

            <div className="bg-gradient-to-br from-red-950/50 to-gray-900 border border-red-900/50 rounded-2xl p-5 mb-4 text-center">
              <div className="flex justify-center mb-3 text-red-500">
                <HeadphonesIcon size={48} />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Техническая поддержка</h3>
              <p className="text-gray-400 text-sm mb-4">Наши специалисты помогут подобрать запчасть, ответят на вопросы по заказу и доставке.</p>
              <button
                onClick={handleSupport}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageIcon size={16} />
                Написать в поддержку
              </button>
            </div>

            <div className="space-y-3">
              {([
                { icon: ClockIcon, title: "Режим работы", desc: "Пн–Вс, 09:00 – 21:00 (МСК)", color: "text-blue-400" },
                { icon: PackageIcon, title: "Доставка", desc: "По всему СНГ. СДЭК, Почта, ПВЗ", color: "text-amber-400" },
                { icon: RefreshIcon, title: "Возврат", desc: "14 дней с момента получения", color: "text-purple-400" },
                { icon: CreditCardIcon, title: "Оплата", desc: "Наличные, карта, СБП, криптовалюта", color: "text-emerald-400" },
                { icon: ShieldCheckIcon, title: "Гарантия", desc: "На все товары от 6 до 24 месяцев", color: "text-red-400" },
              ] as const).map(item => (
                <div key={item.title} className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#111] border-t border-gray-800 z-40">
        <div className={`grid ${userIsAdmin ? "grid-cols-5" : "grid-cols-4"}`}>
          {([
            { id: "home" as Tab, label: "Главная", icon: HomeIcon },
            { id: "catalog" as Tab, label: "Каталог", icon: CatalogIcon },
            { id: "cart" as Tab, label: "Корзина", icon: CartIcon, badge: cartCount },
            { id: "profile" as Tab, label: "Профиль", icon: UserIcon },
            ...(userIsAdmin ? [{ id: "admin" as Tab, label: "Админ", icon: AdminIcon }] : []),
          ] as { id: Tab; label: string; icon: React.FC<{ size?: number; className?: string }>; badge?: number }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all active:scale-90 ${activeTab === tab.id ? "text-red-500" : "text-gray-500"}`}
            >
              <tab.icon size={20} className="leading-none" />
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-1.5 right-5 bg-red-600 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {tab.badge}
                </span>
              ) : null}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
        {/* iOS safe area */}
        <div className="h-safe-area-inset-bottom" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </nav>

      {/* Order Modal */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          profile={profile}
          onProfileChange={setProfile}
          getPrice={getPrice}
          getOldPrice={getOldPrice}
        />
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onOrder: () => void;
  onAddToCart: () => void;
  displayPrice: number;
  displayOldPrice?: number;
  fitsBadge?: boolean;
  crossRefs?: CrossRef[];
}

function ProductCard({ product, onOrder, onAddToCart, displayPrice, displayOldPrice, fitsBadge, crossRefs }: ProductCardProps) {
  const [showRefs, setShowRefs] = useState(false);
  const discount = displayOldPrice
    ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)
    : 0;

  return (
    <div className={`bg-[#111] border rounded-2xl p-4 hover:border-gray-700 transition-colors ${fitsBadge ? "border-green-800/50" : "border-gray-800"}`}>
      {fitsBadge && (
        <div className="flex items-center gap-1.5 mb-2 -mt-1">
          <CheckIcon size={12} className="text-green-400" />
          <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Подходит к вашему авто</span>
        </div>
      )}

      <div className="flex gap-3">
        <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-800">
          {categoryIconMap[product.category] ? (
            React.createElement(categoryIconMap[product.category], { size: 32 })
          ) : (
            <span className="text-3xl">{product.image}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide">{product.brand}</p>
              <p className="text-white font-semibold text-sm leading-tight mt-0.5 line-clamp-2">{product.name}</p>
            </div>
            {discount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg flex-shrink-0">
                -{discount}%
              </span>
            )}
          </div>

          <p className="text-gray-600 text-[10px] mt-0.5">Арт: {product.partNumber}</p>

          <div className="flex items-center gap-2 mt-1.5">
            <StarIcon size={14} className="text-yellow-400" />
            <span className="text-gray-400 text-xs">{product.rating}</span>
            <span className={`text-[10px] font-semibold ${product.inStock ? "text-green-500" : "text-orange-400"}`}>
              {product.inStock ? "● В наличии" : "● Под заказ"}
            </span>
          </div>
        </div>
      </div>

      {/* Cross-references */}
      {crossRefs && crossRefs.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="text-blue-400 text-[10px] font-semibold hover:text-blue-300 transition-colors"
          >
            {showRefs ? "▾ Скрыть аналоги" : `▸ Аналоги (${crossRefs.length})`}
          </button>
          {showRefs && (
            <div className="mt-1.5 space-y-1">
              {crossRefs.map((ref, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] bg-gray-900/50 rounded-lg px-2.5 py-1.5">
                  <span className="text-gray-300 font-semibold">{ref.altBrand}</span>
                  <code className="text-gray-500 font-mono">{ref.altPartNumber}</code>
                  <span className="text-gray-600 ml-auto">{ref.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price + Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        <div>
          {displayOldPrice && (
            <p className="text-gray-600 text-xs line-through">{displayOldPrice.toLocaleString()} ₽</p>
          )}
          <p className="text-white font-black text-xl">{displayPrice.toLocaleString()} ₽</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddToCart}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 active:scale-90 rounded-xl flex items-center justify-center transition-all"
            title="В корзину"
          >
            <CartIcon size={18} />
          </button>
          <button
            onClick={onOrder}
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
          >
            Купить
          </button>
        </div>
      </div>
    </div>
  );
}
