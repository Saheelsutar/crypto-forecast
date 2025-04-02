'use client';

import React from 'react';
import { useAppSelector } from '../store/store';

export default function ConnectionStatus() {
  const { websocketConnected } = useAppSelector(state => state.crypto);
  
  return (
    <div className="flex items-center text-sm">
      <div className={`h-2 w-2 rounded-full mr-2 ${websocketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
      <span className="text-gray-300">
        {websocketConnected ? 'Live data connected' : 'Disconnected'}
      </span>
    </div>
  );
} 