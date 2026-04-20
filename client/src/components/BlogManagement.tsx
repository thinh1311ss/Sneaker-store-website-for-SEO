"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-40 w-full animate-pulse bg-slate-100 rounded-3xl" />,
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

// ─── Modal chèn ảnh / gallery ─────────────────────────────────────────────────
function InsertMediaModal({
  mode,
  onClose,
  onInsert,
}: {
  mode: "image" | "gallery";
  onClose: () => void;
  onInsert: (text: string) => void;
}) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [caption, setCaption] = useState("");

  const addUrl = () => setUrls((p) => [...p, ""]);
  const updateUrl = (i: number, val: string) =>
    setUrls((p) => p.map((u, idx) => (idx === i ? val : u)));
  const removeUrl = (i: number) =>
    setUrls((p) => p.filter((_, idx) => idx !== i));

  const validUrls = urls.map((u) => u.trim()).filter(Boolean);

  const preview =
    mode === "image"
      ? `[image:${validUrls[0] || "URL_ảnh"}${caption ? `|${caption}` : ""}]`
      : `[gallery:${validUrls.join(",") || "URL1,URL2"}${caption ? `|${caption}` : ""}]`;

  const handleInsert = () => {
    if (!validUrls.length) return;
    onInsert(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === "image" ? "📷 Chèn ảnh đơn" : "🖼️ Chèn bộ ảnh slide"}
          </h2>
          <button onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          {/* URL inputs */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {mode === "image" ? "URL ảnh" : "URL các ảnh"}
            </label>
            <div className="space-y-2">
              {(mode === "image" ? [urls[0]] : urls).map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={url}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    placeholder={`https://cdn.example.com/anh-${i + 1}.jpg`}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                  {mode === "gallery" && urls.length > 1 && (
                    <button onClick={() => removeUrl(i)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 hover:bg-rose-100">
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
            {mode === "gallery" && (
              <button onClick={addUrl}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline">
                + Thêm ảnh
              </button>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Chú thích <span className="text-slate-400 font-normal">(không bắt buộc)</span>
            </label>
            <input type="text" value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ví dụ: Nike Dunk Low Retro phối streetwear 2026"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Preview syntax */}
          <div>
            <p className="mb-1 text-xs text-slate-500">Cú pháp sẽ được chèn:</p>
            <div className="rounded-xl bg-slate-100 px-3 py-2 font-mono text-xs text-slate-600 break-all">
              {preview}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-3xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Hủy
          </button>
          <button onClick={handleInsert} disabled={!validUrls.length}
            className="rounded-3xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
            Chèn vào bài
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BlogManagement() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [modal, setModal] = useState<"image" | "gallery" | null>(null);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (user?.role !== "admin") { router.push("/"); return; }
    fetchBlogs();
  }, [isAuthenticated, user, router]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog-admin/list`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await response.json();
      if (!response.ok) { setAlert({ type: "error", message: data.error || "Không thể tải danh sách blog." }); return; }
      setBlogs(Array.isArray(data) ? data : []);
    } catch {
      setAlert({ type: "error", message: "Lỗi kết nối server." });
    } finally {
      setLoading(false);
    }
  };

  // Chèn block vào vị trí con trỏ textarea
  const insertAtCursor = (text: string) => {
    const el = contentRef.current;
    if (!el) {
      setContent((prev) => prev + "\n\n" + text + "\n\n");
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const inserted = before + "\n\n" + text + "\n\n" + after;
    setContent(inserted);
    setTimeout(() => {
      const pos = before.length + text.length + 4;
      el.setSelectionRange(pos, pos);
      el.focus();
    }, 0);
  };

  const handleSubmit = async () => {
    setAlert(null);
    if (!title.trim() || !content.trim()) {
      setAlert({ type: "error", message: "Vui lòng nhập tiêu đề và nội dung." });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
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
      if (!response.ok) { setAlert({ type: "error", message: data.error || "Lưu bài viết thất bại." }); return; }
      setAlert({ type: "success", message: "Đăng bài viết thành công!" });
      setTitle(""); setExcerpt(""); setCoverImage(""); setContent("");
      fetchBlogs();
    } catch {
      setAlert({ type: "error", message: "Lỗi hệ thống, vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/delete/${blogId}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (response.ok) {
        setAlert({ type: "success", message: "Đã xóa bài viết." });
        setBlogs((prev) => prev.filter((b) => b._id !== blogId));
      } else {
        setAlert({ type: "error", message: "Xóa thất bại." });
      }
    } catch {
      setAlert({ type: "error", message: "Lỗi khi xóa bài viết." });
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("vi-VN");

  return (
    <>
      {modal && (
        <InsertMediaModal
          mode={modal}
          onClose={() => setModal(null)}
          onInsert={insertAtCursor}
        />
      )}

      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10 font-sans">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Quản lý nội dung Blog</h1>
              <p className="mt-2 text-slate-500">Soạn thảo bài viết mới và quản lý các nội dung hiện có.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Admin: {user?.userName || "Admin"}
            </div>
          </div>

          {alert && (
            <div className={`mb-6 rounded-2xl border p-4 text-sm font-medium ${
              alert.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}>
              {alert.message}
            </div>
          )}

          <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">

            {/* Cột Trái: Danh sách */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Bài viết đã đăng</h2>
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
                      <tr><td colSpan={3} className="py-10 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
                    ) : blogs.length === 0 ? (
                      <tr><td colSpan={3} className="py-10 text-center text-slate-400">Chưa có bài viết nào.</td></tr>
                    ) : (
                      blogs.map((blog) => (
                        <tr key={blog._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-100">
                              {blog.coverImage
                                ? <img src={blog.coverImage} className="h-full w-full object-cover" alt="thumb" />
                                : <div className="flex h-full items-center justify-center text-[10px] text-slate-400">No Image</div>
                              }
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-slate-900 line-clamp-1">{blog.title}</p>
                            <p className="text-xs text-slate-500">{formatDate(blog.createdAt)} · {blog.author}</p>
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={() => handleDelete(blog._id)}
                              className="text-rose-600 hover:text-rose-800 font-semibold">
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

            {/* Cột Phải: Form soạn bài */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Soạn bài viết mới</h2>
              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tiêu đề bài viết</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="Ví dụ: Top 5 sneaker retro hot nhất 2026..." />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả ngắn (Excerpt)</label>
                  <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="Tóm tắt nội dung bài viết..." />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">URL ảnh đại diện (cover)</label>
                  <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="https://example.com/image.jpg" />
                </div>

                {/* Editor + toolbar chèn ảnh */}
                <div>
                  <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                    <label className="text-sm font-semibold text-slate-700">Nội dung bài viết</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Chèn:</span>

                      {/* Ảnh đơn */}
                      <button type="button" onClick={() => setModal("image")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition">
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="2" y="4" width="16" height="12" rx="2"/>
                          <circle cx="7" cy="8.5" r="1.5"/>
                          <path d="M2 14l4-4 3 3 3-3 6 4"/>
                        </svg>
                        Ảnh đơn
                      </button>

                      {/* Gallery */}
                      <button type="button" onClick={() => setModal("gallery")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition">
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="1" y="5" width="12" height="10" rx="1.5"/>
                          <rect x="7" y="3" width="12" height="10" rx="1.5" opacity="0.45"/>
                          <circle cx="5" cy="9" r="1.2"/>
                          <path d="M1 13l3-3 2.5 2.5 2-2 4.5 4"/>
                        </svg>
                        Slide ảnh
                      </button>
                    </div>
                  </div>

                  {/* Textarea thay vì ReactQuill để hỗ trợ chèn block tự do */}
                  <textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={18}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 leading-relaxed transition-all resize-y"
                    placeholder={`Nhập nội dung bài viết...\n\nHỗ trợ Markdown cơ bản:\n## Tiêu đề H2\n**in đậm**, *in nghiêng*\n- danh sách\n\nChèn ảnh đơn:\n[image:https://example.com/anh.jpg|Chú thích]\n\nChèn slide ảnh:\n[gallery:https://url1.jpg,https://url2.jpg|Tên bộ ảnh]`}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Dùng nút <strong>Ảnh đơn</strong> / <strong>Slide ảnh</strong> để chèn khối ảnh đúng vị trí con trỏ.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-600">Xuất bản ngay</span>
                  </label>

                  <button onClick={handleSubmit} disabled={saving}
                    className="rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400 transition-all active:scale-95">
                    {saving ? "Đang xử lý..." : "Đăng bài viết"}
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}