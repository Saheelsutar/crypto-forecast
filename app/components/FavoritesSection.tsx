'use client';

import { useAppSelector, useAppDispatch } from '../store/store';
import { toggleFavorite as toggleWeatherFavorite, removeCity } from '../store/slices/weatherSlice';
import { toggleFavorite as toggleCryptoFavorite } from '../store/slices/cryptoSlice';

export default function FavoritesSection() {
  const dispatch = useAppDispatch();
  const { data: weatherData, favorites: favoriteWeather } = useAppSelector(state => state.weather);
  const { data: cryptoData, favorites: favoriteCrypto } = useAppSelector(state => state.crypto);

  // Filter weather data for favorites
  const favoriteWeatherData = weatherData.filter(city => 
    favoriteWeather.includes(city.city)
  );

  // Filter crypto data for favorites
  const favoriteCryptoData = cryptoData.filter(crypto => 
    favoriteCrypto.includes(crypto.id)
  );

  // Handle removing a city from favorites
  const handleRemoveWeatherFavorite = (city: string) => {
    dispatch(toggleWeatherFavorite(city));
  };

  // Handle removing a crypto from favorites
  const handleRemoveCryptoFavorite = (id: string) => {
    dispatch(toggleCryptoFavorite(id));
  };

  // Handle removing a city entirely
  const handleRemoveCity = (city: string) => {
    dispatch(removeCity(city));
  };

  if (favoriteWeatherData.length === 0 && favoriteCryptoData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Your Favorites
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          You haven't added any favorites yet. Click the star icon on weather cities or cryptocurrencies to add them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Your Favorites
      </h2>
      
      {favoriteWeatherData.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Weather
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {favoriteWeatherData.map((city) => (
              <div 
                key={city.city}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <img 
                    src={`https://openweathermap.org/img/wn/${city.icon}.png`} 
                    alt={city.conditions} 
                    className="w-8 h-8 mr-2"
                  />
                  <div>
                    <p className="text-sm font-medium">{city.city}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{city.temperature}°F</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleRemoveWeatherFavorite(city.city)}
                    className="text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400"
                    title="Remove from favorites"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleRemoveCity(city.city)}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    title="Remove city"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {favoriteCryptoData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Cryptocurrency
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {favoriteCryptoData.map((crypto) => (
              <div 
                key={crypto.id}
                className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium">{crypto.name} ({crypto.symbol})</p>
                  <p className={`text-xs ${crypto.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                    ({crypto.priceChange24h >= 0 ? '+' : ''}{crypto.priceChange24h}%)
                  </p>
                </div>
                <button 
                  onClick={() => handleRemoveCryptoFavorite(crypto.id)}
                  className="text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 