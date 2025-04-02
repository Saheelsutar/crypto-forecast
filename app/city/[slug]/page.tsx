'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchWeatherByCity } from '../../services/weatherApi';
import { ProcessedWeatherData } from '../../services/weatherApi';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dynamically import Chart.js component with no SSR
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  ssr: false,
});

// Mock historical data
const generateHistoricalData = (city: string, days = 7) => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      tempMin: Math.round(15 + Math.random() * 5),
      tempMax: Math.round(25 + Math.random() * 5),
      humidity: Math.round(40 + Math.random() * 40),
      conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 5)],
    });
  }
  
  return data;
};

export default function CityDetailPage() {
  const params = useParams();
  const citySlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const cityName = citySlug ? decodeURIComponent(citySlug) : '';
  
  const [cityData, setCityData] = useState<ProcessedWeatherData | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch current weather
        const weatherData = await fetchWeatherByCity(cityName);
        setCityData(weatherData);
        
        // Generate mock historical data
        setHistoricalData(generateHistoricalData(cityName));
      } catch (err) {
        console.error('Error fetching city data:', err);
        setError('Failed to load weather data for this city');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [cityName]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !cityData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'City not found'}</p>
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      {/* City header with current conditions */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-xl overflow-hidden mb-8">
        <div className="p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{cityData.city}</h1>
              <p className="text-xl text-blue-100">{cityData.country}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="mr-6 text-center">
                <img 
                  src={`https://openweathermap.org/img/wn/${cityData.icon}@2x.png`}
                  alt={cityData.conditions}
                  className="w-16 h-16 inline-block"
                />
                <p className="text-sm">{cityData.conditions}</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold">{cityData.temperature}°</p>
                <p className="text-sm">Feels like {cityData.feelsLike}°</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">Humidity</p>
              <p className="text-2xl font-semibold">{cityData.humidity}%</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">Min / Max</p>
              <p className="text-2xl font-semibold">{cityData.tempMin}° / {cityData.tempMax}°</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">Wind</p>
              <p className="text-2xl font-semibold">{cityData.windSpeed} mph</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">Pressure</p>
              <p className="text-2xl font-semibold">{cityData.pressure} hPa</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Historical data section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Historical Weather Data</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Past 7 days of weather data for {cityData.city}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Min Temp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Max Temp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Humidity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Conditions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {historicalData.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {day.tempMin}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {day.tempMax}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {day.humidity}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {day.conditions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Weather chart visualization */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Temperature Trends</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Weekly temperature variation for {cityData.city}</p>
        </div>
        
        <div className="p-6">
          {historicalData.length > 0 ? (
            <div className="h-64">
              {typeof window !== 'undefined' && (
                <Chart
                  data={{
                    labels: historicalData.map(day => 
                      new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })
                    ).reverse(),
                    datasets: [
                      {
                        label: 'Min Temperature (°C)',
                        data: historicalData.map(day => day.tempMin).reverse(),
                        borderColor: 'rgba(53, 162, 235, 0.8)',
                        backgroundColor: 'rgba(53, 162, 235, 0.2)',
                        tension: 0.3,
                      },
                      {
                        label: 'Max Temperature (°C)',
                        data: historicalData.map(day => day.tempMax).reverse(),
                        borderColor: 'rgba(255, 99, 132, 0.8)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.3,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b',
                        }
                      },
                      tooltip: {
                        mode: 'index' as const,
                        intersect: false,
                      }
                    },
                    scales: {
                      y: {
                        grid: {
                          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b',
                        }
                      },
                      x: {
                        grid: {
                          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b',
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No temperature data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 