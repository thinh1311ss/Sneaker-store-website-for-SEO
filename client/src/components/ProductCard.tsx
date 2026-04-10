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

  // Hỗ trợ cả id và _id từ MongoDB
  const productId = product._id || String(product.id);
  const inCart = cartItems.some((item) => 
    (item.product._id || String(item.product.id)) === productId
  );

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

  // Hỗ trợ cả image string và images array từ MongoDB
  const imageUrl = product.image || (product.images && product.images[0]) || '/placeholder.jpg';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Image */}
      <Link href={productUrl} className="block flex-shrink-0">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.discount && product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              -{product.discount}%
            </span>
          )}
          
          {/* Nút Add to Cart */}
          <button
            onClick={handleToggleCart}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              inCart
                ? 'bg-green-500 text-white scale-100'
                : 'bg-white text-gray-800 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white scale-90 group-hover:scale-100'
            }`}
            title={inCart ? 'Xóa khỏi giỏ' : 'Thêm vào giỏ'}
          >
            {inCart ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
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
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {product.sizes && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
              {product.sizes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}