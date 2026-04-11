export const siteConfig = {
  name: "UIT Sneakers Vietnam",
  description:
    "Cửa hàng giày sneaker chính hãng hàng đầu Việt Nam. Nike, Adidas, Puma, HOKA, On Running, Under Armour, Asics với giá tốt nhất.",
  url: "https://sneakerstore.vn",
  ogImage: "https://sneakerstore.vn/og-image.jpg",
  keywords: [
    "giày sneaker",
    "sneaker chính hãng",
    "giày thể thao",
    "nike vietnam",
    "adidas vietnam",
    "puma vietnam",
    "hoka vietnam",
    "on running vietnam",
    "giày sneaker nam",
    "giày sneaker nữ",
    "mua giày sneaker online",
  ],
  authors: [{ name: "UIT Sneakers Vietnam" }],
  creator: "UIT Sneakers Vietnam",
};

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  brand: string;
  sizes: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      ...(product.originalPrice && {
        priceSpecification: {
          "@type": "PriceSpecification",
          price: product.originalPrice,
          priceCurrency: "VND",
        },
      }),
    },
    ...(product.sizes && {
      size: product.sizes.split(", "),
    }),
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
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

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      "https://facebook.com/sneakerstorevn",
      "https://instagram.com/sneakerstorevn",
      "https://tiktok.com/@sneakerstorevn",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-xxx-xxx-xxx",
      contactType: "customer service",
      availableLanguage: "Vietnamese",
    },
  };
}
