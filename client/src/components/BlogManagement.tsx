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
  tags: string[];
  author: string;
  published: boolean;
  createdAt: string;
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

// ─── Tag input component ──────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const val = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div
      className="min-h-[46px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
      onClick={() => document.getElementById("tag-input-field")?.focus()}
    >
      {tags.map((tag) => (
        <span key={tag}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
          #{tag}
          <button type="button" onClick={() => removeTag(tag)}
            className="ml-0.5 text-slate-300 hover:text-white leading-none text-sm">×</button>
        </span>
      ))}
      <input
        id="tag-input-field"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? "Nhập tag rồi nhấn Enter hoặc dấu phẩy..." : ""}
        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
      />
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

  // Form fields
  const [editingId, setEditingId] = useState<string | null>(null); // null = create mode
  const [title, setTitle] = useState("");
  const [slugField, setSlugField] = useState("");
  const [slugManual, setSlugManual] = useState(false); // if true, don't auto-update slug from title
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
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

  // Auto-generate slug from title (only when not manually edited)
  useEffect(() => {
    if (!slugManual) {
      setSlugField(toSlug(title));
    }
  }, [title, slugManual]);

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

  // Load blog into form for editing
  const handleEdit = (blog: BlogItem) => {
    setEditingId(blog._id);
    setTitle(blog.title);
    setSlugField(blog.slug);
    setSlugManual(true); // don't overwrite existing slug
    setExcerpt(blog.excerpt || "");
    setCoverImage(blog.coverImage || "");
    setTags(blog.tags || []);
    setContent(""); // content not loaded in list — fetch separately
    setIsPublished(blog.published);
    setAlert(null);
    // Fetch full content
    fetch(`${API_BASE_URL}/api/blog/${blog.slug}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.content) setContent(data.content);
      })
      .catch(() => {});
    // Scroll to form
    setTimeout(() => {
      document.getElementById("blog-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlugField("");
    setSlugManual(false);
    setExcerpt("");
    setCoverImage("");
    setTags([]);
    setContent("");
    setIsPublished(true);
  };

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
    if (!slugField.trim()) {
      setAlert({ type: "error", message: "Slug không được để trống." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slugField.trim(),
        excerpt: excerpt.trim(),
        coverImage: coverImage.trim(),
        tags,
        content,
        author: user?.userName || "Admin",
        published: isPublished,
      };

      const isEditing = !!editingId;
      const url = isEditing
        ? `${API_BASE_URL}/api/blog/update/${editingId}`
        : `${API_BASE_URL}/api/blog/create`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setAlert({ type: "error", message: data.error || (isEditing ? "Cập nhật thất bại." : "Lưu bài viết thất bại.") });
        return;
      }
      setAlert({ type: "success", message: isEditing ? "Cập nhật bài viết thành công!" : "Đăng bài viết thành công!" });
      resetForm();
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
        if (editingId === blogId) resetForm();
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
                        <tr key={blog._id}
                          className={`hover:bg-slate-50 transition-colors ${editingId === blog._id ? "bg-blue-50" : ""}`}>
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
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(blog.createdAt)} · {blog.author}</p>
                            {blog.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {blog.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => handleEdit(blog)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition whitespace-nowrap ${
                                  editingId === blog._id
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                                }`}>
                                {editingId === blog._id ? "✎ Đang sửa" : "Sửa"}
                              </button>
                              <button
                                onClick={() => handleDelete(blog._id)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition whitespace-nowrap">
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Cột Phải: Form soạn/chỉnh sửa bài */}
            <section id="blog-form-section" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "✎ Chỉnh sửa bài viết" : "Soạn bài viết mới"}
                </h2>
                {editingId && (
                  <button onClick={resetForm}
                    className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition">
                    + Tạo bài mới
                  </button>
                )}
              </div>

              <div className="space-y-5">

                {/* Tiêu đề */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tiêu đề bài viết</label>
                  <input type="text" value={title}
                    onChange={(e) => { setTitle(e.target.value); }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="Ví dụ: Top 5 sneaker retro hot nhất 2026..." />
                </div>

                {/* Slug */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Slug (URL)
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      → /blog/<span className="text-blue-500">{slugField || "..."}</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={slugField}
                    onChange={(e) => {
                      setSlugManual(true);
                      setSlugField(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"));
                    }}
                    onFocus={() => setSlugManual(true)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="vi-du-slug-bai-viet"
                  />
                  {!slugManual && (
                    <p className="mt-1 text-xs text-slate-400">Tự động tạo từ tiêu đề. Chỉnh sửa để tuỳ chỉnh.</p>
                  )}
                  {slugManual && (
                    <button
                      type="button"
                      onClick={() => { setSlugManual(false); setSlugField(toSlug(title)); }}
                      className="mt-1 text-xs text-blue-500 hover:underline">
                      ↺ Tạo lại từ tiêu đề
                    </button>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả ngắn (Excerpt)</label>
                  <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="Tóm tắt nội dung bài viết..." />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">URL ảnh đại diện (cover)</label>
                  <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="https://example.com/image.jpg" />
                  {coverImage && (
                    <img src={coverImage} alt="Cover preview"
                      className="mt-2 h-28 w-full rounded-2xl object-cover border border-slate-200" />
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tags
                    <span className="ml-2 text-xs font-normal text-slate-400">Nhấn Enter hoặc dấu phẩy để thêm</span>
                  </label>
                  <TagInput tags={tags} onChange={setTags} />
                </div>

                {/* Content Editor */}
                <div>
                  <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
                    <label className="text-sm font-semibold text-slate-700">Nội dung bài viết</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Chèn:</span>
                      <button type="button" onClick={() => setModal("image")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition">
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="2" y="4" width="16" height="12" rx="2"/>
                          <circle cx="7" cy="8.5" r="1.5"/>
                          <path d="M2 14l4-4 3 3 3-3 6 4"/>
                        </svg>
                        Ảnh đơn
                      </button>
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

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-600">Xuất bản ngay</span>
                  </label>

                  <div className="flex gap-3">
                    {editingId && (
                      <button onClick={resetForm}
                        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                        Hủy sửa
                      </button>
                    )}
                    <button onClick={handleSubmit} disabled={saving}
                      className="rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-400 transition-all active:scale-95">
                      {saving
                        ? "Đang xử lý..."
                        : editingId
                        ? "Lưu thay đổi"
                        : "Đăng bài viết"}
                    </button>
                  </div>
                </div>

              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}