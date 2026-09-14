import { Suspense } from "react";
import RestoreCart from "./RestoreCart";

export default function RestoreCartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C8B993] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RestoreCart />
    </Suspense>
  );
}
