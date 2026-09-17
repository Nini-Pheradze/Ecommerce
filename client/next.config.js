/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/public/img/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // production API-ის დომენიც დაამატე აქ, როცა Render-ზე გექნება (fallback disk-storage-ისთვის):
      // { protocol: 'https', hostname: 'your-api.onrender.com', pathname: '/public/img/**' },
    ],
    // ლოკალურ დეველოპმენტში backend-იც localhost-ზეა - ეს საჭიროა Next 16-ის
    // SSRF დაცვის გვერდის ასავლელად. საჯარო დეპლოიმენტში ეს არ უნდა დარჩეს ჩართული.
    dangerouslyAllowLocalIP: true,
  },
};

module.exports = nextConfig;
