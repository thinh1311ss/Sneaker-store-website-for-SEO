"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  author: string;
  createdAt: string;
}

export default function BlogManagement() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
    setAlert(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setAlert({ type: "error", message: data.error || "Không thể tải danh sách blog." });
        return;
      }
      setBlogs(data.data || []);
    } catch (error) {
      console.error("fetchBlogs error", error);
      setAlert({ type: "error", message: "Lỗi khi tải danh sách blog." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setAlert(null);
    if (!title.trim() || !content.trim() || content === "<p><br></p>") {
      setAlert({ type: "error", message: "Vui lòng nhập tiêu đề và nội dung bài viết." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          thumbnail: thumbnail.trim(),
          content,
          author: user?.userName || "Admin",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAlert({ type: "error", message: data.error || data.message || "Lưu bài viết thất bại." });
        return;
      }
      setAlert({ type: "success", message: "Đã lưu bài viết thành công." });
      setTitle("");
      setSummary("");
      setThumbnail("");
      setContent("");
      fetchBlogs();
    } catch (error) {
      console.error("create blog error", error);
      setAlert({ type: "error", message: "Lỗi kết nối. Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bài viết này?");
    if (!confirmed) return;

    setAlert(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/admin/delete/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setAlert({ type: "error", message: data.error || data.message || "Xóa bài viết thất bại." });
        return;
      }
      setAlert({ type: "success", message: "Đã xóa bài viết." });
      setBlogs((prev) => prev.filter((item) => item._id !== blogId));
    } catch (error) {
      console.error("delete blog error", error);
      setAlert({ type: "error", message: "Lỗi server khi xóa bài viết." });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Quản lý Blog</h1>
            <p className="mt-2 text-sm text-slate-500">
              Quản lý danh sách bài viết, thêm mới và xóa bài viết nhanh chóng.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
            Admin: {user?.userName || "—"}
          </div>
        </div>

        {alert && (
          <div
            className={`mb-6 rounded-3xl px-5 py-4 text-sm font-medium ${
              alert.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {alert.message}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Danh sách Blog</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Hiển thị các bài viết đã có và xóa nếu cần.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {blogs.length} bài viết
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Hình ảnh</th>
                    <th className="px-4 py-3">Tiêu đề</th>
                    <th className="px-4 py-3">Ngày đăng</th>
                    <th className="px-4 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        Đang tải danh sách...
                      </td>
                    </tr>
                  ) : blogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        Chưa có bài viết nào.
                      </td>
                    </tr>
                  ) : (
                    blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="h-16 w-24 overflow-hidden rounded-2xl bg-slate-100">
                            {blog.thumbnail ? (
                              <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-900">
                          <div className="font-semibold">{blog.title}</div>
                          <div className="mt-1 text-xs text-slate-500">/{blog.slug}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(blog.createdAt)}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleDelete(blog._id)}
                            className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Thêm bài viết mới</h2>
              <p className="mt-1 text-sm text-slate-500">
                Nhập thông tin và nội dung, sau đó lưu để đăng bài.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="Nhập tiêu đề bài viết"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Mô tả ngắn</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="Mô tả ngắn dùng cho SEO và meta description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Link ảnh đại diện</label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="URL ảnh thumbnail"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nội dung</label>
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="Nhập nội dung bài viết..."
                    className="min-h-[280px] rounded-3xl"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? "Đang lưu..." : "Lưu bài viết"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
