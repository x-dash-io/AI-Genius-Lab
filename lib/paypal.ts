type PayPalAccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type PayPalOrderResponse = {
  id: string;
  links: Array<{ rel: string; href: string; method: string }>;
};

type PayPalSubscriptionResponse = {
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

function validatePayPalCredentials() {
  if (!paypalClientId || !paypalClientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET.");
  }
}

async function getPayPalAccessToken() {
  validatePayPalCredentials();
  
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

export async function createPayPalSubscription({
  planType,
  returnUrl,
  cancelUrl,
  subscriptionId,
}: {
  planType: "monthly" | "annual";
  returnUrl: string;
  cancelUrl: string;
  subscriptionId: string;
}) {
  const accessToken = await getPayPalAccessToken();

  // First, create a billing plan
  const planResponse = await fetch(`${paypalBaseUrl}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      product_id: null, // We'll create the product inline
      name: planType === "monthly" ? "Monthly Premium Subscription" : "Annual Premium Subscription",
      description: planType === "monthly" 
        ? "Access to all courses - Monthly billing" 
        : "Access to all courses - Annual billing",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: planType === "monthly" ? "MONTH" : "YEAR",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // Infinite cycles
          pricing_scheme: {
            fixed_price: {
              value: planType === "monthly" ? "29.99" : "299.99",
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!planResponse.ok) {
    const error = await planResponse.text();
    console.error("PayPal plan creation error:", error);
    throw new Error("Failed to create PayPal billing plan.");
  }

  const plan = await planResponse.json();
  const planId = plan.id;

  // Now create the subscription with the plan ID
  const response = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      start_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Start in 5 minutes
      quantity: "1",
      shipping_amount: {
        currency_code: "USD",
        value: "0",
      },
      subscriber: {
        name: {
          given_name: "Customer",
        },
        email_address: "customer@example.com", // Will be updated with actual email
      },
      auto_renewal: true,
      application_context: {
        brand_name: "AI Genius Lab",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
      custom_id: subscriptionId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("PayPal subscription creation error:", error);
    throw new Error("Failed to create PayPal subscription.");
  }

  const data = (await response.json()) as PayPalSubscriptionResponse;
  const approvalUrl = data.links.find((link) => link.rel === "approve")?.href;

  if (!approvalUrl) {
    throw new Error("Missing PayPal approval URL.");
  }

  return { subscriptionId: data.id, approvalUrl, planId };
}

export async function activatePayPalSubscription(subscriptionId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: "Activating subscription",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to activate PayPal subscription.");
  }

  return response.json();
}

export async function cancelPayPalSubscription(subscriptionId: string, reason: string = "Customer requested cancellation") {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: reason,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to cancel PayPal subscription.");
  }

  return response.json();
}

export async function suspendPayPalSubscription(subscriptionId: string, reason: string = "Customer requested suspension") {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}/suspend`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: reason,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to suspend PayPal subscription.");
  }

  return response.json();
}
