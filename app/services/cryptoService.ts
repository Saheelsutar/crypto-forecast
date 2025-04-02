'use client';

import { store } from '../store/store';
import { setCryptoData, addNotification, setWebsocketConnected } from '../store/slices/cryptoSlice';
import { v4 as uuidv4 } from 'uuid';

// Store previous prices to detect significant changes
const previousPrices: Record<string, number> = {
  bitcoin: 0,
  ethereum: 0,
  cardano: 0,
  solana: 0,
  ripple: 0
};

// Define significant price change threshold (in percentage)
const PRICE_CHANGE_THRESHOLD = 0.2; // 0.2% threshold for notifications

// In-memory cache for crypto data
interface CryptoCache {
  data: any[];
  timestamp: number;
}

let cryptoCache: CryptoCache | null = null;
const CACHE_DURATION = 30000; // 30 seconds cache

// Fallback data in case of API failures
const FALLBACK_DATA = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 30000 + Math.random() * 2000,
    priceChange24h: (Math.random() * 10) - 5,
    marketCap: 580000000000,
    volume24h: 28000000000,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 1800 + Math.random() * 100,
    priceChange24h: (Math.random() * 10) - 5,
    marketCap: 216000000000,
    volume24h: 12000000000,
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.35 + Math.random() * 0.05,
    priceChange24h: (Math.random() * 10) - 5,
    marketCap: 12000000000,
    volume24h: 500000000,
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    price: 90 + Math.random() * 10,
    priceChange24h: (Math.random() * 10) - 5,
    marketCap: 38000000000,
    volume24h: 2100000000,
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'XRP',
    price: 0.5 + Math.random() * 0.05,
    priceChange24h: (Math.random() * 10) - 5,
    marketCap: 27000000000,
    volume24h: 1200000000,
  }
];

let refreshInterval: NodeJS.Timeout | null = null;
const REFRESH_INTERVAL = 30000; // 30 seconds (increased to reduce API calls)
let consecutiveFailures = 0;
const MAX_FAILURES_BEFORE_FALLBACK = 3;
let usingFallbackData = false;

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch with retry
async function fetchWithRetry(url: string, retries = 2, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url);
    
    // If rate limited and we have retries left, wait and try again
    if (response.status === 429 && retries > 0) {
      console.warn('Rate limited, retrying crypto API after delay...');
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn('Fetch failed, retrying crypto API after delay...', error);
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export function initializeCryptoUpdates() {
  if (typeof window === 'undefined') return;
  
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  
  // Reset state
  usingFallbackData = false;
  consecutiveFailures = 0;
  
  // Fetch initial data
  fetchCryptoData();
  
  // Set connected status to true
  store.dispatch(setWebsocketConnected(true));
  
  // Set up interval for regular updates
  refreshInterval = setInterval(fetchCryptoData, REFRESH_INTERVAL);
  
  console.log('Started real-time crypto price updates');
}

// Function to fetch crypto data from our API
async function fetchCryptoData() {
  // Check if we have valid cached data
  const now = Date.now();
  if (cryptoCache && now - cryptoCache.timestamp < CACHE_DURATION) {
    console.log('Using cached crypto data');
    processCryptoData(cryptoCache.data);
    return;
  }
  
  try {
    const response = await fetchWithRetry('/api/crypto');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.data && Array.isArray(responseData.data)) {
      // Cache the data
      cryptoCache = {
        data: responseData.data,
        timestamp: now
      };
      
      // Reset failure counter on success
      consecutiveFailures = 0;
      
      if (usingFallbackData) {
        usingFallbackData = false;
        store.dispatch(addNotification({
          id: uuidv4(),
          type: 'price_alert',
          message: 'Real-time cryptocurrency data restored',
          timestamp: Date.now(),
          read: false,
        }));
      }
      
      // Process the data
      processCryptoData(responseData.data);
    }
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    consecutiveFailures++;
    
    // If we've failed too many times, use fallback data
    if (consecutiveFailures >= MAX_FAILURES_BEFORE_FALLBACK) {
      if (!usingFallbackData) {
        usingFallbackData = true;
        console.warn('Switching to fallback crypto data');
        
        // Notify the user
        store.dispatch(addNotification({
          id: uuidv4(),
          type: 'price_alert',
          message: 'Using offline cryptocurrency data due to connection issues',
          timestamp: Date.now(),
          read: false,
        }));
      }
      
      // Use fallback data with slight random variations
      const fallbackData = FALLBACK_DATA.map(crypto => ({
        ...crypto,
        price: crypto.price * (1 + (Math.random() * 0.04 - 0.02)), // +/- 2%
        priceChange24h: (Math.random() * 10) - 5, // +/- 5%
      }));
      
      // Process fallback data
      processCryptoData(fallbackData);
    }
    
    // Still connected, just using fallback data
    store.dispatch(setWebsocketConnected(usingFallbackData));
  }
}

// Process crypto data and generate notifications for significant price changes
function processCryptoData(data: any[]) {
  // Update Redux store with the latest data
  store.dispatch(setCryptoData(data));
  
  // Check for significant price changes and send notifications
  data.forEach((crypto: any) => {
    const { id, price, name, symbol } = crypto;
    
    // Skip if we don't have a previous price (first update)
    if (previousPrices[id] === 0) {
      previousPrices[id] = price;
      return;
    }
    
    // Calculate percentage change
    const prevPrice = previousPrices[id];
    const percentChange = ((price - prevPrice) / prevPrice) * 100;
    
    // Check if change exceeds threshold
    if (Math.abs(percentChange) >= PRICE_CHANGE_THRESHOLD) {
      const direction = percentChange > 0 ? 'increased' : 'decreased';
      
      // Create and dispatch notification
      store.dispatch(addNotification({
        id: uuidv4(),
        type: 'price_change',
        cryptoId: id,
        message: `${name} (${symbol}) ${direction} by ${Math.abs(percentChange).toFixed(2)}% to $${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        timestamp: Date.now(),
        read: false,
      }));
    }
    
    // Update previous price
    previousPrices[id] = price;
  });
}

export function stopCryptoUpdates() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  
  store.dispatch(setWebsocketConnected(false));
} 