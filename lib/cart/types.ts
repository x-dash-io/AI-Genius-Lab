export interface CartItem {
  courseId: string;
  courseSlug: string;
  title: string;
  priceCents: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  totalCents: number;
  itemCount: number;
}
