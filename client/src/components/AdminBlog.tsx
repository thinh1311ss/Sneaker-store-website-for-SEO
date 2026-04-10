"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminBlog() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
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
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    if (!content || content === "<p><br></p>") {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/admin/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          image: image.trim(),
          summary: summary.trim(),
          author: user?.userName || "",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || "Tạo bài viết thất bại.");
      } else {
        setMessage("Bài viết đã được đăng thành công.");
        setTitle("");
        setImage("");
        setSummary("");
        setContent("");
      }
    } catch (err) {
      console.error("Create blog error:", err);
      setError("Lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                Quản lý Blog
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Tạo bài viết mới cho trang tin tức và tối ưu SEO.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/blog/list"
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Xem danh sách bài viết
              </Link>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Admin: {user?.userName || "—"}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {message && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="Nhập tiêu đề SEO"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Ảnh bài viết
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="URL ảnh đại diện"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mô tả ngắn
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Mô tả ngắn dùng cho meta description"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nội dung bài viết
              </label>
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Nhập nội dung bài viết..."
                  className="min-h-[320px] rounded-3xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Nội dung bài viết sẽ được lưu kèm HTML, phù hợp với SEO và hiển
                thị rich text.
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Đang đăng..." : "Đăng bài"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
