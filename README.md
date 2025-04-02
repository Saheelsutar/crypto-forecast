# CryptoForecast

A real-time dashboard combining weather forecasts, cryptocurrency data, and financial news in one convenient interface.

## Features

- **Weather Dashboard**: Real-time weather information for cities worldwide
- **Cryptocurrency Tracker**: Monitor top cryptocurrencies with price charts
- **Interactive Charts**: Visualize temperature and price trends
- **Favorites**: Save your favorite cities and cryptocurrencies
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Saheelsutar/crypto-forecast.git
   cd crypto-forecast
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   -  `.env.local`
   ```bash
    NEXT_PUBLIC_NEWS_API_KEY=your news api key
    NEXT_PUBLIC_OPENWEATHER_API_KEY=your weather api key

   ```
   - Edit `.env.local` and add your API keys:
     - Get an OpenWeatherMap API key from [openweathermap.org](https://openweathermap.org/api)
     - Get a News API key from [newsdata.io](https://newsdata.io/)
     - Get WebSocket CoinCap API

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

For deployment to Vercel or similar platforms, the build process will be handled automatically when you push to your repository.

## Design Decisions

### Architecture

- **App Router**: Leverages Next.js App Router for improved routing and server components
- **SSR/SSG Hybrid**: Server-side rendering for SEO, with client-side hydration for interactivity
- **Component Isolation**: Clear separation between server and client components
- **Modular API Services**: Separate services for each data source with proper error handling

### State Management

- **Redux Toolkit**: Centralized state management for predictable data flow
- **Loading States**: Dedicated loading and error states for robust UI feedback
- **Data Caching**: Implemented time-based caching to reduce API calls
- **Dark Mode**: Persisted user preferences using localStorage with SSR compatibility

### Error Handling

- **Graceful Degradation**: Fallback UI components when services are unavailable
- **Partial Failures**: System continues functioning even if one API service fails
- **Error Boundaries**: Isolated error states to prevent cascading failures
- **Retry Logic**: Implemented exponential backoff for transient API failures

## Challenges and Solutions

### Server-Side Rendering with Dynamic Charts

**Challenge**: Chart.js components caused hydration mismatches between server and client renders.

**Solution**: 
- Implemented dynamic imports with `{ ssr: false }` for chart components
- Used `suppressHydrationWarning` for containers with client-only content
- Added client-side mounting detection to prevent flash of incorrect content

### API Key Management

**Challenge**: Securely storing and using API keys without exposing them.

**Solution**:
- Environment variables with proper Next.js configuration
- Fallback mechanisms when keys are missing
- Server-side API requests to keep keys secure

### Deep Linking and Data Prefetching

**Challenge**: Handling direct navigation to detail pages while maintaining SSR benefits.

**Solution**:
- Implemented `generateStaticParams` for popular routes
- Created typed URL parameters with proper Next.js conventions
- Added loading states during client-side data fetching

### Cross-Browser Compatibility

**Challenge**: Browser extensions injecting attributes causing hydration mismatches.

**Solution**:
- Strategic use of `suppressHydrationWarning` directives
- Modified chart rendering to be client-side only
- Disabled strict mode for production builds

## Technologies Used

- **Framework**: Next.js 13+
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Data Sources**: OpenWeatherMap API, CryptoCompare API, NewsData.io

