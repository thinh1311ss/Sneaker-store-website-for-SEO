'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

interface ShopFilterProps {
  brands: string[];
  currentBrand?: string | null;
  availableSizes?: string[];
  hideBrandFilter?: boolean;
}

// Generate US sizes from 2 to 15 with 0.5 increments
const US_SIZES: string[] = [];
for (let size = 2; size <= 15; size += 0.5) {
  US_SIZES.push(`US ${size % 1 === 0 ? size.toFixed(0) : size.toFixed(1)}`);
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ title, children, defaultOpen = true }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="font-bold text-gray-900 uppercase text-sm tracking-wide">{title}</span>
        <span className="text-gray-400 group-hover:text-gray-700 transition-colors">
          <ChevronIcon open={open} />
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ShopFilter({
  brands,
  currentBrand = null,
  availableSizes = [],
  hideBrandFilter = false,
}: ShopFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSizes = searchParams.getAll('size');
  const currentBrands = searchParams.getAll('brand');
  const currentDiscounts = searchParams.getAll('discount');

  const createQueryString = useCallback(
    (name: string, value: string, isChecked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (isChecked) {
        params.append(name, value);
      } else {
        const values = params.getAll(name);
        params.delete(name);
        values.filter((v) => v !== value).forEach((v) => params.append(name, v));
      }

      params.delete('page');

      return params.toString();
    },
    [searchParams]
  );

  const handleCheckboxChange =
    (name: string, value: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      router.push(pathname + '?' + createQueryString(name, value, e.target.checked));
    };

  const discountRanges = [
    { label: 'Dưới 10%', value: '0-10' },
    { label: '10% - 20%', value: '10-20' },
    { label: '20% - 30%', value: '20-30' },
    { label: '30% - 40%', value: '30-40' },
    { label: '40% - 50%', value: '40-50' },
    { label: 'Trên 50%', value: '50-100' },
  ];

  return (
    <div className="flex flex-col">
      {/* Brand Filter */}
      {!hideBrandFilter && (
        <AccordionSection title="Thương hiệu" defaultOpen={true}>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={currentBrands.includes(brand) || currentBrand === brand}
                  onChange={handleCheckboxChange('brand', brand)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Size Filter — fixed US 2 → US 15 (0.5 increments) */}
      <AccordionSection title="Kích thước" defaultOpen={true}>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {US_SIZES.map((size) => (
            <label key={size} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={currentSizes.includes(size)}
                onChange={handleCheckboxChange('size', size)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                {size}
              </span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Discount Filter */}
      <AccordionSection title="Phần trăm giảm giá" defaultOpen={true}>
        <div className="space-y-2">
          {discountRanges.map((range) => (
            <label key={range.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={currentDiscounts.includes(range.value)}
                onChange={handleCheckboxChange('discount', range.value)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </AccordionSection>
    </div>
  );
}