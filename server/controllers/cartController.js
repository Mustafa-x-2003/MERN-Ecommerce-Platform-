import mongoose, { trusted } from "mongoose";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

export const addToCart = async (req, res) => {
  try {
    const user = req.user;
    const productID = req.params.id;
    if (!productID) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        error: {
          code: "MISSING_PRODUCT_ID",
        },
      });
    }
    const product = await Product.findOne({ _id: productID });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        error: {
          code: "PRODUCT_NOT_FOUND",
        },
      });
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = new Cart({
        user: user._id,
        products: [{ product: product._id, quantity: 1 }],
      });
    } else {
      const existingProduct = cart.products.find(
        ({ product }) => product.toString() === productID,
      );
      if (existingProduct) {
        if (product.stock > existingProduct.quantity) {
          existingProduct.quantity += 1;
        } else {
          return res.status(400).json({
            success: false,
            message: "Not enough product stock available",
            error: {
              code: "INSUFFICIENT_STOCK",
            },
          });
        }
      } else {
        cart.products.push({ product: productID, quantity: 1 });
      }
    }
    await cart.save();
    res.status(200).json({
      message: "done",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while adding product to cart",
      error: {
        error: error.message,
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  }
};
export const getCart = async (req, res) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ user: user._id }).populate(
      "products.product",
    );
    const cartItems = cart?.products || [];
    res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cart data",
      error: error.message,
    });
  }
};
export const updateCartQuantity = async (req, res) => {
  try {
    const { _id, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        error: {
          code: "CART_NOT_FOUND",
        },
      });
    }
    const product = cart.products.find(
      (item) => item.product.toString() === _id,
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
        error: {
          code: "PRODUCT_NOT_FOUND_IN_CART",
        },
      });
    }
    const dbProduct = await Product.findOne({ _id });
    if (!dbProduct) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist",
        error: {
          code: "PRODUCT_NOT_FOUND",
        },
      });
    }
    if (quantity >= 1 && quantity <= dbProduct.stock) {
      product.quantity = quantity;
      await cart.save();
      return res.status(200).json({
        success: true,
        message: "Cart quantity updated successfully",
        product,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available",
        error: {
          code: "INVALID_QUANTITY",
          details: {
            requestedQuantity: quantity,
            availableStock: dbProduct.stock,
          },
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating cart quantity",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details: error.message,
      },
    });
  }
};
export const deleteFromCart = async (req, res) => {
  try {
    const productID = req.params.id;
    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const newProducts = cart.products.filter(
      (item) => item.product.toString() !== productID,
    );
    if (newProducts.length === cart.products.length) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
    cart.products = newProducts;
    await cart.save();
    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
