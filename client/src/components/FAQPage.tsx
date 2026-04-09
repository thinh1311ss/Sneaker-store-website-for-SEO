'use client';

import { useState, useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const CartSVG = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const CardSVG = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const TruckSVG = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h6m2-1l2-8h3l2 8H13z" />
  </svg>
);
const RefreshSVG = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const UserSVG = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM12 20a8 8 0 100-16 8 8 0 000 16z" />
  </svg>
);
const ChatSVG = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const StarSVG = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const HandshakeSVG = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const faqData: FAQCategory[] = [
  {
    id: 'dat-hang',
    label: 'Đặt hàng',
    icon: <CartSVG />,
    items: [
      {
        question: 'Làm thế nào để đặt hàng?',
        answer: 'Để đặt hàng tại Sneaker Store, Quý khách thực hiện các bước sau:\n• Bước 1: Truy cập website sneakerstore.vn\n• Bước 2: Tìm kiếm sản phẩm yêu thích\n• Bước 3: Chọn size và số lượng\n• Bước 4: Thêm vào giỏ hàng và tiến hành đặt hàng\n• Bước 5: Nhập thông tin giao hàng\n• Bước 6: Chọn hình thức thanh toán\n• Bước 7: Hoàn tất đặt hàng',
      },
      {
        question: 'Làm thế nào để hủy đơn hàng đã đặt?',
        answer: 'Vui lòng liên hệ hotline 1900 xxxx xx hoặc email contact@sneakerstore.vn trong vòng 2 giờ sau khi đặt hàng.',
      },
      {
        question: 'Làm thế nào để biết đơn hàng đã được đặt thành công?',
        answer: 'Sau khi đặt hàng thành công, hệ thống sẽ gửi email xác nhận đến địa chỉ email bạn đã đăng ký.',
      },
      {
        question: 'Tôi có thể đổi sản phẩm trong đơn hàng sau khi đặt không?',
        answer: 'Có thể nếu đơn hàng chưa được xử lý. Vui lòng liên hệ ngay qua hotline hoặc live chat.',
      },
      {
        question: 'Tại sao đơn hàng của tôi bị hủy?',
        answer: 'Đơn hàng có thể bị hủy vì: sản phẩm hết hàng, thông tin thanh toán không hợp lệ, địa chỉ không rõ ràng, hoặc không liên lạc được với khách hàng.',
      },
    ],
  },
  {
    id: 'thanh-toan',
    label: 'Thanh toán',
    icon: <CardSVG />,
    items: [
      {
        question: 'Các hình thức thanh toán được chấp nhận?',
        answer: 'Chúng tôi chấp nhận:\n• Thanh toán khi nhận hàng (COD)\n• Chuyển khoản ngân hàng\n• Thẻ tín dụng/ghi nợ (Visa, Mastercard)\n• Ví điện tử (MoMo, ZaloPay, VNPay)',
      },
      {
        question: 'Thanh toán online có an toàn không?',
        answer: 'Tất cả giao dịch được bảo mật bằng SSL 256-bit. Chúng tôi không lưu trữ thông tin thẻ của bạn.',
      },
      {
        question: 'Tôi có thể xuất hóa đơn VAT không?',
        answer: 'Chúng tôi hỗ trợ xuất hóa đơn VAT. Cung cấp thông tin doanh nghiệp khi đặt hàng hoặc liên hệ trong vòng 24 giờ sau nhận hàng.',
      },
    ],
  },
  {
    id: 'giao-nhan',
    label: 'Giao nhận',
    icon: <TruckSVG />,
    items: [
      {
        question: 'Thời gian giao hàng là bao lâu?',
        answer: 'Thời gian giao hàng dự kiến:\n• Nội thành TP.HCM & Hà Nội: 1-2 ngày làm việc\n• Các tỉnh thành khác: 3-5 ngày\n• Vùng sâu vùng xa: 5-7 ngày',
      },
      {
        question: 'Phí vận chuyển như thế nào?',
        answer: 'Miễn phí vận chuyển cho đơn từ 2.000.000đ. Dưới mức này phí từ 25.000đ - 50.000đ tùy khu vực.',
      },
      {
        question: 'Tôi có thể theo dõi đơn hàng không?',
        answer: 'Sau khi giao cho đơn vị vận chuyển, bạn sẽ nhận mã vận đơn qua email/SMS để theo dõi.',
      },
    ],
  },
  {
    id: 'doi-tra-bao-hanh',
    label: 'Đổi trả - Bảo hành',
    icon: <RefreshSVG />,
    items: [
      {
        question: 'Chính sách đổi trả như thế nào?',
        answer: 'Hỗ trợ đổi trả trong 30 ngày kể từ ngày nhận hàng với điều kiện:\n• Còn nguyên tem nhãn\n• Chưa qua sử dụng\n• Còn đầy đủ hộp và phụ kiện\n• Có hóa đơn mua hàng',
      },
      {
        question: 'Chính sách bảo hành là gì?',
        answer: 'Tất cả sản phẩm được bảo hành 12 tháng đối với lỗi từ nhà sản xuất. Không áp dụng cho hư hỏng do sử dụng sai cách hoặc tác động vật lý.',
      },
      {
        question: 'Quy trình đổi trả như thế nào?',
        answer: 'Bước 1: Liên hệ hotline hoặc email để tạo yêu cầu đổi trả.\nBước 2: Đóng gói sản phẩm kèm hóa đơn và gửi về kho.\nBước 3: Chúng tôi xử lý trong 3-5 ngày làm việc.',
      },
    ],
  },
  {
    id: 'tai-khoan',
    label: 'Tài khoản',
    icon: <UserSVG />,
    items: [
      {
        question: 'Làm thế nào để tạo tài khoản?',
        answer: 'Nhấn "Đăng ký" ở góc trên bên phải, điền thông tin và email. Kiểm tra email để kích hoạt tài khoản.',
      },
      {
        question: 'Tôi quên mật khẩu phải làm sao?',
        answer: 'Nhấn "Quên mật khẩu" trên trang đăng nhập, nhập email đã đăng ký. Link đặt lại sẽ được gửi trong vài phút.',
      },
    ],
  },
  {
    id: 'lien-he',
    label: 'Liên hệ',
    icon: <ChatSVG />,
    items: [
      {
        question: 'Làm thế nào để liên hệ với Sneaker Store?',
        answer: 'Liên hệ qua:\n• Hotline: 1900 xxxx xx (8:00 - 22:00, T2 - CN)\n• Email: contact@sneakerstore.vn\n• Live chat trên website\n• Fanpage Facebook: SneakerStore Vietnam',
      },
    ],
  },
  {
    id: 'bieu-mau',
    label: 'Biểu mẫu',
    icon: <StarSVG />,
    items: [
      {
        question: 'Các biểu mẫu hỗ trợ gồm những gì?',
        answer: 'Chúng tôi cung cấp:\n• Yêu cầu đổi/trả hàng\n• Yêu cầu hủy đơn hàng\n• Khiếu nại sản phẩm\n• Yêu cầu bảo hành\nTất cả có thể nộp trực tuyến qua website.',
      },
    ],
  },
  {
    id: 'hop-tac',
    label: 'Hợp tác',
    icon: <HandshakeSVG />,
    items: [
      {
        question: 'Làm thế nào để trở thành đối tác/đại lý?',
        answer: 'Gửi thông tin doanh nghiệp về email: business@sneakerstore.vn. Đội ngũ kinh doanh phản hồi trong 2-3 ngày làm việc.',
      },
      {
        question: 'Chính sách affiliate là gì?',
        answer: 'Hoa hồng từ 5-10% cho mỗi đơn hàng thành công qua link giới thiệu. Đăng ký tại mục "Đối tác" trên website.',
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('dat-hang');
  const [openItem, setOpenItem] = useState<number | null>(null);

  // Đọc hash từ URL khi trang load
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && faqData.some((c) => c.id === hash)) {
      setActiveCategory(hash);
    }
  }, []);

  // Lắng nghe thay đổi hash (khi navigate từ trang khác)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && faqData.some((c) => c.id === hash)) {
        setActiveCategory(hash);
        setOpenItem(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const currentCategory = faqData.find((c) => c.id === activeCategory)!;

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    setOpenItem(null);
    window.history.replaceState(null, '', `#${id}`);
  };

  const handleToggle = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-10">Hỗ trợ và giải đáp thắc mắc</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <ul className="flex flex-col border border-gray-200 divide-y divide-gray-200">
            {faqData.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors text-left ${
                    activeCategory === cat.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className={activeCategory === cat.id ? 'text-white' : 'text-gray-500'}>
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Accordion */}
        <section className="flex-1">
          <ul className="flex flex-col border border-gray-200 divide-y divide-gray-200">
            {currentCategory.items.map((item, index) => (
              <li key={index} className="bg-gray-50">
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors"
                >
                  <span>{item.question}</span>
                  {openItem === index ? (
                    <svg className="w-4 h-4 flex-shrink-0 ml-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0 ml-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                {openItem === index && (
                  <div className="px-5 pb-5 pt-3 text-sm text-gray-700 leading-relaxed border-t border-gray-200 bg-white whitespace-pre-line">
                    {item.answer}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}