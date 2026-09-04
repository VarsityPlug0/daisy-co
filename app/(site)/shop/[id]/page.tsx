import { getProduct, getRelated } from "@/lib/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Package, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import AddToEnquiry from "@/app/(site)/shop/AddToEnquiry";
import BuyNowButton from "./BuyNowButton";
import ShareButton from "./ShareButton";
import InstallmentSection from "@/app/(site)/shop/InstallmentSection";
import { getSettings } from "@/lib/installments";

export const dynamic = "force-dynamic";

const BASE = "https://daisygadgetsco.com";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return { title: "Product Not Found" };
  const desc = p.description || `Buy the ${p.name} at ${p.price}. 100% authentic with full warranty. Fast delivery across South Africa and worldwide.`;
  const images = p.imageUrl ? [{ url: p.imageUrl, alt: p.name }] : [{ url: "/logo.jpg", alt: "Daisy Gadgets Co." }];
  return {
    title: `${p.name} — ${p.price}`,
    description: desc,
    alternates: { canonical: `${BASE}/shop/${p.id}` },
    openGraph: {
      title: `${p.name} — ${p.price} | Daisy Gadgets Co.`,
      description: desc,
      url: `${BASE}/shop/${p.id}`,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} — ${p.price}`,
      description: desc,
      images: p.imageUrl ? [p.imageUrl] : ["/logo.jpg"],
    },
  };
}

const WaPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const installmentSettings = getSettings(id);
  const related = getRelated(id, product.category);
  const waMessage = encodeURIComponent(`Hi, I'm interested in the ${product.name} (${product.price}). Please send me more details.`);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${BASE}/shop` },
      { "@type": "ListItem", position: 3, name: product.category, item: `${BASE}/shop?cat=${encodeURIComponent(product.category)}` },
      { "@type": "ListItem", position: 4, name: product.name, item: `${BASE}/shop/${product.id}` },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} available at Daisy Gadgets Co.`,
    image: product.imageUrl ? [product.imageUrl] : [],
    sku: product.id,
    brand: { "@type": "Brand", name: "Daisy Gadgets Co." },
    offers: {
      "@type": "Offer",
      url: `${BASE}/shop/${product.id}`,
      priceCurrency: "ZAR",
      price: product.price.replace(/[^0-9.]/g, "") || "0",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Daisy Gadgets Co." },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
          <Link href="/shop" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors shrink-0">
            <ArrowLeft size={14} /> Shop
          </Link>
          <span>/</span>
          <span className="text-[#D4AF37] shrink-0">{product.category}</span>
          <span>/</span>
          <span className="text-gray-400 truncate">{product.name}</span>
        </div>
        <ShareButton name={product.name} price={product.price} url={`${BASE}/shop/${product.id}`} />
      </div>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

        {/* Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#111111] border border-[#1F1F1F]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={80} color="#2a2a2a" strokeWidth={1} />
            </div>
          )}
          {product.featured && (
            <span className="absolute top-5 left-5 btn-gold text-xs px-4 py-1.5 rounded-full font-bold">
              Featured
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-[#D4AF37] text-xs uppercase tracking-widest mb-3">{product.category}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-3xl font-bold text-[#D4AF37]">{product.price}</p>
            {product.originalPrice && (
              <p className="text-gray-500 text-lg line-through">{product.originalPrice}</p>
            )}
          </div>

          {product.description && (
            <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Trust points */}
          <div className="space-y-3 mb-6">
            {[
              { icon: Check,        text: product.inStock ? "In stock — ready to order" : "Currently out of stock" },
              { icon: Truck,        text: "Nationwide delivery across South Africa" },
              { icon: ShieldCheck,  text: "Full manufacturer warranty included" },
              { icon: MessageCircle,text: "Expert advice available by email" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-gray-300">
                <item.icon size={16} color="#D4AF37" strokeWidth={2} className="shrink-0" />
                {item.text}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            {/* Primary: Add to cart + Buy Now */}
            <div className="flex gap-3">
              <BuyNowButton product={{ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, imageUrl: product.imageUrl ?? "", category: product.category }} />
            </div>
            <AddToEnquiry id={product.id} name={product.name} price={product.price} originalPrice={product.originalPrice} imageUrl={product.imageUrl ?? ""} category={product.category} />

            {/* Installment option */}
            {installmentSettings && (
              <InstallmentSection
                product={{ id: product.id, name: product.name, price: product.price }}
                settings={{
                  min_deposit_pct: installmentSettings.min_deposit_pct,
                  eligible_terms: installmentSettings.eligible_terms,
                  monthly_rate: installmentSettings.monthly_rate,
                  admin_fee: installmentSettings.admin_fee,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center gap-5 mb-8">
            <h2 className="text-2xl font-bold text-white whitespace-nowrap">More in {product.category}</h2>
            <div className="flex-1 h-px bg-[#1F1F1F]" />
            <Link href={`/shop?cat=${encodeURIComponent(product.category)}`}
              className="text-[#D4AF37] text-sm hover:underline whitespace-nowrap">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`}
                className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden card-hover flex flex-col group">
                <div className="relative h-64 bg-[#0f0f0f] overflow-hidden">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} fill className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={40} color="#2a2a2a" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 to-transparent" />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="font-semibold text-white text-sm leading-snug mb-2 flex-1">{p.name}</p>
                  <p className="text-[#D4AF37] font-bold text-base">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
