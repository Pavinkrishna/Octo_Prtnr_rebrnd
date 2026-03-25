import { NextApiRequest, NextApiResponse } from "next";
import credentials from "@/config/livekit-credentials.json";
import { setCookie, getCookie } from "cookies-next";
import crypto from "crypto";

declare global {
  var livekitSessions: {
    [key: string]: {
      apiKey: string;
      secret: string;
      url: string;
      name: string;
      expiresAt: number;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const { apiKey, checkSession } = req.body;

  // Check for existing session
  if (checkSession) {
    const sessionToken = getCookie("lk_session", { req, res }) as string;
    if (sessionToken) {
      global.livekitSessions = global.livekitSessions || {};
      const session = global.livekitSessions[sessionToken];

      if (session && session.expiresAt > Date.now()) {
        res.status(200).json({
          hasValidSession: true,
          url: session.url,
          name: session.name,
        });
        return;
      }
    }

    res.status(200).json({ hasValidSession: false });
    return;
  }

  if (!apiKey) {
    res.status(400).json({ error: "API key is required" });
    return;
  }

  const credential =
    credentials.credentials[apiKey as keyof typeof credentials.credentials];

  if (!credential) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  const sessionToken = crypto.randomBytes(32).toString("hex");

  setCookie("lk_session", sessionToken, {
    req,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
  });

  global.livekitSessions = global.livekitSessions || {};
  global.livekitSessions[sessionToken] = {
    apiKey,
    secret: credential.secret,
    url: credential.url,
    name: credential.name,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  res.status(200).json({
    success: true,
    url: credential.url,
    name: credential.name,
  });
}
