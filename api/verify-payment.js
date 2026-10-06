const crypto = require("crypto");

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const DOWNLOAD_LINKS = {
  "1": "https://drive.google.com/drive/folders/1UNr_ILE9j64CSufw2VlJrsdkcwRrAKWN",
  "2": "https://drive.google.com/drive/folders/15vNNWLdMR6929lYaiNvlj83xd3xOFueO",
  "3": "https://drive.google.com/drive/folders/1uSMAA-5gJdVFRgT_YzmQb4HV3UXR8piv"
};

function cors(res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://royalxgamerz34-spec.github.io"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

module.exports = async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Payment verification is not configured"
      });
    }

    const {
      productId,
      orderId,
      paymentId,
      signature
    } = req.body || {};

    if (!productId || !orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const valid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

    if (!valid) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed"
      });
    }

    const downloadUrl = DOWNLOAD_LINKS[String(productId)];

    if (!downloadUrl) {
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        downloadUrl: null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      downloadUrl
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server verification error"
    });
  }
};
