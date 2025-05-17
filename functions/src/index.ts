import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import jwt from "jsonwebtoken";
import express from "express";
import cors from "cors";

// 🔐 Replace with your real Huddle01 credentials
const JWT_SECRET = "ak_UBVePRsb1YiVFLBB";

admin.initializeApp();
const app = express();
app.use(cors());

// Explicitly type req/res as `express.Request` and `express.Response`
app.post("/generateHuddleToken", (req: express.Request, res: express.Response) => {
  const { userId = "guest-user", role = "host", roomId = "" } = req.body;

  const payload = {
    userId,
    role,
    roomId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  try {
    const token = jwt.sign(payload, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error("JWT generation error:", error);
    res.status(500).json({ error: "Token generation failed" });
  }
});

exports.api = functions.https.onRequest(app);
