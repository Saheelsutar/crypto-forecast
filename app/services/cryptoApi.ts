// Use environment variable for API key
const API_KEY = process.env.NEXT_PUBLIC_CRYPTO_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com/data';

import { Cryptocurrency } from '../types/crypto';

// Handle API errors gracefully
const handleApiError = (error: any) => {
  console.error('Crypto API error:', error);
  return [];
};

// Fetch cryptocurrency data
export async function fetchCryptocurrencies(): Promise<Cryptocurrency[]> {
  // Check if API key is available
  if (!API_KEY) {
    console.warn('Crypto API key is missing. Set NEXT_PUBLIC_CRYPTO_API_KEY in your environment variables.');
    return getMockCryptoData();
  }

  try {
    const url = `${BASE_URL}/top/mktcapfull?limit=10&tsym=USD${API_KEY ? `&api_key=${API_KEY}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Response === 'Error') {
      throw new Error(data.Message || 'Error fetching cryptocurrency data');
    }

    return data.Data.map((item: any) => ({
      id: item.CoinInfo.Name,
      name: item.CoinInfo.FullName,
      symbol: item.CoinInfo.Name,
      price: item.RAW?.USD?.PRICE || 0,
      priceChange24h: item.RAW?.USD?.CHANGEPCT24HOUR || 0,
      marketCap: item.RAW?.USD?.MKTCAP || 0,
      volume24h: item.RAW?.USD?.VOLUME24HOUR || 0
    }));
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error);
    return getMockCryptoData();
  }
}

// Mock data for fallback
function getMockCryptoData(): Cryptocurrency[] {
  return [
    {
      id: 'BTC',
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 37245.51,
      priceChange24h: 1.25,
      marketCap: 731245978245,
      volume24h: 18245784523
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      symbol: 'ETH',
      price: 2021.35,
      priceChange24h: -0.75,
      marketCap: 245785412547,
      volume24h: 12547854123
    },
    {
      id: 'SOL',
      name: 'Solana',
      symbol: 'SOL',
      price: 105.25,
      priceChange24h: 3.45,
      marketCap: 42547854125,
      volume24h: 5124578541
    },
    {
      id: 'ADA',
      name: 'Cardano',
      symbol: 'ADA',
      price: 0.45,
      priceChange24h: 0.25,
      marketCap: 15457854125,
      volume24h: 1245785412
    },
    {
      id: 'XRP',
      name: 'XRP',
      symbol: 'XRP',
      price: 0.65,
      priceChange24h: -1.05,
      marketCap: 35475854125,
      volume24h: 3547854125
    }
  ];
}