import { kc, setToken } from "./kite";
import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";

export async function generateSession() {
  const reqToken = process.env.KITE_REQUEST_TOKEN!;
  const apiSecret = process.env.KITE_API_SECRET!;

  if (!reqToken) {
    console.log("No request_token found in .env");
    return;
  }

  try {
    const s = await kc.generateSession(reqToken, apiSecret);
    const token = s.access_token;
    console.log("Access Token:", token);
    setToken(token);

    // Save token into .env
    const env = readFileSync(".env", "utf8");
    const updated = env.includes("KITE_ACCESS_TOKEN=")
      ? env.replace(/KITE_ACCESS_TOKEN=.*/g, `KITE_ACCESS_TOKEN=${token}`)
      : env + `\nKITE_ACCESS_TOKEN=${token}\n`;

    writeFileSync(".env", updated.trim() + "\n");
    console.log("Token saved to .env");
  } catch (e) {
    console.error("Session error:", e);
  }
}
