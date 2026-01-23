import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCartFromCookies } from "@/lib/cart/utils";
import { CartClient } from "@/components/cart/CartClient";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Shopping Cart",
  description: "Review your selected courses before checkout",
  noindex: true,
});

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  let cart;
  
  try {
    cart = await getCartFromCookies();
  } catch (error) {
    console.error("Error loading cart:", error);
    cart = { items: [], totalCents: 0, itemCount: 0 };
  }

  // Ensure cart has valid structure
  if (!cart || !cart.items || !Array.isArray(cart.items)) {
    cart = { items: [], totalCents: 0, itemCount: 0 };
  }

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {cart.items.length > 0 
            ? "Review your selected courses and proceed to checkout"
            : "Your shopping cart"}
        </p>
      </div>

      <CartClient initialCart={cart} isAuthenticated={!!session?.user} />
    </section>
  );
}
