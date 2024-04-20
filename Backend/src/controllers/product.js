import { Product } from "../models/products.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { rm } from "fs";
import { faker } from "@faker-js/faker";
import { nodeCache } from "../app.js";
import { invalidateCache } from "../utils/invalidateCache.js";

export const newProduct = async (req, res, next) => {
  try {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) {
      return next(new ErrorHandler("Please Add Photo", 400));
    }
    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Deleted");
      });
      return next(new ErrorHandler("Please enter all field", 400));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    await invalidateCache({ product: true  , admin :true});
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Error in creating a product", 500));
  }
};

// Revalidate on New , Update , Delete Product & New order
export const getlatestProducts = async (req, res, next) => {
  try {
    let products;

    if (nodeCache.has("latest-product")) {
      products = JSON.parse(nodeCache.get("latest-product"));
    } else {
      products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      nodeCache.set("latest-product", JSON.stringify(products));
    }

    return res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(
      new ErrorHandler("Error in retrival  of latest products ", 500)
    );
  }
};

// Revalidate on New , Update , Delete Product & New order
export const getAllCategories = async (req, res, next) => {
  try {
    let categories;
    if (nodeCache.has("categories")) {
      categories = JSON.parse(nodeCache.get("categories"));
    } else {
      categories = await Product.distinct("category");
      nodeCache.set("categories", JSON.stringify(categories));
    }
    return res.status(201).json({
      success: true,
      categories,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in retrival of categories ", 500));
  }
};

// Revalidate on New , Update , Delete Product & New order
export const getAdminProducts = async (req, res, next) => {
  try {
    let products;

    if (nodeCache.has("all-products")) {
      products = JSON.parse(nodeCache.get("all-products"));
    } else {
      products = await Product.find({});
      nodeCache.set("all-products", JSON.stringify(products));
    }

    return res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in retrival  of  products ", 500));
  }
};

export const getSingleProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    let product;
    if (nodeCache.has("product-${id}")) {
      product = JSON.parse(nodeCache.get("product-${id}"));
    } else {
      product = await Product.findById(id);
      if (!product) {
        return next(new ErrorHandler("product not found", 404));
      }
      nodeCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(
      new ErrorHandler("Error in retrival  of latest products ", 500)
    );
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    console.log(id);
    const product = await Product.findById(id);
    if (!product) {
      return next(new ErrorHandler("Invalid product id", 404));
    }
    if (photo) {
      rm(product.photo, () => {
        console.log("Old photo Deleted");
      });
      product.photo = photo.path;
    }
    if (name) {
      product.name = name;
    }
    if (price) {
      product.price = price;
    }
    if (stock) {
      product.stock = stock;
    }
    if (category) {
      product.category = category;
    }
    await product.save();
    await invalidateCache({ product: true, productId: product._id , admin :true});
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Error in updating a product", 500));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("product not found", 404));
    }
    rm(product.photo, () => {
      console.log("Old photo Deleted");
    });
    await product.deleteOne();
    await invalidateCache({ product: true, productId: product._id , admin :true});
    return res.status(201).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler("Error in deletion of product ", 500)
    );
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);
    const baseQuery = {};
    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      baseQuery.category = category;
    }
    const [products, filteredOnlyProduct] = await Promise.all([
      Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip),
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(201).json({
      success: true,
      products,
      totalPage,
    });
  } catch (error) {
    return next(
      new ErrorHandler("Error in retrival  of latest products ", 500)
    );
  }
};
