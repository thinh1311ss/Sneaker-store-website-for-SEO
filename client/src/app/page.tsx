// KHÔNG có 'use client' → đây là Server Component
// Data được fetch trên server → HTML trả về ĐÃ CÓ sản phẩm
// Speed Index giảm mạnh vì browser nhận HTML có nội dung ngay

import { getAllProducts, getAllBrands, getSaleProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import HeroSlider from '@/components/HeroSlider';
import ProductsSection from '@/components/ProductsSection';
import Link from 'next/link';

// ISR: Revalidate mỗi 5 phút (sản phẩm không thay đổi liên tục)
// Sau 5 phút, Next.js sẽ tự động fetch lại data mới ở background
export const revalidate = 300;

export default async function HomePage() {
  // Fetch song song trên SERVER — không cần useEffect, không cần loading state
  const [allProducts, brands, saleProducts] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getSaleProducts(),
  ]);

  // Filter sale products có discount >= 20%
  const featuredProducts = saleProducts
    .filter(p => (p.discount ?? 0) >= 20)
    .slice(0, 8);

  // Giới hạn sản phẩm cho section "Tất cả"
  const displayProducts = allProducts.slice(0, 12);

  return (
    <>
      {/* Hero - Client Component vì có animation/timer */}
      <HeroSlider
        productCount={allProducts.length}
        brandCount={brands.length}
        brands={brands}
      />

      {/* Sale Products - render trực tiếp trên server (KHÔNG cần loading spinner) */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white" aria-labelledby="sale-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">HOT DEALS</span>
              <h2 id="sale-heading" className="text-3xl md:text-4xl font-bold mb-3">Đang Giảm Giá Mạnh</h2>
              <p className="text-gray-700">Tiết kiệm đến 40% cho các sản phẩm hot</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products - Client Component vì cần brand filter (useSearchParams) */}
      <ProductsSection
        products={displayProducts}
        brands={brands}
        totalCount={allProducts.length}
      />

      {/* Features - render trực tiếp trên server (static HTML) */}
      <section className="py-16 bg-gray-900 text-white" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Cam kết của chúng tôi</h2>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/20 flex items-center justify-center" aria-hidden="true">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">100% Chính Hãng</h3>
              <p className="text-sm text-gray-300">Cam kết đền 200%</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center" aria-hidden="true">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Freeship</h3>
              <p className="text-sm text-gray-300">Đơn từ 2 triệu</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center" aria-hidden="true">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Đổi Trả 30 Ngày</h3>
              <p className="text-sm text-gray-300">Đổi size miễn phí</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-amber-500/20 flex items-center justify-center" aria-hidden="true">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Thanh Toán COD</h3>
              <p className="text-sm text-gray-300">Nhận hàng rồi trả tiền</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}