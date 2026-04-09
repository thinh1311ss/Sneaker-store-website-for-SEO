"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  collection?: string; // truyền vào để build đúng URL
}

export default function ProductCard({ product, collection }: ProductCardProps) {
  const { cartItems, addToCart, removeFromCart } = useCart();

  const inCart = cartItems.some((item) => item.product.id === product.id);

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  };

  // Fallback về brand nếu không có collection truyền vào
  const collectionSlug =
    collection || product.brand.toLowerCase().replace(/ /g, "-");
  const productUrl = `/collections/${collectionSlug}/products/${product.slug}`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Image */}
      <Link href={productUrl} className="block flex-shrink-0">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.discount && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              -{product.discount}%
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          {product.brand}
        </span>
        <Link href={productUrl}>
          <h3 className="font-semibold mt-1 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}