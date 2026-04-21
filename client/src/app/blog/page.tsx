import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import BlogTagFilter from "@/components/BlogTagFilter";
import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const metadata: Metadata = {
  title: `Blog Sneaker - Tin Tức, Review & Hướng Dẫn | ${siteConfig.name}`,
  description: "Tin tức sneaker mới nhất, review giày chính hãng, hướng dẫn chọn size, cách phối đồ với sneaker. Cập nhật liên tục tại UIT Sneakers Vietnam.",
  openGraph: {
    title: `Blog Sneaker - Tin Tức, Review & Hướng Dẫn | ${siteConfig.name}`,
    description: "Tin tức sneaker mới nhất, review giày chính hãng, hướng dẫn chọn size, cách phối đồ với sneaker.",
    url: `${siteConfig.url}/blog`,
    type: "website",
    siteName: siteConfig.name,
  },
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
};

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  author: string;
  createdAt: string;
}

const TAG_COLORS: Record<string, string> = {
  "Sneaker": "bg-black text-white",
  "Review": "bg-stone-700 text-white",
  "Style": "bg-stone-500 text-white",
  "Tin tức": "bg-red-600 text-white",
  "Hướng dẫn": "bg-stone-800 text-white",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function getBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BlogList({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const blogs = await getBlogs();
  const allTags = Array.from(new Set(blogs.flatMap((b) => b.tags))).filter(Boolean);

  const activeTag = searchParams.tag || null;
  const filtered = activeTag
    ? blogs.filter((b) => b.tags.includes(activeTag))
    : blogs;

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Blog | ${siteConfig.name}`,
    url: `${siteConfig.url}/blog`,
    description: "Tin tức, review và hướng dẫn về giày sneaker chính hãng.",
    blogPost: blogs.slice(0, 10).map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      url: `${siteConfig.url}/blog/${blog.slug}`,
      datePublished: blog.createdAt,
      author: { "@type": "Person", name: blog.author },
      description: blog.excerpt,
      ...(blog.coverImage && { image: blog.coverImage }),
    })),
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <Breadcrumb items={[{ label: "Blog" }]} />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-4 mb-10">
          <div>
            <h1
              className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              Blog
            </h1>
            <p className="text-gray-500 mt-3 text-base max-w-sm">
              Tin tức, review và câu chuyện về thế giới sneaker.
            </p>
          </div>

          {allTags.length > 0 && (
            <BlogTagFilter tags={allTags} activeTag={activeTag} />
          )}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-xl">Chưa có bài viết nào.</p>
          </div>
        )}

        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <article className="grid md:grid-cols-2 gap-0 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64 md:h-auto min-h-[320px] bg-gray-100 overflow-hidden">
                {featured.coverImage ? (
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-400 flex items-center justify-center">
                    <span className="text-5xl">👟</span>
                  </div>
                )}
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featured.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-bold uppercase tracking-widest px-2 py-1 ${TAG_COLORS[tag] || "bg-stone-100 text-stone-700"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2
                    className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4 group-hover:text-red-600 transition-colors"
                    style={{ fontFamily: "'Lora', Georgia, serif" }}
                  >
                    {featured.title}
                  </h2>
                  <p className="text-gray-500 text-base leading-relaxed line-clamp-3">
                    {featured.excerpt}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-gray-700">{featured.author}</span>
                    <span className="mx-2">·</span>
                    {formatDate(featured.createdAt)}
                  </div>
                  <span className="text-sm font-bold text-black group-hover:text-red-600 transition-colors">
                    Đọc bài →
                  </span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug}`}
                className="group bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <article>
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {blog.coverImage ? (
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                        <span className="text-3xl">👟</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {blog.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${TAG_COLORS[tag] || "bg-stone-100 text-stone-700"}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3
                      className="font-black text-gray-900 text-lg leading-tight mb-2 group-hover:text-red-600 transition-colors line-clamp-2"
                      style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                      {blog.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="text-xs text-gray-400 flex items-center justify-between">
                      <span>{blog.author}</span>
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}