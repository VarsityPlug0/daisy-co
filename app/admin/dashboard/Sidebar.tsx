"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Plus, ShoppingBag, FileText,
  Users, UserCheck, CreditCard, Image, MessageCircle,
  Mail, ExternalLink, Menu, X, LogOut, Shirt,
} from "lucide-react";
import AdminLogoutButton from "./LogoutButton";

const groups = [
  {
    items: [
      { label: "Dashboard",   href: "/admin/dashboard",             icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Products",           href: "/admin/dashboard/products",    icon: Package },
      { label: "Clothing & Apparel", href: "/admin/dashboard/clothing",    icon: Shirt },
      { label: "Add Product",        href: "/admin/dashboard/new",         icon: Plus },
      { label: "Site Images",        href: "/admin/dashboard/images",      icon: Image },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders",        href: "/admin/dashboard/orders",        icon: ShoppingBag },
      { label: "Quotes",        href: "/admin/dashboard/quotes",        icon: FileText },
      { label: "Installments",  href: "/admin/dashboard/installments",  icon: CreditCard },
      { label: "Emails",        href: "/admin/dashboard/emails",        icon: Mail },
    ],
  },
  {
    title: "Contacts",
    items: [
      { label: "Leads",     href: "/admin/dashboard/leads",     icon: Users },
      { label: "Customers", href: "/admin/dashboard/customers", icon: UserCheck },
      { label: "Chat",      href: "/admin/dashboard/chat",      icon: MessageCircle },
    ],
  },
];

function NavLink({ href, icon: Icon, label, exact, onClick }: {
  href: string; icon: React.ElementType; label: string; exact?: boolean; onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-[#C8B993]/15 text-[#C8B993]"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  // close on route change (mobile)
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  // close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#1A1A1A]">
        <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
          {[0,45,90,135,180,225,270,315].map((deg) => (
            <ellipse key={deg} cx="50" cy="22" rx="9" ry="18" fill="#C8B993" transform={`rotate(${deg} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="14" fill="#C8B993" />
          <circle cx="50" cy="50" r="8" fill="#111111" />
        </svg>
        <div>
          <p className="text-[#C8B993] font-bold text-sm leading-none">Bevanssons</p>
          <p className="text-gray-600 text-[10px] mt-0.5">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-3 mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} {...item} onClick={() => setOpen(false)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#1A1A1A] space-y-0.5">
        <Link
          href="/shop"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ExternalLink size={16} className="shrink-0" />
          View Shop
        </Link>
        <div className="px-3 py-2">
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-full bg-[#0D0D0D] border-r border-[#1A1A1A] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0D0D0D] border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            {[0,45,90,135,180,225,270,315].map((deg) => (
              <ellipse key={deg} cx="50" cy="22" rx="9" ry="18" fill="#C8B993" transform={`rotate(${deg} 50 50)`} />
            ))}
            <circle cx="50" cy="50" r="14" fill="#C8B993" />
            <circle cx="50" cy="50" r="8" fill="#0D0D0D" />
          </svg>
          <p className="text-[#C8B993] font-bold text-sm">Bevanssons</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-50 flex flex-col w-72 h-full bg-[#0D0D0D] border-r border-[#1A1A1A] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
