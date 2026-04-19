import { getAllBrands } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';

// FIX: Metadata dùng siteConfig.name + domain đúng
export const metadata: Metadata = {
  title: `Thương Hiệu Giày Sneaker Chính Hãng | ${siteConfig.name}`,
  description: 'Khám phá các thương hiệu giày sneaker nổi tiếng: Nike, Adidas, HOKA, Puma, On Running, Under Armour, Asics. 100% chính hãng tại UIT Sneakers.',
  openGraph: {
    title: `Thương Hiệu Giày Sneaker Chính Hãng | ${siteConfig.name}`,
    description: 'Khám phá các thương hiệu giày sneaker nổi tiếng: Nike, Adidas, HOKA, Puma, On Running, Under Armour, Asics. 100% chính hãng tại UIT Sneakers.',
    url: `${siteConfig.url}/thuong-hieu`,
    type: 'website',
    siteName: siteConfig.name,
  },
  alternates: {
    canonical: `${siteConfig.url}/thuong-hieu`,
  },
};

const brandLogoMap: Record<string, string> = {
  'ON RUNNING':    '/brands/ON.webp',
  'ASICS':         '/brands/ASICS.webp',
  'HOKA':          '/brands/HOKA.webp',
  'UNDER ARMOUR':  '/brands/UA.webp',
  'PUMA':          '/brands/PUMA.webp',
  'NIKE':          '/brands/NIKE.webp',
  'ADIDAS':        '/brands/ADIDAS.webp',
};

export default async function BrandsPage() {
  const brands = await getAllBrands();
  const breadcrumbItems = [{ label: 'Thương hiệu' }];

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Thương Hiệu Nổi Bật
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Khám phá bộ sưu tập giày từ các thương hiệu hàng đầu thế giới. Chúng tôi cam kết
            mang đến những sản phẩm chính hãng với chất lượng tốt nhất.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {brands.map((brand) => {
            const slug = brand.toLowerCase().replace(/ /g, '-');
            const logoSrc = brandLogoMap[brand];

            return (
              <Link
                key={brand}
                href={`/collections/${slug}`}
                aria-label={`Xem giày ${brand} chính hãng`}
                className="bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors group"
                style={{ aspectRatio: '3/2' }}
              >
                {logoSrc ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={logoSrc}
                      alt={`Logo ${brand}`}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                ) : (
                  <span className="text-base font-black text-gray-700 tracking-tighter uppercase text-center px-3 group-hover:scale-105 transition-transform duration-300">
                    {brand}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}