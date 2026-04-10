import { Metadata } from "next";
import BlogDetailPage from "@/components/BlogDetail";

export const metadata: Metadata = {
  title: "Blog | Sneaker Store",
  description: "Trang blog của Sneaker Store.",
};

export default function BlogDetail() {
  return <BlogDetailPage />;
}
