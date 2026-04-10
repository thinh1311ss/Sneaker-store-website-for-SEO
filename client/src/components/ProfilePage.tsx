"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/products";

interface UserInfo {
  _id: string;
  userName: string;
  email: string;
  telephone: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface OrderItem {
  product: string;
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    telephone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch user info and orders
  useEffect(() => {
    if (!isAuthenticated) return;
    // Wait a bit for token to be loaded from localStorage
    const timer = setTimeout(() => {
      if (token) {
        fetchUserInfo();
      } else {
        console.log("Token not available yet");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        console.error("No token available");
        setError("Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      console.log(
        "Fetching user info with token:",
        token.substring(0, 20) + "...",
      );

      // Get current user info
      const userRes = await fetch(`${API_BASE_URL}/api/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User API response status:", userRes.status);

      if (!userRes.ok) {
        const errorData = await userRes.json().catch(() => ({}));
        console.error("User API error:", errorData);
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Không thể tải thông tin người dùng",
        );
      }

      const userData: UserInfo = await userRes.json();
      console.log("User data received:", userData);
      setUserInfo(userData);

      // Set form data with proper null handling
      setFormData({
        telephone: userData.telephone ? userData.telephone.toString() : "",
        street: userData.shippingAddress?.street || "",
        city: userData.shippingAddress?.city || "",
        state: userData.shippingAddress?.state || "",
        zipCode: userData.shippingAddress?.zipCode || "",
      });

      // Get user orders
      const ordersRes = await fetch(
        `${API_BASE_URL}/api/auth/user/${userData._id}/orders`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Orders API response status:", ordersRes.status);

      if (!ordersRes.ok) {
        console.warn("Không thể tải lịch sử đơn hàng");
        setOrders([]);
      } else {
        const ordersData: Order[] = await ordersRes.json();
        console.log("Orders data received:", ordersData);
        // Sort orders by date (newest first)
        const sortedOrders = ordersData.sort(
          (a, b) =>
            new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime(),
        );
        setOrders(sortedOrders);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải thông tin người dùng",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!token || !userInfo) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);

      const payload = {
        telephone: formData.telephone
          ? parseInt(formData.telephone)
          : undefined,
        shippingAddress: {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: "Việt Nam",
        },
      };

      console.log("Saving profile with payload:", payload);

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Update response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Update error:", errorData);
        throw new Error(
          errorData.message || errorData.error || "Không thể cập nhật hồ sơ",
        );
      }

      const result = await response.json();
      console.log("Update result:", result);
      setUserInfo(result.user);
      setIsEditing(false);
      setSaveMessage({
        type: "success",
        text: "Cập nhật hồ sơ thành công!",
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi khi cập nhật hồ sơ",
      });
    } finally {
      setIsSaving(false);
    }
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

  if (error || !userInfo) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
          <p className="text-red-700 mb-4">{error || "Không thể tải hồ sơ"}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Quay lại trang chủ
          </Link>
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
            <Link
              href="/"
              className="text-gray-500 hover:text-red-500 transition"
            >
              Trang chủ
            </Link>
          </li>
          <li className="text-gray-300">/</li>
          <li className="text-gray-900 font-medium">Tài khoản của tôi</li>
        </ol>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Tài khoản của tôi</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 h-fit">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                {userInfo.userName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {userInfo.userName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{userInfo.email}</p>
            </div>

            <nav className="space-y-2 border-t pt-4">
              <Link
                href="/profile"
                className="block px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium transition"
              >
                Hồ sơ
              </Link>
              <Link
                href="/orders"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                Đơn hàng
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                Cài đặt
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Message */}
          {saveMessage && (
            <div
              className={`rounded-lg p-4 ${
                saveMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          {/* User Info Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Thông tin cá nhân
            </h2>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Tên</label>
                  <p className="text-lg font-medium text-gray-900">
                    {userInfo.userName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-lg font-medium text-gray-900">
                    {userInfo.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Số điện thoại</label>
                  <p className="text-lg font-medium text-gray-900">
                    +84{userInfo.telephone || "Chưa cập nhật"}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Địa chỉ giao hàng mặc định
                  </h3>
                  {userInfo.shippingAddress?.street ||
                  userInfo.shippingAddress?.city ||
                  userInfo.shippingAddress?.state ? (
                    <p className="text-gray-700">
                      {userInfo.shippingAddress?.street &&
                        `${userInfo.shippingAddress.street}, `}
                      {userInfo.shippingAddress?.city &&
                        `${userInfo.shippingAddress.city}, `}
                      {userInfo.shippingAddress?.state &&
                        `${userInfo.shippingAddress.state}`}
                      {userInfo.shippingAddress?.zipCode &&
                        ` - ${userInfo.shippingAddress.zipCode}`}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Chưa cập nhật</p>
                  )}
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProfile();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    placeholder="098 1234 5678"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Địa chỉ giao hàng
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đường
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        placeholder="Số nhà, tên đường"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thành phố
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                          placeholder="TP. Hồ Chí Minh"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh/Thành
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                          placeholder="Tỉnh/Thành phố"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã bưu điện
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        placeholder="700000"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order History Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Lịch sử đơn hàng
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
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
                <p className="text-gray-600">Chưa có đơn hàng nào</p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Mã đơn
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Ngày đặt
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Địa chỉ
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-900">
                        Tổng tiền
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/orders`}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            {order._id.substring(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(order.orderTime).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {order.shippingAddress?.address || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}