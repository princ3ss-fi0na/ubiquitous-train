import React, { useState, useRef, useEffect } from "react";
import { searchCities, isCityKnown } from "../utils/validation";

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error: string | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
  touched?: boolean;
  cityAutocomplete?: boolean;
  rows?: number;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  required,
  touched,
  cityAutocomplete,
  rows,
}) => {
  const [focused, setFocused] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cityAutocomplete && focused && value.trim()) {
      setCitySuggestions(searchCities(value));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value, focused, cityAutocomplete]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showError = touched && error;
  const borderColor = showError
    ? "border-red-500"
    : focused
    ? "border-red-600"
    : "border-gray-700";

  const Tag = rows ? "textarea" : "input";

  return (
    <div ref={wrapRef} className="relative">
      <label className="text-gray-400 text-xs block mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <Tag
        type={rows ? undefined : type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setTimeout(() => setShowSuggestions(false), 150);
        }}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-gray-900 border ${borderColor} rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors ${
          rows ? "resize-none" : ""
        }`}
      />
      {showError && (
        <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold flex items-center justify-center leading-none text-center">!</span>
          {error}
        </p>
      )}

      {/* City autocomplete dropdown */}
      {cityAutocomplete && showSuggestions && citySuggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
          {citySuggestions.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(city);
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-2.5 text-left text-white text-sm hover:bg-red-600/20 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Soft hint for unknown cities */}
      {cityAutocomplete && !showError && value.trim().length >= 2 && !isCityKnown(value) && !focused && (
        <p className="text-gray-500 text-[11px] mt-1">
          Доставим в любой населённый пункт РФ
        </p>
      )}
    </div>
  );
};
