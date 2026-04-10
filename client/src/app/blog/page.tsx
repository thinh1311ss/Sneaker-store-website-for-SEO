import { Metadata } from "next";
import BlogPage from "@/components/BlogPage";

export const metadata: Metadata = {
  title: "Blog | Sneaker Store",
  description: "Trang blog của Sneaker Store.",
};

export default function BlogList() {
  return <BlogPage />;
}
