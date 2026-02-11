import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ShoppingCart } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getCartFromCookies } from "@/lib/cart/utils";
import { CartClient } from "@/components/cart/CartClient";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
} from "@/components/layout/shell";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

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

  if (!cart || !cart.items || !Array.isArray(cart.items)) {
    cart = { items: [], totalCents: 0, itemCount: 0 };
  }

  const hasItems = cart.items.length > 0;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Shopping Cart"
        description={
          hasItems
            ? "Review selected courses, apply discounts, and move to checkout."
            : "No items in cart yet. Browse courses to get started."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cart" },
        ]}
      />

      <ContentRegion>
        <CartClient initialCart={cart} isAuthenticated={!!session?.user} />
      </ContentRegion>

      <StatusRegion>
        {!hasItems ? (
          <EmptyState
            icon={<ShoppingCart className="h-6 w-6" />}
            title="Cart is empty"
            description="Add courses from the catalog to continue checkout."
          />
        ) : null}
      </StatusRegion>
    </PageContainer>
  );
}

