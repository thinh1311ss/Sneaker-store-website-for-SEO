"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product, formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "./ProductCard";

interface ProductDetailProps {
  product?: Product;
  relatedProducts?: Product[];
  collection?: string;
}

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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductDetail({
  product: propProduct,
  relatedProducts = [],
}: ProductDetailProps) {
  const { addToCart } = useCart();
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  // State cho dữ liệu từ API
  const [product, setProduct] = useState<Product | BackendProduct | null>(
    propProduct || null,
  );
  const [loading, setLoading] = useState(!propProduct);
  const [error, setError] = useState<string | null>(null);

  // State cho UI
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "care">("desc");
  const [showAdded, setShowAdded] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Fetch product từ API nếu không nhận từ props
  useEffect(() => {
    if (propProduct) return; // Nếu có product từ props, không cần fetch

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // params.id là productId từ URL
        const productId = params.id as string;
        if (!productId) {
          setError("Không tìm thấy ID sản phẩm");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/auth/admin/product/${productId}`,
        );
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm");
        }

        const data: BackendProduct = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [propProduct, params.id]);

  // Convert sizes object thành array để render
  const getSizeArray = (): string[] => {
    if (!product) return [];

    if (!("sizes" in product)) return [];

    const sizesData = product.sizes;
    console.log("RAW SIZES DATA:", JSON.stringify(sizesData)); // <-- xem log này

    let rawSizes: string[] = [];

    if (typeof sizesData === "string") {
      rawSizes = [sizesData];
    } else if (Array.isArray(sizesData)) {
      rawSizes = sizesData.map(String);
    } else if (typeof sizesData === "object" && sizesData !== null) {
      rawSizes = Object.entries(sizesData as Record<string, number>)
        .filter(([_, v]) => v > 0)
        .map(([k]) => k);
    }

    // Tách mọi chuỗi chứa nhiều size
    const result: string[] = [];
    for (const raw of rawSizes) {
      if (raw.includes(", ")) {
        result.push(
          ...raw
            .split(", ")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      } else {
        // Tách theo pattern "US X" hoặc số đơn giản
        const parts = raw
          .split(/(?=US\s[\d.]+|(?<!\d)\d{2}(?!\d))/g)
          .map((s) => s.trim())
          .filter(Boolean);
        result.push(...parts);
      }
    }

    console.log("PARSED SIZES:", result); // <-- kết quả sau parse
    return result;
  };

  const sizes = getSizeArray();

  const handleAddToCart = () => {
    if (!product) return;

    // Kiểm tra size - hiện lỗi inline thay vì alert
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000);
      return;
    }

    addToCart(product as Product, selectedSize || undefined);
    setTimeout(() => setShowAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000);
      return;
    }

    if (!isAuthenticated || !user || !token) {
      router.push("/login");
      return;
    }

    if (!product) return;

    // Add product to cart and redirect to checkout
    addToCart(product as Product, selectedSize || undefined, 1);
    router.push("/checkout");
  };

  // Khi chọn size thì tắt lỗi
  const handleSelectSize = (size: string) => {
    setSelectedSize(size === selectedSize ? null : size);
    setShowSizeError(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="ml-4 text-lg text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
          <p className="text-red-700 mb-4">
            {error || "Không thể tải sản phẩm"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Lấy tên và brand từ dữ liệu
  const productName = product
    ? "name" in product
      ? product.name
      : (product as BackendProduct).productName
    : "";
  const productBrand = product
    ? "brand" in product
      ? product.brand
      : (product as BackendProduct).brand
    : "";
  const productImage = product
    ? "image" in product
      ? product.image
      : (product as BackendProduct).images?.[0] || ""
    : "";
  const productDescription = product
    ? "description" in product
      ? product.description
      : (product as BackendProduct).description
    : "";
  const productPrice = product
    ? "price" in product
      ? product.price
      : (product as BackendProduct).price
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 flex-wrap">
          <li>
            <Link
              href="/"
              className="text-gray-500 hover:text-red-500 transition"
            >
              Trang chủ
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li>
            <Link
              href={`/thuong-hieu/${productBrand.toLowerCase().replace(" ", "-")}`}
              className="text-gray-500 hover:text-red-500 transition"
            >
              {productBrand}
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-900 font-medium truncate max-w-[200px]">
            {productName}
          </li>
        </ol>
      </nav>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden">
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-contain p-8"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {"discount" in product && product.discount && (
            <span className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 uppercase tracking-widest font-medium">
            {productBrand}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-4 leading-tight">
            {productName}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="text-3xl font-bold text-red-600">
              {formatPrice(productPrice)}
            </span>
            {"originalPrice" in product && product.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">
                  Tiết kiệm {formatPrice(product.originalPrice - productPrice)}
                </span>
              </>
            )}
          </div>

          {/* Sizes - có hiệu ứng lỗi */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold">Kích thước:</h3>
                {selectedSize && (
                  <span className="text-red-600 font-bold">{selectedSize}</span>
                )}
                {/* Thông báo lỗi inline */}
                {showSizeError && (
                  <span className="text-red-500 text-sm font-medium animate-pulse flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Vui lòng chọn size!
                  </span>
                )}
              </div>
              <div
                className={`flex flex-wrap gap-2 p-3 rounded-xl transition-all duration-300 ${
                  showSizeError ? "bg-red-50 ring-2 ring-red-300" : ""
                }`}
              >
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSelectSize(size)}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? "bg-black text-white shadow-lg scale-105"
                        : "border border-gray-300 hover:border-black hover:shadow-md"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={showAdded}
              className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                showAdded
                  ? "bg-green-500 text-white scale-[1.02]"
                  : "bg-black text-white hover:bg-gray-800 active:scale-[0.98]"
              }`}
            >
              {showAdded ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Đã thêm vào giỏ!
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Thêm vào giỏ hàng
                </>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isBuying}
              className="flex-1 border-2 border-black py-4 rounded-xl font-bold hover:bg-black hover:text-white transition-all duration-300 active:scale-[0.98] disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isBuying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đặt hàng...
                </>
              ) : (
                "Mua ngay"
              )}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-emerald-700">
                Chính hãng 100%
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-700">
                Giao hàng toàn quốc
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-purple-700">
                Đổi trả 30 ngày
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-amber-700">
                Thanh toán COD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-16">
        <div className="border-b">
          <nav className="flex gap-8">
            {[
              { key: "desc", label: "Mô tả" },
              { key: "specs", label: "Thông số" },
              { key: "care", label: "Chăm sóc & Bảo quản" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`pb-4 font-semibold transition-all ${
                  activeTab === tab.key
                    ? "border-b-2 border-black text-black"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {activeTab === "desc" && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {productDescription}
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {"specs" in product && product.specs
                  ? product.specs
                  : "Đang cập nhật..."}
              </p>
            </div>
          )}

          {activeTab === "care" && (
            <div className="prose max-w-none">
              {"careGuide" in product && product.careGuide && (
                <>
                  <h2 className="text-xl font-bold mb-4">Hướng dẫn chăm sóc</h2>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-8">
                    {product.careGuide}
                  </p>
                </>
              )}
              {"storageGuide" in product && product.storageGuide && (
                <>
                  <h2 className="text-xl font-bold mb-4">Hướng dẫn bảo quản</h2>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {product.storageGuide}
                  </p>
                </>
              )}
              {(!("careGuide" in product) || !product.careGuide) &&
                (!("storageGuide" in product) || !product.storageGuide) && (
                  <p className="text-gray-500">Đang cập nhật...</p>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">
            Sản phẩm {productBrand} khác
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}