'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';

export default function Provider({ children }: { children: React.ReactNode }) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
} 