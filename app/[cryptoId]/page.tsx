import { Metadata } from 'next';
import CryptoDetailClient from '../components/CryptoDetailClient';

type Params = {
  cryptoId: string;
};

type Props = {
  params: Params;
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cryptoId = params.cryptoId;
  
  // You could fetch more accurate data here in a real app
  return {
    title: `${cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)} Price | Crypto Forecast`,
    description: `Real-time price information, historical data, and analysis for ${cryptoId}.`,
  };
}

export default function CryptoDetail({ params }: Props) {
  return (
    <main className="flex min-h-screen flex-col">
      <div suppressHydrationWarning>
        <CryptoDetailClient cryptoId={params.cryptoId} />
      </div>
    </main>
  );
} 