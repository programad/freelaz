import {
  COST_LEVEL,
  COMPETITIVENESS,
  type CostLevel,
  type Competitiveness,
  type LocationData,
} from "@freelaz/shared";
export { formatCurrency } from "@freelaz/shared";

export interface LocationSearchResult {
  success: boolean;
  data: LocationData[];
  total: number;
  query: {
    query?: string;
    category?: string;
    country?: string;
    limit: number;
  };
}

export interface LocationResponse {
  success: boolean;
  data: LocationData;
  insights: {
    costLevel: string;
    salaryLevel: string;
    competitiveness: string;
    recommendation: string;
  };
}

export interface LocationError {
  error: string;
  message: string;
  suggestions?: Array<{
    city: string;
    country: string;
    state?: string;
  }>;
  availableCountries?: string[];
}

export class LocationService {
  private static readonly API_BASE =
    (import.meta.env?.VITE_API_URL as string) || "http://localhost:8787";

  /**
   * Get specific location data for a city and country
   */
  static async getLocationData(
    city: string,
    country: string
  ): Promise<LocationResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE}/api/location/${encodeURIComponent(
          country
        )}/${encodeURIComponent(city)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData: LocationError = await response.json();
        throw new LocationServiceError(
          errorData.message,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof LocationServiceError) {
        throw error;
      }
      console.error("Failed to fetch location data:", error);
      throw new LocationServiceError(
        "Failed to connect to location service",
        500
      );
    }
  }

  static async searchCities(
    params: {
      query?: string;
      category?: "tech_hub" | "business_center" | "capital" | "major_city";
      country?: string;
      limit?: number;
    },
    signal?: AbortSignal
  ): Promise<LocationSearchResult> {
    const searchParams = new URLSearchParams();

    if (params.query) searchParams.set("q", params.query);
    if (params.category) searchParams.set("category", params.category);
    if (params.country) searchParams.set("country", params.country);
    if (params.limit) searchParams.set("limit", params.limit.toString());

    const response = await fetch(
      `${this.API_BASE}/api/location/search?${searchParams.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      }
    );

    if (!response.ok) {
      throw new LocationServiceError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  }

  /**
   * Get all cities with pagination
   */
  static async getAllCities(
    params: {
      page?: number;
      limit?: number;
      category?: "tech_hub" | "business_center" | "capital" | "major_city";
    } = {}
  ): Promise<{
    success: boolean;
    data: LocationData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.category) searchParams.set("category", params.category);

      const response = await fetch(
        `${this.API_BASE}/api/location/cities?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      throw new LocationServiceError("Failed to fetch cities", 500);
    }
  }

  /**
   * Get location statistics and insights
   */
  static async getLocationStats(): Promise<{
    success: boolean;
    data: {
      totalCities: number;
      categories: Record<string, number>;
      countries: Record<string, number>;
      averageCostOfLiving: number;
      averagePurchasingPower: number;
    };
    insights: {
      mostExpensive: LocationData;
      mostAffordable: LocationData;
      highestSalaries: LocationData;
      bestValue: LocationData;
    };
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/api/location/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch location stats:", error);
      throw new LocationServiceError("Failed to fetch location stats", 500);
    }
  }

  /**
   * Get popular cities by category for autocomplete
   */
  static async getPopularCities(category?: string): Promise<LocationData[]> {
    try {
      const result = await this.searchCities({
        category: category as any,
        limit: 20,
      });
      return result.data;
    } catch (error) {
      console.error("Failed to fetch popular cities:", error);
      return [];
    }
  }

}

export class LocationServiceError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: LocationError
  ) {
    super(message);
    this.name = "LocationServiceError";
  }
}

export const getCostLevelColor = (level: CostLevel | string): string => {
  switch (level) {
    case COST_LEVEL.VERY_LOW:
      return "text-green-600 bg-green-100";
    case COST_LEVEL.LOW:
      return "text-green-500 bg-green-50";
    case COST_LEVEL.MEDIUM:
      return "text-yellow-600 bg-yellow-100";
    case COST_LEVEL.HIGH:
      return "text-orange-600 bg-orange-100";
    case COST_LEVEL.VERY_HIGH:
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getCompetitivenessColor = (
  level: Competitiveness | string
): string => {
  switch (level) {
    case COMPETITIVENESS.VERY_COMPETITIVE:
      return "text-green-600 bg-green-100";
    case COMPETITIVENESS.COMPETITIVE:
      return "text-blue-600 bg-blue-100";
    case COMPETITIVENESS.MODERATE:
      return "text-yellow-600 bg-yellow-100";
    case COMPETITIVENESS.PREMIUM:
      return "text-purple-600 bg-purple-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};
