// // middlewares/serpapiGuard.js
// let serpapiCalls = 0;
// let lastReset = Date.now();

// export function serpapiGuard(req, res, next) {
//   const now = Date.now();

//   // Reset every 60 seconds
//   if (now - lastReset > 60 * 1000) {
//     serpapiCalls = 0;
//     lastReset = now;
//   }

//   // If SerpAPI was already used in this window → skip it
//   if (serpapiCalls >= 1) {
//     console.log("⚠️ SerpAPI limit reached → skipping Lens, using GPT fallback");
//     req.skipSerpAPI = true;
//   } else {
//     serpapiCalls++;
//   }

//   next();
// }
