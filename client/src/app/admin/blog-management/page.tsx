import { Metadata } from "next";
import BlogManagement from "@/components/BlogManagement";

export const metadata: Metadata = {
  title: "Quản lý Blog | Sneaker Store Admin",
  description: "Trang quản lý blog dành cho admin sneaker store.",
};

export default function AdminBlogManagementPage() {
  return <BlogManagement />;
}
