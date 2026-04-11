"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/api";
import Link from "next/link";
import ShopFilter from "@/components/ShopFilter";
import ShopSort from "@/components/ShopSort";
import Breadcrumb from "@/components/Breadcrumb";
import { Suspense } from "react";

interface BackendProduct {
  _id: string;
  productName: string;
  brand: string;
  price: number;
  category: string;
  sizes: Record<string, number>;
  description: string;
  quantity: number;
  images: string[];
  discountPercent?: number;
  originalPrice?: number | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function SearchPageInner() {
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const selectedSizes = searchParams.getAll("size");
  const selectedDiscounts = searchParams.getAll("discount");
  const currentSort = searchParams.get("sort") || "newest";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products khi query thay đổi
  useEffect(() => {
    if (!query.trim()) {
      setAllProducts([]);
      return;
    }
    fetchProducts();
  }, [query]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchUrl = new URL(`${API_BASE_URL}/api/product/search`);
      searchUrl.searchParams.append("q", query);

      const response = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "API trả về lỗi");

      const transformed = transformProducts(data.data || []);
      setAllProducts(transformed);
    } catch (err) {
      let errorMessage = "Lỗi khi tìm kiếm sản phẩm";
      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const transformProducts = (backendProducts: BackendProduct[]): Product[] => {
    return backendProducts.map((p, index) => ({
      id: index + 1,
      _id: p._id,
      name: p.productName,
      brand: p.brand,
      price: p.price,
      originalPrice: p.originalPrice || null,
      discount: p.discountPercent || null,
      image: p.images?.[0] || "/placeholder.png",
      images: p.images || [],
      slug: p.productName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim(),
      category: p.category,
      description: p.description,
      sizes: Object.keys(p.sizes || {})
        .filter((size) => p.sizes[size] > 0)
        .map((size) => size.replace("_", ".").replace("US", "US "))
        .join(", "),
      sizesObj: p.sizes,
      quantity: p.quantity,
      specs: "",
      careGuide: "",
      storageGuide: "",
    }));
  };

  // Apply filters & sort trên client
  const filteredProducts = (() => {
    let result = [...allProducts];

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) => {
        if (!p.sizes) return false;
        const productSizes = p.sizes.split(", ");
        return selectedSizes.some((size) => productSizes.includes(size));
      });
    }

    // Discount filter
    if (selectedDiscounts.length > 0) {
      result = result.filter((p) => {
        if (!p.discount) return false;
        return selectedDiscounts.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return p.discount! >= min && p.discount! <= max;
        });
      });
    }

    // Sort
    if (currentSort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (currentSort === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  })();

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: `Tìm kiếm: "${query}"` }]} />

      <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-100 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              Kết quả tìm kiếm cho &quot;{query}&quot;
            </h1>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Nếu vẫn chưa tìm thấy sản phẩm ưng ý! 
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Hãy thử <Link href="/ho-tro#lien-he" className="text-red-600 hover:underline">liên hệ với chúng tôi</Link> để được tư vấn và hỗ trợ ngay nhé.
            </p>
       </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tìm kiếm...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      ) : allProducts.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600 mb-8">
            Không có sản phẩm nào phù hợp với &quot;{query}&quot;
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <div className="lg:w-1/4 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <ShopFilter
                brands={[]}
                hideBrandFilter={true}
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 text-sm">
                Hiển thị{" "}
                <span className="font-bold text-gray-900">
                  {filteredProducts.length}
                </span>{" "}
                sản phẩm
              </p>
              <ShopSort />
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Không có sản phẩm phù hợp
                </h2>
                <p className="text-gray-500 mb-4">
                  Thử bỏ bớt bộ lọc để xem thêm sản phẩm.
                </p>
                <Link
                  href={`?q=${query}`}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:border-red-600 hover:text-red-600 transition font-medium text-sm"
                >
                  Xóa bộ lọc
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}