import { useState, useEffect, useRef } from "react";
import type { LocationData } from "@freelaz/shared";
import {
  LocationService,
  LocationServiceError,
  formatCurrency,
  getCostLevelColor,
  getCompetitivenessColor,
  type LocationResponse,
} from "../services/location-service";

interface ClientLocationInputProps {
  onLocationChange: (location: LocationData | null) => void;
  onLocationAnalysis: (analysis: LocationAnalysis | null) => void;
  className?: string;
}

export interface LocationAnalysis {
  location: LocationData;
  insights: {
    costLevel: string;
    salaryLevel: string;
    competitiveness: string;
    recommendation: string;
  };
  adjustment: {
    adjustedRate: number;
    multiplier: number;
    reasoning: string;
    comparison: {
      localSeniorRate: number;
      yourAdvantage: number;
      competitivePosition: string;
    };
  };
}

// Helper function to translate country names to Portuguese
const getCountryNameInPortuguese = (country: string): string => {
  switch (country) {
    case "United States":
      return "Estados Unidos";
    case "United Kingdom":
      return "Reino Unido";
    case "Germany":
      return "Alemanha";
    case "France":
      return "França";
    case "Spain":
      return "Espanha";
    case "Netherlands":
      return "Holanda";
    case "Switzerland":
      return "Suíça";
    case "Sweden":
      return "Suécia";
    case "Finland":
      return "Finlândia";
    case "Poland":
      return "Polônia";
    case "Czech Republic":
      return "República Tcheca";
    case "Hungary":
      return "Hungria";
    case "Bulgaria":
      return "Bulgária";
    case "Romania":
      return "Romênia";
    case "Canada":
      return "Canadá";
    case "Australia":
      return "Austrália";
    case "Singapore":
      return "Singapura";
    case "Japan":
      return "Japão";
    case "Brazil":
      return "Brasil";
    case "Portugal":
      return "Portugal";
    case "Ireland":
      return "Irlanda";
    default:
      return country;
  }
};

// Helper function to translate category names to Portuguese
const getCategoryNameInPortuguese = (category: string): string => {
  switch (category) {
    case "tech_hub":
      return "hub tecnológico";
    case "business_center":
      return "centro empresarial";
    case "capital":
      return "capital";
    case "major_city":
      return "cidade importante";
    default:
      return category;
  }
};

export function ClientLocationInput({
  onLocationChange,
  onLocationAnalysis,
  className = "",
}: ClientLocationInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationResponse | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularCities, setPopularCities] = useState<LocationData[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load popular cities on mount
  useEffect(() => {
    const loadPopularCities = async () => {
      try {
        // Get specific popular cities: San Francisco, New York, São Paulo
        const specificCities = [
          { query: "San Francisco", country: "United States" },
          { query: "New York City", country: "United States" },
          { query: "São Paulo", country: "Brazil" },
        ];

        const popularCitiesData: LocationData[] = [];

        for (const { query, country } of specificCities) {
          try {
            const response = await LocationService.getLocationData(
              query,
              country
            );
            popularCitiesData.push(response.data);
          } catch (error) {
            console.error(`Failed to load ${query}:`, error);
          }
        }

        // Add a few more tech hubs to fill out the list
        const additionalCities = await LocationService.getPopularCities(
          "tech_hub"
        );
        const filteredAdditional = additionalCities
          .filter(
            (city) =>
              !popularCitiesData.some(
                (existing) =>
                  existing.city === city.city &&
                  existing.country === city.country
              )
          )
          .slice(0, 5);

        setPopularCities([...popularCitiesData, ...filteredAdditional]);
      } catch (error) {
        console.error("Failed to load popular cities:", error);
        // Fallback to tech hubs if specific cities fail
        try {
          const cities = await LocationService.getPopularCities("tech_hub");
          setPopularCities(cities.slice(0, 8));
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }
    };
    loadPopularCities();
  }, []);

  // Search for cities as user types
  useEffect(() => {
    const searchCities = async () => {
      // Don't search if we already have a location selected
      if (locationData) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      if (searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const result = await LocationService.searchCities({
          query: searchQuery,
          limit: 8,
        });
        console.log(`Search results for "${searchQuery}":`, result.data);
        setSuggestions(result.data);
        setShowSuggestions(true); // Ensure suggestions are shown when we have results
      } catch (error) {
        console.error("Failed to search cities:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, locationData]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSubmit = async (city: string, country: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await LocationService.getLocationData(city, country);
      setLocationData(response);
      onLocationChange(response.data);

      // Calculate location-based rate adjustment (will need base rate from parent)
      // For now, we'll pass the analysis without the adjustment
      const analysis: LocationAnalysis = {
        location: response.data,
        insights: response.insights,
        adjustment: {
          adjustedRate: 0, // Will be calculated by parent component
          multiplier: 1,
          reasoning: "",
          comparison: {
            localSeniorRate: response.data.localDeveloperRates.senior,
            yourAdvantage: 0,
            competitivePosition: "balanced",
          },
        },
      };

      onLocationAnalysis(analysis);
      setShowSuggestions(false);
    } catch (error) {
      if (error instanceof LocationServiceError) {
        setError(error.message);
        if (error.details?.suggestions) {
          setSuggestions(
            error.details.suggestions.map((s) => ({
              city: s.city,
              country: s.country,
              state: s.state,
              costOfLiving: 0,
              purchasingPowerIndex: 100,
              averageNetSalary: 0,
              localDeveloperRates: { junior: 0, mid: 0, senior: 0 },
              category: "major_city" as const,
              lastUpdated: "",
            }))
          );
          setShowSuggestions(true);
        }
      } else {
        setError("Erro ao buscar dados da localização");
      }
      onLocationChange(null);
      onLocationAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: LocationData) => {
    const displayName = `${
      suggestion.namePortuguese || suggestion.city
    }, ${getCountryNameInPortuguese(suggestion.country)}`;
    setSearchQuery(displayName);
    setShowSuggestions(false);
    // Auto-submit when selecting from suggestions
    setTimeout(
      () => handleLocationSubmit(suggestion.city, suggestion.country),
      100
    );
  };

  const handlePopularCityClick = (cityData: LocationData) => {
    const displayName = `${
      cityData.namePortuguese || cityData.city
    }, ${getCountryNameInPortuguese(cityData.country)}`;
    setSearchQuery(displayName);
    setShowSuggestions(false); // Hide suggestions immediately when clicking popular city
    // Auto-submit when selecting from popular cities
    setTimeout(
      () => handleLocationSubmit(cityData.city, cityData.country),
      100
    );
  };

  const clearLocation = () => {
    setSearchQuery("");
    setLocationData(null);
    setError(null);
    onLocationChange(null);
    onLocationAnalysis(null);
  };

  return (
    <div className={`client-location-section ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          🌍 Onde está seu cliente?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          A localização do cliente afeta significativamente o valor que você
          pode cobrar. Nosso sistema ajusta sua taxa baseado no poder de compra
          local.
        </p>

        <div className="relative mb-4">
          {/* Search input styled like our dropdowns */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite a cidade (ex: São Francisco, Londres, São Paulo, SP, NYC)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base leading-6 min-h-[3.5rem]"
              disabled={isLoading}
            />

            {/* Search icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && searchQuery.length >= 2 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">
                        {suggestion.namePortuguese || suggestion.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getCountryNameInPortuguese(suggestion.country)}
                        {suggestion.state && `, ${suggestion.state}`}
                        {suggestion.region && ` • ${suggestion.region}`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {getCategoryNameInPortuguese(suggestion.category)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Nenhuma cidade encontrada para "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {locationData && (
            <button
              onClick={clearLocation}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpar
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Popular cities quick selection */}
      {!locationData && popularCities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            🔥 Cidades populares:
          </h4>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((cityData, index) => (
              <button
                key={index}
                onClick={() => handlePopularCityClick(cityData)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {cityData.namePortuguese || cityData.city},{" "}
                {getCountryNameInPortuguese(cityData.country)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location analysis results */}
      {locationData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                📍 {locationData.data.namePortuguese || locationData.data.city},{" "}
                {getCountryNameInPortuguese(locationData.data.country)}
              </h4>
              {locationData.data.state && (
                <p className="text-sm text-gray-600">
                  {locationData.data.state}
                  {locationData.data.region && ` • ${locationData.data.region}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCostLevelColor(
                  locationData.insights.costLevel
                )}`}
              >
                {locationData.insights.costLevel}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">
                💰 Economia Local
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Custo de vida:</span>
                  <span className="font-medium">
                    {formatCurrency(locationData.data.costOfLiving)}/mês
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Poder de compra:</span>
                  <span className="font-medium">
                    {locationData.data.purchasingPowerIndex}% da média global
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Salário médio:</span>
                  <span className="font-medium">
                    {formatCurrency(locationData.data.averageNetSalary)}/mês
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3">
                👨‍💻 Desenvolvedores Locais
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Júnior:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      locationData.data.localDeveloperRates.junior
                    )}
                    /h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pleno:</span>
                  <span className="font-medium">
                    {formatCurrency(locationData.data.localDeveloperRates.mid)}
                    /h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sênior:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      locationData.data.localDeveloperRates.senior
                    )}
                    /h
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mr-3 ${getCompetitivenessColor(
                locationData.insights.competitiveness
              )}`}
            >
              {locationData.insights.competitiveness}
            </div>
            <p className="text-sm text-gray-700 mt-2">
              <strong>💡 Recomendação:</strong>{" "}
              {locationData.insights.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
