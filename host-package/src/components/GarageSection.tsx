import React, { useState } from "react";
import { CheckIcon, PlusIcon, TrashIcon, StarIcon } from "./Icons";
import { BrandSVGs } from "./BrandLogos";
import { carBrands } from "../data/cars";
import {
  UserCar,
  CAR_MODELS,
  addCarToGarage,
  removeCarFromGarage,
  setPrimaryCar,
} from "../utils/garage";
import { validateCarBrand, validateCarModel, validateEngine } from "../utils/validation";

interface GarageSectionProps {
  garage: UserCar[];
  onGarageChange: (cars: UserCar[]) => void;
}

export const GarageSection: React.FC<GarageSectionProps> = ({ garage, onGarageChange }) => {
  const [adding, setAdding] = useState(false);
  const [step, setStep] = useState<"brand" | "model" | "year" | "engine">("brand");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState(0);
  const [brandSearch, setBrandSearch] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customEngine, setCustomEngine] = useState("");
  const [customYear, setCustomYear] = useState("");
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customBrandError, setCustomBrandError] = useState<string | null>(null);
  const [customModelError, setCustomModelError] = useState<string | null>(null);
  const [customEngineError, setCustomEngineError] = useState<string | null>(null);

  const resetForm = () => {
    setAdding(false);
    setStep("brand");
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedYear(0);
    setBrandSearch("");
    setCustomBrand("");
    setCustomModel("");
    setCustomEngine("");
    setCustomYear("");
    setIsCustomBrand(false);
    setIsCustomModel(false);
    setCustomBrandError(null);
    setCustomModelError(null);
    setCustomEngineError(null);
  };

  const handleSelectBrand = (brandId: string) => {
    setSelectedBrand(brandId);
    setIsCustomBrand(false);
    setStep("model");
  };

  const handleCustomBrandConfirm = () => {
    const err = validateCarBrand(customBrand);
    setCustomBrandError(err);
    if (err) return;
    setSelectedBrand(customBrand.trim().toLowerCase().replace(/\s+/g, ""));
    setIsCustomBrand(true);
    setStep("model");
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setIsCustomModel(false);
    setStep("year");
  };

  const handleCustomModelConfirm = () => {
    const err = validateCarModel(customModel);
    setCustomModelError(err);
    if (err) return;
    setSelectedModel(customModel.trim());
    setIsCustomModel(true);
    setStep("year");
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    setStep("engine");
  };

  const handleCustomYearConfirm = () => {
    const y = parseInt(customYear.trim(), 10);
    if (!y || y < 1950 || y > new Date().getFullYear() + 1) return;
    handleSelectYear(y);
  };

  const handleSelectEngine = (engine: string) => {
    const brand = carBrands.find((b) => b.id === selectedBrand);
    const updated = addCarToGarage({
      brandId: isCustomBrand ? `custom_${selectedBrand}` : selectedBrand,
      brandName: isCustomBrand ? customBrand.trim() : (brand?.name ?? selectedBrand),
      model: selectedModel,
      year: selectedYear,
      engine,
      isPrimary: garage.length === 0,
    });
    onGarageChange(updated);
    resetForm();
  };

  const handleCustomEngineConfirm = () => {
    const err = validateEngine(customEngine);
    setCustomEngineError(err);
    if (err) return;
    handleSelectEngine(customEngine.trim());
  };

  const handleRemove = (carId: string) => {
    const updated = removeCarFromGarage(carId);
    onGarageChange(updated);
  };

  const handleSetPrimary = (carId: string) => {
    const updated = setPrimaryCar(carId);
    onGarageChange(updated);
  };

  const models = CAR_MODELS[selectedBrand] ?? [];
  const selectedModelData = models.find((m) => m.id === selectedModel);
  const availableBrands = carBrands.filter(
    (b) => CAR_MODELS[b.id] && (!brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()))
  );

  const yearRange: number[] = [];
  if (selectedModelData) {
    for (let y = selectedModelData.years[1]; y >= selectedModelData.years[0]; y--) {
      yearRange.push(y);
    }
  } else if (isCustomModel || isCustomBrand) {
    const now = new Date().getFullYear();
    for (let y = now; y >= 1990; y--) {
      yearRange.push(y);
    }
  }

  return (
    <div>
      {/* Saved cars */}
      {garage.length > 0 && !adding && (
        <div className="space-y-2 mb-3">
          {garage.map((car) => {
            const BrandLogo = BrandSVGs[car.brandId];
            return (
              <div
                key={car.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  car.isPrimary
                    ? "bg-red-600/10 border-red-600/30"
                    : "bg-[#111] border-gray-800"
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {BrandLogo ? <BrandLogo size={34} /> : <span className="text-xl">🚗</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">
                    {car.brandName} {CAR_MODELS[car.brandId]?.find((m) => m.id === car.model)?.name || car.model}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {car.year} · {car.engine}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!car.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(car.id)}
                      className="p-1.5 text-gray-600 hover:text-yellow-400 transition-colors"
                      title="Сделать основным"
                    >
                      <StarIcon size={16} />
                    </button>
                  )}
                  {car.isPrimary && (
                    <span className="text-yellow-400 p-1.5">
                      <StarIcon size={16} />
                    </span>
                  )}
                  <button
                    onClick={() => handleRemove(car.id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                    title="Удалить"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add car button */}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#111] border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm font-semibold hover:border-red-600 hover:text-red-400 transition-all active:scale-95"
        >
          <PlusIcon size={16} />
          {garage.length === 0 ? "Добавить свой автомобиль" : "Добавить ещё авто"}
        </button>
      )}

      {/* Add car wizard */}
      {adding && (
        <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-sm">
              {step === "brand" && "Выберите марку"}
              {step === "model" && "Выберите модель"}
              {step === "year" && "Год выпуска"}
              {step === "engine" && "Двигатель"}
            </p>
            <button onClick={resetForm} className="text-gray-500 text-xs hover:text-gray-300">
              Отмена
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mb-4">
            {(["brand", "model", "year", "engine"] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${
                  ["brand", "model", "year", "engine"].indexOf(step) >= i
                    ? "bg-red-600"
                    : "bg-gray-800"
                }`}
              />
            ))}
          </div>

          {step !== "brand" && (
            <button
              onClick={() => {
                if (step === "model") setStep("brand");
                else if (step === "year") setStep("model");
                else if (step === "engine") setStep("year");
              }}
              className="text-gray-400 text-xs mb-3 hover:text-gray-200"
            >
              ← Назад
            </button>
          )}

          {/* Brand selection */}
          {step === "brand" && (
            <div>
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Поиск марки..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600 mb-3"
              />
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {availableBrands.map((brand) => {
                  const BrandLogo = BrandSVGs[brand.id];
                  return (
                    <button
                      key={brand.id}
                      onClick={() => handleSelectBrand(brand.id)}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-600 active:scale-95 transition-all"
                    >
                      {BrandLogo ? <BrandLogo size={28} /> : <span className="text-lg">🚗</span>}
                      <span className="text-gray-300 text-[10px] font-semibold text-center leading-tight">
                        {brand.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Custom brand input */}
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-gray-500 text-xs mb-2">Нет вашей марки? Введите вручную:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => { setCustomBrand(e.target.value); setCustomBrandError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomBrandConfirm()}
                    placeholder="Например: Haval, Exeed, Voyah..."
                    className={`flex-1 bg-gray-900 border ${customBrandError ? "border-red-500" : "border-gray-700"} rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600`}
                  />
                  <button
                    onClick={handleCustomBrandConfirm}
                    disabled={!customBrand.trim()}
                    className="px-4 py-2 bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    OK
                  </button>
                </div>
                {customBrandError && <p className="text-red-400 text-[11px] mt-1">{customBrandError}</p>}
              </div>
            </div>
          )}

          {/* Model selection */}
          {step === "model" && (
            <div className="space-y-1.5">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-600 active:scale-95 transition-all text-left"
                >
                  <span className="text-white text-sm font-semibold">{model.name}</span>
                  <span className="text-gray-600 text-xs">{model.years[0]}–{model.years[1]}</span>
                </button>
              ))}
              {/* Custom model input */}
              <div className="pt-2 border-t border-gray-800 mt-2">
                <p className="text-gray-500 text-xs mb-2">Нет вашей модели? Введите:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => { setCustomModel(e.target.value); setCustomModelError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomModelConfirm()}
                    placeholder="Например: Jolion, Tiggo 5..."
                    className={`flex-1 bg-gray-900 border ${customModelError ? "border-red-500" : "border-gray-700"} rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600`}
                  />
                  <button
                    onClick={handleCustomModelConfirm}
                    disabled={!customModel.trim()}
                    className="px-4 py-2 bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    OK
                  </button>
                </div>
                {customModelError && <p className="text-red-400 text-[11px] mt-1">{customModelError}</p>}
              </div>
            </div>
          )}

          {/* Year selection */}
          {step === "year" && (
            <div>
              <div className="grid grid-cols-4 gap-1.5 max-h-52 overflow-y-auto">
                {yearRange.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleSelectYear(year)}
                    className="py-2.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-600 active:scale-95 transition-all text-white text-sm font-semibold"
                  >
                    {year}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-gray-500 text-xs mb-2">Нет нужного года? Введите:</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomYearConfirm()}
                    placeholder="Например: 1998, 2007..."
                    min={1950}
                    max={new Date().getFullYear() + 1}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600"
                  />
                  <button
                    onClick={handleCustomYearConfirm}
                    disabled={!customYear.trim()}
                    className="px-4 py-2 bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Engine selection */}
          {step === "engine" && (
            <div className="space-y-1.5">
              {selectedModelData && selectedModelData.engines.map((engine) => (
                <button
                  key={engine}
                  onClick={() => handleSelectEngine(engine)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-600 active:scale-95 transition-all text-left"
                >
                  <span className="text-white text-sm font-semibold">{engine}</span>
                  <CheckIcon size={16} className="text-gray-700" />
                </button>
              ))}
              {!selectedModelData && (
                <>
                  {["1.4L", "1.6L", "1.8L", "2.0L", "2.0L Turbo", "2.5L", "3.0L", "Diesel", "EV / Гибрид"].map(
                    (engine) => (
                      <button
                        key={engine}
                        onClick={() => handleSelectEngine(engine)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-red-600 active:scale-95 transition-all text-left"
                      >
                        <span className="text-white text-sm font-semibold">{engine}</span>
                        <CheckIcon size={16} className="text-gray-700" />
                      </button>
                    )
                  )}
                </>
              )}
              {/* Custom engine input */}
              <div className="pt-2 border-t border-gray-800 mt-2">
                <p className="text-gray-500 text-xs mb-2">Другой объём / тип:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEngine}
                    onChange={(e) => { setCustomEngine(e.target.value); setCustomEngineError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomEngineConfirm()}
                    placeholder="Например: 1.5T, 3.5L V6..."
                    className={`flex-1 bg-gray-900 border ${customEngineError ? "border-red-500" : "border-gray-700"} rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600`}
                  />
                  <button
                    onClick={handleCustomEngineConfirm}
                    disabled={!customEngine.trim()}
                    className="px-4 py-2 bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg text-xs active:scale-95 transition-all"
                  >
                    OK
                  </button>
                </div>
                {customEngineError && <p className="text-red-400 text-[11px] mt-1">{customEngineError}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
