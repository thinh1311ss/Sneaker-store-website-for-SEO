<<<<<<< HEAD
# 🏪 Sneaker Store Vietnam - Next.js SEO Project

Website bán giày sneaker chính hãng với cấu trúc SEO tối ưu, được xây dựng bằng Next.js 14 App Router.

# UIT Sneakers - Sneaker Store Website for SEO

🔗 **Live Demo:** [https://www.uitsneakers.io.vn](https://www.uitsneakers.io.vn)

## Performance
- PageSpeed Performance: 100/100
- Accessibility: 95/100
- Best Practices: 100/100
- SEO: 100/100

## Tech Stack
- Next.js 14 (App Router + Server Components)
- MongoDB
- Tailwind CSS
- Vercel

## Features
- Server-Side Rendering cho SEO
- Product Schema (Rich Results)
- Dynamic Sitemap
- Image Optimization (WebP/AVIF)

## ✨ Tính năng SEO

- ✅ **Static Site Generation (SSG)** - Trang được pre-render, load nhanh
- ✅ **Dynamic Metadata** - Title, description, OpenGraph cho từng trang
- ✅ **Schema.org JSON-LD** - Product, Organization, BreadcrumbList
- ✅ **Sitemap tự động** - `/sitemap.xml` cho tất cả sản phẩm
- ✅ **Robots.txt** - Cấu hình crawl cho search engines
- ✅ **Canonical URLs** - Tránh duplicate content
- ✅ **Vietnamese SEO** - Tối ưu cho thị trường Việt Nam
- ✅ **Mobile-first** - Responsive, tối ưu Core Web Vitals

## 📁 Cấu trúc Project

```
sneaker-store/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + global metadata
│   │   ├── page.tsx            # Trang chủ
│   │   ├── sitemap.ts          # Sitemap tự động
│   │   ├── robots.ts           # Robots.txt
│   │   ├── not-found.tsx       # Trang 404
│   │   ├── san-pham/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Chi tiết sản phẩm (SSG)
│   │   ├── thuong-hieu/
│   │   │   └── [brand]/
│   │   │       └── page.tsx    # Trang thương hiệu (SSG)
│   │   └── khuyen-mai/
│   │       └── page.tsx        # Trang khuyến mãi
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── BrandFilter.tsx
│   ├── lib/
│   │   ├── products.ts         # Data access layer
│   │   └── seo.ts              # SEO utilities & schemas
│   └── data/
│       ├── products.json       # 54 sản phẩm sneaker
│       └── brands.json         # Danh sách thương hiệu
├── public/
│   └── manifest.json           # PWA manifest
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🚀 Cài đặt & Chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy development server
npm run dev

# 3. Build production
npm run build

# 4. Chạy production server
npm start
```

## 📊 Dữ liệu sản phẩm

Project đã import **54 sản phẩm** từ file Excel với các thương hiệu:
- ON RUNNING
- ASICS
- HOKA
- UNDER ARMOUR
- PUMA
- NIKE
- ADIDAS

Mỗi sản phẩm có đầy đủ thông tin:
- Tên, thương hiệu, giá, giảm giá
- Hình ảnh, kích thước
- Mô tả chi tiết
- Thông số kỹ thuật
- Hướng dẫn chăm sóc & bảo quản

## 🔍 Các trang SEO chính

| URL | Mục đích |
|-----|----------|
| `/` | Trang chủ - Tất cả sản phẩm |
| `/san-pham/[slug]` | Chi tiết sản phẩm (54 trang) |
| `/thuong-hieu/[brand]` | Sản phẩm theo thương hiệu (7 trang) |
| `/khuyen-mai` | Sản phẩm đang giảm giá |
| `/sitemap.xml` | Sitemap cho Google |

## 🎯 Tối ưu SEO cần làm thêm

1. **Cập nhật domain thật** trong `src/lib/seo.ts`
2. **Thêm Google Analytics** & Search Console
3. **Tạo favicon & og-image** trong `/public`
4. **Submit sitemap** lên Google Search Console
5. **Thêm reviews/ratings** (Schema.org Review)
6. **Tối ưu images** - WebP, lazy loading
7. **Thêm internal linking** giữa các sản phẩm liên quan

## 📝 Cấu hình SEO

Chỉnh sửa file `src/lib/seo.ts`:

```typescript
export const siteConfig = {
  name: 'Sneaker Store Vietnam',
  url: 'https://your-domain.vn',  // Đổi domain
  // ...
};
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Images**: Next.js Image Optimization
- **Fonts**: Google Fonts (Inter)

## 📄 License

MIT License - Free to use for personal and commercial projects.
UIT
# Sneaker-store-website-for-SEO

