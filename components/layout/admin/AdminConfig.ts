import {
    LayoutDashboard,
    BookOpen,
    Users,
    ShoppingCart,
    Receipt,
    Route,
    User,
    Newspaper,
    CreditCard,
    ShieldCheck,
    Ticket,
    MessageSquare,
    Settings,
} from "lucide-react";

export const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Learning Paths", href: "/admin/learning-paths", icon: Route },
    { name: "Categories", href: "/admin/categories", icon: ShoppingCart },
    { name: "Subscription Plans", href: "/admin/subscriptions/plans", icon: CreditCard },
    { name: "User Subscriptions", href: "/admin/subscriptions/users", icon: ShieldCheck },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Purchases", href: "/admin/purchases", icon: Receipt },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Blog", href: "/admin/blog", icon: Newspaper },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Profile", href: "/admin/profile", icon: User },
];

export const customerPreviewLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Course Catalog", href: "/courses", icon: BookOpen },
    { name: "Learning Paths", href: "/learning-paths", icon: Route },
];
