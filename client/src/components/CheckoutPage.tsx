"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/products";

interface ShippingAddress {
  fullName: string;
  telephone: string;
  street: string;
  city: string;
  state: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SHIPPING_FEE = 30000; // 30k phí ship

export default function CheckoutPage() {
  const { cartItems, cartCount, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"cod" | "transfer">(
    "cod",
  );
  // Xử lý khi chọn phương thức thanh toán
  const handlePaymentChange = (method: "cod" | "transfer") => {
    setSelectedPayment(method);
    setShowBankTransfer(method === "transfer");
  };

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.userName || "",
    tphone: "",
    street: "",
    city: "",
    state: "",
  });

  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect if cart is empty or not authenticated
  useEffect(() => {
    if (cartCount === 0) {
      router.push("/cart");
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [cartCount, isAuthenticated, router]);

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal > 500000 ? 0 : SHIPPING_FEE; // Free shipping over 500k
  const total = subtotal + shipping;

  const validateForm = (): string | null => {
    if (!shippingAddress.fullName.trim()) return "Vui lòng nhập họ tên";
    if (!shippingAddress.telephone.trim()) return "Vui lòng nhập số điện thoại";
    if (!shippingAddress.street.trim()) return "Vui lòng nhập địa chỉ";
    if (!shippingAddress.city.trim()) return "Vui lòng nhập thành phố/quận";
    if (!shippingAddress.state.trim()) return "Vui lòng nhập tỉnh/thành phố";
    return null;
  };

  const handleSubmitOrder = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const orderData = {
        user: user?._id, // Gửi ObjectId của User
        orderItems: cartItems.map((item) => ({
          product: item.product._id || item.product.id, // Dùng _id từ MongoDB
          size: item.size
            ? item.size.replace("US ", "US").replace(".", "_")
            : undefined, // Convert "US 6.5" -> "US6_5"
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          telephone: shippingAddress.telephone,
          address:
            `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} || '' `.trim(),
        },
        note: note.trim(),
        orderTime: new Date().toISOString(),
        paymentMethod: selectedPayment === "cod" ? "COD" : "BANK_TRANSFER",
        totalPrice: total,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      // Backend trả về text "create order successfully" không phải JSON
      const responseText = await response.text();

      if (response.ok) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      } else {
        // Error - try parse JSON error
        try {
          const errorData = JSON.parse(responseText);
          setError(
            errorData.error || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
          );
        } catch {
          setError(
            responseText || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
          );
        }
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để tiếp tục đặt hàng.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đặt hàng thành công!
          </h2>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
          <p className="text-sm text-gray-500">
            Bạn sẽ được chuyển hướng đến trang đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Trang chủ
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/cart" className="hover:text-gray-700">
                Giỏ hàng
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Thanh toán</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shipping Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Thông tin giao hàng
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    handleAddressChange("fullName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={shippingAddress.telephone}
                  onChange={(e) =>
                    handleAddressChange("telephone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) =>
                    handleAddressChange("street", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Số nhà, tên đường"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quận/Huyện *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Quận/Huyện"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Tỉnh/Thành phố"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ghi chú về đơn hàng (tùy chọn)"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Tóm tắt đơn hàng
            </h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${index}`}
                  className="flex items-center gap-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    {item.size && (
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-gray-900">
                  {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                </span>
              </div>
              {subtotal > 500000 && (
                <p className="text-xs text-green-600">
                  Miễn phí vận chuyển cho đơn hàng từ 500.000đ
                </p>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-900">Tổng cộng:</span>
                <span className="text-red-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Phương thức thanh toán
              </h3>

              <div className="space-y-4">
                {/* COD */}
                <div className="flex items-center">
                  <input
                    id="payment-cod"
                    name="payment-method"
                    type="radio"
                    checked={selectedPayment === "cod"}
                    onChange={() => handlePaymentChange("cod")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label
                    htmlFor="payment-cod"
                    className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>

                {/* Chuyển khoản ngân hàng */}
                <div>
                  <div className="flex items-center">
                    <input
                      id="payment-transfer"
                      name="payment-method"
                      type="radio"
                      checked={selectedPayment === "transfer"}
                      onChange={() => handlePaymentChange("transfer")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label
                      htmlFor="payment-transfer"
                      className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Chuyển khoản ngân hàng
                    </label>
                  </div>

                  {/* Phần thông tin chuyển khoản hiện khi chọn */}
                  {showBankTransfer && (
                    <div className="mt-4 ml-7 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                      <p className="text-sm text-gray-600 mb-4">
                        Hiện tại các cổng thanh toán đang gặp vấn đề. <br />
                        Xin lỗi vì sự bất tiện này. Bạn có thể chuyển khoản trực
                        tiếp cho shop nhé!
                      </p>

                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Thông tin ngân hàng */}
                        <div className="flex-1 space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">
                              Ngân hàng:
                            </span>
                            <span className="ml-2 text-gray-700">
                              Vietcombank
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              Số tài khoản:
                            </span>
                            <span className="ml-2 font-mono text-gray-700">
                              1030995840
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              Chủ tài khoản:
                            </span>
                            <span className="ml-2 text-gray-700">
                              Nguyen Phuoc Thinh
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              Nội dung CK:
                            </span>
                            <span className="ml-2 text-gray-700">
                              Đơn hàng #
                            </span>
                          </div>
                        </div>

                        {/* Mã QR */}
                        <div className="flex-shrink-0 text-center">
                          <p className="text-xs text-gray-500 mb-2">
                            Quét mã QR để chuyển khoản
                          </p>
                          <div className="">
                            <Image
                              src="/Qr.jpg"
                              alt="Mã QR chuyển khoản"
                              width={160}
                              height={160}
                              className="mx-auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full mt-6 bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                `Đặt hàng - ${formatPrice(total)}`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Bằng việc đặt hàng, bạn đồng ý với các điều khoản và chính sách
              của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
