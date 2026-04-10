import { Metadata } from "next";
import AdminBlogList from "@/components/AdminBlogList";

export const metadata: Metadata = {
  title: "Danh sách Blog | Sneaker Store Admin",
  description: "Trang quản lý danh sách bài viết blog dành cho admin.",
};

export default function AdminBlogListPage() {
  return <AdminBlogList />;
}
