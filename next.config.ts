import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: [
  //             "default-src 'self'",
  //             "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://apis.google.com https://www.gstatic.com https://accounts.google.com",
  //             "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  //             "font-src 'self' https://fonts.gstatic.com",
  //             "img-src 'self' data: https:",
  //             "connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:* https://localhost:*",
  //             "worker-src 'self' blob:",
  //           ].join('; ')
  //         }
  //       ]
  //     }
  //   ]
  // }
};

export default nextConfig;
