import { NextRequest, NextResponse } from "next/server";
import { createApplication, getSettings, calcMonthly, trackEvent } from "@/lib/installments";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    product_id, term_months,
    name, phone, email, id_number, address,
  } = body;

  if (!product_id || !term_months || !name || !phone || !email || !id_number || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const settings = getSettings(product_id);
  if (!settings) {
    return NextResponse.json({ error: "Installments not available for this product" }, { status: 400 });
  }

  const terms: number[] = settings.eligible_terms;
  if (!terms.includes(Number(term_months))) {
    return NextResponse.json({ error: "Invalid term" }, { status: 400 });
  }

  // Get product price from DB
  const { getProduct } = await import("@/lib/products");
  const product = getProduct(product_id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const price = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  if (price < 5000) return NextResponse.json({ error: "Product not eligible for installments" }, { status: 400 });
  const deposit = Math.max(2000, Math.ceil(price * settings.min_deposit_pct / 100 * 100) / 100);
  const { monthly, total } = calcMonthly(price, deposit, Number(term_months), settings.monthly_rate, settings.admin_fee);

  try {
    const application = createApplication({
      product_id,
      product_name: product.name,
      product_price: price,
      product_imageUrl: product.imageUrl ?? null,
      term_months: Number(term_months),
      monthly_payment: monthly,
      deposit,
      total_repayable: total,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      id_number: id_number.trim(),
      address: address.trim(),
    });

    trackEvent({ event: "application_submitted", product_id, ref: application.ref, term_months: Number(term_months) });

    // Notify admin
    sendMail({
      to: "daisygadgetsco@gmail.com, moneybman0@gmail.com",
      subject: `New Installment Application ${application.ref} — ${product.name} — ${name}`,
      html: `<pre style="font-family:monospace;font-size:13px">New installment application received.\n\nRef: ${application.ref}\nProduct: ${product.name}\nPrice: R${price.toLocaleString("en-ZA")}\nTerm: ${term_months} months\nMonthly: R${monthly.toLocaleString("en-ZA")}\nDeposit: R${deposit.toLocaleString("en-ZA")}\n\nCustomer: ${name}\nPhone: ${phone}\nEmail: ${email}\nID: ${id_number}\nAddress: ${address}\n\nReview: https://daisygadgetsco.com/admin/dashboard/installments</pre>`,
    });

    // Confirmation to customer
    sendMail({
      to: email,
      subject: `Installment Application Received — ${application.ref} | Daisy Gadgets Co.`,
      html: `<div style="font-family:sans-serif;background:#0A0A0A;color:#e5e7eb;padding:32px;border-radius:12px;max-width:520px">
        <p style="color:#D4AF37;font-weight:700;margin:0 0 8px">Daisy Gadgets Co.</p>
        <h2 style="margin:0 0 16px;color:#fff">Application Received!</h2>
        <p style="color:#9ca3af;margin:0 0 20px">Hi ${name.split(" ")[0]}, your installment application for the <strong style="color:#fff">${product.name}</strong> has been submitted successfully.</p>
        <div style="background:#111;border:1px solid #1F1F1F;border-radius:10px;padding:16px 20px;margin-bottom:20px">
          <p style="margin:0 0 8px;color:#6b7280;font-size:12px">Application Reference</p>
          <p style="margin:0;color:#D4AF37;font-size:22px;font-weight:900;font-family:monospace">${application.ref}</p>
        </div>
        <p style="color:#9ca3af;margin:0 0 20px">We'll contact you at <strong style="color:#fff">${phone}</strong> to complete the process.</p>
        <p style="color:#6b7280;font-size:12px;margin:0">© ${new Date().getFullYear()} Daisy Gadgets Co.</p>
      </div>`,
    });

    return NextResponse.json({ ok: true, ref: application.ref, product_name: product.name, phone });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
