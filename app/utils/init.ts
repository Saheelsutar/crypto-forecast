'use client';

import { useEffect } from 'react';
import { loadMockData } from './mock-data';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchWeatherData } from '../store/slices/weatherSlice';
import { setWebsocketConnected } from '../store/slices/cryptoSlice';
import { initializeCryptoUpdates, stopCryptoUpdates } from '../services/cryptoService';
import { fetchNewsData } from '../store/slices/newsSlice';

// This custom hook initializes the app with data
export function useAppInitialization() {
  const dispatch = useAppDispatch();
  const { favorites: weatherFavorites } = useAppSelector(state => state.weather);
  const { favorites: cryptoFavorites } = useAppSelector(state => state.crypto);

  // Load data when the app initializes
  useEffect(() => {
    // Initialize the app by fetching all required data
    dispatch(fetchWeatherData(['New York', 'London', 'Tokyo']));
    initializeCryptoUpdates();
    dispatch(fetchNewsData(5)); // Fetch 5 news articles
    
    // Cleanup function for when component unmounts
    return () => {
      stopCryptoUpdates();
    };
  }, [dispatch]);

  // Save weather favorites to local storage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && weatherFavorites.length > 0) {
      localStorage.setItem('weatherFavorites', JSON.stringify(weatherFavorites));
    }
  }, [weatherFavorites]);

  // Save crypto favorites to local storage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && cryptoFavorites.length > 0) {
      localStorage.setItem('cryptoFavorites', JSON.stringify(cryptoFavorites));
    }
  }, [cryptoFavorites]);
} 