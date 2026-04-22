import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Zap, Headset } from "lucide-react";
import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Giới thiệu | UIT Sneakers Vietnam ",
  description:
    "Tìm hiểu về sứ mệnh, tầm nhìn và những giá trị cốt lõi làm nên thương hiệu UIT Sneakers Vietnam.",
  openGraph: {
    title: "Giới thiệu | UIT Sneakers Vietnam ",
    description:
      "Tìm hiểu về sứ mệnh, tầm nhìn và những giá trị cốt lõi làm nên thương hiệu UITSneakers Vietnam.",
    url: `${siteConfig.url}/gioi-thieu`,
  },
};

export default function AboutPage() {
  return (
    <main className="w-full bg-white">
      {/* Section 1: Hero Section */}
      <section className="relative w-full h-[700px] md:h-[850px] overflow-hidden flex items-center justify-center bg-black">
        <Image
          src="/a_banner_for_uit_sneakers_vietnam_featuring_a_stylish_nike_sneaker._the.png"
          alt="Hero Product Image"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="relative z-10 text-center px-4 md:px-16 max-w-[1000px]">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 uppercase tracking-tight">
            CHÍNH HÃNG
            <br /> TRÊN TỪNG BƯỚC CHÂN
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto italic font-medium">
            Được thiết kế cho tốc độ. Xây dựng cho văn hoá. Sneaker Store là nơi
            hội tụ giữa hiệu suất và phong cách đường phố.
          </p>
          <Link
            href="/san-pham"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-sm md:text-base px-10 py-5 rounded uppercase tracking-wider transition-all transform hover:scale-105 shadow-xl"
          >
            KHÁM PHÁ BỘ SƯU TẬP
          </Link>
        </div>
      </section>

      {/* Section 2: Our Journey */}
      <section className="px-4 md:px-16 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 italic uppercase tracking-tighter">
              Chặng Đường Của Chúng Tôi
            </h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Được thành lập vào năm 2020, Sneaker Store bắt đầu như một dự án
                đầy đam mê tại một không gian lưu trữ nhỏ bé. Sứ mệnh của chúng
                tôi ngay từ ngày tiên khởi rất rõ ràng: thu hẹp khoảng cách giữa
                hiệu suất thể thao kỹ thuật cao và tính thẩm mỹ độc đáo của thời
                trang đường phố.
              </p>
              <p>
                Qua nhiều năm, chúng tôi đã phát triển thành điểm đến hàng đầu
                cho các nhà sưu tập và vận động viên. Chúng tôi không chỉ bán
                giày; chúng tôi kết nối, chọn lọc nhịp đập của sự đổi mới để
                mang tới những sản phẩm tuyệt vời nhất.
              </p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg overflow-hidden h-[400px] md:h-[600px] relative shadow-2xl">
            <Image
              src="/253-best-retro-sneakers-16232159-1440.webp"
              alt="Store Interior"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Mission & Vision */}
      <section className="px-4 md:px-16 py-24 bg-zinc-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-12 md:p-16 border-l-4 border-red-600 shadow-sm transition-transform hover:-translate-y-1">
            <h3 className="text-3xl font-black mb-6 uppercase italic tracking-tight">
              Sứ Mệnh
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tiếp thêm sức mạnh cho từng chuyển động thông qua các thiết kế
              mang tính cách mạng và tính nguyên bản tuyệt đối. Chúng tôi cung
              cấp những "công cụ" giúp vận động viên phá vỡ kỷ lục và các nhà
              sáng tạo vượt lên mọi chuẩn mực thời trang.
            </p>
          </div>
          <div className="bg-white p-12 md:p-16 border-l-4 border-black shadow-sm transition-transform hover:-translate-y-1">
            <h3 className="text-3xl font-black mb-6 uppercase italic tracking-tight">
              Tầm Nhìn
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Trở thành tâm điểm toàn cầu của văn hóa và công nghệ sneaker, nơi
              mỗi sản phẩm được trao đến tay khách hàng đều kể một câu chuyện
              bất tận về tốc độ, độ bền bỉ và ý nghĩa văn hóa sâu sắc.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Core Values */}
      <section className="px-4 md:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Tiêu Chuẩn Của SNEAKER STORE
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center p-10 bg-gray-50 rounded-xl hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <BadgeCheck
              className="text-red-600 w-16 h-16 mb-6"
              strokeWidth={1.5}
            />
            <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">
              100% Chính Hãng
            </h4>
            <p className="text-gray-600 text-lg">
              Tất cả sản phẩm đều được kiểm định bởi các chuyên gia uy tín.
              Chúng tôi cam kết luôn nói không với hàng giả, mang đến giá trị
              đích thực.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-10 bg-gray-50 rounded-xl hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <Zap className="text-red-600 w-16 h-16 mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">
              Giao Hàng Tốc Độ
            </h4>
            <p className="text-gray-600 text-lg">
              Hệ thống logistics được tối ưu hóa để vận hành nhanh nhất. Nhận
              ngay đôi sneaker yêu thích trước lúc bạn kịp mong chờ.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-10 bg-gray-50 rounded-xl hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <Headset
              className="text-red-600 w-16 h-16 mb-6"
              strokeWidth={1.5}
            />
            <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">
              Hỗ Trợ Tận Tâm
            </h4>
            <p className="text-gray-600 text-lg">
              Đội ngũ chăm sóc khách hàng đều là những người mê giày nhiệt
              huyết. Chúng tôi luôn sẵn lòng hỗ trợ bạn tìm ra sự lựa chọn hoàn
              hảo.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Community */}
      <section className="px-4 md:px-16 py-24 bg-white text-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header: Title và Socials nằm sát nhau trên cùng 1 hàng */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 border-b border-gray-100 pb-6">
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Tham Gia Cộng Đồng
            </h2>

            <div className="flex gap-4 md:gap-6">
              <a
                href="https://facebook.com/..."
                target="_blank"
                className="hover:text-blue-600 transition-transform hover:scale-110"
              >
                <svg
                  className="w-6 h-6 md:w-10 md:h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/..."
                target="_blank"
                className="hover:text-pink-600 transition-transform hover:scale-110"
              >
                <svg
                  className="w-6 h-6 md:w-10 md:h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/..."
                target="_blank"
                className="hover:text-red-600 transition-transform hover:scale-110"
              >
                <svg
                  className="w-6 h-6 md:w-10 md:h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Description nằm riêng ở dưới */}
          <p className="max-w-2xl text-lg text-gray-600 mb-12  italic width-full">
            Hơn cả khách hàng, chúng tôi là tập thể gắn kết bởi văn hóa sneaker.
            Gắn thẻ <span className="font-bold text-black">#UITSneakers</span>{" "}
            để cùng lan tỏa đam mê.
          </p>

          {/* Grid Hình ảnh (Có thể đổi thành Marquee như hướng dẫn trước nếu muốn trượt) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/adidas"
                className="absolute inset-0 z-20"
                aria-label="Xem giày Adidas chính hãng"
              >
                <Image
                    src="/brands/ADIDAS.webp"
                    alt="M1"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
              </Link>  
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/nike"
                className="absolute inset-0 z-20"
                aria-label="Xem giày Nike chính hãng"
              >            
                <Image
                    src="/brands/NIKE.webp"
                    alt="M2"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
              </Link>  
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/puma"
                className="absolute inset-0 z-20"
                aria-label="Xem giày Puma chính hãng"
              >
                <Image
                    src="/brands/PUMA.webp"
                    alt="M3"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
               </Link>
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/on-running"
                className="absolute inset-0 z-20"
                aria-label="Xem giày On Running chính hãng"
              >
                <Image
                    src="/brands/ON.webp"
                    alt="M4"
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
               </Link> 
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/hoka"
                className="absolute inset-0 z-20"
                aria-label="Xem giày Hoka chính hãng"
              >
                <Image
                src="/brands/HOKA.webp"
                alt="M1"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
              </Link>
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/asics"
                className="absolute inset-0 z-20"
                aria-label="Xem giày ASICS chính hãng"
              >
                <Image
                  src="/brands/ASICS.webp"
                  alt="M2"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
              </Link>
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/under-armour"
                className="absolute inset-0 z-20"
                aria-label="Xem giày Under Armour chính hãng"
              >
                <Image
                  src="/brands/UA.webp"
                  alt="M3"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
              </Link>
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden relative group">
              <Link
                href="/collections/crocs"
                className="absolute inset-0 z-20"
                aria-label="Xem giày Crocs chính hãng"
              >
                <Image
                  src="/brands/CROCS.webp"
                  alt="M4"
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
