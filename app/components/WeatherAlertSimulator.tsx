'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { simulateWeatherAlert } from '../store/slices/weatherSlice';

export default function WeatherAlertSimulator() {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const dispatch = useAppDispatch();
  const weatherData = useAppSelector(state => state.weather.data);

  // Timer for alert simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isActive && weatherData.length > 0) {
      timer = setTimeout(() => {
        // Generate a random weather alert
        dispatch(simulateWeatherAlert());
        // Reset countdown
        setCountdown(30);
      }, countdown * 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, countdown, dispatch, weatherData]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, countdown]);

  const toggleSimulation = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setCountdown(30);
    }
  };

  return (
    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-2 shadow">
      <div className="mr-3">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Weather Alert Simulator
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isActive 
            ? `Next alert in ${countdown} seconds` 
            : 'Alerts paused'}
        </div>
      </div>
      <button
        onClick={toggleSimulation}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          isActive 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        disabled={weatherData.length === 0}
      >
        {isActive ? 'Stop' : 'Start'}
      </button>
    </div>
  );
} 