// Use environment variable for API key
const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1';

// Define news response interface
export interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

// Define the structure of NewsData.io API response
export interface NewsDataArticle {
  article_id?: string;
  title?: string;
  link?: string;
  keywords?: string[];
  creator?: string[];
  video_url?: string;
  description?: string;
  content?: string;
  pubDate?: string;
  image_url?: string;
  source_id?: string;
  source_priority?: number;
  country?: string[];
  category?: string[];
  language?: string;
}

// Define article interface for our application
export interface Article {
  id: string;
  title: string;
  description?: string;
  url: string;
  source?: string;
  image_url?: string | null;
  publishedAt: string;
}

// In-memory cache
interface NewsCache {
  data: Article[];
  timestamp: number;
}

let newsCache: NewsCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fallback news data
const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    title: 'Bitcoin Surges to New Heights as Institutional Adoption Continues',
    description: 'Major financial institutions are increasingly embracing Bitcoin as a legitimate asset class.',
    url: 'https://example.com/news/1',
    source: 'Crypto Daily',
    image_url: null,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'fallback-2',
    title: 'Ethereum 2.0 Upgrade Nears Completion, Promising Reduced Gas Fees',
    description: 'The long-awaited Ethereum upgrade is expected to address scalability issues and reduce transaction costs.',
    url: 'https://example.com/news/2',
    source: 'Blockchain Insider',
    image_url: null,
    publishedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'fallback-3',
    title: 'Regulatory Changes Could Impact Cryptocurrency Markets',
    description: 'New regulations being considered by global authorities may reshape the crypto landscape.',
    url: 'https://example.com/news/3',
    source: 'Finance News',
    image_url: null,
    publishedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'fallback-4',
    title: 'New Altcoins Gaining Popularity Among Crypto Investors',
    description: 'Several emerging cryptocurrencies are attracting attention from investors looking beyond Bitcoin and Ethereum.',
    url: 'https://example.com/news/4',
    source: 'Crypto Trends',
    image_url: null,
    publishedAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 'fallback-5',
    title: 'Blockchain Technology Finding New Applications Beyond Cryptocurrency',
    description: 'Industries from supply chain to healthcare are adopting blockchain for transparency and security.',
    url: 'https://example.com/news/5',
    source: 'Tech Daily',
    image_url: null,
    publishedAt: new Date(Date.now() - 14400000).toISOString()
  }
];

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch with retry
async function fetchWithRetry(url: string, retries = 2, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url);
    
    // If rate limited and we have retries left, wait and try again
    if (response.status === 429 && retries > 0) {
      console.warn('Rate limited, retrying news API after delay...');
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn('Fetch failed, retrying news API after delay...', error);
      await delay(backoff);
      return fetchWithRetry(url, retries - 1, backoff * 2);
    }
    throw error;
  }
}

// Fetch crypto news
export async function fetchCryptoNews(): Promise<Article[]> {
  // Check if API key is available
  if (!API_KEY) {
    console.error('News API key is missing. Set NEXT_PUBLIC_NEWS_API_KEY in your environment variables.');
    return FALLBACK_NEWS;
  }

  // Check cache first
  const now = Date.now();
  if (newsCache && now - newsCache.timestamp < CACHE_DURATION) {
    console.log('Using cached news data');
    return newsCache.data;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/news?apikey=${API_KEY}&q=crypto+OR+cryptocurrency+OR+bitcoin&language=en&size=10`);
    
    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }
    
    const data: NewsResponse = await response.json();
    
    if (data.status === 'success' && data.results && data.results.length > 0) {
      // Process and normalize data
      const articles = data.results.slice(0, 10).map(article => {
        // Ensure article has all required fields
        return {
          id: article.article_id || article.title?.replace(/\s+/g, '-').toLowerCase() || `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: article.title || 'No title available',
          description: article.description || article.content || 'No description available',
          url: article.link || '#',
          source: article.source_id || 'Unknown source',
          image_url: article.image_url || null,
          publishedAt: article.pubDate || new Date().toISOString()
        };
      });
      
      // Cache the results
      newsCache = {
        data: articles,
        timestamp: now
      };
      
      return articles;
    } else {
      console.warn('No news results found, using fallback data');
      return FALLBACK_NEWS;
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return FALLBACK_NEWS;
  }
} 