"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/products";

interface OrderItem {
  product: {
    _id: string;
    productName: string;
    price: number;
    images: string[];
  };
  size?: string;
  quantity: number;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  totalPrice: number;
  orderTime: string;
  paymentMethod: string;
  status?: string;
  shippingAddress?: {
    fullName?: string;
    address?: string;
    telephone?: number;
  };
  note: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch orders
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const timer = setTimeout(() => {
      if (token) {
        fetchOrders();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token || !user?._id) {
        console.error("No token or user ID available");
        setError("Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/user/${user._id}/orders`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Không thể tải lịch sử đơn hàng",
        );
      }

      const data: Order[] = await response.json();
      const sortedOrders = data.sort(
        (a, b) =>
          new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime(),
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải lịch sử đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status?: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending:   { label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
      confirmed: { label: "Đã xác nhận",  color: "text-blue-600 bg-blue-50 border-blue-200" },
      shipping:  { label: "Đang giao",    color: "text-purple-600 bg-purple-50 border-purple-200" },
      delivered: { label: "Đã giao",      color: "text-green-600 bg-green-50 border-green-200" },
      cancelled: { label: "Đã huỷ",       color: "text-red-600 bg-red-50 border-red-200" },
    };
    return map[status ?? "pending"] ?? map["pending"];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-red-500 transition">
              Trang chủ
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li>
            <Link href="/profile" className="text-gray-500 hover:text-red-500 transition">
              Tài khoản
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-900 font-medium">Đơn hàng</li>
        </ol>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">Đơn hàng của tôi</h1>
      <p className="text-gray-600 mb-8">
        {orders.length > 0 && (
          <span>
            Tổng cộng{" "}
            <span className="text-red-600 font-medium">{orders.length}</span>{" "}
            đơn hàng
          </span>
        )}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chưa có đơn hàng
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusLabel(order.status);
            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mã đơn hàng</p>
                    <p className="font-bold text-lg text-gray-900">
                      #{order._id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex justify-end items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {new Date(order.orderTime).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4 border-b">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Sản phẩm ({order.orderItems.length})
                  </h3>
                  <div className="space-y-3">
                    {order.orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 pb-3 border-b last:border-b-0"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product?.productName}
                              className="w-full h-full object-contain p-2"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.product?.productName || "Sản phẩm"}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            {item.size && (
                              <span className="text-sm text-gray-600">
                                Size: {item.size}
                              </span>
                            )}
                            <span className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(
                                (item.product?.price || 0) * item.quantity,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address - dùng đúng field từ DB */}
                <div className="px-6 py-4 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Địa chỉ giao hàng
                  </h3>
                  {order.shippingAddress ? (
                    <>
                      {order.shippingAddress.fullName && (
                        <p className="text-gray-700">{order.shippingAddress.fullName}</p>
                      )}
                      {order.shippingAddress.address && (
                        <p className="text-gray-700">{order.shippingAddress.address}</p>
                      )}
                      {order.shippingAddress.telephone && (
                        <p className="text-gray-700">
                          SĐT: {order.shippingAddress.telephone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">Không có thông tin địa chỉ</p>
                  )}
                  {order.note && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-medium text-gray-600">
                        <b>Ghi chú:</b> {order.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Total */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                       <b>Tổng tiền:</b>{" "}
                       <span className="font-semibold text-gray-900">
                        {formatPrice(order.totalPrice)}
                       </span>{" "}
                        -{" "}
                       <span className="font-medium text-gray-900">
                        {order.paymentMethod}
                       </span>
                    </p>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full border ${statusInfo.color}`}>
                      {statusInfo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}