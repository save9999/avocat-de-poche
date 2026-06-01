/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js inline scripts + scripts de même origine
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles inline (Tailwind JIT) + même origine
              "style-src 'self' 'unsafe-inline'",
              // Images : même origine + data URIs
              "img-src 'self' data: blob:",
              // Polices
              "font-src 'self'",
              // Connexions API : même origine + Supabase + Anthropic
              "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://*.upstash.io",
              // Frames interdites
              "frame-src 'none'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
