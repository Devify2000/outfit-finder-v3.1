import express from "express";
import {
  uploadImage,
  lensSearch,
  upload,
} from "../controller/outfitController.js";
import { uploadLimiter } from "../config/rateLimiters.js";
import { serpapiGuard } from "../middleware/serpapiGuard.js";

const router = express.Router();

router.post("/upload", uploadLimiter, upload.single("image"), uploadImage);
// router.post("/lens", lensLimiter, lensSearch);
router.post("/lens", serpapiGuard, lensSearch);

export default router;
