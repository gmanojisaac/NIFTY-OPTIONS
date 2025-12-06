import { kc } from "../auth/kite";
import "dotenv/config";

export async function showProfile() {
  try {
    if (!process.env.KITE_ACCESS_TOKEN) {
      console.log("Set KITE_ACCESS_TOKEN first");
      return;
    }

    kc.setAccessToken(process.env.KITE_ACCESS_TOKEN);
    console.log(await kc.getProfile());
  } catch (e) {
    console.error("Profile error:", e);
  }
}

showProfile();
