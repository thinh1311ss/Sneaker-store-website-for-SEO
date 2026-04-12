"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/api";
import Breadcrumb from "@/components/Breadcrumb";

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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  shipping:  { label: "Đang giao",    color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Đã giao",      color: "bg-green-100 text-green-700" },
  completed: { label: "Hoàn thành",   color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã huỷ",       color: "bg-red-100 text-red-700" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ telephone: "", street: "", city: "", state: "", zipCode: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => { if (token) fetchUserInfo(); }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) { setError("Vui lòng đăng nhập lại"); setLoading(false); return; }

      const userRes = await fetch(`${API_BASE_URL}/api/user/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) {
        const errorData = await userRes.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Không thể tải thông tin người dùng");
      }
      const userData: UserInfo = await userRes.json();
      setUserInfo(userData);
      setFormData({
        telephone: userData.telephone ? userData.telephone.toString() : "",
        street: userData.shippingAddress?.street || "",
        city: userData.shippingAddress?.city || "",
        state: userData.shippingAddress?.state || "",
        zipCode: userData.shippingAddress?.zipCode || "",
      });

      const ordersRes = await fetch(`${API_BASE_URL}/api/auth/user/${userData._id}/orders`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!ordersRes.ok) {
        setOrders([]);
      } else {
        const ordersData: Order[] = await ordersRes.json();
        setOrders(ordersData.sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!token || !userInfo) return;
    try {
      setIsSaving(true);
      setSaveMessage(null);
      const payload = {
        telephone: formData.telephone ? parseInt(formData.telephone) : undefined,
        shippingAddress: {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: "Việt Nam",
        },
      };
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Không thể cập nhật hồ sơ");
      }
      const result = await response.json();
      setUserInfo(result.user);
      setIsEditing(false);
      setSaveMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: "error", text: err instanceof Error ? err.message : "Lỗi khi cập nhật hồ sơ" });
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
          <Link href="/" className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <Breadcrumb items={[{ label: "Tài khoản" }]} />

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Tài khoản của tôi</h1>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Mobile: horizontal tabs; Desktop: sticky sidebar */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 lg:sticky lg:top-24">
            <div className="text-center mb-5 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white text-xl sm:text-2xl font-bold">
                {userInfo.userName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{userInfo.userName}</h2>
              <p className="text-sm text-gray-600 mt-1 break-all">{userInfo.email}</p>
            </div>
            <nav className="flex lg:flex-col gap-2 border-t pt-4 overflow-x-auto pb-1 lg:pb-0 lg:overflow-visible">
              <Link href="/profile" className="flex-shrink-0 lg:flex-shrink block px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium transition text-sm sm:text-base">
                Hồ sơ
              </Link>
              <Link href="/orders" className="flex-shrink-0 lg:flex-shrink block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition text-sm sm:text-base">
                Đơn hàng
              </Link>
              <Link href="/settings" className="flex-shrink-0 lg:flex-shrink block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition text-sm sm:text-base">
                Cài đặt
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {saveMessage && (
            <div className={`rounded-lg p-4 ${saveMessage.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {saveMessage.text}
            </div>
          )}

          {/* User Info Section */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-gray-900">Thông tin cá nhân</h2>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Tên</label>
                  <p className="text-base sm:text-lg font-medium text-gray-900">{userInfo.userName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-base sm:text-lg font-medium text-gray-900 break-all">{userInfo.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Số điện thoại</label>
                  <p className="text-base sm:text-lg font-medium text-gray-900">
                    {userInfo.telephone ? `+84${userInfo.telephone}` : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Địa chỉ giao hàng mặc định</h3>
                  {userInfo.shippingAddress?.street || userInfo.shippingAddress?.city || userInfo.shippingAddress?.state ? (
                    <p className="text-gray-700">
                      {userInfo.shippingAddress?.street && `${userInfo.shippingAddress.street}, `}
                      {userInfo.shippingAddress?.city && `${userInfo.shippingAddress.city}, `}
                      {userInfo.shippingAddress?.state && `${userInfo.shippingAddress.state}`}
                      {userInfo.shippingAddress?.zipCode && ` - ${userInfo.shippingAddress.zipCode}`}
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
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                    placeholder="098 1234 5678" />
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Địa chỉ giao hàng</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Đường</label>
                      <input type="text" name="street" value={formData.street} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        placeholder="Số nhà, tên đường" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                          placeholder="TP. Hồ Chí Minh" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                          placeholder="Tỉnh/Thành phố" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mã bưu điện</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                        placeholder="700000" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isSaving}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50">
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order History Section */}
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6 text-gray-900">Lịch sử đơn hàng</h2>

            {orders.length === 0 ? (
              <div className="text-center py-10 sm:py-12">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">Chưa có đơn hàng nào</p>
                <Link href="/" className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 text-sm">Mã đơn</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 text-sm">Ngày đặt</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 text-sm hidden md:table-cell">Địa chỉ</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-900 text-sm">Tổng tiền</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-900 text-sm">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const info = STATUS_MAP[order.status ?? "pending"] ?? STATUS_MAP["pending"];
                        return (
                          <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <Link href="/orders" className="text-red-600 hover:text-red-700 font-medium text-sm">
                                {order._id.substring(0, 8).toUpperCase()}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-sm whitespace-nowrap">
                              {new Date(order.orderTime).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-sm hidden md:table-cell max-w-[160px]">
                              <span className="line-clamp-1">{order.shippingAddress?.address || "—"}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900 text-sm whitespace-nowrap">
                              {formatPrice(order.totalPrice)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${info.color}`}>
                                {info.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden space-y-3">
                  {orders.map((order) => {
                    const info = STATUS_MAP[order.status ?? "pending"] ?? STATUS_MAP["pending"];
                    return (
                      <div key={order._id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Link href="/orders" className="text-red-600 font-bold text-sm">
                            #{order._id.substring(0, 8).toUpperCase()}
                          </Link>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${info.color}`}>
                            {info.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(order.orderTime).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{order.orderItems.length} sản phẩm</span>
                          <span className="font-semibold text-gray-900 text-sm">{formatPrice(order.totalPrice)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}