"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/products";
import Toast from "./Toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TabType = "products" | "orders" | "users" | "vouchers";

interface Product {
  _id: string;
  productName: string;
  brand: string;
  price: number;
  category: string;
  sizes: Record<string, number>;
  description: string;
  quantity: number;
  images: string[];
}

interface Order {
  _id: string;
  user:
    | {
        _id: string;
        userName: string;
        email: string;
      }
    | string;
  totalPrice: number;
  orderTime: string;
  status: string;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
  };
}

interface User {
  _id: string;
  userName: string;
  email: string;
  telephone: string;
  role: string;
}

interface Voucher {
  _id: string;
  voucherName: string;
  discount: number;
  discountType: string;
  expiryDate: string;
}

interface ProductFormData {
  productName: string;
  brand: string;
  price: string;
  category: string;
  sizes: Record<string, string>;
  description: string;
  quantity: string;
  images: string[];
}

const validCategories = ["Sneaker", "Chạy bộ", "Đi bộ", "Thể thao", "Khác"];
const expectedSizes = [
  "US6",
  "US6_5",
  "US7",
  "US7_5",
  "US8",
  "US8_5",
  "US9",
  "US9_5",
  "US10",
  "US10_5",
];

export default function AdminDashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusMap, setOrderStatusMap] = useState<Record<string, string>>(
    {},
  );

  // Users state
  const [users, setUsers] = useState<User[]>([]);

  // Vouchers state
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    brand: "",
    price: "",
    category: "Sneaker",
    sizes: expectedSizes.reduce((acc, size) => ({ ...acc, [size]: "" }), {}),
    description: "",
    quantity: "",
    images: [],
  });

  // Check authentication and admin role
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/");
      return;
    }

    fetchData(activeTab);
  }, [isAuthenticated, user, router, activeTab]);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "success",
  ) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const fetchData = async (tab: TabType) => {
    setLoading(true);
    try {
      switch (tab) {
        case "products":
          await fetchProducts();
          break;
        case "orders":
          await fetchOrders();
          break;
        case "users":
          await fetchUsers();
          break;
        case "vouchers":
          await fetchVouchers();
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      showToast(`Lỗi khi tải dữ liệu ${tab}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/api/product`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách sản phẩm");
    }

    const data = await response.json();
    setProducts(data);
  };

  const fetchOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/order`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách đơn hàng");
    }

    const data = await response.json();
    setOrders(data);
    // Initialize status map
    const statusMap: Record<string, string> = {};
    data.forEach((order: Order) => {
      statusMap[order._id] = order.status;
    });
    setOrderStatusMap(statusMap);
  };

  const fetchUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/admin/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách người dùng");
    }

    const data = await response.json();
    setUsers(data);
  };

  const fetchVouchers = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/admin/voucher`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách mã giảm giá");
    }

    const data = await response.json();
    setVouchers(data);
  };

  // Product handlers
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizeChange = (size: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: value,
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = e.target.value
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url);
    setFormData((prev) => ({
      ...prev,
      images: urls,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.productName.trim()) {
      showToast("Tên sản phẩm không được để trống", "warning");
      return false;
    }
    if (!formData.brand.trim()) {
      showToast("Thương hiệu không được để trống", "warning");
      return false;
    }
    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      showToast("Giá sản phẩm phải là số dương", "warning");
      return false;
    }
    if (!validCategories.includes(formData.category)) {
      showToast("Danh mục không hợp lệ", "warning");
      return false;
    }

    const hasValidSize = expectedSizes.some((size) => {
      const qty = Number(formData.sizes[size] || 0);
      return qty > 0;
    });

    if (!hasValidSize) {
      showToast("Phải có ít nhất một size với số lượng > 0", "warning");
      return false;
    }

    if (!formData.images.length) {
      showToast("Phải có ít nhất một hình ảnh", "warning");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      brand: "",
      price: "",
      category: "Sneaker",
      sizes: expectedSizes.reduce((acc, size) => ({ ...acc, [size]: "" }), {}),
      description: "",
      quantity: "",
      images: [],
    });
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    try {
      const normalizedSizes = expectedSizes.reduce(
        (acc, size) => {
          acc[size] = Number(formData.sizes[size] || 0);
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalSizes = expectedSizes.reduce(
        (total, size) => total + Number(formData.sizes[size] || 0),
        0,
      );

      const productData = {
        productName: formData.productName,
        brand: formData.brand,
        price: Number(formData.price),
        category: formData.category,
        sizes: normalizedSizes,
        description: formData.description,
        quantity: totalSizes,
        images: formData.images,
      };

      const response = await fetch(`${API_BASE_URL}/api/product/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm sản phẩm");
      }

      showToast("Thêm sản phẩm thành công!", "success");
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      showToast("Lỗi khi thêm sản phẩm", "error");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      brand: product.brand,
      price: product.price.toString(),
      category: product.category,
      sizes: expectedSizes.reduce(
        (acc, size) => ({
          ...acc,
          [size]: (product.sizes[size] || 0).toString(),
        }),
        {},
      ),
      description: product.description,
      quantity: product.quantity.toString(),
      images: product.images,
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!validateForm() || !editingProduct) return;

    try {
      const normalizedSizes = expectedSizes.reduce(
        (acc, size) => {
          acc[size] = Number(formData.sizes[size] || 0);
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalSizes = expectedSizes.reduce(
        (total, size) => total + Number(formData.sizes[size] || 0),
        0,
      );

      const productData = {
        productName: formData.productName,
        brand: formData.brand,
        price: Number(formData.price),
        category: formData.category,
        sizes: normalizedSizes,
        description: formData.description,
        quantity: totalSizes,
        images: formData.images,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/product/update/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        },
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật sản phẩm");
      }

      showToast("Cập nhật sản phẩm thành công!", "success");
      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      showToast("Lỗi khi cập nhật sản phẩm", "error");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/product/delete/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Không thể xóa sản phẩm");
      }

      showToast("Xóa sản phẩm thành công!", "success");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Lỗi khi xóa sản phẩm", "error");
    }
  };

  // Order handlers
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/order/update/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }

      setOrderStatusMap((prev) => ({
        ...prev,
        [orderId]: newStatus,
      }));
      showToast("Cập nhật trạng thái đơn hàng thành công!", "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Lỗi khi cập nhật trạng thái", "error");
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Quản lý hệ thống</h1>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: "products", label: "📦 Sản phẩm", icon: "📦" },
            { id: "orders", label: "📋 Đơn hàng", icon: "📋" },
            { id: "users", label: "👥 Người dùng", icon: "👥" },
            { id: "vouchers", label: "🎟️ Mã giảm giá", icon: "🎟️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <Link
            href="/admin/blog-management"
            className="block w-full rounded-lg border border-gray-200 bg-slate-50 px-4 py-3 text-left text-gray-700 font-medium transition hover:bg-gray-100"
          >
            📝 Quản lý Blog
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Quản lý sản phẩm
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Tổng cộng: {products.length} sản phẩm
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Hình ảnh
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Tên sản phẩm
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Thương hiệu
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Giá
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Số lượng
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {products.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              Chưa có sản phẩm nào
                            </td>
                          </tr>
                        ) : (
                          products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <img
                                  src={product.images[0] || "/placeholder.png"}
                                  alt={product.productName}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder.png";
                                  }}
                                />
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {product.productName}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {product.brand}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {formatPrice(product.price)}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {product.quantity}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProduct(product._id)
                                    }
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Quản lý đơn hàng
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Tổng cộng: {orders.length} đơn hàng
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Mã đơn hàng
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Khách hàng
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Tổng tiền
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Ngày đặt
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Trạng thái
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Cập nhật
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              Chưa có đơn hàng nào
                            </td>
                          </tr>
                        ) : (
                          orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900 text-sm">
                                {order._id.slice(-6)}
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                {typeof order.user === "object" &&
                                order.user?.userName
                                  ? order.user.userName
                                  : order.shippingAddress?.fullName || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-gray-700 text-sm">
                                {typeof order.user === "object" &&
                                order.user?.email
                                  ? order.user.email
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 font-medium text-red-600">
                                {formatPrice(order.totalPrice || 0)}
                              </td>
                              <td className="px-6 py-4 text-gray-700 text-sm">
                                {new Date(order.orderTime).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {(() => {
                                  const currentStatus =
                                    orderStatusMap[order._id] ||
                                    order.status ||
                                    "pending";

                                  return (
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        currentStatus === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : currentStatus === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : currentStatus === "cancelled"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {currentStatus === "pending"
                                        ? "Chờ xử lý"
                                        : currentStatus === "completed"
                                          ? "Hoàn thành"
                                          : currentStatus === "cancelled"
                                            ? "Đã hủy"
                                            : currentStatus}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={
                                    orderStatusMap[order._id] || order.status
                                  }
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(
                                      order._id,
                                      e.target.value,
                                    )
                                  }
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                  <option value="pending">Chờ xử lý</option>
                                  <option value="completed">Hoàn thành</option>
                                  <option value="cancelled">Hủy</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Quản lý người dùng
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Tổng cộng: {users.length} người dùng
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Tên người dùng
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Số điện thoại
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              Chưa có người dùng nào
                            </td>
                          </tr>
                        ) : (
                          users.map((userItem) => (
                            <tr key={userItem._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {userItem.userName}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {userItem.email}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {userItem.telephone || "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    userItem.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {userItem.role === "admin" ? "Admin" : "User"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Vouchers Tab */}
            {activeTab === "vouchers" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Quản lý mã giảm giá
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Tổng cộng: {vouchers.length} mã
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Mã giảm giá
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Mô tả
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Loại
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Giá trị
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                            Ngày hết hạn
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vouchers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              Chưa có mã giảm giá nào
                            </td>
                          </tr>
                        ) : (
                          vouchers.map((voucher) => (
                            <tr key={voucher._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900 bg-yellow-50 text-yellow-900">
                                {voucher.voucherName}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                Mã giảm giá
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                  {voucher.discountType === "percentage"
                                    ? "Phần trăm"
                                    : "Tiền mặt"}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-red-600">
                                {voucher.discountType === "percentage"
                                  ? `${voucher.discount}%`
                                  : formatPrice(voucher.discount)}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {new Date(
                                  voucher.expiryDate,
                                ).toLocaleDateString("vi-VN")}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập thương hiệu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {validCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size và số lượng
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {expectedSizes.map((size) => (
                      <div key={size}>
                        <label className="block text-xs text-gray-600 mb-1">
                          {size}
                        </label>
                        <input
                          type="number"
                          value={formData.sizes[size]}
                          onChange={(e) =>
                            handleSizeChange(size, e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh (URL, cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.images.join(", ")}
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Thêm sản phẩm
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Chỉnh sửa sản phẩm</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập thương hiệu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {validCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size và số lượng
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {expectedSizes.map((size) => (
                      <div key={size}>
                        <label className="block text-xs text-gray-600 mb-1">
                          {size}
                        </label>
                        <input
                          type="number"
                          value={formData.sizes[size]}
                          onChange={(e) =>
                            handleSizeChange(size, e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh (URL, cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.images.join(", ")}
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleUpdateProduct}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Cập nhật
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
