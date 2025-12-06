import { showLoginUrl } from "./login";
import { generateSession } from "./session";

process.env.KITE_REQUEST_TOKEN ? generateSession() : showLoginUrl();
