import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWeatherForMultipleCities, fetchWeatherByCity as fetchWeatherByCityApi, ProcessedWeatherData } from '../../services/weatherApi';
import { Weather } from '../../types/weather';

// Define weather alert type
export interface WeatherAlert {
  id: string;
  type: 'severe' | 'warning' | 'watch' | 'advisory' | 'weather_alert';
  city: string;
  message: string;
  severity: 'high' | 'medium' | 'low' | 'severe' | 'warning' | 'info';
  timestamp: number;
  read: boolean;
}

// Define weather data types
interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  conditions: string;
  icon: string;
  feelsLike?: number;
  tempMin?: number;
  tempMax?: number;
  windSpeed?: number;
  windDeg?: number;
  pressure?: number;
  clouds?: number;
  visibility?: number;
}

// Define the weather state structure
interface WeatherState {
  data: WeatherData[];
  favorites: string[];
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
}

// Helper function to load favorites from localStorage
const loadFavoritesFromStorage = (): string[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('weatherFavorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse weather favorites from localStorage', e);
      }
    }
  }
  return [];
};

// Initial state
const initialState: WeatherState = {
  data: [],
  favorites: loadFavoritesFromStorage(),
  alerts: [],
  loading: false,
  error: null,
};

// Thunk to fetch weather data for multiple cities
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (cities: string[] = ['New York', 'London', 'Tokyo'], { rejectWithValue }) => {
    try {
      const weatherData = await fetchWeatherForMultipleCities(cities);
      return weatherData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch weather data');
    }
  }
);

// Thunk to fetch weather data for a single city and add it to the list
export const fetchWeatherByCity = createAsyncThunk(
  'weather/fetchWeatherByCity',
  async (city: string, { rejectWithValue, getState }) => {
    try {
      const weatherData = await fetchWeatherByCityApi(city);
      
      // Check if the city already exists in the state
      const state = getState() as { weather: WeatherState };
      const cityExists = state.weather.data.some(c => 
        c.city.toLowerCase() === weatherData.city.toLowerCase()
      );
      
      if (cityExists) {
        return { weatherData, isNewCity: false };
      }
      
      return { weatherData, isNewCity: true };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch weather data');
    }
  }
);

// Thunk to simulate weather alerts
export const simulateWeatherAlert = createAsyncThunk(
  'weather/simulateWeatherAlert',
  async (_, { getState }) => {
    // Get a random city from state
    const state = getState() as { weather: WeatherState };
    const cities = state.weather.data;
    
    if (cities.length === 0) return null;
    
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    // Generate a random alert type
    const alertTypes = [
      { 
        type: 'Heavy Rain', 
        message: `Heavy rainfall expected in ${randomCity.city}`, 
        severity: 'warning' as const
      },
      { 
        type: 'Thunderstorm', 
        message: `Thunderstorm warning issued for ${randomCity.city}`, 
        severity: 'severe' as const
      },
      { 
        type: 'High Winds', 
        message: `High wind advisory for ${randomCity.city}`, 
        severity: 'warning' as const
      },
      { 
        type: 'Heatwave', 
        message: `Extreme heat alert for ${randomCity.city}`, 
        severity: 'severe' as const
      },
      { 
        type: 'Weather Change', 
        message: `Weather conditions changing in ${randomCity.city}`, 
        severity: 'info' as const
      }
    ];
    
    const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    const alert: WeatherAlert = {
      id: Date.now().toString(),
      type: 'weather_alert',
      city: randomCity.city,
      message: randomAlert.message,
      severity: randomAlert.severity,
      timestamp: Date.now(),
      read: false
    };
    
    return alert;
  }
);

// Create the weather slice
export const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    // Add/remove city from favorites
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const cityName = action.payload;
      if (state.favorites.includes(cityName)) {
        state.favorites = state.favorites.filter(city => city !== cityName);
      } else {
        state.favorites.push(cityName);
      }
    },
    // Manually set weather data (for testing/demo purposes)
    setWeatherData: (state, action: PayloadAction<WeatherData[]>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    // Mark a weather alert as read
    markAlertAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.read = true;
      }
    },
    // Add a mock weather alert
    addWeatherAlert: (state, action: PayloadAction<WeatherAlert>) => {
      state.alerts.unshift(action.payload);
    },
    // Remove a city from the data array
    removeCity: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(city => city.city !== action.payload);
      // Also remove from favorites if present
      state.favorites = state.favorites.filter(city => city !== action.payload);
    }
  },
  // Add async reducers for API calls
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
      })
      .addCase(fetchWeatherByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherByCity.fulfilled, (state, action) => {
        if (action.payload.isNewCity) {
          state.data.push(action.payload.weatherData);
        } else {
          // Update existing city data
          const index = state.data.findIndex(
            city => city.city.toLowerCase() === action.payload.weatherData.city.toLowerCase()
          );
          if (index !== -1) {
            state.data[index] = action.payload.weatherData;
          }
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchWeatherByCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
      })
      .addCase(simulateWeatherAlert.fulfilled, (state, action) => {
        if (action.payload) {
          state.alerts.unshift(action.payload);
        }
      });
  },
});

// Export actions
export const { 
  toggleFavorite, 
  setWeatherData, 
  markAlertAsRead, 
  addWeatherAlert,
  removeCity
} = weatherSlice.actions;

// Export reducer
export default weatherSlice.reducer; 