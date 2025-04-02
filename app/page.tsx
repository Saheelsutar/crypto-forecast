'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/store';
import { useAppInitialization } from './utils/init';
import WeatherCard from './components/WeatherCard';
import CryptoCard from './components/CryptoCard';
import NewsCard from './components/NewsCard';
import SearchBar from './components/SearchBar';
import FavoritesSection from './components/FavoritesSection';
import WeatherAlertSimulator from './components/WeatherAlertSimulator';
import ConnectionStatus from './components/ConnectionStatus';

export default function Home() {
  // Initialize app with data
  useAppInitialization();
  
  // Get data from Redux store
  const { data: weatherData, loading: weatherLoading, error: weatherError, favorites: weatherFavorites } = useAppSelector(state => state.weather);
  const { data: cryptoData, loading: cryptoLoading, error: cryptoError, favorites: cryptoFavorites } = useAppSelector(state => state.crypto);
  const { data: newsData, loading: newsLoading, error: newsError } = useAppSelector(state => state.news);

  return (
    <div className="space-y-10 min-h-screen p-4 md:p-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 md:p-12">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px] opacity-40"></div>
        <div className="relative flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">CryptoForecast</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mb-8">
              Your all-in-one dashboard for weather data, cryptocurrency information, and the latest news.
            </p>
            <div className="inline-flex bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm items-center">
              <ConnectionStatus />
            </div>
          </div>
        </div>
      </section>

      {/* Favorites Section */}
      <FavoritesSection />

      {/* Weather Alert Simulator */}
      <div className="flex justify-end">
        <WeatherAlertSimulator />
      </div>

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Weather Section */}
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="h-28 bg-gradient-to-r from-sky-400 to-blue-500 p-6">
            <h2 className="text-2xl font-bold text-white">Weather</h2>
            <p className="text-sky-100">Global conditions at a glance</p>
          </div>
          <div className="p-6">
            {/* Search Bar for adding cities */}
            <SearchBar />
            
            <div className="space-y-4 mt-4">
              {weatherLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : weatherError ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                  Error loading weather data: {weatherError}
                </div>
              ) : weatherData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {weatherData.map(city => (
                    <WeatherCard 
                      key={city.city}
                      city={city.city}
                      country={city.country}
                      temperature={city.temperature}
                      humidity={city.humidity}
                      conditions={city.conditions}
                      icon={city.icon}
                      isFavorite={weatherFavorites.includes(city.city)}
                      feelsLike={city.feelsLike}
                      tempMin={city.tempMin}
                      tempMax={city.tempMax}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-sm text-blue-600 dark:text-blue-400">
                  No weather data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cryptocurrency Section */}
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="h-28 bg-gradient-to-r from-amber-400 to-orange-500 p-6">
            <h2 className="text-2xl font-bold text-white">Cryptocurrency</h2>
            <p className="text-amber-100">Real-time market updates</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {cryptoLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : cryptoError ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                  Error loading cryptocurrency data: {cryptoError}
                </div>
              ) : cryptoData.length > 0 ? (
                cryptoData.map((crypto) => (
                  <CryptoCard 
                    key={crypto.id}
                    id={crypto.id}
                    name={crypto.name}
                    symbol={crypto.symbol}
                    price={crypto.price}
                    priceChange24h={crypto.priceChange24h}
                    marketCap={crypto.marketCap}
                    volume24h={crypto.volume24h}
                    isFavorite={cryptoFavorites.includes(crypto.id)}
                  />
                ))
              ) : (
                <div className="text-center py-3 text-sm text-amber-600 dark:text-amber-400">
                  Market data loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* News Section */}
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="h-28 bg-gradient-to-r from-purple-400 to-fuchsia-500 p-6">
            <h2 className="text-2xl font-bold text-white">News</h2>
            <p className="text-purple-100">Latest crypto headlines</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {newsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : newsError ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                  Error loading news data: {newsError}
                </div>
              ) : newsData.length > 0 ? (
                newsData.map((article, index) => (
                  <NewsCard key={article.id || article.url || `news-${index}`} article={article} />
                ))
              ) : (
                <div className="text-center py-3 text-sm text-purple-600 dark:text-purple-400">
                  News headlines loading...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Stay Updated in Real-Time</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Get instant notifications about significant price changes and weather alerts.
        </p>
        <div className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors">
          Get Updates
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </section>
    </div>
  );
}
