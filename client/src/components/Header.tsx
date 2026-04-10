"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllBrands, searchProducts } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, Product } from "@/lib/products";
import Image from "next/image";

// SVG Icons
const SearchIcon = () => (
  <svg
    className="w-6 h-6"
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
);

const CartIcon = () => (
  <svg
    className="w-6 h-6"
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
);

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  // Fetch brands từ API
  useEffect(() => {
    async function fetchBrands() {
      try {
        const data = await getAllBrands();
        setBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }
    fetchBrands();
  }, []);

  // Search suggestions với debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchInput.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchInput);
          setSuggestions(results.slice(0, 5)); // Chỉ lấy 5 gợi ý
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search error:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
      setSearchInput("");
      setIsSearchExpanded(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    router.push(
      `/collections/${product.brand.toLowerCase().replace(" ", "-")}/products/${product.slug}`,
    );
    setSearchInput("");
    setShowSuggestions(false);
    setIsSearchExpanded(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e);
    } else if (e.key === "Escape") {
      setIsSearchExpanded(false);
      setSearchInput("");
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/* Top bar */}
      <div className="bg-black text-white text-sm py-2">
        <div className="container mx-auto px-4 text-center">
          Miễn phí vận chuyển đơn hàng từ 2.000.000đ | Đổi trả trong 30 ngày
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center gap-2">
              <Image
                src="/UITSneakers.png"
                alt="UIT Sneakers Logo"
                width={125}
                height={125}
                priority
                className="object-contain"
              />
              UIT<span className="text-red-500">SNEAKERS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:text-red-500 transition">
              Trang chủ
            </Link>
            <div className="relative group">
              <Link
                href="/thuong-hieu"
                className="hover:text-red-500 transition flex items-center gap-1"
              >
                Thương hiệu
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  href="/collections/all"
                  className="block px-4 py-2 hover:bg-gray-100 font-medium text-gray-900 border-b border-gray-100"
                >
                  Tất cả
                </Link>
                {brands.map((brand) => (
                  <Link
                    key={brand}
                    href={`/collections/${brand.toLowerCase().replace(" ", "-")}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/collections/uu-dai"
              className="text-red-500 font-semibold"
            >
              Ưu đãi
            </Link>
            <Link href="/blog" className="hover:text-red-500 transition">
              Blog
            </Link>
          </nav>

          {/* Search Bar */}
          <div
            className="hidden md:flex items-center flex-1 max-w-md mx-8"
            ref={searchRef}
          >
            <div
              className={`relative flex items-center w-full transition-all duration-300 ${
                isSearchExpanded
                  ? "bg-white border-2 border-red-500 rounded-lg shadow-lg"
                  : "bg-gray-100 rounded-lg"
              }`}
            >
              <input
                type="text"
                placeholder="Tìm kiếm sneaker..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  setIsSearchExpanded(true);
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className={`flex-1 px-4 py-2 bg-transparent outline-none text-sm transition-all duration-300 ${
                  isSearchExpanded ? "w-full" : "w-0 opacity-0"
                }`}
              />
              <button
                onClick={() => {
                  if (isSearchExpanded && searchInput.trim()) {
                    handleSearch(new Event("submit") as any);
                  } else {
                    setIsSearchExpanded(!isSearchExpanded);
                  }
                }}
                className={`p-2 hover:text-red-500 transition flex-shrink-0 ${
                  isSearchExpanded ? "text-red-500" : "text-gray-600"
                }`}
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SearchIcon />
                )}
              </button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {suggestions.map((product) => (
                    <button
                      key={product._id || product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={
                          product.image ||
                          product.images?.[0] ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
                        {formatPrice(product.price)}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={(e) => handleSearch(e)}
                    className="w-full px-4 py-3 text-sm text-center text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    Xem tất cả kết quả cho "{searchInput}"
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden hover:text-red-500 transition p-2"
            >
              <SearchIcon />
            </button>
            <Link
              href="/cart"
              className="relative hover:text-red-500 transition p-2 group"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            {isAuthenticated && user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:text-red-500 transition p-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="hidden md:block text-sm font-medium">
                    {user.userName}
                  </span>
                </button>
                <div className="absolute top-full right-0 bg-white shadow-lg rounded-lg py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-gray-100 text-blue-600 font-medium"
                    >
                      Quản lý
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Tài khoản
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Đơn hàng
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Đăng nhập
              </Link>
            )}

            <button
              className="md:hidden text-gray-600 hover:text-red-500 transition p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            {/* Mobile Search Bar */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sneaker..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-red-600 transition"
                >
                  <SearchIcon />
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/" className="hover:text-red-500 transition">
                Trang chủ
              </Link>
              <div>
                <button className="font-semibold mb-2 flex items-center gap-1">
                  Thương hiệu
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div className="pl-4 flex flex-col gap-2">
                  {/* Tất cả thương hiệu */}
                  <Link
                    href="/collections/all"
                    className="text-gray-900 font-medium hover:text-red-500"
                  >
                    Tất cả
                  </Link>
                  {brands.map((brand) => (
                    <Link
                      key={brand}
                      href={`/thuong-hieu/${brand.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-600 hover:text-red-500"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/khuyen-mai" className="text-red-500 font-semibold">
                Khuyến mãi
              </Link>
              <Link href="/lien-he" className="hover:text-red-500 transition">
                Liên hệ
              </Link>

              {/* Mobile User Account */}
              {isAuthenticated && user ? (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">{user.userName}</span>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Quản lý
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block py-2 text-gray-600 hover:text-red-500"
                  >
                    Tài khoản
                  </Link>
                  <Link
                    href="/orders"
                    className="block py-2 text-gray-600 hover:text-red-500"
                  >
                    Đơn hàng
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 mt-4">
                  <Link
                    href="/login"
                    className="block bg-black text-white text-center py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
