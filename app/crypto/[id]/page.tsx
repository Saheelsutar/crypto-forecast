import { Metadata } from 'next';
import { fetchCryptocurrencies } from '../../services/cryptoApi';

// Generate metadata for SEO
export async function generateMetadata({params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Fetch crypto data to get the name
  try {
    const cryptos = await fetchCryptocurrencies();
    const crypto = cryptos.find(crypto => crypto.id.toLowerCase() === id.toLowerCase());
    
    return {
      title: crypto ? `${crypto.name} (${crypto.symbol}) Price | CryptoWeather Nexus` : 'Cryptocurrency Details',
      description: crypto 
        ? `Live ${crypto.name} price, market cap, volume, and detailed information. Track ${crypto.symbol} in real-time.`
        : 'Detailed cryptocurrency market data, price charts, and analytics.',
      // OpenGraph data
      openGraph: {
        title: crypto ? `${crypto.name} (${crypto.symbol}) Price & Market Data` : 'Cryptocurrency Details',
        description: crypto 
          ? `View ${crypto.name} live price, charts, and market data. Current price: $${crypto.price.toLocaleString()}.` 
          : 'Track cryptocurrencies with real-time data and charts.',
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Cryptocurrency Details',
      description: 'Detailed cryptocurrency market data, price charts, and analytics.',
    };
  }
}

// This function gets called at build time on server-side
export async function generateStaticParams() {
  // Fetch the list of cryptocurrencies for static paths
  const cryptos = await fetchCryptocurrencies();
  
  // Return a list of possible values for id
  return cryptos.map((crypto) => ({
    id: crypto.id.toLowerCase(),
  }));
}

// Import the client component to render on the client side
import CryptoDetailClient from '@/app/components/CryptoDetailClient';

// Server component that uses the client component
export default function CryptoDetailPage({ params }: { params: { id: string } }) {
  return <CryptoDetailClient cryptoId={params.id} />;
} 