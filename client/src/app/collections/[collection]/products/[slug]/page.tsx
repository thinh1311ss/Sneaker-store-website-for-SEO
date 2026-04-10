import { getProductBySlug, getProductsByBrand } from '@/lib/api';
import { generateProductSchema, siteConfig } from '@/lib/seo';
import ProductDetail from '@/components/ProductDetail';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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
      title: 'Sản phẩm không tồn tại | Sneaker Store',
    };
  }

  return {
    title: `${product.name} | Sneaker Store`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      url: `${siteConfig.url}/collections/${params.collection}/products/${params.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }

  const brandProducts = await getProductsByBrand(product.brand);
  const relatedProducts = brandProducts.filter(p => (p._id || p.id) !== (product._id || product.id)).slice(0, 4);

  const jsonLd = generateProductSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-white">
        <ProductDetail product={product} relatedProducts={relatedProducts} collection={params.collection} />
      </div>
    </>
  );
}
