"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Import ReactQuill động để tránh lỗi SSR trong Next.js
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full animate-pulse bg-slate-100 rounded-3xl" />
  ),
});
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
  published: boolean;
  createdAt: string;
}

export default function BlogManagement() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  // State quản lý danh sách và form
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State (Khớp với BlogSchema của bạn)
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  // Lấy danh sách blog cho Admin
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog-admin/list`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setAlert({
          type: "error",
          message: data.error || "Không thể tải danh sách blog.",
        });
        return;
      }
      // Backend trả về mảng trực tiếp [blog1, blog2...]
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      setAlert({ type: "error", message: "Lỗi kết nối server." });
    } finally {
      setLoading(false);
    }
  };

  // Gửi bài viết mới
  const handleSubmit = async () => {
    setAlert(null);
    if (!title.trim() || !content.trim() || content === "<p><br></p>") {
      setAlert({
        type: "error",
        message: "Vui lòng nhập tiêu đề và nội dung.",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim(),
          coverImage: coverImage.trim(),
          content,
          author: user?.userName || "Admin",
          published: isPublished,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAlert({
          type: "error",
          message: data.error || "Lưu bài viết thất bại.",
        });
        return;
      }

      setAlert({ type: "success", message: "Đăng bài viết thành công!" });
      // Reset form
      setTitle("");
      setExcerpt("");
      setCoverImage("");
      setContent("");
      fetchBlogs(); // Cập nhật lại danh sách
    } catch (error) {
      setAlert({ type: "error", message: "Lỗi hệ thống, vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };

  // Xóa bài viết
  const handleDelete = async (blogId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?"))
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/blog/delete/${blogId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      if (response.ok) {
        setAlert({ type: "success", message: "Đã xóa bài viết." });
        setBlogs((prev) => prev.filter((b) => b._id !== blogId));
      } else {
        setAlert({ type: "error", message: "Xóa thất bại." });
      }
    } catch (error) {
      setAlert({ type: "error", message: "Lỗi khi xóa bài viết." });
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Quản lý nội dung Blog
            </h1>
            <p className="mt-2 text-slate-500">
              Soạn thảo bài viết mới và quản lý các nội dung hiện có.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Admin: {user?.userName || "Admin"}
          </div>
        </div>

        {alert && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-medium ${
              alert.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {alert.message}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
          {/* Cột Trái: Danh sách */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Bài viết đã đăng
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Ảnh</th>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-10 text-center text-slate-400"
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : (
                    blogs.map((blog) => (
                      <tr
                        key={blog._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-100">
                            {blog.coverImage ? (
                              <img
                                src={blog.coverImage}
                                className="h-full w-full object-cover"
                                alt="thumb"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                                No Image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900 line-clamp-1">
                            {blog.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(blog.createdAt)} • {blog.author}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cột Phải: Form thêm mới */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Soạn bài viết mới
            </h2>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="Ví dụ: Hướng dẫn chăm sóc giày sneaker..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mô tả ngắn (Excerpt)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="Tóm tắt nội dung bài viết..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  URL Ảnh đại diện
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nội dung bài viết
                </label>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="Bắt đầu viết nội dung tại đây..."
                    className="min-h-[300px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-600">
                    Xuất bản ngay
                  </span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 disabled:bg-slate-400 transition-all active:scale-95"
                >
                  {saving ? "Đang xử lý..." : "Đăng bài viết"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
