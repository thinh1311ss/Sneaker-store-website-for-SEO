'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export default function ShopSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'newest';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page when sorting
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value;
    router.push(pathname + '?' + createQueryString('sort', sort));
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
      <select
        id="sort-filter"
        value={currentSort}
        onChange={handleSortChange}
        className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-sm focus:ring-black focus:border-black outline-none"
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="price-asc">Giá: Thấp đến Cao</option>
        <option value="price-desc">Giá: Cao đến Thấp</option>
        <option value="name-asc">Tên: A-Z</option>
        <option value="name-desc">Tên: Z-A</option>
      </select>
    </div>
  );
}