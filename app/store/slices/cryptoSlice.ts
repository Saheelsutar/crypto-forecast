import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Cryptocurrency } from '../../types/crypto';

// Define crypto data types
interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
}

// Define notification history type
export interface Notification {
  id: string;
  type: 'price_alert' | 'price_change' | 'market_cap_change' | 'volume_change';
  cryptoId?: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Define crypto state
interface CryptoState {
  data: Cryptocurrency[];
  favorites: string[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  websocketConnected: boolean;
}

// Helper function to load favorites from localStorage
const loadFavoritesFromStorage = (): string[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cryptoFavorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse crypto favorites from localStorage', e);
      }
    }
  }
  return [];
};

// Initial state
const initialState: CryptoState = {
  data: [],
  favorites: loadFavoritesFromStorage(),
  notifications: [],
  loading: false,
  error: null,
  websocketConnected: false,
};

// Create crypto slice
export const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    // Toggle favorite crypto
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const cryptoId = action.payload;
      if (state.favorites.includes(cryptoId)) {
        state.favorites = state.favorites.filter(id => id !== cryptoId);
      } else {
        state.favorites.push(cryptoId);
      }
    },
    // Set crypto data (for testing/demo purposes)
    setCryptoData: (state, action: PayloadAction<CryptoData[]>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    // Add a notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      
      // Limit to 20 most recent notifications
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(0, 20);
      }
    },
    // Mark a notification as read
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    // Update websocket connection status
    setWebsocketConnected: (state, action: PayloadAction<boolean>) => {
      state.websocketConnected = action.payload;
    },
    // Update crypto price from websocket
    updateCryptoPrice: (state, action: PayloadAction<{ id: string; price: number }>) => {
      const { id, price } = action.payload;
      const crypto = state.data.find(c => c.id === id);
      if (crypto) {
        // Calculate the price change
        const priceChange = price - crypto.price;
        // Update the crypto price
        crypto.price = price;
        
        // Generate notification for significant price changes (more than 5%)
        if (Math.abs(priceChange / crypto.price) > 0.05) {
          state.notifications.unshift({
            id: Date.now().toString(),
            type: 'price_alert',
            cryptoId: crypto.id,
            message: `${crypto.name} (${crypto.symbol}) has ${priceChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceChange / crypto.price * 100).toFixed(2)}%`,
            timestamp: Date.now(),
            read: false,
          });
        }
      }
    }
  },
  // We'll add more async reducers later for API calls
  extraReducers: (builder) => {
    // Empty for now - will be implemented with API calls
  },
});

// Export actions
export const { 
  toggleFavorite, 
  setCryptoData, 
  addNotification, 
  markNotificationAsRead,
  setWebsocketConnected,
  updateCryptoPrice
} = cryptoSlice.actions;

// Export reducer
export default cryptoSlice.reducer; 