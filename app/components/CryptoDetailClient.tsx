'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../store/store';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CryptoDetailClient({ cryptoId }: { cryptoId: string }) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<'24h'|'7d'|'30d'|'1y'>('7d');
  
  const cryptoData = useAppSelector(state => 
    state.crypto.data.find(crypto => crypto.id.toLowerCase() === cryptoId.toLowerCase())
  );
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  if (!cryptoData) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <h1 className="text-xl font-bold mb-2">Cryptocurrency Not Found</h1>
          <Link href="/" className="text-blue-500 hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Generate mock historical data
  const generateHistoricalData = () => {
    const labels = [];
    const data = [];
    const seedPrice = cryptoData.price * 0.9;
    const volatility = 0.05;
    
    const pointCount = timeframe === '24h' ? 24 : 
                      timeframe === '7d' ? 7 : 
                      timeframe === '30d' ? 30 : 
                      365;
                      
    const format = timeframe === '24h' ? 'HH:00' : 
                  timeframe === '7d' ? 'ddd' :
                  timeframe === '30d' ? 'MMM DD' :
                  'MMM YYYY';
    
    let currentDate = new Date();
    
    for (let i = pointCount; i >= 0; i--) {
      const randomChange = (Math.random() - 0.5) * volatility;
      const multiplier = 1 + randomChange;
      let date;
      
      if (timeframe === '24h') {
        date = new Date(currentDate);
        date.setHours(date.getHours() - i);
        labels.push(`${date.getHours()}:00`);
      } else if (timeframe === '7d') {
        date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        labels.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]);
      } else if (timeframe === '30d') {
        date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      } else {
        date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        labels.push(`${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`);
      }
      
      data.push(seedPrice * Math.pow(1.0007, i) * (1 + (Math.sin(i/10) * 0.02) + randomChange));
    }
    
    return { labels, data };
  };
  
  const { labels, data } = generateHistoricalData();
  
  const chartData = {
    labels,
    datasets: [
      {
        label: cryptoData.name + ' Price',
        data,
        borderColor: cryptoData.priceChange24h >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: cryptoData.priceChange24h >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as 'index',
    },
  };
  
  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>
      
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white mt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{cryptoData.name} ({cryptoData.symbol})</h1>
          <div className="text-right">
            <p className="text-3xl font-bold">${cryptoData.price.toLocaleString()}</p>
            <p className={cryptoData.priceChange24h >= 0 ? "text-green-300" : "text-red-300"}>
              {cryptoData.priceChange24h >= 0 ? "▲" : "▼"} {Math.abs(cryptoData.priceChange24h).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Historical Price</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeframe('24h')}
              className={`px-3 py-1 rounded ${timeframe === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              24H
            </button>
            <button 
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1 rounded ${timeframe === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              7D
            </button>
            <button 
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1 rounded ${timeframe === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              30D
            </button>
            <button 
              onClick={() => setTimeframe('1y')}
              className={`px-3 py-1 rounded ${timeframe === '1y' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              1Y
            </button>
          </div>
        </div>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Market Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Market Cap</p>
            <p className="font-medium">${(cryptoData.marketCap / 1e9).toFixed(2)}B</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">24h Volume</p>
            <p className="font-medium">${(cryptoData.volume24h / 1e6).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Circulating Supply</p>
            <p className="font-medium">{(cryptoData.marketCap / cryptoData.price).toLocaleString(undefined, {maximumFractionDigits: 0})} {cryptoData.symbol}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">All-Time High</p>
            <p className="font-medium">${(cryptoData.price * (1 + Math.random() * 0.5)).toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mt-4">
        <h2 className="text-xl font-bold mb-4">Extended Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400">ROI (30d)</p>
            <p className={`font-medium ${(Math.random() > 0.5) ? 'text-green-600' : 'text-red-600'}`}>
              {(Math.random() > 0.5 ? '+' : '-')}{(Math.random() * 15).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Volatility</p>
            <p className="font-medium">{(Math.random() * 5).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Market Dominance</p>
            <p className="font-medium">{(Math.random() * 30).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Trading Volume Rank</p>
            <p className="font-medium">#{Math.floor(Math.random() * 20) + 1}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Market Cap Rank</p>
            <p className="font-medium">#{Math.floor(Math.random() * 20) + 1}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Price Change (7d)</p>
            <p className={`font-medium ${(Math.random() > 0.5) ? 'text-green-600' : 'text-red-600'}`}>
              {(Math.random() > 0.5 ? '+' : '-')}{(Math.random() * 25).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 