import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CloudRain,
  MapPin,
  Search,
  Thermometer,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface GeoResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  weathercode: number[];
}

interface WeatherData {
  daily: DailyForecast;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "🌤️";
  if (code === 45 || code === 48) return "🌫️";
  if (
    code === 51 ||
    code === 53 ||
    code === 55 ||
    code === 61 ||
    code === 63 ||
    code === 65
  )
    return "🌧️";
  if (code === 71 || code === 73 || code === 75) return "❄️";
  if (code === 80 || code === 81 || code === 82) return "🌦️";
  if (code === 95 || code === 96 || code === 99) return "⛈️";
  return "🌈";
}

function getWeatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 61 || code === 63 || code === 65) return "Rainy";
  if (code === 71 || code === 73 || code === 75) return "Snowy";
  if (code === 80 || code === 81 || code === 82) return "Showers";
  if (code === 95 || code === 96 || code === 99) return "Thunderstorm";
  return "Mixed";
}

function getDayName(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function WeatherScreen() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GeoResult | null>(
    null,
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Geocoding search ───────────────────────
  const searchLocation = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoadingGeo(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`,
      );
      const data = await res.json();
      const results: GeoResult[] = data.results ?? [];
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingGeo(false);
    }
  }, []);

  // ─── Debounce input ─────────────────────────
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 400);
  };

  // ─── Fetch forecast ─────────────────────────
  const fetchWeather = useCallback(async (location: GeoResult) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    setWeatherData(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`,
      );
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data: WeatherData = await res.json();
      setWeatherData(data);
    } catch {
      setWeatherError("Unable to load weather forecast. Please try again.");
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // ─── Select a suggestion ────────────────────
  const handleSelectLocation = (loc: GeoResult) => {
    setSelectedLocation(loc);
    setQuery(`${loc.name}, ${loc.country}`);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather(loc);
  };

  // ─── Default load: London ───────────────────
  useEffect(() => {
    const defaultLocation: GeoResult = {
      id: 2643743,
      name: "London",
      country: "United Kingdom",
      admin1: "England",
      latitude: 51.50853,
      longitude: -0.12574,
    };
    setSelectedLocation(defaultLocation);
    setQuery("London, United Kingdom");
    fetchWeather(defaultLocation);
  }, [fetchWeather]);

  // ─── Close dropdown on outside click ────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ─── Render ──────────────────────────────────
  const days = weatherData?.daily.time ?? [];

  return (
    <div className="pb-6">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-6 rounded-b-3xl mb-4"
        style={{
          background:
            "linear-gradient(140deg, oklch(0.38 0.14 240) 0%, oklch(0.28 0.1 252) 60%, oklch(0.22 0.08 260) 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-base">⛅</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            Weather
          </h1>
        </div>
        <p className="text-white/70 text-sm mt-0.5">
          7-day forecast for your farm
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Location Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative"
          ref={containerRef}
        >
          <div className="bg-white rounded-2xl p-4 shadow-card border border-border">
            <h2 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-farm-mid" />
              Location
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              {isLoadingGeo && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-farm-mid border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <Input
                type="text"
                value={query}
                onChange={handleQueryChange}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="Search city or town..."
                className="pl-9 h-11 rounded-xl text-sm"
                data-ocid="weather.location_input"
                autoComplete="off"
              />
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="mt-2 rounded-xl border border-border bg-white shadow-lg overflow-hidden z-10"
                >
                  {suggestions.map((loc, idx) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      data-ocid={`weather.location_item.${idx + 1}`}
                      className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-farm-pale transition-colors text-sm border-b border-border last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-farm-mid flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground leading-tight truncate">
                          {loc.name}
                          {loc.admin1 ? `, ${loc.admin1}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {loc.country}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected location pill */}
          {selectedLocation && !showSuggestions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-farm-pale rounded-xl w-fit"
            >
              <span className="text-base">📍</span>
              <span className="text-sm font-medium text-farm-deep">
                {selectedLocation.name}
                {selectedLocation.admin1 ? `, ${selectedLocation.admin1}` : ""},{" "}
                {selectedLocation.country}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Loading skeleton */}
        {isLoadingWeather && (
          <div className="space-y-2.5" data-ocid="weather.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[76px] rounded-2xl w-full" />
            ))}
          </div>
        )}

        {/* Error state */}
        {weatherError && !isLoadingWeather && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="weather.error_state"
            className="bg-white rounded-2xl p-5 shadow-card border border-red-100 flex flex-col items-center gap-2 text-center"
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="font-display font-bold text-sm text-foreground">
              Forecast Unavailable
            </p>
            <p className="text-xs text-muted-foreground">{weatherError}</p>
          </motion.div>
        )}

        {/* 7-day forecast cards */}
        {!isLoadingWeather && weatherData && days.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-2.5"
          >
            {/* Section header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display font-bold text-base text-foreground">
                7-Day Forecast
              </h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Thermometer className="w-3.5 h-3.5" />
                <span>°C</span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {days.slice(0, 7).map((dateStr, idx) => {
                const maxTemp = weatherData.daily.temperature_2m_max[idx] ?? 0;
                const minTemp = weatherData.daily.temperature_2m_min[idx] ?? 0;
                const precip = weatherData.daily.precipitation_sum[idx] ?? 0;
                const code = weatherData.daily.weathercode[idx] ?? 0;
                const emoji = getWeatherEmoji(code);
                const label = getWeatherLabel(code);
                const isToday = idx === 0;
                const dayName = getDayName(dateStr, idx);
                const dateLabel = formatDate(dateStr);

                return (
                  <motion.div
                    key={dateStr}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                    data-ocid={`weather.forecast_card.${idx + 1}`}
                    className={`rounded-2xl p-4 border transition-all ${
                      isToday
                        ? "border-blue-200 shadow-md"
                        : "bg-white border-border shadow-card"
                    }`}
                    style={
                      isToday
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.94 0.05 240) 0%, oklch(0.97 0.03 245) 100%)",
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      {/* Day + emoji */}
                      <div className="flex flex-col items-center min-w-[52px]">
                        <span className="text-2xl leading-none">{emoji}</span>
                        <span
                          className={`text-xs font-bold mt-1 ${
                            isToday ? "text-blue-700" : "text-muted-foreground"
                          }`}
                        >
                          {dayName}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isToday
                              ? "text-blue-600/70"
                              : "text-muted-foreground/60"
                          }`}
                        >
                          {dateLabel}
                        </span>
                      </div>

                      {/* Divider */}
                      <div
                        className={`w-px self-stretch mx-1 ${isToday ? "bg-blue-200" : "bg-border"}`}
                      />

                      {/* Weather info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-display font-bold text-sm leading-tight ${
                            isToday ? "text-blue-900" : "text-foreground"
                          }`}
                        >
                          {label}
                        </p>
                        {precip > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <CloudRain
                              className={`w-3 h-3 ${isToday ? "text-blue-500" : "text-blue-400"}`}
                            />
                            <p
                              className={`text-xs ${isToday ? "text-blue-600" : "text-muted-foreground"}`}
                            >
                              {precip.toFixed(1)} mm rain
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Temperature */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`font-display font-bold text-base leading-none ${
                            isToday ? "text-blue-900" : "text-foreground"
                          }`}
                        >
                          {Math.round(maxTemp)}°
                        </p>
                        <p
                          className={`text-sm mt-0.5 ${
                            isToday ? "text-blue-600" : "text-muted-foreground"
                          }`}
                        >
                          / {Math.round(minTemp)}°
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Attribution */}
            <p className="text-center text-xs text-muted-foreground pt-1 pb-2">
              Powered by{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Open-Meteo
              </a>
            </p>
          </motion.div>
        )}

        {/* Empty state when no location selected yet and no data */}
        {!isLoadingWeather && !weatherData && !weatherError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-2xl border border-dashed border-border"
          >
            <span className="text-4xl block mb-3">🌤️</span>
            <p className="font-display font-bold text-base text-foreground mb-1">
              No forecast loaded
            </p>
            <p className="text-sm text-muted-foreground">
              Search for a city above to see the 7-day forecast
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
