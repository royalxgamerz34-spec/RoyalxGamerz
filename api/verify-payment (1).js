const crypto = require("crypto");

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const DOWNLOAD_LINKS = {
  "1": "https://drive.google.com/drive/folders/1UNr_ILE9j64CSufw2VlJrsdkcwRrAKWN",
  "2": "https://drive.google.com/drive/folders/1rtLg7zeFo4K_Ex8KSyRBIwsYyObro7Ur",
  "3": "https://drive.google.com/drive/folders/1uSMAA-5gJdVFRgT_YzmQb4HV3UXR8piv",
  "4": "https://drive.google.com/drive/folders/1KFbmudOh1uQ5BdIdzvCikdg4GrW7RiIe",
  "5": "https://drive.google.com/drive/folders/15vNNWLdMR6929lYaiNvlj83xd3xOFueO"
};

function setCors(res) {
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
  setCors(res);

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
      paymentId
