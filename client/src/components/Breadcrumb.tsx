import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxLabelLength?: number; // ký tự tối đa cho mỗi item, default 40
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

export default function Breadcrumb({ items, maxLabelLength = 40 }: BreadcrumbProps) {
  return (
    <nav className="text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-y-1">
        <li className="flex items-center">
          <Link href="/" className="text-gray-500 hover:text-primary transition whitespace-nowrap">
            Trang chủ
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center min-w-0">
            <span className="text-gray-300 mx-2 flex-shrink-0">/</span>
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-primary transition truncate"
                title={item.label}
              >
                {truncate(item.label, maxLabelLength)}
              </Link>
            ) : (
              <span
                className="text-gray-900 font-medium truncate"
                title={item.label}
              >
                {truncate(item.label, maxLabelLength)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}