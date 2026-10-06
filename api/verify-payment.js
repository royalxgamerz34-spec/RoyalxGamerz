const crypto = require("crypto");

const PRODUCTS = {
  1: {
    name: "Minecraft Reel Bundle",
    link: "https://drive.google.com/drive/folders/1UNr_ILE9j64CSufw2VlJrsdkcwRrAKWN"
  },
  2: {
    name: "3000+ Roblox Content Bundle",
    link: "https://drive.google.com/drive/folders/REPLACE_PRODUCT_2_LINK"
  },
  3: {
    name: "1000+ Minecraft Shorts Bundle",
    link: "https://drive.google.com/drive/folders/REPLACE_PRODUCT_3_LINK"
  },
  4: {
    name: "1000+ Cartoon Reels Bundle",
    link: "https://drive.google.com/drive/folders/REPLACE_PRODUCT_4_LINK"
  }
};

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ||
  "https://royalxgamerz34-spec.github.io";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      productId,
      orderId,
      paymentId,
      signature
    } = req.body || {};

    const product = PRODUCTS[Number(productId)];

    if (!product) {
      return res.status(400).json({
        error: "Invalid product"
      });
    }

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        error: "Missing payment details"
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        error: "Razorpay secret is missing"
      });
    }

    const body = `${orderId}|${paymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const isValid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

    if (!isValid) {
      return res.status(400).json({
        error: "Payment verification failed"
      });
    }

    return res.status(200).json({
      verified: true,
      message: "Payment verified successfully",
      product: product.name,
      download_url: product.link
    });

  } catch (error)
