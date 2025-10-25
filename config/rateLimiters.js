import rateLimit from "express-rate-limit";

export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Too many upload requests, try again later.",
  },
});

export const lensLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
});
