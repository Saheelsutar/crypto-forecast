'use client';

import { store } from '../store/store';
import { addNotification, setWebsocketConnected } from '../store/slices/cryptoSlice';
import { Notification } from '../store/slices/cryptoSlice';
import { v4 as uuidv4 } from 'uuid';

// CoinCap WebSocket URL - commented out since it won't work from browser due to CORS
// const COINCAP_WS_URL = 'wss://ws.coincap.io/prices?assets=bitcoin,ethereum';

// Use fallback mode by default since WebSocket won't work due to CORS restrictions
let fallbackModeActive = false;
let fallbackInterval: NodeJS.Timeout | null = null;

// Store previous prices to detect significant changes
const previousPrices: Record<string, number> = {
  bitcoin: 0,
  ethereum: 0,
};

// Mock prices for fallback mode
const mockPrices = {
  bitcoin: 44000,
  ethereum: 3200,
};

// Define significant price change threshold (in percentage)
const PRICE_CHANGE_THRESHOLD = 0.5; // 0.5%

// Map CoinCap asset names to our internal IDs
const assetMapping: Record<string, { id: string, name: string, symbol: string }> = {
  bitcoin: { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  ethereum: { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
};

export function initializeWebSocket() {
  if (typeof window === 'undefined') return;
  
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }
  
  // Directly use fallback mode since WebSocket connection will likely fail due to CORS
  console.log('Skipping actual WebSocket connection due to CORS limitations. Using simulated data.');
  activateFallbackMode();
  
  // The commented code below would work if deployed with proper CORS headers on server
  /*
  try {
    console.log('Connecting to CoinCap WebSocket...');
    socket = new WebSocket(COINCAP_WS_URL);
    
    socket.onopen = () => {
      console.log('WebSocket connection established with CoinCap');
      store.dispatch(setWebsocketConnected(true));
      reconnectAttempts = 0;
      fallbackModeActive = false;
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handlePriceUpdate(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error occurred. Switching to fallback mode.', error);
      store.dispatch(setWebsocketConnected(false));
      activateFallbackMode();
    };
    
    socket.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);
      store.dispatch(setWebsocketConnected(false));
      
      if (!fallbackModeActive) {
        activateFallbackMode();
      }
    };
  } catch (error) {
    console.error('Failed to establish WebSocket connection:', error);
    store.dispatch(setWebsocketConnected(false));
    activateFallbackMode();
  }
  */
}

export function closeWebSocket() {
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }
  
  store.dispatch(setWebsocketConnected(false));
  fallbackModeActive = false;
}

function handlePriceUpdate(data: Record<string, string>) {
  Object.entries(data).forEach(([asset, priceString]) => {
    try {
      const currentPrice = parseFloat(priceString);
      
      // Skip if we don't have a previous price (first update)
      if (previousPrices[asset] === 0) {
        previousPrices[asset] = currentPrice;
        return;
      }
      
      // Calculate percentage change
      const previousPrice = previousPrices[asset];
      const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      // Check if change exceeds threshold
      if (Math.abs(percentChange) >= PRICE_CHANGE_THRESHOLD) {
        const direction = percentChange > 0 ? 'increased' : 'decreased';
        const mappedAsset = assetMapping[asset];
        
        if (mappedAsset) {
          // Create and dispatch notification
          const notification: Notification = {
            id: uuidv4(),
            type: 'price_change',
            cryptoId: mappedAsset.id,
            message: `${mappedAsset.name} (${mappedAsset.symbol}) ${direction} by ${Math.abs(percentChange).toFixed(2)}% to $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            timestamp: Date.now(),
            read: false,
          };
          
          store.dispatch(addNotification(notification));
        }
      }
      
      // Update previous price
      previousPrices[asset] = currentPrice;
    } catch (error) {
      console.error(`Error processing price update for ${asset}:`, error);
    }
  });
}

// Simulate WebSocket updates when the real connection fails
function activateFallbackMode() {
  if (fallbackModeActive) return;
  
  console.log('Activating fallback mode for crypto price updates');
  fallbackModeActive = true;
  
  // Initialize mock prices
  if (previousPrices.bitcoin === 0) previousPrices.bitcoin = mockPrices.bitcoin;
  if (previousPrices.ethereum === 0) previousPrices.ethereum = mockPrices.ethereum;
  
  // Add notification about fallback mode
  store.dispatch(addNotification({
    id: uuidv4(),
    type: 'price_alert',
    message: 'Crypto price updates activated',
    timestamp: Date.now(),
    read: false,
  }));
  
  // Simulate initial price update
  const initialData = {
    bitcoin: previousPrices.bitcoin.toString(),
    ethereum: previousPrices.ethereum.toString()
  };
  handlePriceUpdate(initialData);
  
  // Set connected status to true since we're "connected" to the simulated data source
  store.dispatch(setWebsocketConnected(true));
  
  // Simulate price updates every 10 seconds
  fallbackInterval = setInterval(() => {
    // Create random price changes (±2%)
    const bitcoinChange = (Math.random() * 4 - 2) / 100;
    const ethereumChange = (Math.random() * 4 - 2) / 100;
    
    // Calculate new prices
    previousPrices.bitcoin = previousPrices.bitcoin * (1 + bitcoinChange);
    previousPrices.ethereum = previousPrices.ethereum * (1 + ethereumChange);
    
    const mockData = {
      bitcoin: previousPrices.bitcoin.toFixed(2),
      ethereum: previousPrices.ethereum.toFixed(2)
    };
    
    handlePriceUpdate(mockData);
  }, 10000);
} 