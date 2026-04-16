"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllBrands, searchProducts } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, Product } from "@/lib/api";
import Image from "next/image";

// SVG Icons - thêm aria-hidden vì button/link cha đã có aria-label
const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className ?? ""}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
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

  // Đóng toàn bộ mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsBrandOpen(false);
  };

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
          setSuggestions(results.slice(0, 5));
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside để đóng suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
      closeMenu();
    }
  };

  const handleSuggestionClick = (product: Product) => {
    router.push(
      `/collections/${product.brand.toLowerCase().replace(" ", "-")}/products/${product.slug}`,
    );
    setSearchInput("");
    setShowSuggestions(false);
    setIsSearchExpanded(false);
    closeMenu();
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
          <Link href="/" aria-label="Trang chủ UIT Sneakers" className="text-2xl font-bold flex-shrink-0">
            <div className="flex items-center gap-2">
              <Image
                src="/Logo_UITSneaker_v2.png"
                alt="UIT Sneakers Logo"
                width={125}
                height={125}
                priority
                className="object-contain"
                style={{ height: "66px" }}
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center md:gap-4 lg:gap-8 md:text-sm lg:text-base" aria-label="Menu chính">
            <Link href="/" className="text-gray-800 hover:text-red-600 transition">
              Trang chủ
            </Link>
            <div className="relative group">
              <Link
                href="/thuong-hieu"
                className="text-gray-800 hover:text-red-600 transition flex items-center gap-1"
              >
                Thương hiệu
                <ChevronDownIcon />
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
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/collections/nam" className="text-gray-800 hover:text-red-600 transition">
              Nam
            </Link>
            <Link href="/collections/nu" className="text-gray-800 hover:text-red-600 transition">
              Nữ
            </Link>
            {/* FIX CONTRAST: text-red-500 → text-red-600 (đậm hơn để đủ contrast trên nền trắng) */}
            <Link href="/collections/uu-dai" className="text-red-600 font-semibold">
              Ưu đãi
            </Link>
            <Link href="/blog" className="text-gray-800 hover:text-red-600 transition">
              Blog
            </Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <div
              className={`relative flex items-center w-full transition-all duration-300 ${
                isSearchExpanded
                  ? "bg-white border-2 border-red-500 rounded-lg shadow-lg"
                  : "bg-gray-100 rounded-lg"
              }`}
            >
              <label htmlFor="desktop-search" className="sr-only">Tìm kiếm sneaker</label>
              <input
                id="desktop-search"
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
                type="button"
                aria-label={isSearchExpanded && searchInput.trim() ? "Thực hiện tìm kiếm" : "Mở thanh tìm kiếm"}
                onClick={() => {
                  if (isSearchExpanded && searchInput.trim()) {
                    handleSearch(new Event("submit") as any);
                  } else {
                    setIsSearchExpanded(!isSearchExpanded);
                  }
                }}
                className={`p-2 hover:text-red-600 transition flex-shrink-0 ${
                  isSearchExpanded ? "text-red-600" : "text-gray-700"
                }`}
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Đang tìm kiếm" />
                ) : (
                  <SearchIcon />
                )}
              </button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden" role="listbox" aria-label="Gợi ý tìm kiếm">
                  {suggestions.map((product) => (
                    <button
                      key={product._id || product.id}
                      type="button"
                      role="option"
                      aria-label={`${product.name} - ${product.brand} - ${formatPrice(product.price)}`}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={product.image || product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.brand}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
                        {formatPrice(product.price)}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={(e) => handleSearch(e)}
                    className="w-full px-4 py-3 text-sm text-center text-red-700 hover:bg-red-50 transition font-medium"
                  >
                    Xem tất cả kết quả cho &ldquo;{searchInput}&rdquo;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <button
              type="button"
              aria-label="Mở tìm kiếm"
              aria-expanded={isSearchExpanded}
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden text-gray-700 hover:text-red-600 transition p-2"
            >
              <SearchIcon />
            </button>

            <Link
              href="/cart"
              aria-label={`Giỏ hàng${cartCount > 0 ? ` có ${cartCount} sản phẩm` : ''}`}
              className="relative text-gray-700 hover:text-red-600 transition p-2 group"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User Account (desktop) */}
            {isAuthenticated && user ? (
              <div className="relative group hidden md:block">
                <button
                  type="button"
                  aria-label={`Tài khoản của ${user.userName}`}
                  className="flex items-center gap-2 text-gray-800 hover:text-red-600 transition p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">{user.userName}</span>
                </button>
                <div className="absolute top-full right-0 bg-white shadow-lg rounded-lg py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {user.role === "admin" && (
                    <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100 text-blue-700 font-medium">
                      Quản lý
                    </Link>
                  )}
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">Tài khoản</Link>
                  <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100 text-gray-800">Đơn hàng</Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Đăng nhập
              </Link>
            )}

            {/* Hamburger */}
            <button
              type="button"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              className="md:hidden text-gray-700 hover:text-red-600 transition p-2"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                if (isMenuOpen) setIsBrandOpen(false);
              }}
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchExpanded && (
          <div className="md:hidden mt-3" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative" role="search">
              <label htmlFor="mobile-search" className="sr-only">Tìm kiếm sneaker</label>
              <input
                id="mobile-search"
                type="text"
                placeholder="Tìm kiếm sneaker..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 pr-12 border-2 border-red-500 rounded-lg focus:outline-none text-sm"
              />
              <button
                type="submit"
                aria-label="Thực hiện tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-red-600 hover:text-red-700 transition"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Đang tìm kiếm" />
                ) : (
                  <SearchIcon />
                )}
              </button>
            </form>

            {/* Mobile suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden" role="listbox">
                {suggestions.map((product) => (
                  <button
                    key={product._id || product.id}
                    type="button"
                    role="option"
                    aria-label={`${product.name} - ${product.brand} - ${formatPrice(product.price)}`}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-b-0"
                  >
                    <img
                      src={product.image || product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.brand}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={(e) => handleSearch(e)}
                  className="w-full px-4 py-3 text-sm text-center text-red-700 hover:bg-red-50 transition font-medium"
                >
                  Xem tất cả kết quả cho &ldquo;{searchInput}&rdquo;
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav id="mobile-menu" className="md:hidden mt-4 pb-4 border-t pt-4" aria-label="Menu di động">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="px-2 py-3 text-gray-800 hover:text-red-600 transition rounded-lg hover:bg-gray-50"
                onClick={closeMenu}
              >
                Trang chủ
              </Link>

              {/* Thương hiệu - toggle dropdown */}
              <div>
                <button
                  type="button"
                  aria-label="Mở/đóng danh sách thương hiệu"
                  aria-expanded={isBrandOpen}
                  className="w-full flex items-center justify-between px-2 py-3 font-semibold text-gray-800 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => setIsBrandOpen(!isBrandOpen)}
                >
                  <span>Thương hiệu</span>
                  <ChevronDownIcon className={`transition-transform duration-200 ${isBrandOpen ? "rotate-180" : ""}`} />
                </button>

                {isBrandOpen && (
                  <div className="pl-4 flex flex-col mt-1 mb-1 border-l-2 border-red-100 ml-2">
                    <Link
                      href="/collections/all"
                      className="px-2 py-2 font-medium text-gray-900 hover:text-red-600 rounded transition"
                      onClick={closeMenu}
                    >
                      Tất cả
                    </Link>
                    {brands.map((brand) => (
                      <Link
                        key={brand}
                        href={`/collections/${brand.toLowerCase().replace(" ", "-")}`}
                        className="px-2 py-2 text-gray-700 hover:text-red-600 rounded transition"
                        onClick={closeMenu}
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* FIX CONTRAST: text-red-500 → text-red-600 */}
              <Link
                href="/collections/uu-dai"
                className="px-2 py-3 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition"
                onClick={closeMenu}
              >
                Ưu đãi
              </Link>
              <Link
                href="/blog"
                className="px-2 py-3 text-gray-800 hover:text-red-600 transition rounded-lg hover:bg-gray-50"
                onClick={closeMenu}
              >
                Blog
              </Link>

              {/* Mobile User Account */}
              {isAuthenticated && user ? (
                <div className="border-t pt-4 mt-3">
                  <div className="flex items-center gap-2 px-2 py-2 mb-1">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold text-gray-900">{user.userName}</span>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-2 py-3 text-blue-700 hover:text-blue-800 font-medium rounded-lg hover:bg-blue-50 transition"
                      onClick={closeMenu}
                    >
                      Quản lý
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-2 py-3 text-gray-700 hover:text-red-600 rounded-lg hover:bg-gray-50 transition"
                    onClick={closeMenu}
                  >
                    Tài khoản
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-2 py-3 text-gray-700 hover:text-red-600 rounded-lg hover:bg-gray-50 transition"
                    onClick={closeMenu}
                  >
                    Đơn hàng
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout(); closeMenu(); }}
                    className="block w-full text-left px-2 py-3 text-red-700 hover:text-red-800 rounded-lg hover:bg-red-50 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 mt-3">
                  <Link
                    href="/login"
                    className="block bg-black text-white text-center py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                    onClick={closeMenu}
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