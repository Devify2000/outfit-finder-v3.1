import express from "express";
import {
  uploadImage,
  lensSearch,
  upload,
} from "../controller/outfitController.js";
import { uploadLimiter, lensLimiter } from "../config/rateLimiters.js";

const router = express.Router();

router.post("/upload", uploadLimiter, upload.single("image"), uploadImage);
router.post("/lens", lensLimiter, lensSearch);

export default router;
