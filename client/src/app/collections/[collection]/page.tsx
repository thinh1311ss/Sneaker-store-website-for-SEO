import { getAllProducts, getAllBrands } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ShopFilter from "@/components/ShopFilter";
import ShopSort from "@/components/ShopSort";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { siteConfig, generateCollectionSchema, generateBreadcrumbSchema } from "@/lib/seo";
import Image from "next/image";

interface Props {
  params: {
    collection: string;
  };
  searchParams: {
    size?: string | string[];
    sort?: string;
    page?: string;
    brand?: string | string[];
    discount?: string | string[];
  };
}

const brand_banners: Record<string, string> = {
  "ON RUNNING": "/ON_banner.webp",
  ASICS: "/ASICS_banner.jpg",
  HOKA: "/HOKA_banner.webp",
  "UNDER ARMOUR": "/UA_banner.webp",
  PUMA: "/PUMA_banner.webp",
  NIKE: "/NIKE_banner.webp",
  ADIDAS: "/ADIDAS_banner.webp",
  CROCS: "/CROCS_banner.jpg",
};

// FIX: Metadata tối ưu SEO — mỗi collection có title/description riêng biệt
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = params.collection.toLowerCase();
  let title = "Bộ sưu tập";
  let description = "";
  let matchedBrand = "";

  if (collection === "nam") {
    title = "Giày Sneaker Nam";
    description = "Mua giày sneaker nam chính hãng giá tốt. Nike, Adidas, HOKA, Puma... Freeship đơn từ 2 triệu. Đổi trả 30 ngày.";
  } else if (collection === "nu") {
    title = "Giày Sneaker Nữ";
    description = "Mua giày sneaker nữ chính hãng giá tốt. Nike Air Force 1, Adidas Ultraboost... Freeship đơn từ 2 triệu. Đổi trả 30 ngày.";
  } else if (collection === "uu-dai") {
    title = "Giày Sneaker Giảm Giá";
    description = "Săn giày sneaker chính hãng giảm giá đến 70%. Nike, Adidas, HOKA, On Running... Số lượng có hạn, nhanh tay!";
  } else if (collection === "all") {
    title = "Tất Cả Giày Sneaker";
    description = "Khám phá hơn 200+ giày sneaker chính hãng. Nike, Adidas, HOKA, Puma, On Running, Under Armour. Giá tốt nhất Việt Nam.";
  } else {
    const brands = await getAllBrands();
    matchedBrand = brands.find(
      (b) => b.toLowerCase().replace(/ /g, "-") === collection,
    ) || "";
    if (matchedBrand) {
      title = `Giày ${matchedBrand}`;
      description = `Mua giày ${matchedBrand} chính hãng giá tốt nhất tại UIT Sneakers. Đa dạng mẫu mã, freeship đơn từ 2 triệu, đổi trả 30 ngày.`;
    }
  }

  const pageTitle = `${title} Chính Hãng Giá Tốt | ${siteConfig.name}`;
  const pageUrl = `${siteConfig.url}/collections/${params.collection}`;

  return {
    title: pageTitle,
    description: description || `Khám phá bộ sưu tập ${title.toLowerCase()} chính hãng tại ${siteConfig.name}.`,
    openGraph: {
      title: pageTitle,
      description: description,
      url: pageUrl,
      type: "website",
      siteName: siteConfig.name,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

const ITEMS_PER_PAGE = 12;

export default async function CollectionPage({ params, searchParams }: Props) {
  const collection = params.collection.toLowerCase();
  const [allProducts, brands] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
  ]);

  let filteredProducts = [...allProducts];
  let collectionTitle = "Bộ sưu tập";
  let collectionDescription = "";
  let isBrandPage = false;
  let matchedBrand = "";

  if (collection === "nam") {
    collectionTitle = "Giày Nam";
    collectionDescription =
      "Khám phá bộ sưu tập giày thể thao nam chính hãng với thiết kế mạnh mẽ, năng động và công nghệ tiên tiến nhất.";
    filteredProducts = filteredProducts.filter(p => p.gender === 'Nam' || p.gender === 'Unisex');
  } else if (collection === "nu") {
    collectionTitle = "Giày Nữ";
    collectionDescription =
      "Bộ sưu tập giày thể thao nữ chính hãng mang đến sự thoải mái, phong cách thời trang và nâng niu từng bước chân của bạn.";
    filteredProducts = filteredProducts.filter(p => p.gender === 'Nữ' || p.gender === 'Unisex');
  } else if (collection === "uu-dai") {
    collectionTitle = "Sản Phẩm Ưu Đãi";
    collectionDescription =
      "Săn ngay những đôi giày sneaker chính hãng với mức giá cực kỳ hấp dẫn. Số lượng có hạn!";
    filteredProducts = filteredProducts.filter((p) => p.discount !== null);
  } else if (collection === "all") {
    isBrandPage = false;
    collectionTitle = "Tất cả sản phẩm";
    collectionDescription =
      "Khám phá toàn bộ bộ sưu tập giày sneaker chính hãng với đa dạng mẫu mã, phong cách và mức giá phù hợp với mọi đối tượng khách hàng.";
    filteredProducts = allProducts;
  } else {
    const foundBrand = brands.find(
      (b) => b.toLowerCase().replace(/ /g, "-") === collection,
    );
    if (foundBrand) {
      isBrandPage = true;
      matchedBrand = foundBrand;
      collectionTitle = `Thương hiệu: ${foundBrand}`;
      collectionDescription = `Khám phá các sản phẩm nổi bật từ ${foundBrand}. Chúng tôi tự hào mang đến những bộ sưu tập mới nhất, chất lượng nhất từ thương hiệu này.`;
      filteredProducts = filteredProducts.filter((p) => p.brand === foundBrand);
    } else {
      notFound();
    }
  }

  // Extract all unique sizes for the filter based on CURRENT collection products
  const allSizes = Array.from(
    new Set(
      filteredProducts.flatMap((p) => (p.sizes ? p.sizes.split(", ") : [])),
    ),
  ).sort();

  // Apply Brand Filter (if not on a brand page)
  if (!isBrandPage && searchParams.brand) {
    const brandsToFilter = Array.isArray(searchParams.brand)
      ? searchParams.brand
      : [searchParams.brand];
    filteredProducts = filteredProducts.filter((p) =>
      brandsToFilter.includes(p.brand),
    );
  }

  // Apply Size Filter
  if (searchParams.size) {
    const sizesToFilter = Array.isArray(searchParams.size)
      ? searchParams.size
      : [searchParams.size];
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.sizes &&
        sizesToFilter.some((size) => p.sizes.split(", ").includes(size)),
    );
  }

  // Apply Discount Filter
  if (searchParams.discount) {
    const discountsToFilter = Array.isArray(searchParams.discount)
      ? searchParams.discount
      : [searchParams.discount];
    filteredProducts = filteredProducts.filter((p) => {
      if (!p.discount) return false;
      return discountsToFilter.some((range) => {
        const [min, max] = range.split("-").map(Number);
        return p.discount! >= min && p.discount! <= max;
      });
    });
  }

  // Apply Sorting
  const sort = searchParams.sort || "newest";
  if (sort === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === "oldest") {
    filteredProducts.sort((a, b) => a.id - b.id);
  } else if (sort === "name-asc") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "name-desc") {
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  } else {
    filteredProducts.sort((a, b) => b.id - a.id);
  }

  // Pagination Logic
  const currentPage = Number(searchParams.page) || 1;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Build current search params for pagination
  const currentSearchParams = new URLSearchParams();
  if (searchParams.size) {
    const sizes = Array.isArray(searchParams.size)
      ? searchParams.size
      : [searchParams.size];
    sizes.forEach((s) => currentSearchParams.append("size", s));
  }
  if (searchParams.sort) currentSearchParams.set("sort", searchParams.sort);
  if (searchParams.brand) {
    const brands = Array.isArray(searchParams.brand)
      ? searchParams.brand
      : [searchParams.brand];
    brands.forEach((b) => currentSearchParams.append("brand", b));
  }
  if (searchParams.discount) {
    const discounts = Array.isArray(searchParams.discount)
      ? searchParams.discount
      : [searchParams.discount];
    discounts.forEach((d) => currentSearchParams.append("discount", d));
  }

  const breadcrumbItems = [
    { label: collectionTitle.replace("Thương hiệu: ", "") },
  ];

  const currentBrandParam = Array.isArray(searchParams.brand)
    ? searchParams.brand[0]
    : searchParams.brand;

  const brandBanner = matchedBrand
    ? (brand_banners[matchedBrand] ?? null)
    : null;

  // Schema: Collection + Breadcrumb
  const collectionSchema = isBrandPage && matchedBrand
    ? generateCollectionSchema(matchedBrand, filteredProducts)
    : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: siteConfig.url },
    {
      name: collectionTitle.replace("Thương hiệu: ", ""),
      url: `${siteConfig.url}/collections/${params.collection}`,
    },
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {collectionSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}

      {/* Brand Banner */}
      {brandBanner && (
        <div className="relative w-full h-[420px] overflow-hidden">
          <Image
            src={brandBanner}
            alt={`${matchedBrand} banner`}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Collection Header — ẩn nếu đã có banner brand */}
        {!brandBanner && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-100 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              {collectionTitle}
            </h1>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              {collectionDescription}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <div className="lg:w-1/4 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <ShopFilter
                brands={brands}
                currentBrand={
                  isBrandPage ? matchedBrand : currentBrandParam || null
                }
                availableSizes={allSizes}
                hideBrandFilter={isBrandPage}
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

            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      collection={params.collection}
                    />
                  ))}
                </div>
                <div className="mt-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl={`/collections/${params.collection}`}
                    searchParams={currentSearchParams}
                  />
                </div>
              </>
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
                  Không tìm thấy sản phẩm
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Không có sản phẩm nào phù hợp với bộ lọc của bạn. Vui lòng thử
                  lại với các tiêu chí khác.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}