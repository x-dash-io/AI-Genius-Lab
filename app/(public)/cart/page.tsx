import { Metadata } from "next";
import { redirect } from "next/navigation";
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
  const cart = getCartFromCookies();

  // If cart is empty, redirect to courses
  if (cart.items.length === 0) {
    redirect("/courses");
  }

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Review your selected courses and proceed to checkout
        </p>
      </div>

      <CartClient initialCart={cart} isAuthenticated={!!session?.user} />
    </section>
  );
}
