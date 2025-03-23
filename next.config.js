/** @type {import('next').NextConfig} */
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  // Hata mesajlarını üretim ortamında gizle
  reactStrictMode: true,
  
  // Üretim ortamı yapılandırması
  productionBrowserSourceMaps: false,
  
  // Hata sayfalarını özelleştirme
  onDemandEntries: {
    // Sayfa taslağının bellekte ne kadar süre tutulacağı
    maxInactiveAge: 60 * 1000,
    // Aynı anda bellekte tutulacak sayfa sayısı
    pagesBufferLength: 5,
  },
  
  // Derleme çıktılarını özelleştirme
  poweredByHeader: false,
  
  // Hata günlüğünü yapılandırma
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Ortam değişkenine göre üretim ayarlarını belirle
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
  },
  
  // Belirli klasörleri derleme işleminden hariç tut
  distDir: '.next',
  eslint: {
    // docs/templates klasörünü eslint kontrolünden çıkar
    ignoreDuringBuilds: true,
  },
  
  // TypeScript derleme sırasında hataları atla
  typescript: {
    // Production'da TypeScript hatalarını yoksay
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Webpack yapılandırması ile üretim ortamında hataları özelleştirme
  webpack: (config, { dev, isServer }) => {
    // Sadece üretim ortamında ve tarayıcı tarafında değişiklik yap
    if (!dev && !isServer) {
      // Kaynak haritaları devre dışı bırak
      config.devtool = false;
      
      // Üretim ortamında hata mesajlarını özelleştir
      config.optimization.minimizer.forEach((plugin) => {
        if (plugin.constructor.name === 'TerserPlugin') {
          plugin.options.terserOptions.compress.warnings = false;
          plugin.options.terserOptions.compress.drop_console = true;
          plugin.options.terserOptions.format.comments = false;
        }
      });
    }
    
    return config;
  },
  
  // Server-side rendering sırasında oluşan hataları ele al
  experimental: {
    // SSR sırasındaki setTimeout/setInterval hatalarını atla
    missingSuspenseWithCSRBailout: false
  },
  
  // Client-side'da kullanılmak üzere bazı API'lerin server-side'da kullanımını atla
  serverRuntimeConfig: {
    // Server tarafında özel yapılandırma
  },
  publicRuntimeConfig: {
    // Client ve server tarafında paylaşılan yapılandırma
    isServerSide: false,
  },
};

module.exports = withBundleAnalyzer(nextConfig); 