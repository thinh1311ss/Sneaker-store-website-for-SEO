export const siteConfig = {
  name: "UIT Sneakers Vietnam",
  description:
    "Cửa hàng giày sneaker chính hãng hàng đầu Việt Nam. Nike, Adidas, Puma, HOKA, On Running, Under Armour, Asics với giá tốt nhất.",
  url: "https://www.uitsneakers.io.vn",
  ogImage: "https://www.uitsneakers.io.vn/Logo_UITSneaker_v2.webp",
  keywords: [
    "giày sneaker",
    "sneaker chính hãng",
    "giày thể thao",
    "nike vietnam",
    "adidas vietnam",
    "puma vietnam",
    "hoka vietnam",
    "on running vietnam",
    "under armour vietnam",
    "giày sneaker nam",
    "giày sneaker nữ",
    "mua giày sneaker online",
    "giày sneaker giảm giá",
    "giày chính hãng TPHCM",
  ],
  authors: [{ name: "UIT Sneakers Vietnam" }],
  creator: "UIT Sneakers Vietnam",
};

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  brand: string;
  sizes: string;
  slug?: string;
  quantity?: number;
}) {
  const availability =
    (product.quantity ?? 1) > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const brandSlug = product.brand.toLowerCase().replace(/ /g, "-");
  const productUrl = product.slug
    ? `${siteConfig.url}/collections/${brandSlug}/products/${product.slug}`
    : siteConfig.url;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} - Giày ${product.brand} chính hãng tại UIT Sneakers Vietnam`,
    url: productUrl,
    image:
      product.images && product.images.length > 0
        ? product.images
        : [product.image],
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    sku: product.slug || product.name.toLowerCase().replace(/ /g, "-"),
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: "VND",
      availability: availability,
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: priceValidUntil,
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "VND",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "VN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "VN",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(product.sizes && {
      additionalProperty: product.sizes.split(", ").map((size) => ({
        "@type": "PropertyValue",
        name: "Size",
        value: size,
      })),
    }),
  };
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Organization Schema — đã cập nhật thông tin thật
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/Logo_UITSneaker_v2.webp`,
    description: siteConfig.description,
    // Đã cập nhật link mạng xã hội thật
    sameAs: [
      "https://www.facebook.com/profile.php?id=61568709059553",
      "https://www.instagram.com/uit_sneakersvn/",
      "https://www.tiktok.com/@uitsneakersvietnam",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      // Đã cập nhật số điện thoại thật
      telephone: "+84396528253",
      contactType: "customer service",
      availableLanguage: "Vietnamese",
      areaServed: "VN",
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday","Tuesday","Wednesday","Thursday",
          "Friday","Saturday","Sunday",
        ],
        opens: "08:00",
        closes: "22:00",
      },
    },
    // Đã cập nhật địa chỉ thật
    address: {
      "@type": "PostalAddress",
      streetAddress: "49 Thống Nhất, Bình Thọ",
      addressLocality: "Thủ Đức",
      addressRegion: "Hồ Chí Minh",
      postalCode: "700000",
      addressCountry: "VN",
    },
    email: "uitsneakersvn@gmail.com",
  };
}

// WebSite Schema + SearchAction — MỚI THÊM
// Giúp Google hiển thị Sitelinks Search Box trên kết quả tìm kiếm
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// Collection Schema — cho trang danh sách sản phẩm theo brand
export function generateCollectionSchema(
  brand: string,
  products: { name: string; price: number; image: string; slug: string }[]
) {
  const brandSlug = brand.toLowerCase().replace(/ /g, "-");

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Giày ${brand} Chính Hãng`,
    description: `Mua giày ${brand} chính hãng giá tốt tại UIT Sneakers Vietnam. Freeship đơn từ 2 triệu. Đổi trả 30 ngày.`,
    url: `${siteConfig.url}/collections/${brandSlug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteConfig.url}/collections/${brandSlug}/products/${product.slug}`,
        name: product.name,
      })),
    },
  };
}