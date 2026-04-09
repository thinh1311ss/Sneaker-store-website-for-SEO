'use client';

import Link from 'next/link';
import Image from 'next/image';

const brands = ['ON RUNNING', 'ASICS', 'HOKA', 'UNDER ARMOUR', 'PUMA', 'NIKE', 'ADIDAS', 'NEW BALANCE', 'SAUCONY', 'BROOKS'];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">

      {/* ── Băng rôn thương hiệu chạy liên tục ── */}
      <div className="border-y border-white/10 bg-gray-800 overflow-hidden py-4">
        <div className="flex gap-16 animate-marquee whitespace-nowrap" style={{ animation: 'marquee 28s linear infinite' }}>
          {[...brands, ...brands].map((brand, i) => (
            <span key={i} className="text-sm font-bold tracking-widest text-gray-300 uppercase flex-shrink-0 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {brand}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── Main footer ── */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Logo & About */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold">
              SNEAKER<span className="text-red-500">STORE</span>
            </Link>
            <p className="text-gray-400 mt-4 leading-relaxed text-sm">
              Cửa hàng giày sneaker chính hãng hàng đầu Việt Nam.
              Cam kết 100% authentic, giá tốt nhất thị trường.
            </p>
            <div className="flex gap-3 mt-6">
              {/* Facebook */}
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-black flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Giới thiệu */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5">Về chúng tôi</h4>
            <ul className="space-y-3">
              {[
                { name: 'Giới thiệu', href: '/gioi-thieu' },
                { name: 'Hệ thống cửa hàng', href: '/he-thong-cua-hang' },
                { name: 'Thông tin liên hệ', href: '/pages/ho-tro-giai-dap-thac-mac#lien-he' },
                { name: 'Điều khoản & điều kiện', href: '/pages/ho-tro-giai-dap-thac-mac#dieu-khoan' },
                { name: 'Hợp tác cùng chúng tôi', href: '/pages/ho-tro-giai-dap-thac-mac#hop-tac' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5">Hỗ trợ</h4>
            <ul className="space-y-3">
              {[
                { name: 'Hướng dẫn mua hàng', href: '/ho-tro#dat-hang' },
                { name: 'Chính sách đổi trả', href: '/ho-tro#doi-tra-bao-hanh' },
                { name: 'Chính sách bảo hành', href: '/ho-tro#doi-tra-bao-hanh' },
                { name: 'Hướng dẫn chọn size', href: '/ho-tro#dat-hang' },
                { name: 'Câu hỏi thường gặp', href: '/ho-tro' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5">Thanh toán</h4>
            
            <div className="grid grid-cols-3 gap-3">  
              {[
                { src: '/momo.png', alt: 'MoMo' },
                { src: '/Zalo.png', alt: 'ZaloPay' },
                { src: '/COD.png', alt: 'Thanh toán khi nhận hàng' },
                { src: '/VISA.png', alt: 'VISA' },
                { src: '/MASTERCARD.png', alt: 'Mastercard' },
                { src: '/ATM.png', alt: 'ATM' },
              ].map((pm, index) => (
                <div 
                  key={index}
                  className="w-11 h-11 bg-white/10 hover:bg-white/20 overflow-hidden duration-200"
                  title={pm.alt}
                >
                  <Image
                    src={pm.src}
                    alt={pm.alt}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Chứng nhận */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 rounded object-cover">
                <Image src="/image_41_487e5803-f4d0-489f-ac14-7b301b6cbb92.avif" alt="Chứng nhận" width={150} height={20} />
              </div>
              <div className="flex items-center gap-2 rounded object-cove">
                <Image src="/DMCA.png" alt="DMCA" width={80} height={20} />
              </div>
            </div>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm">123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm">1900 xxxx xx</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm">contact@sneakerstore.vn</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-400 text-sm">8:00 - 22:00 (T2 - CN)</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Sneaker Store Vietnam. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/dieu-khoan" className="text-gray-500 hover:text-white transition">Điều khoản</Link>
              <Link href="/bao-mat" className="text-gray-500 hover:text-white transition">Bảo mật</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}