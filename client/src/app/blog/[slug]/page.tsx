import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Dynamic metadata - mỗi bài blog có title/description riêng
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return { title: `Bài viết không tồn tại | ${siteConfig.name}` };
  }

  const pageUrl = `${siteConfig.url}/blog/${blog.slug}`;

  return {
    title: `${blog.title} | ${siteConfig.name}`,
    description: blog.excerpt.substring(0, 160),
    keywords: blog.tags,
    openGraph: {
      title: blog.title,
      description: blog.excerpt.substring(0, 160),
      url: pageUrl,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author],
      tags: blog.tags,
      siteName: siteConfig.name,
      ...(blog.coverImage && {
        images: [
          {
            url: blog.coverImage,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
      }),
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Markdown renderer
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3 text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black mt-10 mb-4 text-gray-900" style="font-family:Georgia,serif">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black mt-12 mb-5 text-gray-900" style="font-family:Georgia,serif">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-black pl-5 my-6 text-gray-600 italic text-lg">$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700 mb-1">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-700 mb-1">$1</li>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="w-full rounded my-6 shadow-sm" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-red-600 underline hover:text-red-800 font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/```[\w]*\n([\s\S]+?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded my-6 overflow-x-auto text-sm font-mono"><code>$1</code></pre>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    .replace(/\n\n(.+?)(?=\n\n|$)/gs, (_, p) => {
      if (p.startsWith('<')) return p;
      return `<p class="text-gray-700 leading-relaxed mb-5 text-[17px]">${p.replace(/\n/g, ' ')}</p>`;
    });
}

export default async function BlogDetail({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  // Article Schema cho Google
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    url: `${siteConfig.url}/blog/${blog.slug}`,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Person",
      name: blog.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/Logo_UITSneaker_v2.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${blog.slug}`,
    },
    keywords: blog.tags.join(", "),
    ...(blog.coverImage && {
      image: {
        "@type": "ImageObject",
        url: blog.coverImage,
      },
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteConfig.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: `${siteConfig.url}/blog/${blog.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="w-full h-[50vh] overflow-hidden">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Breadcrumb
          items={[
            { label: "Blog", href: "/blog" },
            { label: blog.title },
          ]}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6 mb-5">
          {blog.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-black text-white hover:bg-red-600 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-500 pb-8 border-b border-gray-200 mb-10">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
            {blog.author.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-700">{blog.author}</span>
          <span>·</span>
          <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
          {blog.updatedAt !== blog.createdAt && (
            <>
              <span>·</span>
              <span className="italic">Cập nhật <time dateTime={blog.updatedAt}>{formatDate(blog.updatedAt)}</time></span>
            </>
          )}
        </div>

        {/* Content - render trên server, Google thấy ngay */}
        <article
          className="prose-sneaker"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
        />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/blog"
            className="text-sm font-bold text-gray-600 hover:text-black transition-colors"
          >
            ← Tất cả bài viết
          </Link>
          <div className="flex gap-2">
            {blog.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="text-xs text-gray-500 hover:text-black border border-gray-300 hover:border-black px-2 py-1 transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}