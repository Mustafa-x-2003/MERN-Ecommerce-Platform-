import "dotenv/config";
import express from "express";
import concetDB from "./config/db.js";
import cors from "cors";
import routerUser from "./router/userRouter.js";
import routerAddress from "./router/addressRouter.js";
import routerProduct from "./router/productsRouter.js";
import cartRouter from "./router/cartRouter.js";
import categoryRouter from "./router/categoryRouter.js";
import wishlistRouter from "./router/wishlistRouter.js";
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", routerUser);
app.use("/api/address", routerAddress);
app.use("/api/products", routerProduct);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/category", categoryRouter);




app.get("/", async (req, res) => {
  res.send("API Working");
});

app.listen(port, async () => {
  try {
    await concetDB();
    console.log(`server is running on port ${port}`);
  } catch (e) {
    console.log(e);
  }
});
