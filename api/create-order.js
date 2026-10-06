const crypto = require("crypto");

const PRODUCTS = {
  1: { name: "Minecraft Reel Bundle", amount: 4900 },
  2: { name: "3000+ Roblox Content Bundle", amount: 4900 },
  3: { name: "1000+ Minecraft Shorts Bundle", amount: 4900 },
  4: { name: "1000+ Cartoon Reels Bundle", amount: 4900 }
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { productId } = req.body || {};
    const product = PRODUCTS[Number(productId)];

    if (!product) {
      return res.status(400).json({ error: "Invalid product" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: "Razorpay environment variables are missing"
      });
    }

    const receipt =
      "rxg_" +
      Date.now() +
      "_" +
      crypto.randomBytes(4).toString("hex");

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: product.amount,
        currency: "INR",
        receipt,
        notes: {
          product_id: String(productId),
          product_name: product.name
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.description || "Unable to create Razorpay order"
      });
    }

    return res.status(200).json({
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: keyId
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error"
    });
  }
};
