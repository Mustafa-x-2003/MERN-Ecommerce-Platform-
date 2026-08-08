import express from "express";
import auth from "../middleware/auth";

const wishlistRouter = express.Router()

wishlistRouter.post('/',auth, )


export default wishlistRouter