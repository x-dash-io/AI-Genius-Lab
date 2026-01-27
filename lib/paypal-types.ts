/**
 * TypeScript types for PayPal API responses
 */

export interface PayPalCaptureResponse {
  id?: string;
  status?: "COMPLETED" | "PENDING" | "FAILED";
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export interface PayPalOrderResponse {
  id: string;
  status?: string;
  links?: Array<{
    rel: string;
    href: string;
    method: string;
  }>;
}

export interface PayPalWebhookEvent {
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
}
