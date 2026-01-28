"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Receipt,
  Menu,
  X,
  Shield,
  Route,
  User,
  Eye,
  FileText,
  Crown,
  Activity,
  GraduationCap,
  Home,
  HelpCircle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { CartIcon } from "@/components/cart/CartIcon";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { Footer } from "@/components/layout/Footer";
import { Navigation, type NavItem } from "./Navigation";
import { UserProfile } from "./UserProfile";
import { MobileMenu } from "./MobileMenu";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type LayoutType = "admin" | "customer" | "public";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  layoutType?: LayoutType;
}

// Admin navigation items
const adminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/admin/learning-paths", icon: Route },
  { name: "Categories", href: "/admin/categories", icon: ShoppingCart },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Purchases", href: "/admin/purchases", icon: Receipt },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: Crown },
  { name: "Profile", href: "/admin/profile", icon: User },
];

// Customer preview links (for admin)
const customerPreviewLinks: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Course Catalog", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Blog", href: "/blog", icon: FileText },
];

// Customer navigation items
const customerNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/library", icon: BookOpen },
  { name: "Browse Courses", href: "/courses", icon: GraduationCap },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Subscription", href: "/subscription", icon: Crown },
  { name: "Profile", href: "/profile", icon: User },
];

// Public navigation items
const publicNavigation: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Learning Paths", href: "/learning-paths", icon: Route },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Contact Us", href: "/contact", icon: Mail },
];

export function UnifiedLayout({ children, layoutType = "public" }: UnifiedLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();

  // Determine actual layout type based on user role from the session
  const sessionLayoutType: LayoutType =
    session?.user?.role === "admin" ? "admin" : session?.user ? "customer" : "public";

  // Determine final layout type.
  // We prioritize the server-provided layoutType as a baseline to prevent flickering.
  // We only switch to a different layout if the user is authenticated and their role
  // requires a different layout (e.g., admin browsing public pages or upgrading from public to customer).
  // This ensures the sidebar doesn't disappear intermittently while the session is loading.
  const currentLayoutType = (status === "authenticated" && session?.user)
    ? (session.user.role === "admin" ? "admin" : "customer")
    : layoutType;

  // Get navigation items based on layout type
  const getNavigationItems = (): NavItem[] => {
    if (currentLayoutType === "admin") return adminNavigation;
    if (currentLayoutType === "customer") return customerNavigation;
    return publicNavigation;
  };

  const navigationItems = getNavigationItems();

  // Handle preview mode for admins
  const isAdmin = session?.user?.role === "admin";
  const isPreviewMode = searchParams.get("preview") === "true";
  const shouldPreservePreview = isAdmin && isPreviewMode;

  const getHref = (baseHref: string) => {
    if (shouldPreservePreview) return `${baseHref}?preview=true`;
    return baseHref;
  };

  // Get profile href based on layout type
  const getProfileHref = () => {
    if (currentLayoutType === "admin") return "/admin/profile";
    return "/profile";
  };

  // Get logo href based on layout type
  const getLogoHref = () => {
    if (currentLayoutType === "admin") return "/admin";
    if (currentLayoutType === "customer") return getHref("/dashboard");
    return "/";
  };

  // Add cart badge to navigation items
  const navigationWithBadges = navigationItems.map((item) => {
    if (item.href === "/cart" && cart?.itemCount) {
      return { ...item, badge: cart.itemCount };
    }
    return item;
  });

  // Logo component
  const LogoComponent = () => {
    const logoHref = getLogoHref();
    const isAdminLayout = currentLayoutType === "admin";

    return (
      <Link href={logoHref} className="flex items-center gap-2">
        <div
          className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center",
            isAdminLayout
              ? "bg-gradient-to-br from-amber-500 to-amber-600"
              : "bg-gradient-to-br from-primary to-primary/70"
          )}
        >
          {isAdminLayout ? (
            <Shield className="h-5 w-5 text-white" />
          ) : (
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
        <span className="font-display text-lg font-bold tracking-tight">
          {isAdminLayout ? "ADMIN" : "AI GENIUS LAB"}
        </span>
      </Link>
    );
  };

  // Public layout uses top navigation bar
  if (currentLayoutType === "public") {
    return (
      <ConfirmDialogProvider>
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
          <BackgroundBlobs />

          {/* Desktop Layout - Top Navigation */}
          <div className="hidden lg:flex flex-col min-h-screen">
            <motion.header
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-md h-16"
            >
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 h-full">
                <div className="flex items-center justify-between h-full">
                  <LogoComponent />

                  <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {navigationWithBadges.map((item) => {
                      const isActive =
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-all whitespace-nowrap min-h-[44px]",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="hidden sm:inline">{item.name}</span>
                          {item.badge && (
                            <span className="h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5 text-[10px] font-bold bg-destructive text-destructive-foreground">
                              {typeof item.badge === "number" && item.badge > 9 ? "9+" : item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <UserProfile
                      profileHref={getProfileHref()}
                      variant="header"
                      showThemeToggle={false}
                    />
                  </div>
                </div>
              </div>
            </motion.header>

            <div className="flex-1 flex flex-col pt-16">
              <main className="flex-1">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {children}
                  </motion.div>
                </div>
              </main>
              <Footer />
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="flex lg:hidden flex-col min-h-screen">
            <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md h-16">
              <div className="flex items-center justify-between px-4 h-full">
                <LogoComponent />
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="h-10 w-10"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </header>

            <MobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              navigationItems={navigationWithBadges}
              profileHref={getProfileHref()}
              logoHref={getLogoHref()}
              logoComponent={<LogoComponent />}
              showCart={true}
              showThemeToggle={true}
            />

            <main className="flex-1 px-3 sm:px-4 py-4 pt-20 pb-12 overflow-y-auto min-h-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </main>
            <Footer />
          </div>
        </div>
      </ConfirmDialogProvider>
    );
  }

  // Admin and Customer layouts use sidebar
  return (
    <ConfirmDialogProvider>
      <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
        <BackgroundBlobs />

          {/* Desktop Layout - Sidebar */}
          <div className="hidden lg:flex min-h-screen">
            <motion.aside
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "w-64 flex-col border-r bg-background/90 backdrop-blur-md flex fixed left-0 top-0 bottom-0 z-20",
                currentLayoutType === "admin" ? "bg-background/90" : "bg-card/80"
              )}
            >
            {/* Sidebar Header */}
            <div className="flex-shrink-0 border-b p-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <LogoComponent />
              </motion.div>
            </div>

            {/* Scrollable Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
              <div className="space-y-6">
                {/* Main Navigation */}
                <div>
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    {currentLayoutType === "admin" ? "Admin Panel" : "Navigation"}
                  </p>
                  <Navigation items={navigationWithBadges} getHref={getHref} />
                </div>

                {/* Customer Preview Section (Admin only) */}
                {currentLayoutType === "admin" && (
                  <div className="border-t pt-6">
                    <div className="px-3 flex items-center gap-2 mb-3">
                      <Eye className="h-3.5 w-3.5 text-amber-500" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Customer Preview
                      </p>
                    </div>
                    <p className="px-3 text-xs text-muted-foreground mb-3">
                      View pages as customers see them
                    </p>
                    <Navigation
                      items={customerPreviewLinks.map((item) => ({
                        ...item,
                        href: `${item.href}?preview=true`,
                      }))}
                      className="space-y-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="flex-shrink-0 border-t p-4 mt-auto">
              <UserProfile
                profileHref={getProfileHref()}
                showCart={currentLayoutType === "admin"}
                showThemeToggle={true}
                variant="sidebar"
              />
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:ml-64">
            {currentLayoutType === "customer" && <PreviewBanner />}
            <main className="flex-1">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-4 sm:py-6 pb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </div>
            </main>
            <Footer />
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="flex lg:hidden flex-col min-h-screen">
          <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md h-16">
            <div className="flex items-center justify-between px-4 h-full">
              <LogoComponent />
              <div className="flex items-center gap-2">
                <SignOutButton size="icon" variant="ghost" />
                {currentLayoutType === "admin" && <CartIcon />}
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="h-10 w-10"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </header>

          <MobileMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            navigationItems={navigationWithBadges}
            profileHref={getProfileHref()}
            logoHref={getLogoHref()}
            logoComponent={<LogoComponent />}
            showCart={currentLayoutType === "admin"}
            showThemeToggle={true}
            getHref={getHref}
          />

          {currentLayoutType === "customer" && (
            <div className="pt-16">
              <PreviewBanner />
            </div>
          )}
          <main className="flex-1 px-3 py-4 pt-20 pb-12 min-h-0 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
          <Footer />
        </div>
      </div>
    </ConfirmDialogProvider>
  );
}
