export const siteConfig = {
  // FIX: Domain thật
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

// Product Schema đầy đủ cho Google Rich Results
// Ref: https://developers.google.com/search/docs/appearance/structured-data/product
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
  // Xác định availability dựa trên quantity
  const availability = (product.quantity ?? 1) > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  // Ngày hết hạn giá (30 ngày từ hiện tại)
  const priceValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString().split('T')[0]; // Format YYYY-MM-DD

  // Tạo URL sản phẩm
  const brandSlug = product.brand.toLowerCase().replace(/ /g, '-');
  const productUrl = product.slug
    ? `${siteConfig.url}/collections/${brandSlug}/products/${product.slug}`
    : siteConfig.url;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} - Giày ${product.brand} chính hãng tại UIT Sneakers Vietnam`,
    url: productUrl,

    // Hình ảnh - Google khuyến nghị nhiều ảnh
    image: product.images && product.images.length > 0
      ? product.images
      : [product.image],

    // Thương hiệu
    brand: {
      "@type": "Brand",
      name: product.brand,
    },

    // SKU (dùng slug làm SKU)
    sku: product.slug || product.name.toLowerCase().replace(/ /g, '-'),

    // Tình trạng sản phẩm
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: "VND",
      availability: availability,
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: priceValidUntil,

      // Người bán
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },

      // Chính sách giao hàng
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

      // Chính sách đổi trả
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "VN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },

    // Size có sẵn
    ...(product.sizes && {
      additionalProperty: product.sizes.split(", ").map(size => ({
        "@type": "PropertyValue",
        name: "Size",
        value: size,
      })),
    }),
  };
}

// Breadcrumb Schema - giúp Google hiển thị breadcrumb trong search results
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

// Organization Schema - thông tin doanh nghiệp
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/Logo_UITSneaker_v2.webp`,
    description: siteConfig.description,
    // TODO: Thay bằng URL mạng xã hội thật
    sameAs: [
      // "https://facebook.com/uitsneakers",
      // "https://instagram.com/uitsneakers",
      // "https://tiktok.com/@uitsneakers",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      // TODO: Thay bằng số điện thoại thật
      telephone: "+84-xxx-xxx-xxx",
      contactType: "customer service",
      availableLanguage: "Vietnamese",
      areaServed: "VN",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Nguyễn Huệ",
      addressLocality: "Quận 1",
      addressRegion: "TP.HCM",
      addressCountry: "VN",
    },
  };
}

// Collection Schema - cho trang danh sách sản phẩm theo brand
export function generateCollectionSchema(
  brand: string,
  products: { name: string; price: number; image: string; slug: string }[]
) {
  const brandSlug = brand.toLowerCase().replace(/ /g, '-');

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