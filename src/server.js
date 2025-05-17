const express = require("express");
const Stripe = require("stripe");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config(); // To use environment variables like HUDDLE_API_KEY

const stripe = Stripe("sk_test_YOUR_SECRET_KEY"); // Replace with your real Stripe Secret Key
const app = express();

app.use(cors());
app.use(express.json());

// ====== Stripe Checkout Route ======
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "She Means Business Devotional",
              description: "Glitter included (digitally speaking).",
            },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      success_url: "https://your-site.com/success",
      cancel_url: "https://your-site.com/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error", err);
    res.status(500).json({ error: "Checkout session creation failed" });
  }
});

// ====== Huddle01 Create Room Route ======
const HUDDLE_API_KEY = process.env.HUDDLE_API_KEY;

app.post("/create-room", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.huddle01.com/api/v1/create-room",
      {
        title: req.body.title || "Live Room",
        roomType: "audio", // or 'video' if you want video rooms
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": HUDDLE_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Huddle01 room creation error", err.message);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// ====== Server Listen ======
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✨ Server running on port ${PORT}`));
