import Link from 'next/link';
 
interface BreadcrumbItem {
  label: string;
  href?: string;
}
 
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
 
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-sm mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 flex-wrap">
        <li>
          <Link href="/" className="text-gray-500 hover:text-primary transition">
            Trang chủ
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="text-gray-300">/</span>
            {item.href ? (
              <Link href={item.href} className="text-gray-500 hover:text-primary transition">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}