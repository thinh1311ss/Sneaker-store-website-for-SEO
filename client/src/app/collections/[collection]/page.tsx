export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const collection = params.collection.toLowerCase();
  const currentPage = Number(searchParams?.page) || 1; // ✅ THÊM
  let title = "Bộ sưu tập";
  let description = "";

  if (collection === "nam") {
    title = "Giày Sneaker Nam";
    description = "Mua giày sneaker nam chính hãng giá tốt. Nike, Adidas, HOKA, Puma... Freeship đơn từ 2 triệu. Đổi trả 30 ngày.";
  } else if (collection === "nu") {
    title = "Giày Sneaker Nữ";
    description = "Mua giày sneaker nữ chính hãng giá tốt. Nike Air Force 1, Adidas Ultraboost... Freeship đơn từ 2 triệu. Đổi trả 30 ngày.";
  } else if (collection === "uu-dai") {
    title = "Giày Sneaker Giảm Giá";
    description = "Săn giày sneaker chính hãng giảm giá đến 70%. Nike, Adidas, HOKA, On Running... Số lượng có hạn, nhanh tay!";
  } else if (collection === "all") {
    title = "Tất Cả Giày Sneaker";
    description = "Khám phá hơn 200+ giày sneaker chính hãng. Nike, Adidas, HOKA, Puma, On Running, Under Armour. Giá tốt nhất Việt Nam.";
  } else {
    const brands = await getAllBrands();
    const matchedBrand = brands.find(
      (b) => b.toLowerCase().replace(/ /g, "-") === collection,
    ) || "";
    if (matchedBrand) {
      title = `Giày ${matchedBrand}`;
      description = `Mua giày ${matchedBrand} chính hãng giá tốt nhất tại UIT Sneakers. Đa dạng mẫu mã, freeship đơn từ 2 triệu, đổi trả 30 ngày.`;
    }
  }

  const pageTitle = `${title} Chính Hãng Giá Tốt | ${siteConfig.name}`;
  // ✅ FIX CHÍNH: Canonical LUÔN trỏ về trang 1 — không có ?page=
  const canonicalUrl = `${siteConfig.url}/collections/${params.collection}`;

  return {
    title: pageTitle,
    description: description || `Khám phá bộ sưu tập ${title.toLowerCase()} chính hãng tại ${siteConfig.name}.`,

    // ✅ FIX: noindex trang phân trang — giải quyết 239 non-canonical
    robots: currentPage > 1
      ? { index: false, follow: true }
      : { index: true, follow: true },

    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: siteConfig.name,
    },

    alternates: {
      canonical: canonicalUrl,
    },
  };
}