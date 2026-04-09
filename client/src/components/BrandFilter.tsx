'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface BrandFilterProps {
  brands: string[];
}

export default function BrandFilter({ brands }: BrandFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentBrands = searchParams.getAll('brand');

  const handleAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('brand');
    params.delete('page');
    router.replace(pathname + (params.toString() ? '?' + params.toString() : ''), { scroll: false });
  };

  const handleBrand = useCallback(
    (brand: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      if (currentBrands.includes(brand)) {
        const remaining = currentBrands.filter((b) => b !== brand);
        params.delete('brand');
        remaining.forEach((b) => params.append('brand', b));
      } else {
        params.append('brand', brand);
      }

      router.replace(pathname + '?' + params.toString(), { scroll: false });
    },
    [searchParams, currentBrands, pathname, router]
  );

  const isAllSelected = currentBrands.length === 0;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={handleAll}
        className={`px-6 py-2 rounded-full border transition ${
          isAllSelected
            ? 'bg-black text-white border-black'
            : 'border-gray-300 hover:border-black'
        }`}
      >
        Tất cả
      </button>
      {brands.map((brand) => (
        <button
          key={brand}
          onClick={() => handleBrand(brand)}
          className={`px-6 py-2 rounded-full border transition ${
            currentBrands.includes(brand)
              ? 'bg-black text-white border-black'
              : 'border-gray-300 hover:border-black'
          }`}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}