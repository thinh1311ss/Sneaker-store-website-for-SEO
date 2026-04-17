'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const heroSlides = [
  { title: 'SNEAKER', highlight: 'CHÍNH HÃNG', subtitle: 'Bộ sưu tập mới nhất 2024', bg: 'from-black via-gray-900 to-gray-800', accent: 'text-red-500' },
  { title: 'GIẢM GIÁ', highlight: 'ĐẾN 40%', subtitle: 'Ưu đãi có hạn - Nhanh tay', bg: 'from-red-600 via-red-700 to-red-900', accent: 'text-yellow-400' },
  { title: 'FREESHIP', highlight: 'TOÀN QUỐC', subtitle: 'Đơn hàng từ 2.000.000đ', bg: 'from-emerald-600 via-emerald-700 to-emerald-900', accent: 'text-white' },
];

interface HeroSliderProps {
  productCount: number;
  brandCount: number;
  brands: string[];
}

export default function HeroSlider({ productCount, brandCount, brands }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
    <section
      aria-label="Hero banner"
      className={`relative min-h-[600px] md:min-h-[700px] bg-gradient-to-br ${slide.bg} text-white overflow-hidden transition-all duration-1000`}
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
      </div>

      <div className="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[600px] md:min-h-[700px]">
        <div className={`text-center transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
          <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/90 mb-4">{slide.subtitle}</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-2">{slide.title}</h1>
          <h2 className={`text-5xl md:text-7xl lg:text-8xl font-black ${slide.accent}`}>{slide.highlight}</h2>
        </div>

        <div className="flex gap-8 md:gap-16 mt-12 mb-12">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold">{productCount}+</p>
            <p className="text-sm text-white/90 uppercase">Sản phẩm</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold">{brandCount}</p>
            <p className="text-sm text-white/90 uppercase">Thương hiệu</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold">100%</p>
            <p className="text-sm text-white/90 uppercase">Chính hãng</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/collections/${brand.toLowerCase().replace(' ', '-')}`}
              aria-label={`Xem sản phẩm thương hiệu ${brand}`}
              className="px-5 py-2.5 rounded-full border border-white/30 hover:border-white/80 hover:bg-white/10 transition-all text-sm font-medium"
            >
              {brand}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <Link
            href="/collections/uu-dai"
            aria-label="Xem trang khuyến mãi"
            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-all"
          >
            🔥 Xem Khuyến Mãi
          </Link>
          <Link
            href="#products"
            aria-label="Cuộn xuống danh sách sản phẩm"
            className="px-8 py-4 border-2 border-white/40 hover:border-white font-bold rounded-full transition-all"
          >
            Khám Phá
          </Link>
        </div>

        <div className="flex gap-2 mt-10" role="tablist" aria-label="Chọn slide hero">
          {heroSlides.map((slideItem, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              role="tab"
              aria-selected={i === currentSlide}
              aria-label={`Chuyển đến slide ${i + 1}: ${slideItem.title} ${slideItem.highlight}`}
              className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}