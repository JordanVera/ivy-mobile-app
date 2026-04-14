import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ivy/api', '@ivy/database'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
