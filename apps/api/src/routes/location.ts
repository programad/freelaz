import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  findLocationData,
  getAllCities,
  searchCities,
  getCitiesByCategory,
  getCitiesByCountry,
  getLocationStats,
  type LocationData,
} from "@freelaz/shared";

type Bindings = {
  LOCATION_CACHE?: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Rate limiting storage (in production, use KV or external storage)
const rateLimitMap = new Map<string, number[]>();

// Cache TTL - 24 hours
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

// CORS protection - only allow our frontend domains
app.use(
  "/api/location/*",
  cors({
    origin: [
      "https://freelaz.com",
      "https://www.freelaz.com",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type"],
    credentials: false,
  })
);

// Rate limiting middleware - 30 requests per minute per IP
app.use("/api/location/*", async (c, next) => {
  const clientIP =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  const requests = rateLimitMap.get(clientIP) || [];
  const recentRequests = requests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return c.json(
      {
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
      },
      429
    );
  }

  recentRequests.push(now);
  rateLimitMap.set(clientIP, recentRequests);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance
    for (const [ip, times] of rateLimitMap.entries()) {
      const validTimes = times.filter((time) => now - time < windowMs);
      if (validTimes.length === 0) {
        rateLimitMap.delete(ip);
      } else {
        rateLimitMap.set(ip, validTimes);
      }
    }
  }

  await next();
});

// Helper function to normalize text (remove diacritics and convert to lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim();
}

// Helper function to get cached data or fetch from static database
async function getCachedLocationData(
  kv: KVNamespace | undefined,
  city: string,
  country: string
): Promise<LocationData | null> {
  // Normalize the input for consistent lookup
  const normalizedCity = normalizeText(city);
  const normalizedCountry = normalizeText(country);

  const cacheKey = `location:${normalizedCity}:${normalizedCountry}`;

  // Try to get from KV cache first (if available)
  if (kv) {
    try {
      const cached = await kv.get(cacheKey, "json");
      if (cached) {
        console.log(`Cache hit for ${city}, ${country}`);
        return cached as LocationData;
      }
    } catch (error) {
      console.warn("KV cache read error:", error);
    }
  }

  // Get from static database using normalized names
  const locationData = findLocationData(normalizedCity, normalizedCountry);

  // Cache the result if KV is available
  if (kv && locationData) {
    try {
      await kv.put(cacheKey, JSON.stringify(locationData), {
        expirationTtl: CACHE_TTL,
      });
      console.log(`Cached location data for ${city}, ${country}`);
    } catch (error) {
      console.warn("KV cache write error:", error);
    }
  }

  return locationData;
}

// Get specific location data
app.get("/api/location/:country/:city", async (c) => {
  try {
    const country = decodeURIComponent(c.req.param("country"));
    const city = decodeURIComponent(c.req.param("city"));

    if (!country || !city) {
      return c.json(
        {
          error: "Missing parameters",
          message: "Both country and city are required",
        },
        400
      );
    }

    const locationData = await getCachedLocationData(
      c.env.LOCATION_CACHE,
      city,
      country
    );

    if (!locationData) {
      // Suggest similar cities
      const suggestions = searchCities(city).slice(0, 5);

      return c.json(
        {
          error: "City not found",
          message: `We don't have data for ${city}, ${country} yet.`,
          suggestions: suggestions.map((loc: LocationData) => ({
            city: loc.city,
            country: loc.country,
            state: loc.state,
          })),
          availableCountries: [
            "United States",
            "Brazil",
            "United Kingdom",
            "Germany",
            "France",
            "Spain",
            "Canada",
            "Australia",
          ],
        },
        404
      );
    }

    return c.json({
      success: true,
      data: locationData,
      insights: {
        costLevel: getCostLevel(locationData.costOfLiving),
        salaryLevel: getSalaryLevel(locationData.averageNetSalary),
        competitiveness: getCompetitiveness(
          locationData.localDeveloperRates.senior
        ),
        recommendation: getRecommendation(locationData),
      },
      cached: !!c.env.LOCATION_CACHE, // Indicate if caching is enabled
    });
  } catch (error) {
    console.error("Location API error:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch location data",
      },
      500
    );
  }
});

// Search cities (with caching for popular searches)
app.get("/api/location/search", async (c) => {
  try {
    const query = c.req.query("q");
    const category = c.req.query("category") as LocationData["category"];
    const country = c.req.query("country");
    const limit = parseInt(c.req.query("limit") || "10");

    if (!query && !category && !country) {
      return c.json(
        {
          error: "Missing search parameters",
          message: "Provide at least one of: q (query), category, or country",
        },
        400
      );
    }

    // Create cache key for search results
    const cacheKey = `search:${query || ""}:${category || ""}:${
      country || ""
    }:${limit}`;

    // Try to get from KV cache first (if available)
    if (c.env.LOCATION_CACHE) {
      try {
        const cached = await c.env.LOCATION_CACHE.get(cacheKey, "json");
        if (cached) {
          console.log(`Search cache hit for: ${cacheKey}`);
          return c.json(cached);
        }
      } catch (error) {
        console.warn("KV search cache read error:", error);
      }
    }

    let results: LocationData[] = [];

    if (query) {
      results = searchCities(query);
    } else if (category) {
      results = getCitiesByCategory(category);
    } else if (country) {
      results = getCitiesByCountry(country);
    }

    // Apply limit
    results = results.slice(0, Math.min(limit, 50));

    const response = {
      success: true,
      data: results,
      total: results.length,
      query: { query, category, country, limit },
      cached: !!c.env.LOCATION_CACHE,
    };

    // Cache search results if KV is available
    if (c.env.LOCATION_CACHE) {
      try {
        await c.env.LOCATION_CACHE.put(cacheKey, JSON.stringify(response), {
          expirationTtl: CACHE_TTL,
        });
        console.log(`Cached search results for: ${cacheKey}`);
      } catch (error) {
        console.warn("KV search cache write error:", error);
      }
    }

    return c.json(response);
  } catch (error) {
    console.error("Search API error:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to search cities",
      },
      500
    );
  }
});

// Get all cities (with pagination)
app.get("/api/location/cities", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const category = c.req.query("category") as LocationData["category"];

    let cities = category ? getCitiesByCategory(category) : getAllCities();

    // Sort by cost of living (ascending)
    cities.sort(
      (a: LocationData, b: LocationData) => a.costOfLiving - b.costOfLiving
    );

    const total = cities.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCities = cities.slice(startIndex, endIndex);

    return c.json({
      success: true,
      data: paginatedCities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Cities API error:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch cities",
      },
      500
    );
  }
});

// Get statistics
app.get("/api/location/stats", async (c) => {
  try {
    const stats = getLocationStats();

    return c.json({
      success: true,
      data: stats,
      insights: {
        mostExpensive: getAllCities().sort(
          (a: LocationData, b: LocationData) => b.costOfLiving - a.costOfLiving
        )[0],
        mostAffordable: getAllCities().sort(
          (a: LocationData, b: LocationData) => a.costOfLiving - b.costOfLiving
        )[0],
        highestSalaries: getAllCities().sort(
          (a: LocationData, b: LocationData) =>
            b.averageNetSalary - a.averageNetSalary
        )[0],
        bestValue: getAllCities().sort(
          (a: LocationData, b: LocationData) =>
            b.purchasingPowerIndex - a.purchasingPowerIndex
        )[0],
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch statistics",
      },
      500
    );
  }
});

// Helper functions
function getCostLevel(cost: number): string {
  if (cost < 1000) return "Muito Baixo";
  if (cost < 2000) return "Baixo";
  if (cost < 3000) return "Médio";
  if (cost < 4000) return "Alto";
  return "Muito Alto";
}

function getSalaryLevel(salary: number): string {
  if (salary < 2000) return "Baixo";
  if (salary < 4000) return "Médio";
  if (salary < 6000) return "Alto";
  return "Muito Alto";
}

function getCompetitiveness(seniorRate: number): string {
  if (seniorRate < 30) return "Muito Competitivo";
  if (seniorRate < 60) return "Competitivo";
  if (seniorRate < 100) return "Moderado";
  return "Mercado Premium";
}

function getRecommendation(location: LocationData): string {
  const ratio = location.averageNetSalary / location.costOfLiving;

  if (ratio > 2.5) {
    return "Excelente custo-benefício - salários altos em relação ao custo de vida";
  } else if (ratio > 2.0) {
    return "Bom custo-benefício - relação salário/custo decente";
  } else if (ratio > 1.5) {
    return "Custo-benefício razoável - relação salário/custo moderada";
  } else {
    return "Mercado premium - custos altos mas potencialmente muitas oportunidades";
  }
}

export default app;
