import { NextResponse } from 'next/server';

// URLs for the CoinCap API
const COINCAP_API_URL = 'https://api.coincap.io/v2/assets';

// Cache to store the latest prices
let cryptoCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10000; // 10 seconds cache

// Fallback data for when the API is down or rate-limited
const FALLBACK_DATA = {
  data: [
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
  ],
  timestamp: Date.now()
};

// Helper function to delay execution
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch with retry
async function fetchWithRetry(url: string, retries = 2, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url, { 
      headers: { 
        'Accept': 'application/json',
        'Cache-Control': 'no-cache' 
      }
    });
    
    // If rate limited and we have retries left, wait and try again
    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      console.warn(`CoinCap API responded with status ${response.status}, retrying after delay...`);
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn('CoinCap API fetch failed, retrying after delay...', error);
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw error;
  }
}

// Add cache control headers
export const revalidate = 30; // Revalidate every 30 seconds at most

export async function GET() {
  try {
    const now = Date.now();
    
    // Check if we have a fresh cache
    if (cryptoCache && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(cryptoCache, {
        headers: {
          'Cache-Control': `public, s-maxage=10, stale-while-revalidate=60`,
        },
      });
    }
    
    // Fetch data from CoinCap API - include Bitcoin, Ethereum, and Cardano
    const response = await fetchWithRetry(`${COINCAP_API_URL}?ids=bitcoin,ethereum,cardano,solana,ripple&limit=5`);
    
    if (!response.ok) {
      console.warn(`CoinCap API responded with status: ${response.status}. Using fallback data.`);
      
      // If our cache is not too old (within 5 minutes), use it instead of fallback
      if (cryptoCache && now - lastFetchTime < 300000) {
        return NextResponse.json(cryptoCache, {
          headers: {
            'Cache-Control': `public, s-maxage=10, stale-while-revalidate=60`,
          },
        });
      }
      
      // Otherwise use fallback data
      return NextResponse.json(FALLBACK_DATA, {
        headers: {
          'Cache-Control': `public, s-maxage=10, stale-while-revalidate=60`,
        },
      });
    }
    
    const data = await response.json();
    
    // Transform the data to match our app's format
    const transformedData = data.data.map((asset: any) => ({
      id: asset.id,
      name: asset.name,
      symbol: asset.symbol,
      price: parseFloat(asset.priceUsd),
      priceChange24h: parseFloat(asset.changePercent24Hr),
      marketCap: parseFloat(asset.marketCapUsd),
      volume24h: parseFloat(asset.volumeUsd24Hr),
    }));
    
    // Cache the response
    cryptoCache = { data: transformedData, timestamp: now };
    lastFetchTime = now;
    
    return NextResponse.json(cryptoCache, {
      headers: {
        'Cache-Control': `public, s-maxage=10, stale-while-revalidate=60`,
      },
    });
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    
    // If our cache is not too old (within 5 minutes), use it
    const now = Date.now();
    if (cryptoCache && now - lastFetchTime < 300000) {
      return NextResponse.json(cryptoCache, {
        headers: {
          'Cache-Control': `public, s-maxage=10, stale-while-revalidate=60`,
        },
      });
    }
    
    // Otherwise use fallback data
    return NextResponse.json(FALLBACK_DATA, {
      headers: {
        'Cache-Control': `public, s-maxage=10, stale-while-revalidate=60`,
      },
    });
  }
} 