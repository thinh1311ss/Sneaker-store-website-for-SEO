import { Metadata } from "next";
import AdminBlog from "@/components/AdminBlog";

export const metadata: Metadata = {
  title: "Quản lý Blog | Sneaker Store Admin",
  description: "Trang quản lý blog dành cho admin Sneaker Store.",
};

export default function AdminBlogPage() {
  return <AdminBlog />;
}
