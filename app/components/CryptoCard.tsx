'use client';

import { useAppDispatch } from '../store/store';
import { toggleFavorite } from '../store/slices/cryptoSlice';
import Link from 'next/link';

interface CryptoCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  isFavorite?: boolean;
  isCompact?: boolean;
}

const CryptoCard = ({ id, name, symbol, price, priceChange24h, marketCap, volume24h, isFavorite = false, isCompact = false }: CryptoCardProps) => {
  const dispatch = useAppDispatch();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(id));
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <Link href={`/${id}`} className="block">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-700/20 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-700/30 transition">
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mr-3">
                <span className="text-amber-500 dark:text-amber-400 font-semibold">{symbol.substring(0, 2)}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{symbol}</p>
              </div>
            </div>
            <button
              onClick={handleToggleFavorite}
              className="text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400 transition"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-500">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatPrice(price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h Change</span>
              <span className={`font-medium ${priceChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>
            {!isCompact && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatMarketCap(marketCap)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Volume (24h)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatMarketCap(volume24h)}</span>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 text-right">
            <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CryptoCard; 