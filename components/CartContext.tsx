"use client";
import { createContext, useContext, useReducer, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category: string;
  qty: number;
}

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "qty"> }
  | { type: "REMOVE"; id: string }
  | { type: "QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.id === action.item.id);
      if (existing) return state.map((i) => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE": return state.filter((i) => i.id !== action.id);
    case "QTY":   return state.map((i) => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i);
    case "CLEAR": return [];
    case "LOAD":  return action.items;
    default:      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [], count: 0,
  add: () => {}, remove: () => {}, setQty: () => {}, clear: () => {}, openCart: () => {},
});

export function useCart() { return useContext(CartContext); }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("daisy_cart");
      if (stored) dispatch({ type: "LOAD", items: JSON.parse(stored) });
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("daisy_cart", JSON.stringify(items));
  }, [items, hydrated]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  function parsePrice(p: string): number { return parseFloat(p.replace(/[^0-9.]/g, "")) || 0; }

  const ctx: CartContextValue = {
    items, count,
    add: (item) => {
      dispatch({ type: "ADD", item });
      try {
        const visitorId = localStorage.getItem("daisy_visitor_id") ?? undefined;
        const visitorName = localStorage.getItem("daisy_visitor_name") ?? undefined;
        const visitorPhone = localStorage.getItem("daisy_visitor_phone") ?? undefined;
        const visitorEmail = localStorage.getItem("daisy_visitor_email") ?? undefined;
        fetch("/api/track/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, visitorName, visitorPhone, visitorEmail, productId: item.id, productName: item.name, price: item.price, category: item.category }),
        }).catch(() => {});
      } catch { }
    },
    remove: (id) => dispatch({ type: "REMOVE", id }),
    setQty: (id, qty) => dispatch({ type: "QTY", id, qty }),
    clear: () => dispatch({ type: "CLEAR" }),
    openCart: () => setOpen(true),
  };

  return (
    <CartContext.Provider value={ctx}>
      {children}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Cart sidebar */}
      <div
        className="fixed top-0 right-0 h-full z-[70] flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: "#0f0f0f",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: open ? "-20px 0 60px rgba(0,0,0,0.6)" : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} color="#C8B993" />
            <h2 className="text-white font-bold">Enquiry List</h2>
            {count > 0 && (
              <span className="text-xs font-bold text-[#111111] bg-[#C8B993] rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ShoppingCart size={48} color="#2a2a2a" strokeWidth={1} />
              <p className="text-gray-500 text-sm">Your enquiry list is empty.</p>
              <p className="text-gray-700 text-xs">Add products you are interested in, then chat with us to get a quote.</p>
              <button onClick={() => setOpen(false)} className="btn-outline px-6 py-2.5 rounded-xl text-sm font-bold">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-[#1D1D1D] border border-[#1A1A1A] rounded-2xl p-4">
                  {item.imageUrl && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#111111]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-snug truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs mb-2">{item.category}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[#C8B993] font-bold text-sm">{item.price}</p>
                      {item.originalPrice && (
                        <p className="text-gray-600 text-xs line-through">{item.originalPrice}</p>
                      )}
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => ctx.setQty(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="w-6 h-6 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-xs font-bold w-5 text-center">{item.qty}</span>
                      <button onClick={() => ctx.setQty(item.id, item.qty + 1)}
                        className="w-6 h-6 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => ctx.remove(item.id)}
                        className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        {items.length > 0 && (
          <div className="px-4 py-5 border-t border-[#1A1A1A] space-y-3">
            <p className="text-xs text-gray-600 text-center mb-2">{count} item{count !== 1 ? "s" : ""} in your enquiry list</p>
            <Link href="/checkout" onClick={() => setOpen(false)}
              className="btn-outline w-full py-3 rounded-xl font-bold text-sm text-center block">
              Checkout
            </Link>
            <button onClick={() => ctx.clear()}
              className="w-full text-center text-xs text-gray-600 hover:text-red-400 transition-colors py-1">
              Clear list
            </button>
          </div>
        )}
      </div>
    </CartContext.Provider>
  );
}

// Cart icon for header
export function CartButton() {
  const { count, openCart } = useCart();
  return (
    <button
      onClick={openCart}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/6 transition-all"
      aria-label="Enquiry list"
    >
      <ShoppingCart size={19} strokeWidth={1.8} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] text-[9px] font-bold text-[#111111] bg-[#C8B993] rounded-full flex items-center justify-center leading-none px-0.5">
          {count}
        </span>
      )}
    </button>
  );
}
