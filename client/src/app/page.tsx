'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAllProducts, getAllBrands, getSaleProducts } from '@/lib/api';
import { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import BrandFilter from '@/components/BrandFilter';

const heroSlides = [
  { title: 'SNEAKER', highlight: 'CHÍNH HÃNG', subtitle: 'Bộ sưu tập mới nhất 2024', bg: 'from-black via-gray-900 to-gray-800', accent: 'text-red-500' },
  { title: 'GIẢM GIÁ', highlight: 'ĐẾN 40%', subtitle: 'Ưu đãi có hạn - Nhanh tay', bg: 'from-red-600 via-red-700 to-red-900', accent: 'text-yellow-400' },
  { title: 'FREESHIP', highlight: 'TOÀN QUỐC', subtitle: 'Đơn hàng từ 2.000.000đ', bg: 'from-emerald-600 via-emerald-700 to-emerald-900', accent: 'text-white' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const selectedBrands = searchParams.getAll('brand');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch data từ API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [allProducts, allBrands, saleProducts] = await Promise.all([
          getAllProducts(),
          getAllBrands(),
          getSaleProducts(),
        ]);
        setProducts(allProducts);
        setBrands(allBrands);
        setFeaturedProducts(saleProducts.filter(p => (p.discount ?? 0) >= 20));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter products by selected brands
  const filteredProducts =
    selectedBrands.length > 0
      ? products.filter((p) => selectedBrands.includes(p.brand))
      : products;

  // Hero slider animation
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <>
      {/* Hero Section */}
      <section className={`relative min-h-[600px] md:min-h-[700px] bg-gradient-to-br ${slide.bg} text-white overflow-hidden transition-all duration-1000`}>
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[600px] md:min-h-[700px]">
          <div className={`text-center transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
            <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/60 mb-4">{slide.subtitle}</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-2">{slide.title}</h1>
            <h2 className={`text-5xl md:text-7xl lg:text-8xl font-black ${slide.accent}`}>{slide.highlight}</h2>
          </div>

          {/* Stats - Dynamic từ API */}
          <div className="flex gap-8 md:gap-16 mt-12 mb-12">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold">{products.length}+</p>
              <p className="text-sm text-white/60 uppercase">Sản phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold">{brands.length}</p>
              <p className="text-sm text-white/60 uppercase">Thương hiệu</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold">100%</p>
              <p className="text-sm text-white/60 uppercase">Chính hãng</p>
            </div>
          </div>

          {/* Brand Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {brands.map((brand) => (
              <Link key={brand} href={`/collections/${brand.toLowerCase().replace(' ', '-')}`}
                className="px-5 py-2.5 rounded-full border border-white/20 hover:border-white/60 hover:bg-white/10 transition-all text-sm font-medium">
                {brand}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-4">
            <Link href="/collections/uu-dai" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all">
              🔥 Xem Khuyến Mãi
            </Link>
            <Link href="#products" className="px-8 py-4 border-2 border-white/30 hover:border-white font-bold rounded-full transition-all">
              Khám Phá
            </Link>
          </div>

          {/* Slide Dots */}
          <div className="flex gap-2 mt-10">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải sản phẩm...</p>
          </div>
        </section>
      )}

      {/* Sale Products */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-4">HOT DEALS</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Đang Giảm Giá Mạnh</h2>
              <p className="text-gray-600">Tiết kiệm đến 40% cho các sản phẩm hot</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      {!loading && (
        <section id="products" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold mb-4">BỘ SƯU TẬP</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Tất Cả Sản Phẩm</h2>
              <p className="text-gray-600">{filteredProducts.length} sản phẩm sneaker chính hãng</p>
            </div>
            <BrandFilter brands={brands} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Chính hãng */}
            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">100% Chính Hãng</h3>
              <p className="text-sm text-gray-400">Cam kết đền 200%</p>
            </div>

            {/* Freeship */}
            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Freeship</h3>
              <p className="text-sm text-gray-400">Đơn từ 2 triệu</p>
            </div>

            {/* Đổi trả */}
            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Đổi Trả 30 Ngày</h3>
              <p className="text-sm text-gray-400">Đổi size miễn phí</p>
            </div>

            {/* COD */}
            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-1">Thanh Toán COD</h3>
              <p className="text-sm text-gray-400">Nhận hàng rồi trả tiền</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}