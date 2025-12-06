import { KiteConnect } from "kiteconnect";
import "dotenv/config";

const apiKey = process.env.KITE_API_KEY!;
export const kc = new KiteConnect({ api_key: apiKey });

export function setToken(token: string) {
  kc.setAccessToken(token);
}

export function loginUrl() {
  return kc.getLoginURL();
}
