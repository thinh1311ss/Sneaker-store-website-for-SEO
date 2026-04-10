"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Markdown renderer đơn giản không cần thư viện
function renderMarkdown(md: string): string {
  return md
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3 text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-black mt-10 mb-4 text-gray-900" style="font-family:Georgia,serif">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black mt-12 mb-5 text-gray-900" style="font-family:Georgia,serif">$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-black pl-5 my-6 text-gray-600 italic text-lg">$1</blockquote>')
    // Unordered list
    .replace(/^\- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700 mb-1">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-gray-700 mb-1">$1</li>')
    // Images
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="w-full rounded my-6 shadow-sm" />')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-red-600 underline hover:text-red-800 font-medium" target="_blank">$1</a>')
    // Code block
    .replace(/```[\w]*\n([\s\S]+?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded my-6 overflow-x-auto text-sm font-mono"><code>$1</code></pre>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    // Paragraphs
    .replace(/\n\n(.+?)(?=\n\n|$)/gs, (_, p) => {
      if (p.startsWith('<')) return p;
      return `<p class="text-gray-700 leading-relaxed mb-5 text-[17px]">${p.replace(/\n/g, ' ')}</p>`;
    });
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed");
      const data: Blog = await res.json();
      setBlog(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Không tìm thấy bài viết</h2>
          <Link href="/blog" className="text-red-600 hover:underline">← Quay lại Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
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
          <span>{formatDate(blog.createdAt)}</span>
          {blog.updatedAt !== blog.createdAt && (
            <>
              <span>·</span>
              <span className="italic">Cập nhật {formatDate(blog.updatedAt)}</span>
            </>
          )}
        </div>

        {/* Content */}
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