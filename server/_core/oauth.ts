import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import axios from "axios";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Initiates Google OAuth flow
  app.get("/api/auth/google", (_req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      res.status(500).json({ error: "Google OAuth is not configured" });
      return;
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", ENV.googleClientId);
    authUrl.searchParams.set("redirect_uri", ENV.googleCallbackUrl);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "select_account");

    res.redirect(302, authUrl.toString());
  });

  // Handles Google OAuth callback
  app.get("/api/auth/callback/google", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      console.error("[OAuth] Google returned error:", error);
      res.redirect(302, "/?auth_error=" + encodeURIComponent(error));
      return;
    }

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      // Exchange authorization code for tokens
      const tokenRes = await axios.post<{
        access_token: string;
        id_token: string;
        token_type: string;
      }>(
        "https://oauth2.googleapis.com/token",
        {
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: ENV.googleCallbackUrl,
        },
        { timeout: 10_000 }
      );

      // Fetch user info from Google
      const userInfoRes = await axios.get<{
        sub: string;
        name: string;
        email: string;
        email_verified: boolean;
      }>("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
        timeout: 10_000,
      });

      const googleUser = userInfoRes.data;

      if (!googleUser.sub) {
        res.status(400).json({ error: "Could not retrieve user ID from Google" });
        return;
      }

      await db.upsertUser({
        openId: googleUser.sub,
        name: googleUser.name || null,
        email: googleUser.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(googleUser.sub, {
        name: googleUser.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (err) {
      console.error("[OAuth] Google callback failed", err);
      res.status(500).json({ error: "Google OAuth callback failed" });
    }
  });
}
