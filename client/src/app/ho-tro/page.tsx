import { Metadata } from "next";
import FAQPage from "@/components/FAQPage";

export const metadata: Metadata = {
  title: "Hỗ trợ | Sneaker Store",
  description:
    "Hỗ trợ khách hàng của Sneaker Store với các câu hỏi thường gặp và thông tin cần thiết.",
};

export default function FAQ() {
  return <FAQPage />;
}
