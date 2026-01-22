type PayPalAccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type PayPalOrderResponse = {
  id: string;
  links: Array<{ rel: string; href: string; method: string }>;
};

type PayPalWebhookVerificationResponse = {
  verification_status: "SUCCESS" | "FAILURE";
};

const paypalEnv = process.env.PAYPAL_ENV ?? "sandbox";
const paypalBaseUrl =
  paypalEnv === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalWebhookId = process.env.PAYPAL_WEBHOOK_ID;

if (!paypalClientId || !paypalClientSecret) {
  throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.");
}

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${paypalClientId}:${paypalClientSecret}`,
    "utf-8"
  ).toString("base64");

  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token.");
  }

  const data = (await response.json()) as PayPalAccessTokenResponse;
  return data.access_token;
}

export async function createPayPalOrder({
  amountCents,
  currency,
  returnUrl,
  cancelUrl,
  purchaseId,
}: {
  amountCents: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  purchaseId: string;
}) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency.toUpperCase(),
            value: (amountCents / 100).toFixed(2),
          },
          custom_id: purchaseId,
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create PayPal order.");
  }

  const data = (await response.json()) as PayPalOrderResponse;
  const approvalUrl = data.links.find((link) => link.rel === "approve")?.href;

  if (!approvalUrl) {
    throw new Error("Missing PayPal approval URL.");
  }

  return { orderId: data.id, approvalUrl };
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to capture PayPal order.");
  }

  return response.json();
}

export async function verifyPayPalWebhook({
  transmissionId,
  transmissionTime,
  transmissionSig,
  certUrl,
  authAlgo,
  webhookEvent,
}: {
  transmissionId: string;
  transmissionTime: string;
  transmissionSig: string;
  certUrl: string;
  authAlgo: string;
  webhookEvent: unknown;
}) {
  if (!paypalWebhookId) {
    throw new Error("Missing PAYPAL_WEBHOOK_ID.");
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${paypalBaseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: paypalWebhookId,
        webhook_event: webhookEvent,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to verify PayPal webhook signature.");
  }

  const data = (await response.json()) as PayPalWebhookVerificationResponse;
  return data.verification_status === "SUCCESS";
}
