/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript during build
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
}

module.exports = nextConfig 