import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_WEATHER_API_KEY: process.env.WEATHER_API_KEY,
  },
};

export default nextConfig;
