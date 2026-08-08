import mongoose from "mongoose";
import Wishlist from "../models/wishlistModel.js";
import Product from "../models/productModel.js";

export const addToWishlist = async (req, res) => {
  try {
    const productID = req.params.id;
    if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const dbProduct = await Product.findById(productID);
    if (!dbProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        products: [productID],
      });
    } else {
      const product = wishlist.products.find(
        (item) => item.toString() === productID,
      );
      if (product) {
        return res.status(409).json({
          success: false,
          message: "Product is already in your wishlist",
        });
      }
      wishlist.products.push(productID);
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    console.log(error);
  }
};
