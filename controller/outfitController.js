import axios from "axios";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { openai } from "../config/openai.js";
import { searchGoogleShopping } from "../config/serper.js";
import { logUsage } from "../models/logModel.js";
import { ensureImageUrlFromBody } from "../utils/ensureImageUrl.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export async function analyzeOutfit(imageUrl) {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `
You are a professional fashion visual intelligence system.
You output **only structured JSON**.
        `,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
Analyze this outfit image and return strict JSON only:
{
  "items": [
    {
      "gender": "male" | "female" | "unisex",
      "item_name": "t-shirt, jeans, sneakers, etc.",
      "confidence": 0–100,
      "key_features": [...],
      "search_phrase": "Google-style query"
    }
  ]
}
            `,
          },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const raw = response.choices[0].message.content;
  try {
    const parsed = JSON.parse(raw);
    return parsed.items || [];
  } catch (err) {
    console.error("❌ Error parsing OpenAI response:", err.message);
    console.log("🔎 Raw output:", raw);
    return [];
  }
}

export async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "outfit-finder",
      resource_type: "image",
    });

    res.status(200).json({
      success: true,
      imageUrl: uploadResponse.secure_url,
      base64Image,
    });

    logUsage("upload", { mime: req.file.mimetype, size: req.file.size });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    logUsage("upload_error", { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function lensSearch(req, res) {
  try {
    const { country = "in", hl = "en", type = "products" } = req.body;
    const imageUrl = await ensureImageUrlFromBody(req.body);

    const params = {
      engine: "google_lens",
      url: imageUrl,
      type,
      country,
      hl,
      api_key: process.env.SERPAPI_KEY,
      output: "json",
      no_cache: true,
    };

    const response = await axios.get("https://serpapi.com/search.json", {
      params,
    });

    const visualMatches = response.data.visual_matches || [];
    const formattedResults = visualMatches.map((item) => ({
      title: item.title,
      link: item.link,
      source: item.source,
      thumbnail: item.thumbnail,
      price: item.price || null,
    }));

    if (formattedResults.length === 0) {
      const items = await analyzeOutfit(imageUrl);
      const enriched = [];
      for (const item of items) {
        const shopping = await searchGoogleShopping(item.search_phrase);
        enriched.push({ ...item, shopping });
      }

      logUsage("fallback_gpt", {
        reason: "no_results",
        items: enriched.length,
      });
      return res.json({
        success: true,
        fallback: true,
        visual_matches: enriched,
      });
    }

    res.json({
      success: true,
      visual_matches: formattedResults,
      fallback: false,
    });
    logUsage("lens_serpapi", { count: formattedResults.length });
  } catch (err) {
    console.error("❌ SerpAPI error:", err.message);
    try {
      const imageUrl = await ensureImageUrlFromBody(req.body);
      const items = await analyzeOutfit(imageUrl);
      const enriched = [];
      for (const item of items) {
        const shopping = await searchGoogleShopping(item.search_phrase);
        enriched.push({ ...item, shopping });
      }

      logUsage("fallback_gpt", {
        reason: "serpapi_error",
        items: enriched.length,
        error: err.message,
      });

      res.json({ success: true, fallback: true, visual_matches: enriched });
    } catch (fallbackErr) {
      console.error("❌ Fallback error:", fallbackErr.message);
      logUsage("fallback_gpt_error", { error: fallbackErr.message });
      res.status(500).json({ success: false, error: fallbackErr.message });
    }
  }
}
