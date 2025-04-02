const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherResponse {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
}

export interface ProcessedWeatherData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  conditions: string;
  icon: string;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  windDeg: number;
  pressure: number;
  clouds: number;
  visibility: number;
}

// Add a function to process the weather data from API response
function processWeatherData(data: WeatherResponse): ProcessedWeatherData {
  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    humidity: data.main.humidity,
    conditions: data.weather[0].main,
    icon: data.weather[0].icon,
    feelsLike: Math.round(data.main.feels_like),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    pressure: data.main.pressure,
    clouds: data.clouds.all,
    visibility: data.visibility
  };
}

// Add a function to handle API errors and provide fallback data
const handleApiError = (city: string, error: any) => {
  console.error(`Weather API error for ${city}:`, error);
  
  // If rate limited (429), return placeholder data
  if (error.message && error.message.includes('429')) {
    console.warn(`Rate limited by OpenWeatherMap API. Using fallback data for ${city}.`);
    return {
      city,
      country: 'Unknown',
      temperature: 0,
      humidity: 0,
      conditions: 'Data unavailable',
      icon: '01d', // Default clear sky icon
      feelsLike: 0,
      tempMin: 0,
      tempMax: 0,
      windSpeed: 0,
      windDeg: 0,
      pressure: 0,
      clouds: 0,
      visibility: 0
    };
  }
  
  // Re-throw other errors
  throw error;
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with retry
async function fetchWithRetry(url: string, retries = 2, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url);
    
    // If rate limited and we have retries left, wait and try again
    if (response.status === 429 && retries > 0) {
      console.warn('Rate limited, retrying after delay...');
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn('Fetch failed, retrying after delay...', error);
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw error;
  }
}

// Simple in-memory cache
interface CacheEntry {
  data: ProcessedWeatherData;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export async function fetchWeatherByCity(city: string): Promise<ProcessedWeatherData> {
  // Check if API key is available
  if (!API_KEY) {
    console.error('Weather API key is missing. Set NEXT_PUBLIC_OPENWEATHER_API_KEY in your environment variables.');
    return {
      city,
      country: 'Error',
      temperature: 0,
      humidity: 0,
      conditions: 'API Key Missing',
      icon: '11d', // Thunderstorm icon to indicate error
      feelsLike: 0,
      tempMin: 0,
      tempMax: 0,
      windSpeed: 0,
      windDeg: 0,
      pressure: 0,
      clouds: 0,
      visibility: 0
    };
  }

  // Check cache first
  const cacheKey = city.toLowerCase();
  const cachedData = cache[cacheKey];
  
  // If we have valid cached data, use it
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached weather data for ${city}`);
    return cachedData.data;
  }
  
  try {
    const res = await fetchWithRetry(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    
    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }
    
    const data = await res.json();
    const processed = processWeatherData(data);
    
    // Cache the result
    cache[cacheKey] = {
      data: processed,
      timestamp: Date.now()
    };
    
    return processed;
  } catch (error) {
    return handleApiError(city, error);
  }
}

export async function fetchWeatherForMultipleCities(cities: string[]): Promise<ProcessedWeatherData[]> {
  try {
    const results = await Promise.allSettled(
      cities.map(city => fetchWeatherByCity(city))
    );
    
    // Process results, using fallback for any rejected promises
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Handle rejected promise with fallback data
        console.error(`Failed to fetch weather for ${cities[index]}:`, result.reason);
        return handleApiError(cities[index], result.reason);
      }
    });
  } catch (error) {
    console.error('Error fetching weather for multiple cities:', error);
    // Return fallback data for all cities
    return cities.map(city => handleApiError(city, error));
  }
} 