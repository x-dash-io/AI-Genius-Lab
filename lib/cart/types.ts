export interface CartItem {
  courseId: string;
  courseSlug: string;
  title: string;
  priceCents: number;
  quantity: number;
  availableInventory: number | null; // null = unlimited
  image?: string;
}

export interface Cart {
  items: CartItem[];
  totalCents: number;
  itemCount: number;
}
