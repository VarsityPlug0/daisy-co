import Link from "next/link";
import ProductForm from "../ProductForm";

export default function NewProduct() {
  return (
    <div className="min-h-screen bg-[#111111]">
      <header className="bg-[#0f0f0f] border-b border-[#1A1A1A] px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/admin/dashboard"
          className="text-gray-500 hover:text-white text-sm transition-colors shrink-0">
          ← Dashboard
        </Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-white font-semibold text-sm">Add New Product</h1>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">New Product</h2>
          <p className="text-gray-500 text-sm">Fill in the details below. The product will appear on the public shop page.</p>
        </div>

        <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-4 sm:p-8">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
