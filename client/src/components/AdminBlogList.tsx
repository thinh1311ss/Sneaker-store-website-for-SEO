"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  author: string;
  image?: string;
  createdAt: string;
}

export default function AdminBlogList() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      return;
    }

    fetchBlogs();
  }, [isAuthenticated, user, router]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Không thể tải danh sách bài viết.");
        return;
      }

      setBlogs(data.data || []);
    } catch (err) {
      console.error("fetchBlogs error:", err);
      setError("Lỗi khi tải danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    setMessage(null);
    setError(null);

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa bài viết này?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/blogs/delete/${blogId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Xóa bài viết thất bại.");
        return;
      }

      setMessage("Xóa bài viết thành công.");
      setBlogs((prev) => prev.filter((item) => item._id !== blogId));
    } catch (err) {
      console.error("delete blog error:", err);
      setError("Lỗi server khi xóa bài viết.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                Danh sách Blog
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Quản lý bài viết đã đăng, xem trước, và xóa khi cần.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/blog"
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Tạo bài viết mới
              </Link>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Admin: {user?.userName || "—"}
              </div>
            </div>
          </div>

          {message && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-sm shadow-sm">
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-100 px-4 py-4 text-slate-600 font-semibold">
              <div>Tiêu đề</div>
              <div className="hidden lg:block">Tác giả</div>
              <div>Ngày tạo</div>
              <div>Hành động</div>
            </div>
            {loading ? (
              <div className="px-4 py-10 text-center text-slate-500">
                Đang tải bài viết...
              </div>
            ) : blogs.length === 0 ? (
              <div className="px-4 py-10 text-center text-slate-500">
                Chưa có bài viết nào.
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 px-4 py-4 items-center last:border-b-0"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {blog.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {blog.summary || "Không có mô tả ngắn."}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      /{blog.slug}
                    </div>
                  </div>
                  <div className="hidden lg:block text-slate-700">
                    {blog.author || "Admin"}
                  </div>
                  <div className="text-slate-700">
                    {formatDate(blog.createdAt)}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Xem
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(blog._id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
