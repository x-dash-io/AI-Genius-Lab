import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const GOOGLE_LINK_INTENT_COOKIE = "agl_google_link_intent";
export const GOOGLE_LINK_INTENT_TTL_SECONDS = 10 * 60;

export type GoogleLinkIntent = {
  userId: string;
  email: string;
  returnTo: string;
  exp: number;
  nonce: string;
  version: 1;
};

function getSigningSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for Google link intent signing");
  }
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

function safeCompare(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function normalizeReturnTo(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (value.startsWith("/api/")) {
    return fallback;
  }

  return value;
}

export function createGoogleLinkIntent(input: {
  userId: string;
  email: string;
  returnTo: string;
}) {
  const payload: GoogleLinkIntent = {
    userId: input.userId,
    email: input.email.toLowerCase().trim(),
    returnTo: input.returnTo,
    exp: Date.now() + GOOGLE_LINK_INTENT_TTL_SECONDS * 1000,
    nonce: randomBytes(16).toString("hex"),
    version: 1,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function parseGoogleLinkIntent(token?: string | null): GoogleLinkIntent | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as Partial<GoogleLinkIntent>;

    if (
      parsed.version !== 1 ||
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.returnTo !== "string" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    if (parsed.exp <= Date.now()) {
      return null;
    }

    return parsed as GoogleLinkIntent;
  } catch {
    return null;
  }
}
