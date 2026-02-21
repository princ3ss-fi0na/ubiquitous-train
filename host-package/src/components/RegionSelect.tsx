import React, { useState, useRef, useEffect } from "react";
import { RUSSIAN_REGIONS, searchRegions } from "../utils/validation";

interface RegionSelectProps {
  value: string;
  onChange: (region: string) => void;
  error: string | null;
  touched?: boolean;
}

const DISTRICT_LABELS: Record<string, string> = {
  "ЦФО": "Центральный",
  "СЗФО": "Северо-Западный",
  "ЮФО": "Южный",
  "СКФО": "Северо-Кавказский",
  "ПФО": "Приволжский",
  "УФО": "Уральский",
  "СФО": "Сибирский",
  "ДФО": "Дальневосточный",
};

export const RegionSelect: React.FC<RegionSelectProps> = ({
  value,
  onChange,
  error,
  touched,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = searchRegions(search);
  const grouped = new Map<string, typeof RUSSIAN_REGIONS>();
  filtered.forEach((r) => {
    const arr = grouped.get(r.district) || [];
    arr.push(r);
    grouped.set(r.district, arr);
  });

  const selectedRegion = RUSSIAN_REGIONS.find((r) => r.name === value);
  const showError = touched && error;

  return (
    <div ref={wrapRef} className="relative">
      <label className="text-gray-400 text-xs block mb-1">
        Регион / область<span className="text-red-500 ml-0.5">*</span>
      </label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className={`w-full bg-gray-900 border ${
          showError ? "border-red-500" : open ? "border-red-600" : "border-gray-700"
        } rounded-xl px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between`}
      >
        {value ? (
          <span className="text-white">{value}</span>
        ) : (
          <span className="text-gray-600">Выберите регион...</span>
        )}
        <span className="text-gray-500 text-xs">{open ? "▴" : "▾"}</span>
      </button>

      {showError && (
        <p className="text-red-400 text-[11px] mt-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold text-center leading-3 mr-1">!</span>
          {error}
        </p>
      )}

      {selectedRegion && (
        <p className="text-gray-600 text-[11px] mt-1">
          {DISTRICT_LABELS[selectedRegion.district] || selectedRegion.district} федеральный округ
        </p>
      )}

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#111] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-800">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск региона..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 outline-none focus:border-red-600"
            />
          </div>
          <div ref={listRef} className="max-h-56 overflow-y-auto">
            {Array.from(grouped.entries()).map(([district, regions]) => (
              <div key={district}>
                <div className="px-3 py-1.5 bg-gray-900/60 text-gray-500 text-[10px] font-bold uppercase tracking-wider sticky top-0">
                  {DISTRICT_LABELS[district] || district} ФО
                </div>
                {regions.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(r.name);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-red-600/20 flex items-center justify-between ${
                      value === r.name ? "bg-red-600/10 text-red-400" : "text-white"
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className="text-gray-600 text-[10px]">{r.code}</span>
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">Ничего не найдено</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
