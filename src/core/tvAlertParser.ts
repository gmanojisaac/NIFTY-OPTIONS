import { Signal } from "./types";

export function parseTvAlert(body: any): Signal | null {
  // 1) Get the text from body
  let text: string | undefined;

  if (typeof body === "string") {
    text = body;
  } else if (body && typeof body.message === "string") {
    text = body.message;
  } else if (body && typeof body.alert === "string") {
    text = body.alert;
  } else if (body && typeof body.text === "string") {
    text = body.text;
  }

  if (!text) return null;

  // 2) Check Entry / Exit
  const isEntry = text.includes("Accepted Entry");
  const isExit = text.includes("Accepted Exit");
  if (!isEntry && !isExit) return null;

  // 3) Extract symbol from "sym=..."
  const symMatch = text.match(/sym=([A-Z0-9]+)/);
  if (!symMatch) return null;
  const symbol = symMatch[1];

  // 4) Map to side
  const side: "BUY" | "SELL" = isEntry ? "BUY" : "SELL";

  return { symbol, side };
}
