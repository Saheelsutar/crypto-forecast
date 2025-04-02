'use client';

import { useAppDispatch } from '../store/store';
import { toggleFavorite } from '../store/slices/weatherSlice';
import Link from 'next/link';

interface WeatherCardProps {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  conditions: string;
  icon: string;
  isFavorite?: boolean;
  feelsLike?: number;
  tempMin?: number;
  tempMax?: number;
}

export default function WeatherCard({
  city,
  country,
  temperature,
  humidity,
  conditions,
  icon,
  isFavorite = false,
  feelsLike,
  tempMin,
  tempMax,
}: WeatherCardProps) {
  const dispatch = useAppDispatch();
  
  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(city));
  };
  
  // Map OpenWeatherMap icons to more descriptive weather conditions
  const getWeatherIcon = (iconCode: string) => {
    // OpenWeatherMap icon URL
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
      <div className="p-2">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/city/${encodeURIComponent(city)}`} className="block">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{city}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{country}</p>
            </Link>
          </div>
          <button
            onClick={handleToggleFavorite}
            className="text-gray-400 hover:text-amber-500 dark:text-gray-500 dark:hover:text-amber-400 transition-colors"
          >
            {isFavorite ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
              alt={conditions}
              className="w-16 h-16 mr-2"
            />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{conditions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Humidity: {humidity}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{temperature}°</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Feels like: {feelsLike}°</p>
          </div>
        </div>
        
        {/* Additional details */}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-x-2">
          <div>Min: {tempMin}°</div>
          <div>Max: {tempMax}°</div>
        </div>
        
        {/* View Details Link */}
        <div className="mt-4 text-right">
          <Link 
            href={`/city/${encodeURIComponent(city)}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
} 