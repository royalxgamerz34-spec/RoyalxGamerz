const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const PRODUCTS = {
  "1": 4900,
  "2": 4900,
  "3": 4900,
  "4": 4900,
  "5": 4900
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
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Razorpay server configuration missing"
      });
    }

    const productId = String(
      req.body && req.body.productId
        ? req.body.productId
        : ""
    );

    if (!PRODUCTS[productId]) {
      return res.status(400).json({
        success: false,
        error: "Invalid product"
      });
    }

    const amount = PRODUCTS[productId];

    const auth = Buffer
      .from(
        RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET
      )
      .toString("base64");

    const response = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + auth,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          receipt: "rg_" + productId + "_" + Date.now(),
          notes: {
            product_id: productId
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error:
          data &&
          data.error &&
          data.error.description
            ? data.error.description
            : "Unable to create payment order"
      });
    }

    return res.status(200).json({
      success: true,
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while creating payment order"
    });
  }
};
