/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ẩn header "X-Powered-By: Next.js"
  poweredByHeader: false,

  async redirects() {
    return [
      {
        // URL danh mục cũ /danh-muc/<slug> → URL hiện tại /<slug>
        source: '/danh-muc/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },

  images: {
    // Ưu tiên AVIF (nhẹ hơn), fallback WebP
    formats: ['image/avif', 'image/webp'],
    // Chỉ tối ưu ảnh từ các nguồn tin cậy (không dùng hostname '*').
    // Nếu terminal báo: hostname "abc.com" is not configured → thêm 1 dòng cho domain đó.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
