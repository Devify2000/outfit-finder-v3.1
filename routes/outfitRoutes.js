import express from "express";
import {
  upload,
  uploadImage,
  lensSearch,
  gptSearch,
} from "../controller/outfitController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);
router.post("/lens", lensSearch);
router.post("/search", gptSearch);

export default router;
