import { getProductBySlug, getProductsByBrand } from "@/lib/api";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  siteConfig,
} from "@/lib/seo";
import ProductDetail from "@/components/ProductDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: {
    collection: string;
    slug: string;
  };
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại | UIT Sneakers Vietnam",
    };
  }

  const productUrl = `${siteConfig.url}/collections/${params.collection}/products/${params.slug}`;
  const description = product.description
    ? product.description.substring(0, 160)
    : `${product.name} - Giày ${product.brand} chính hãng tại UIT Sneakers Vietnam. Đổi trả 30 ngày, freeship đơn từ 2 triệu.`;

  return {
    title: `${product.name} | Sneaker Store | ${siteConfig.name}`,
    description: description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description: description,
      url: productUrl,
      siteName: siteConfig.name,
      locale: "vi_VN",
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const brandProducts = await getProductsByBrand(product.brand);
  const relatedProducts = brandProducts
    .filter((p) => (p._id || p.id) !== (product._id || product.id))
    .slice(0, 4);

  const productSchema = generateProductSchema(product);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Trang chủ", url: siteConfig.url },
    {
      name: product.brand,
      url: `${siteConfig.url}/collections/${params.collection}`,
    },
    {
      name: product.name,
      url: `${siteConfig.url}/collections/${params.collection}/products/${params.slug}`,
    },
  ]);

  return (
    <>
      {/* Product Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* BreadcrumbList Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-white">
        <ProductDetail
          product={product}
          relatedProducts={relatedProducts}
          collection={params.collection}
        />
      </div>
    </>
  );
}