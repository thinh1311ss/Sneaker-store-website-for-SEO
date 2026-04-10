const jwt = require("jsonwebtoken");
const productModel = require("../Models/ProductModel");

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

const normalizeSizes = (sizes) => {
  const normalized = {};
  expectedSizes.forEach((size) => {
    normalized[size] = Number(sizes?.[size] ?? 0);
  });
  return normalized;
};

const getTotalSizes = (sizes) => {
  return expectedSizes.reduce(
    (total, size) => total + Number(sizes?.[size] ?? 0),
    0,
  );
};

const validateSizes = (sizes) => {
  if (!sizes || typeof sizes !== "object") return false;
  return expectedSizes.every((size) => !isNaN(Number(sizes[size])));
};

const getListProduct = async (req, res) => {
  try {
    const products = await productModel.find();
    return res.status(200).send(products);
  } catch (error) {
    console.log("getListProduct error", error);
    return res.status(500).json({ error: "Cannot fetch products" });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("getProductDetail called", { productId });
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).send(product);
  } catch (error) {
    console.log("getProductDetail error", error);
    return res.status(500).json({ error: "Cannot fetch product detail" });
  }
};

const postProduct = async (req, res) => {
  try {
    console.log("postProduct called", req.body);
    const {
      productName,
      brand,
      price,
      category,
      sizes,
      description,
      quantity,
      images,
    } = req.body;

    const normalizedSizes = normalizeSizes(sizes);
    const totalSizes = getTotalSizes(normalizedSizes);
    const finalQuantity = Number(quantity ?? totalSizes);
    const errors = [];

    if (!productName?.trim()) errors.push("productName is required");
    if (!brand?.trim()) errors.push("brand is required");
    if (price == null || isNaN(Number(price)))
      errors.push("price is required and must be a number");
    if (!validCategories.includes(category))
      errors.push(
        "category must be one of: Sneaker, Chạy bộ, Đi bộ, Thể thao, Khác",
      );
    if (!validateSizes(sizes))
      errors.push(
        "sizes must include all expected US size fields and be numeric",
      );
    if (quantity != null && Number(quantity) !== totalSizes)
      errors.push("quantity must equal the sum of all sizes");
    if (!images || !Array.isArray(images) || images.length === 0)
      errors.push("images must be a non-empty array");

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    console.log("postProduct normalized", { normalizedSizes, finalQuantity });
    await productModel.create({
      productName: productName,
      brand: brand,
      price: Number(price),
      category: category,
      sizes: normalizedSizes,
      description: description,
      quantity: finalQuantity,
      images: images,
    });
    return res.status(200).send("create product successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Cannot create product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log("deleteProduct called", { productId });
    const deleted = await productModel.findByIdAndDelete(productId);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).send("delete product successfully");
  } catch (error) {
    console.log("deleteProduct error", error);
    return res.status(500).json({ error: "Cannot delete product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log("updateProduct called", { productId, body: req.body });
    const {
      productName,
      brand,
      price,
      category,
      sizes,
      description,
      quantity,
      images,
    } = req.body;

    const updateData = {};
    const errors = [];

    if (productName != null) updateData.productName = productName;
    if (brand != null) updateData.brand = brand;
    if (price != null) {
      if (isNaN(Number(price))) {
        errors.push("price must be a number");
      } else {
        updateData.price = Number(price);
      }
    }
    if (category != null) {
      if (!validCategories.includes(category)) {
        errors.push(
          "category must be one of: Sneaker, Chạy bộ, Đi bộ, Thể thao, Khác",
        );
      } else {
        updateData.category = category;
      }
    }
    if (description != null) updateData.description = description;
    if (images != null) updateData.images = images;

    if (sizes != null) {
      if (!validateSizes(sizes)) {
        errors.push(
          "sizes must include all expected US size fields and be numeric",
        );
      } else {
        const normalizedSizes = normalizeSizes(sizes);
        const totalSizes = getTotalSizes(normalizedSizes);
        if (quantity != null && Number(quantity) !== totalSizes) {
          errors.push("quantity must equal the sum of all sizes");
        }
        updateData.sizes = normalizedSizes;
        updateData.quantity = quantity != null ? Number(quantity) : totalSizes;
      }
    } else if (quantity != null) {
      if (isNaN(Number(quantity))) {
        errors.push("quantity must be a number");
      } else {
        updateData.quantity = Number(quantity);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    await productModel.findByIdAndUpdate(productId, updateData, { new: true });
    return res.status(200).send("update product successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Cannot update product" });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, sizes } = req.query;

    console.log("searchProduct called", { q, minPrice, maxPrice, sizes });

    // Build filter object
    const filter = {};

    // Search by product name or brand
    if (q && q.trim()) {
      filter.$or = [
        { productName: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Size filter
    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
      const sizeFilters = sizeArray.map((size) => {
        const obj = {};
        obj[`sizes.${size}`] = { $gt: 0 };
        return obj;
      });
      filter.$or = filter.$or ? [...filter.$or, ...sizeFilters] : sizeFilters;
    }

    const products = await productModel.find(filter).limit(50);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.log("searchProduct error", error);
    return res.status(500).json({ error: "Cannot search products" });
  }
};

module.exports = {
  postProduct: postProduct,
  getListProduct: getListProduct,
  deleteProduct: deleteProduct,
  updateProduct: updateProduct,
  getProductDetail: getProductDetail,
  searchProduct: searchProduct,
};
