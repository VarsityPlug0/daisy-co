import { NextRequest, NextResponse } from "next/server";

const SYSTEM = `You are the customer support assistant for Daisy Gadgets Co., a premium South African gadget retailer. You are helpful, friendly, and concise.

PRODUCTS WE SELL:
Smartphones (iPhones, Samsung), Smart TVs (Samsung, LG, Hisense), Gaming Consoles (PS5, Xbox Series X), Gaming PCs, Laptops & MacBooks, Tablets & Apple Watches, Clothing & Apparel (Heavyweight Hoodies, Streetwear, Men's Wear, Women's Fashion, Sneakers & Kicks, Snapback Caps, Beanies), Home Appliances (Fridges, Washers, Dishwashers), Kitchen Appliances (Ovens, Microwaves), Solar & Power Solutions (Inverters, Batteries, Panels), Electric Ride-On Cars, Office Equipment, Furniture (Sofas, Beds).

CLOTHING SIZING & FIT:
- Apparel sizes: XS, S, M, L, XL, 2XL (relaxed/true-to-size streetwear cut)
- Footwear: UK 6 to UK 11
- Caps & Beanies: One Size fits all
- Free size exchanges within 7 days

PRICING & SPECIALS:
- 30% OFF all products (August–December special, automatic)
- Orders over R10,000 get an additional 25% bulk discount
- Prices shown on website already include the 30% discount

PAYMENT:
- EFT to TymeBank account: 51072673949, Branch: 678910
- Visa & Mastercard accepted
- Upload proof of payment after EFT — confirmed within 2–4 hours

DELIVERY:
- Free worldwide shipping on all orders
- Same-day delivery: Cape Town metro & select Joburg areas (order before 11am)
- SA nationwide: 1–3 business days
- International: 7–14 business days

RETURNS & WARRANTY:
- Returns & size swaps within 7 days
- All electronic products carry full manufacturer warranty (12–24 months)
- Damaged on arrival: contact us immediately with photos

ORDER TRACKING:
- If a customer shares an order reference number (format: DC-XXXXXX), tell them you can look it up using the Track Order page at /track-order, or they can type their ref here and the system will check it automatically.

CONTACT:
- Email: daisygadgetsco@gmail.com
- Address: Unit 7, Eagle Street, Okavango Park, Bellville, Cape Town

INSTRUCTIONS:
- Keep answers short and clear (2–4 sentences max unless a list is needed)
- Be warm, professional, and solution-focused
- If you can't resolve an issue, always direct them to email at daisygadgetsco@gmail.com or the /contact page
- Never make up prices — say "prices are shown on our website" or "contact us for a quote"
- For order tracking: tell users to type their order reference (DC-XXXXXX) and the system will look it up`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: "AI assistant is not configured. Please contact us at daisygadgetsco@gmail.com" });
  }

  try {
    const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const url = isOpenRouter
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.anthropic.com/v1/messages";

    if (isOpenRouter) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4-5",
          max_tokens: 400,
          messages: [
            { role: "system", content: SYSTEM },
            ...messages.slice(-8).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      const data = await res.json();
      return NextResponse.json({ reply: data.choices?.[0]?.message?.content ?? "Sorry, I couldn't process that." });
    } else {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system: SYSTEM,
          messages: messages.slice(-8).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      return NextResponse.json({ reply: data.content?.[0]?.text ?? "Sorry, I couldn't process that." });
    }
  } catch {
    return NextResponse.json({ reply: "Sorry, I'm having trouble right now. Please contact us at daisygadgetsco@gmail.com" });
  }
}
