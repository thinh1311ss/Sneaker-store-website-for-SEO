'use client';

import { useRouter, usePathname } from 'next/navigation';

interface BlogTagFilterProps {
  tags: string[];
  activeTag: string | null;
}

export default function BlogTagFilter({ tags, activeTag }: BlogTagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTag = (tag: string | null) => {
    if (tag) {
      router.push(`${pathname}?tag=${encodeURIComponent(tag)}`, { scroll: false });
    } else {
      router.push(pathname, { scroll: false });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleTag(null)}
        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest border transition ${
          activeTag === null
            ? "bg-black text-white border-black"
            : "bg-transparent text-gray-600 border-gray-300 hover:border-black hover:text-black"
        }`}
      >
        Tất cả
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTag(tag === activeTag ? null : tag)}
          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest border transition ${
            activeTag === tag
              ? "bg-black text-white border-black"
              : "bg-transparent text-gray-600 border-gray-300 hover:border-black hover:text-black"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}