module.exports=[67010,33464,e=>{"use strict";var t=e.i(84423),o=e.i(14747),i=e.i(22734);let r=[{id:"payfast",bank:"PayFast Online Payment",accountHolder:"Bevanssons",accountType:"Instant Payment Gateway",accountNumber:"Card / Instant EFT",branchCode:"PayFast"},{id:"fnb",bank:"First National Bank (FNB)",accountHolder:"Bevans Sons (Pty) Ltd",accountType:"Gold Business Account",accountNumber:"63225313418",branchCode:"250655"}];function n(e){return r.find(t=>t.id===e)??r[0]}e.s(["getBankById",0,n],33464);var a=e.i(2529);let s=o.default.join(process.cwd(),"public","logo.jpg"),l="logo@bevanssons",p="#C8B993",d="#f5d76e",c="#111111",g="#1A1A1A",m="#2A2A2A",f="#6b7280",x="https://gadgets.bevanssons.store",y="support@bevanssons.store",u=process.env.BANK_NAME||"First National Bank (FNB)",b=process.env.BANK_ACCOUNT_HOLDER||"Bevans Sons (Pty) Ltd",h=process.env.BANK_ACCOUNT_TYPE||"Gold Business Account",$=process.env.BANK_ACCOUNT_NUMBER||"63225313418",v=process.env.BANK_BRANCH_CODE||"250655";async function w(e){let o=process.env.RESEND_API_KEY?t.default.createTransport({host:"smtp.resend.com",port:587,secure:!1,auth:{user:"resend",pass:process.env.RESEND_API_KEY}}):process.env.MAIL_USER&&process.env.MAIL_PASS?t.default.createTransport({service:"gmail",auth:{user:process.env.MAIL_USER,pass:process.env.MAIL_PASS.replace(/\s+/g,"")}}):null;if(!o)return void console.error("mailer: env vars missing");try{let t=e.attachments??[];(0,i.existsSync)(s)&&t.unshift({filename:"logo.jpg",path:s,cid:l}),await o.sendMail({from:function(){if(process.env.RESEND_API_KEY)return'"Bevanssons" <noreply@bevanssons.store>';let e=process.env.MAIL_USER??"support@bevanssons.store";return`"Bevanssons" <${e}>`}(),replyTo:process.env.MAIL_USER??"support@bevanssons.store",to:e.to,subject:e.subject,text:e.text,html:e.html,attachments:t,...e.headers?{headers:e.headers}:{}})}catch(e){console.error("mailer send error:",e)}}async function z(e){try{let t=await fetch(e,{signal:AbortSignal.timeout(5e3)});if(!t.ok)return null;return Buffer.from(await t.arrayBuffer())}catch{return null}}async function k(e){let t=[],o=new Map;return await Promise.all(e.map(async(e,i)=>{if(!e.imageUrl)return;let r=await z(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl);if(!r)return;let n=`product-${i}@daisy`,a=e.imageUrl.split(".").pop()?.split("?")[0]??"jpg";t.push({filename:`product-${i}.${a}`,content:r,cid:n}),o.set(e.imageUrl,`cid:${n}`)})),{attachments:t,cidMap:o}}function A(e,t=""){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bevanssons</title>
</head>
<body style="margin:0;padding:0;background:${c};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${c};padding:28px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid ${m}">

        <!-- Gold shimmer top bar -->
        <tr><td style="background:linear-gradient(90deg,${c},${p},${d},${p},${c});height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
          <td style="background:${c};padding:24px 36px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="cid:${l}" alt="Bevanssons" height="44" style="height:44px;width:auto;display:block;border:0" />
                </td>
                <td align="right">
                  <a href="${x}" style="color:${f};font-size:12px;text-decoration:none">gadgets.bevanssons.store</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${t}

        <!-- Body -->
        <tr>
          <td style="background:#1D1D1D;padding:36px 36px 32px;border-top:1px solid ${m}">
            ${e}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${c};padding:24px 36px;border-top:1px solid ${m}">
            <p style="margin:0 0 8px;color:${f};font-size:12px;text-align:center">
              Questions? &nbsp;
              <a href="mailto:support@bevanssons.store" style="color:${p};text-decoration:none;font-weight:600">support@bevanssons.store</a>
              &nbsp;\xb7&nbsp;
              <a href="${x}" style="color:${p};text-decoration:none;font-weight:600">gadgets.bevanssons.store</a>
            </p>
            <p style="margin:0;color:#333;font-size:11px;text-align:center">
              \xa9 ${new Date().getFullYear()} Bevanssons \xb7 All rights reserved.
            </p>
          </td>
        </tr>

        <!-- Bottom gold bar -->
        <tr><td style="background:linear-gradient(90deg,${c},${p},${d},${p},${c});height:2px;font-size:0;line-height:0">&nbsp;</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`}function U(e){return`<p style="margin:0 0 3px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em">${e}</p>`}function B(){return`<div style="height:1px;background:${m};margin:24px 0"></div>`}function P(e,t,o=p,i=c){return`<a href="${t}" style="display:inline-block;background:${o};color:${i};font-weight:800;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:14px;letter-spacing:0.02em">${e}</a>`}function R(e,t){return`<tr>
    <td style="padding:8px 0;color:${f};font-size:13px;width:150px;vertical-align:top;border-bottom:1px solid ${m}">${e}</td>
    <td style="padding:8px 0;color:#e5e7eb;font-size:13px;font-weight:600;vertical-align:top;border-bottom:1px solid ${m}">${t}</td>
  </tr>`}function S(e,t){return`<span style="display:inline-block;background:${t}22;color:${t};border:1px solid ${t}55;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.05em">${e}</span>`}async function j(e){let{attachments:t,cidMap:o}=await k(e.items),i=e.items.map(e=>{let t=(parseFloat(String(e.price).replace(/[^0-9.]/g,""))*e.qty).toLocaleString("en-ZA"),i=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,r=i?`<img src="${i}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${m}" />`:`<div style="width:64px;height:64px;background:${g};border:1px solid ${m};border-radius:10px"></div>`;return`
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${m};width:76px;vertical-align:middle">${r}</td>
      <td style="padding:12px 12px;border-bottom:1px solid ${m};vertical-align:middle">
        <p style="margin:0 0 4px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
        <p style="margin:0;color:${f};font-size:12px">Qty: ${e.qty}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${m};text-align:right;vertical-align:middle">
        <span style="color:${p};font-size:14px;font-weight:700">R ${t}</span>
      </td>
    </tr>`}).join(""),r=A(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:12px">🎊</div>
      <h1 style="margin:0 0 8px;color:#f9fafb;font-size:26px;font-weight:900">Thank you for your purchase!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${e.name.split(" ")[0]}, your payment has been verified and your order is confirmed.</p>
    </div>

    <!-- Ref pill -->
    <div style="background:${g};border:1px solid ${p}44;border-radius:10px;padding:14px 20px;margin-bottom:28px;display:flex;align-items:center">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="color:${f};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Order Reference</td>
        <td style="text-align:right;color:${p};font-size:18px;font-weight:900;letter-spacing:0.08em;font-family:monospace">${e.ref}</td>
      </tr></table>
    </div>

    <!-- Items -->
    <p style="margin:0 0 12px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Order Summary</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px">
      ${i}
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 28px">
      <tr>
        <td style="padding:6px 0;color:${f};font-size:13px">Subtotal</td>
        <td style="padding:6px 0;text-align:right;color:#d1d5db;font-size:13px">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${f};font-size:13px">Shipping</td>
        <td style="padding:6px 0;text-align:right;color:#22c55e;font-size:13px;font-weight:700">Free</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;color:#e5e7eb;font-size:16px;font-weight:800;border-top:1px solid ${m}">Total</td>
        <td style="padding:10px 0 0;text-align:right;color:${p};font-size:20px;font-weight:900;border-top:1px solid ${m}">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
    </table>

    ${B()}

    <!-- Customer info grid -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Customer Information</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="50%" style="padding:0 8px 0 0;vertical-align:top">
          <div style="background:${g};border:1px solid ${m};border-radius:10px;padding:16px 18px;margin-bottom:12px">
            <p style="margin:0 0 6px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Shipping Address</p>
            <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">${e.name}<br>${e.address||"—"}</p>
          </div>
          <div style="background:${g};border:1px solid ${m};border-radius:10px;padding:16px 18px">
            <p style="margin:0 0 6px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Billing Address</p>
            <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">${e.name}<br>${e.address||"—"}</p>
          </div>
        </td>
        <td width="50%" style="padding:0 0 0 8px;vertical-align:top">
          <div style="background:${g};border:1px solid ${m};border-radius:10px;padding:16px 18px;margin-bottom:12px">
            <p style="margin:0 0 6px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Shipping Method</p>
            <p style="margin:0;color:#d1d5db;font-size:13px">📦 Standard Delivery<br><span style="color:${f};font-size:12px">2–5 business days</span></p>
          </div>
          <div style="background:${g};border:1px solid ${m};border-radius:10px;padding:16px 18px">
            <p style="margin:0 0 6px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Payment Method</p>
            <p style="margin:0;color:#d1d5db;font-size:13px">${"eft"===e.paymentMethod?"🏦 EFT Bank Transfer":"💳 PayFast"}<br><span style="color:#22c55e;font-size:12px;font-weight:700">✔ Payment Verified</span></p>
          </div>
        </td>
      </tr>
    </table>

    <div style="text-align:center">
      ${P("✉️ Email Us",`mailto:${y}?subject=Order%20${e.ref}`,p,c)}
    </div>
  `);await w({to:e.email,subject:`Order Confirmed ✨ — ${e.ref} | Bevanssons`,html:r,attachments:t})}async function _(e){e.bank??n("payfast");let{attachments:t,cidMap:o}=await k(e.items),i=e.items.map(e=>{let t=(parseFloat(String(e.price).replace(/[^0-9.]/g,""))*e.qty).toLocaleString("en-ZA"),i=parseFloat(String(e.price).replace(/[^0-9.]/g,"")).toLocaleString("en-ZA"),r=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,n=r?`<img src="${r}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${m}" />`:`<div style="width:64px;height:64px;background:${g};border:1px solid ${m};border-radius:10px"></div>`;return`
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${m};width:76px;vertical-align:middle">${n}</td>
      <td style="padding:12px 10px;border-bottom:1px solid ${m};vertical-align:middle">
        <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
        <p style="margin:0;color:${f};font-size:12px">R ${i} \xd7 ${e.qty}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${m};text-align:right;vertical-align:middle">
        <span style="color:${p};font-size:14px;font-weight:700">R ${t}</span>
      </td>
    </tr>`}).join(""),r=e.reason?`<div style="background:${g};border-left:3px solid #ef4444;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;color:#ef4444;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Reason from our team</p>
        <p style="margin:0;color:#fca5a5;font-size:14px;line-height:1.6">${e.reason}</p>
       </div>`:"",a=A(`
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:14px">🔔</div>
      <div style="display:inline-block;background:#ef444420;color:#ef4444;border:1px solid #ef444450;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.06em;margin-bottom:14px">Action Required</div>
      <h1 style="margin:0 0 10px;color:#f9fafb;font-size:26px;font-weight:900;line-height:1.2">Payment could not be verified</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6">Hi <strong style="color:#e5e7eb">${e.name.split(" ")[0]}</strong>, we were unable to verify your proof of payment for order <strong style="color:${p};font-family:monospace">${e.ref}</strong>.</p>
    </div>

    ${r}

    <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;line-height:1.7">
      Don&apos;t worry — this happens sometimes. Please re-do your payment using the details below and upload a clear screenshot or photo of your confirmation.
    </p>

    ${B()}

    <!-- Order summary with images -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Your Order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px">
      ${i}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 28px">
      <tr>
        <td style="padding:6px 0;color:${f};font-size:13px">Subtotal</td>
        <td style="padding:6px 0;text-align:right;color:#d1d5db;font-size:13px">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${f};font-size:13px">Shipping</td>
        <td style="padding:6px 0;text-align:right;color:#22c55e;font-size:13px;font-weight:700">Free</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;color:#e5e7eb;font-size:16px;font-weight:800;border-top:1px solid ${m}">Total Due</td>
        <td style="padding:10px 0 0;text-align:right;color:${p};font-size:20px;font-weight:900;border-top:1px solid ${m}">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
    </table>

    ${B()}

    <!-- Payment details -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Secure Payment (PayFast)</p>
    <div style="background:${g};border:1px solid ${m};border-radius:12px;padding:4px 20px;margin-bottom:28px">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${R("Payment Method","PayFast Online Payment")}
        ${R("Accepted","Visa, Mastercard & Instant EFT")}
        ${R("Reference",`<strong style="color:${p};font-size:15px;font-family:monospace">${e.ref}</strong>`)}
        ${R("Amount Due",`<strong style="color:${p};font-size:15px">R ${e.total.toLocaleString("en-ZA")}</strong>`)}
      </table>
    </div>

    <p style="margin:0 0 20px;color:#9ca3af;font-size:14px">Please complete your payment securely online via PayFast to confirm your order.</p>
    <div>
      ${P("💳 Pay with PayFast",`${x}/checkout`,p,c)}
      &nbsp;&nbsp;
      ${P("✉️ Contact Support",`mailto:${y}?subject=Payment%20help%20for%20order%20${e.ref}`,p,c)}
    </div>
  `);await w({to:e.email,subject:`⚠️ Action Required — ${e.ref} | Bevanssons`,html:a,attachments:t})}let C={approved:{pill:["Payment Approved","#22c55e"],icon:"🎊",title:"Your payment is confirmed!",body:"Great news — your payment has been verified and your order is now being packed and prepared for dispatch. We will notify you as soon as it ships.",cta:["✉️ Email Us",`mailto:${y}`]},shipped:{pill:["Shipped","#3b82f6"],icon:"📦",title:"Your order has been shipped!",body:"We are pleased to inform you that your order has been successfully packed, processed and shipped.\n\nYour parcel is now in transit to the selected delivery destination. Please keep your contact number available in case our delivery team needs to contact you regarding your order.\n\nWe will notify you again when your order moves to Out for Delivery.",cta:["✉️ Track via Email",`mailto:${y}`]},delivered:{pill:["Delivered",p],icon:"🎁",title:"Your order has been delivered!",body:"We are delighted to confirm that your Bevanssons order has been successfully delivered.\n\nThank you for trusting Bevanssons with your purchase. We hope you are completely satisfied with your order. If you experience any issue with the product or require assistance after delivery, please contact our customer support team and we will be happy to assist.\n\nWe would also appreciate your feedback about your shopping experience with us.\n\nThank you for choosing Bevanssons — Smart Tech. Better Living.",cta:["⭐ Leave a Review",`${x}/reviews`]}};async function I(e){let t=C[e.status];if(!t)return;let o=e.notes?`<div style="background:${g};border-left:3px solid ${p};border-radius:0 10px 10px 0;padding:14px 18px;margin:20px 0">
        <p style="margin:0 0 4px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Note from our team</p>
        <p style="margin:0;color:#d1d5db;font-size:14px;font-style:italic;line-height:1.6">"${e.notes}"</p>
       </div>`:"",i="shipped"===e.status&&e.tracking_number?`<div style="background:${g};border:1px solid #3b82f644;border-left:3px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:4px 0 20px">
        <p style="margin:0 0 4px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Your Tracking Number</p>
        <p style="margin:0;color:#93c5fd;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:0.08em">${e.tracking_number}</p>
       </div>`:"",r="delivered"===e.status?`<div style="background:${g};border:1px solid ${p}33;border-radius:12px;padding:16px 20px;margin:4px 0 20px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:${f};font-size:13px">Delivery Status</td>
            <td style="color:#10b981;font-size:13px;font-weight:700;text-align:right">Successfully Delivered</td>
          </tr>
          <tr>
            <td style="color:${f};font-size:13px;padding-top:8px">Delivery Date</td>
            <td style="color:#e5e7eb;font-size:13px;font-weight:600;text-align:right;padding-top:8px">${new Date().toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"})}</td>
          </tr>
        </table>
       </div>`:"",n={approved:`Payment Approved — ${e.ref} | Bevanssons`,rejected:`Action Required — ${e.ref} | Bevanssons`,shipped:`Your Order Has Been Shipped – #${e.ref}`,delivered:`Order Successfully Delivered – #${e.ref}`},a=A(`
    <div style="margin-bottom:16px">${S(...t.pill)}</div>
    <div style="font-size:36px;margin-bottom:12px;line-height:1">${t.icon}</div>
    <h1 style="margin:0 0 6px;color:#f9fafb;font-size:26px;font-weight:900">${t.title}</h1>
    <p style="margin:0 0 4px;color:${f};font-size:13px">Order: <strong style="color:${p}">${e.ref}</strong></p>
    ${B()}
    <p style="margin:0 0 14px;color:#9ca3af;font-size:15px">Dear ${e.name.split(" ")[0]},</p>
    ${r}
    ${i}
    ${t.body.split("\n\n").map(e=>`<p style="margin:0 0 14px;color:#9ca3af;font-size:15px;line-height:1.7">${e}</p>`).join("")}
    ${o}
    ${t.cta?`<div style="margin-top:24px">${P(t.cta[0],t.cta[1])}&nbsp;&nbsp;${P("✉️ Email Us",`mailto:${y}?subject=Order%20${e.ref}`,p,c)}</div>`:""}
  `);await w({to:e.email,subject:n[e.status]??`Order Update — ${e.ref}`,html:a})}let T={processing:{icon:"⚙️",pillText:"Being Prepared",pillColor:"#8b5cf6",title:"Your order is being prepared",subject:"Your Order Is Being Prepared – Bevanssons",defaultMessage:"We are pleased to confirm that your order has been successfully confirmed and is now being prepared by our fulfilment team.\n\nOur team is carefully preparing your order to ensure everything is correct before it moves to the next stage.\n\nWe will notify you as soon as your order is ready for packing.",stage:2},packed:{icon:"📦",pillText:"Being Packed",pillColor:"#3b82f6",title:"Your order is being packed",subject:"Your Order Is Being Packed – Bevanssons",defaultMessage:"Your order has successfully moved to the packing stage.\n\nOur fulfilment team is currently checking and securely packaging your order to ensure that it is properly prepared for transportation.\n\nOnce packing and final quality checks are completed, your order will proceed to shipping. You will receive another notification when your order has been dispatched.",stage:3},out_for_delivery:{icon:"🏠",pillText:"Out for Delivery",pillColor:"#10b981",title:"Your order is out for delivery today!",subject:"Your Order Is Out for Delivery Today",defaultMessage:"Great news. Your Bevanssons order is now out for delivery.\n\nYour assigned delivery driver is currently completing the delivery route and will contact you directly when they are approaching your location.\n\nKindly keep your phone available and ensure that someone is available to receive the order.\n\nPlease note: Delivery times may vary depending on the driver's route, traffic and other scheduled deliveries.\n\nWe appreciate your patience and look forward to completing your delivery successfully.",stage:5},delayed:{icon:"⏳",pillText:"Slight Delay",pillColor:"#f59e0b",title:"A small update on your order",subject:"Update on Your Order – Bevanssons",defaultMessage:"We would like to inform you that there has been a slight delay with your order. We sincerely apologise for any inconvenience this may cause.\n\nOur team is working to resolve this as quickly as possible and your order will be on its way shortly. We will keep you updated with any further changes.",stage:-1},custom:{icon:"📬",pillText:"Update",pillColor:p,title:"An update on your order",subject:"Update on Your Order – Bevanssons",defaultMessage:"",stage:-1}};async function D(e){var t;let o,i,r,n=T[e.templateId]??T.custom,a=e.message?e.message.split("\n\n").map(e=>`<p style="margin:0 0 14px;color:#9ca3af;font-size:15px;line-height:1.7">${e}</p>`).join(""):"",s=e.tracking_number?`<div style="background:${g};border:1px solid #3b82f644;border-left:3px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:16px 0 20px">
        <p style="margin:0 0 4px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Your Tracking Number</p>
        <p style="margin:0;color:#93c5fd;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:0.08em">${e.tracking_number}</p>
       </div>`:"",l=A(`
    <div style="margin-bottom:16px">${S(n.pillText,n.pillColor)}</div>
    <div style="font-size:36px;margin-bottom:12px;line-height:1">${n.icon}</div>
    <h1 style="margin:0 0 6px;color:#f9fafb;font-size:26px;font-weight:900">${n.title}</h1>
    <p style="margin:0 0 4px;color:${f};font-size:13px">Order: <strong style="color:${p}">${e.ref}</strong></p>
    ${B()}
    <p style="margin:0 0 14px;color:#9ca3af;font-size:15px">Dear ${e.name.split(" ")[0]},</p>
    ${n.stage>0?(t=n.stage,i=[],r=[],(o=["Order Placed","Processing","Packed","Dispatched","Delivered"]).forEach((e,n)=>{let a=n+1,s=a<t,l=a===t,d=s?"#10b981":l?p:"#1a1a1a",g=s?"#fff":l?c:"#555";i.push(`<td align="center"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td align="center" width="28" height="28" style="width:28px;height:28px;border-radius:14px;background:${d};border:2px solid ${s?"#10b981":l?p:"#2a2a2a"};text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:${g};line-height:24px">${s?"&#10003;":a}</td></tr></table></td>`),r.push(`<td align="center" style="padding:6px 2px 0;vertical-align:top"><p style="margin:0;font-size:10px;color:${l?"#e5e7eb":s?"#9ca3af":"#4b5563"};font-weight:${l?700:400};line-height:1.4">${e}</p></td>`),n<o.length-1&&(i.push(`<td style="vertical-align:middle;padding-bottom:4px"><div style="height:2px;background:${n+1<t?"#10b981":"#2a2a2a"}"></div></td>`),r.push("<td></td>"))}),`<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px"><tr>${i.join("")}</tr><tr>${r.join("")}</tr></table>`):""}
    ${s}
    ${a}
    <div style="margin-top:8px">
      ${P("✉️ Email Us",`mailto:${y}?subject=Order%20${e.ref}`,p,c)}
    </div>
  `);await w({to:e.email,subject:n.subject,html:l})}async function E(e){let t=A(`
    ${U("Your Quote is Ready")}
    <h1 style="margin:6px 0 6px;color:#f9fafb;font-size:28px;font-weight:900">Hi ${e.name.split(" ")[0]}, here is your quote</h1>
    <p style="margin:0 0 28px;color:${f};font-size:13px">Reference: <strong style="color:#e5e7eb">${e.ref}</strong></p>

    <!-- Package card -->
    <div style="background:${g};border:1px solid ${p}44;border-radius:14px;padding:28px;margin-bottom:24px;text-align:center">
      ${U("Recommended Package")}
      <p style="margin:8px 0 20px;color:#f9fafb;font-size:22px;font-weight:900">${e.package}</p>
      <div style="height:1px;background:${m};margin:0 0 20px"></div>
      ${U("Estimated Price")}
      <p style="margin:8px 0 0;color:${p};font-size:34px;font-weight:900;letter-spacing:0.02em">${e.price}</p>
    </div>

    ${e.message?`
    <p style="margin:0 0 10px;color:#e5e7eb;font-size:15px;font-weight:700">Message from our team</p>
    <div style="background:${g};border:1px solid ${m};border-left:3px solid ${p};border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px">
      <p style="margin:0;color:#d1d5db;font-size:14px;line-height:1.8">${e.message.replace(/\n/g,"<br>")}</p>
    </div>`:""}

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Ready to proceed or have questions?</p>
    ${P("Accept Quote",`mailto:${y}?subject=Accept%20quote%20${e.ref}`,p,c)}
    &nbsp;&nbsp;
    ${P("Ask a Question",`mailto:${y}?subject=Question%20about%20quote%20${e.ref}`,p,c)}
  `);await w({to:e.email,subject:`Your Quote — ${e.ref} | Bevanssons`,html:t})}async function O(e){let t=A(`
    ${U("Welcome to the family")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">
      ✨ You are in${e.name?`, ${e.name.split(" ")[0]}`:""}!
    </h1>
    <p style="margin:0 0 28px;color:#9ca3af;font-size:15px;line-height:1.6">Thank you for joining the Bevanssons family. Here is your exclusive first-order discount code:</p>

    <!-- Code card -->
    <div style="background:${c};border:1px solid ${p}55;border-radius:14px;padding:32px;text-align:center;margin-bottom:28px">
      ${U("Your Exclusive Discount Code")}
      <p style="margin:12px 0;color:${p};font-size:40px;font-weight:900;letter-spacing:0.15em;font-family:monospace">BEVANS25</p>
      <div style="height:1px;background:${m};margin:16px 0"></div>
      <p style="margin:0;color:${f};font-size:13px;line-height:1.6">💎 25% off your first order — mention this code by email<br>when placing your order. Valid for all products.</p>
    </div>

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Browse our full range of gadgets, appliances, solar solutions and more:</p>
    ${P("🛍️ Shop Now",`${x}/shop`)}
    &nbsp;&nbsp;
    ${P("✉️ Claim via Email",`mailto:${y}?subject=Discount%20code%20BEVANS25`,p,c)}
  `);await w({to:e.email,subject:"✨ Your 25% Discount Code — Bevanssons",html:t})}async function Y(e){let t=e=>`R ${e.toLocaleString("en-ZA",{minimumFractionDigits:2})}`,o=encodeURIComponent(`Hi, I received approval for my installment application ${e.ref} for the ${e.product_name}. I'm ready to pay my deposit of ${t(e.deposit)}.`),i=`
    <tr>
      <td colspan="2" style="padding:10px 0 4px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid ${m}">Banking Details (EFT / Bank Transfer)</td>
    </tr>
    ${R("Bank",u)}
    ${R("Account Name",b)}
    ${R("Account Type",h)}
    ${R("Account Number",$)}
    ${R("Branch Code",v)}
    ${R("Reference",e.ref)}
  `,r=A(`
    <!-- Approved badge -->
    <div style="text-align:center;margin-bottom:28px">
      <div style="display:inline-block;background:#10b98122;border:1px solid #10b98155;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:12px">✅</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:900">Application Approved!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${e.name.split(" ")[0]}, your installment plan is confirmed.</p>
    </div>

    <!-- Ref + product -->
    <div style="background:${c};border:1px solid ${p}44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${U("Application Reference")}
      <p style="margin:4px 0 12px;color:${p};font-size:24px;font-weight:900;font-family:monospace;letter-spacing:0.1em">${e.ref}</p>
      ${U("Product")}
      <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:700">${e.product_name}</p>
    </div>

    ${B()}

    <!-- Payment schedule -->
    <p style="margin:0 0 12px;color:#fff;font-size:15px;font-weight:700">Your Payment Schedule</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:${f};font-size:13px">Deposit <span style="color:#f59e0b;font-size:11px;font-weight:700">(pay first)</span></td>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:#f59e0b;font-size:18px;font-weight:900;text-align:right">${t(e.deposit)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:${f};font-size:13px">Monthly Payment \xd7 ${e.term_months} months</td>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:${p};font-size:18px;font-weight:900;text-align:right">${t(e.monthly_payment)}/mo</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:${f};font-size:13px">Total Repayable</td>
        <td style="padding:10px 0;color:#e5e7eb;font-size:14px;font-weight:700;text-align:right">${t(e.total_repayable)}</td>
      </tr>
    </table>

    <!-- How to start -->
    <div style="background:#f59e0b11;border:1px solid #f59e0b44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#f59e0b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">⚡ Next Step — Pay Your Deposit</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">Please transfer your deposit of <strong style="color:#f59e0b">${t(e.deposit)}</strong> to our <strong style="color:#fff">${h}</strong> at <strong style="color:#fff">${u}</strong> using your reference <strong style="color:#fff">${e.ref}</strong> to activate your plan.</p>
    </div>

    ${B()}

    <!-- Payment details -->
    <p style="margin:0 0 12px;color:#fff;font-size:15px;font-weight:700">Banking Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${i}
    </table>

    <!-- Email CTA -->
    <div style="text-align:center;margin-bottom:8px">
      ${P("✉️ Send Proof of Payment by Email",`mailto:${y}?subject=${o}`,p,c)}
    </div>
    <p style="margin:12px 0 0;color:${f};font-size:12px;text-align:center">Always use <strong style="color:#fff">${e.ref}</strong> as your payment reference.</p>
  `);await w({to:e.email,subject:`✅ Installment Approved — ${e.ref} | Bevanssons`,html:r})}function N(e,t,o){return`
    <div style="text-align:center;margin-bottom:28px">
      <div style="display:inline-block;background:#ffffff0f;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:12px">${e}</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:900">${t}</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">${o}</p>
    </div>`}function F(e,t){return`
    <div style="background:${c};border:1px solid ${p}44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${U("Application Reference")}
      <p style="margin:4px 0 12px;color:${p};font-size:24px;font-weight:900;font-family:monospace;letter-spacing:0.1em">${e}</p>
      ${U("Product")}
      <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:700">${t}</p>
    </div>`}async function H(e){let t=encodeURIComponent(`Hi, I am following up on my installment application ${e.ref} for the ${e.product_name}.`),o=A(`
    ${N("🔍","Application Under Review",`Hi ${e.name.split(" ")[0]}, we are looking into your application.`)}
    ${F(e.ref,e.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Our team is currently reviewing your installment application. We will verify your details and get back to you as soon as possible — usually within <strong style="color:#fff">24 hours</strong>.
    </p>

    <div style="background:#3b82f611;border:1px solid #3b82f644;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#3b82f6;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">What Happens Next</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.8">
        1. We verify your details<br>
        2. We may reach out by email or phone to confirm information<br>
        3. You will receive an approval email with your full payment plan
      </p>
    </div>

    ${e.admin_notes?`
    <div style="background:${c};border:1px solid ${m};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${U("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${e.admin_notes}</p>
    </div>`:""}

    <div style="text-align:center">
      ${P("Email Us",`mailto:${y}?subject=${t}`,p,c)}
    </div>
  `);await w({to:e.email,subject:`Application Under Review — ${e.ref} | Bevanssons`,html:o})}async function L(e){var t,o,i,r,n;let a,s,l=encodeURIComponent(`Hi, I am sending proof of payment for my installment deposit. Application: ${e.ref} — ${e.product_name}.`),d=A(`
    ${N("💳","Deposit Payment Required",`Hi ${e.name.split(" ")[0]}, one step away from activating your plan!`)}
    ${F(e.ref,e.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Your application has been processed. To activate your installment plan, please pay the deposit of <strong style="color:#f59e0b;font-size:16px">${(a=e.deposit,`R ${a.toLocaleString("en-ZA",{minimumFractionDigits:2})}`)}</strong> to our <strong style="color:#fff">${h}</strong> at <strong style="color:#fff">${u}</strong>.
    </p>

    ${(t=e.deposit,o=e.monthly_payment,i=e.term_months,r=e.total_repayable,s=e=>`R ${e.toLocaleString("en-ZA",{minimumFractionDigits:2})}`,`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:${f};font-size:13px">Deposit</td>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:#f59e0b;font-size:16px;font-weight:900;text-align:right">${s(t)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:${f};font-size:13px">Monthly x ${i} months</td>
        <td style="padding:10px 0;border-bottom:1px solid ${m};color:${p};font-size:16px;font-weight:900;text-align:right">${s(o)}/mo</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:${f};font-size:13px">Total Repayable</td>
        <td style="padding:10px 0;color:#e5e7eb;font-size:14px;font-weight:700;text-align:right">${s(r)}</td>
      </tr>
    </table>`)}
    ${(n=e.ref,`
    <div style="background:#f59e0b0d;border:1px solid #f59e0b44;border-radius:12px;padding:16px 20px;margin-bottom:20px">
      <p style="margin:0 0 6px;color:#f59e0b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Deposit Banking Details</p>
      <p style="margin:0 0 12px;color:#d1d5db;font-size:13px;line-height:1.6">Use <strong style="color:#fff">${n}</strong> as your payment reference.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td colspan="2" style="padding:6px 0 2px;color:${f};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Banking Details (EFT / Bank Transfer)</td></tr>
        ${R("Bank",u)}
        ${R("Account Name",b)}
        ${R("Account Type",h)}
        ${R("Account Number",$)}
        ${R("Branch Code",v)}
        ${R("Reference",n)}
      </table>
    </div>`)}

    ${e.admin_notes?`
    <div style="background:${c};border:1px solid ${m};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${U("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${e.admin_notes}</p>
    </div>`:""}

    <div style="text-align:center">
      ${P("Send Proof of Payment",`mailto:${y}?subject=${l}`,p,c)}
    </div>
    <p style="margin:12px 0 0;color:${f};font-size:12px;text-align:center">After we confirm receipt, your plan will be activated immediately.</p>
  `);await w({to:e.email,subject:`Deposit Required — ${e.ref} | Bevanssons`,html:d})}async function M(e){let t=e=>`R ${e.toLocaleString("en-ZA",{minimumFractionDigits:2})}`,o=encodeURIComponent(`Hi, I would like to check on my active installment plan ${e.ref} for the ${e.product_name}.`),i=A(`
    ${N("🟢","Your Plan is Now Active!",`Hi ${e.name.split(" ")[0]}, welcome to your installment plan.`)}
    ${F(e.ref,e.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Your deposit has been received and your installment plan is now <strong style="color:#10b981">active</strong>. Here is your monthly payment schedule:
    </p>

    <div style="background:#10b98111;border:1px solid #10b98144;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
      ${U("Your Monthly Payment")}
      <p style="margin:8px 0 4px;color:#10b981;font-size:36px;font-weight:900">${t(e.monthly_payment)}<span style="font-size:16px;color:#9ca3af">/month</span></p>
      <p style="margin:0;color:#9ca3af;font-size:13px">x ${e.term_months} months &nbsp;&middot;&nbsp; Total: ${t(e.total_repayable)}</p>
    </div>

    <div style="background:${c};border:1px solid ${m};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 10px;color:#fff;font-size:14px;font-weight:700">Payment Instructions</p>
      <p style="margin:0 0 8px;color:#d1d5db;font-size:13px;line-height:1.6">Make your monthly payment to our ${h} at ${u} (Acc: <strong style="color:#fff">${$}</strong>, Branch: <strong style="color:#fff">${v}</strong>) using <strong style="color:${p}">${e.ref}</strong> as your reference.</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">Send proof of each monthly payment by email to keep your account in good standing.</p>
    </div>

    ${e.admin_notes?`
    <div style="background:${c};border:1px solid ${m};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${U("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${e.admin_notes}</p>
    </div>`:""}

    <div style="text-align:center">
      ${P("Contact Us by Email",`mailto:${y}?subject=${o}`,p,c)}
    </div>
  `);await w({to:e.email,subject:`Plan Activated — ${e.ref} | Bevanssons`,html:i})}async function W(e){let t,o=encodeURIComponent(`Hi, I would like to enquire about another product on installments. My previous plan was ${e.ref}.`),i=A(`
    ${N("🏆","Fully Paid — Congratulations!",`Hi ${e.name.split(" ")[0]}, you have completed your installment plan!`)}
    ${F(e.ref,e.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      You have successfully completed all payments on your installment plan. Thank you for trusting Bevanssons — we truly appreciate your commitment.
    </p>

    <div style="background:#C8B99311;border:1px solid #C8B99344;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
      ${U("Total Paid")}
      <p style="margin:8px 0 4px;color:${p};font-size:36px;font-weight:900">${(t=e.total_repayable,`R ${t.toLocaleString("en-ZA",{minimumFractionDigits:2})}`)}</p>
      <p style="margin:0;color:#9ca3af;font-size:13px">${e.term_months} monthly payments &nbsp;&middot;&nbsp; Plan complete</p>
    </div>

    <div style="background:${c};border:1px solid ${m};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#fff;font-size:14px;font-weight:700">Interested in another product?</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">As a returning customer, you may be eligible for priority approval on your next installment application. Email us to get started.</p>
    </div>

    <div style="text-align:center">
      ${P("Shop Again",`${x}/shop`)}
      &nbsp;&nbsp;
      ${P("Email Us",`mailto:${y}?subject=${o}`,p,c)}
    </div>
  `);await w({to:e.email,subject:`Plan Complete — ${e.ref} | Bevanssons`,html:i})}async function q(e){let t=encodeURIComponent(`Hi, I would like to discuss my declined installment application ${e.ref} for the ${e.product_name} and explore other options.`),o=A(`
    ${N("📋","Application Update",`Hi ${e.name.split(" ")[0]}, regarding your application ${e.ref}.`)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Thank you for applying for an installment plan on the <strong style="color:#fff">${e.product_name}</strong>. After reviewing your application, we are unfortunately unable to approve it at this time.
    </p>

    ${e.admin_notes?`
    <div style="background:${c};border:1px solid ${m};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${U("Reason")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${e.admin_notes}</p>
    </div>`:""}

    <div style="background:#3b82f611;border:1px solid #3b82f644;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#3b82f6;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Other Options Available</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.8">
        Pay via EFT / bank transfer and get the product immediately<br>
        Enquire about a higher deposit arrangement<br>
        Re-apply in 3 months with updated information<br>
        Contact us to discuss a custom payment plan
      </p>
    </div>

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 24px">
      We are happy to explore other ways to help you get the product you want. Do not hesitate to reach out.
    </p>

    <div style="text-align:center">
      ${P("Discuss Options by Email",`mailto:${y}?subject=${t}`,p,c)}
      <br><br>
      ${P("Browse Other Products",`${x}/shop`)}
    </div>
  `);await w({to:e.email,subject:`Application Update — ${e.ref} | Bevanssons`,html:o})}async function Z(e){let{attachments:t,cidMap:o}=await k(e.items),i=e.items.map(e=>{let t=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,i=t?`<img src="${t}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${m}" />`:`<div style="width:64px;height:64px;background:${g};border:1px solid ${m};border-radius:10px"></div>`;return`
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${m};width:76px;vertical-align:middle">${i}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${m};vertical-align:middle">
        <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
        <p style="margin:0;color:${f};font-size:12px">Qty: ${e.qty}</p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${m};text-align:right;vertical-align:middle">
        <span style="color:${p};font-size:13px;font-weight:700">${e.price}</span>
      </td>
    </tr>`}).join(""),r=`
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em">Order placed!</h1>
    <p style="margin:0 0 24px;color:${f};font-size:15px">Hi ${e.name.split(" ")[0]}, your order <strong style="color:${p}">${e.ref}</strong> is in — we're waiting for your proof of payment.</p>

    <!-- Items ordered -->
    <p style="margin:0 0 12px;color:#e5e7eb;font-size:14px;font-weight:700">Items in your order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${i}
    </table>

    <!-- Clear cart notice -->
    <div style="background:${g};border:1px solid #f59e0b44;border-radius:12px;padding:20px 24px;margin-bottom:28px">
      <p style="margin:0 0 8px;color:#f59e0b;font-size:14px;font-weight:700">Remove these from your cart</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">
        Your order is now in our system. To avoid placing the same order twice, please clear your cart the next time you visit our shop.
      </p>
    </div>

    <div style="text-align:center;margin-bottom:28px">
      ${P("Go to Shop",`${x}/shop`)}
    </div>

    ${B()}
    <p style="margin:0;color:${f};font-size:13px;text-align:center">
      Questions? ${P("Email Us",`mailto:${y}?subject=Order%20${encodeURIComponent(e.ref)}`,g,p)}
    </p>
  `;await w({to:e.email,subject:`Order ${e.ref} received — clear your cart | Bevanssons`,html:A(r),attachments:t})}async function Q(e){let t=(0,a.unsubscribeUrl)(e.to),o=e.ctaUrl&&e.trackingId?`${x}/api/track/email?id=${e.trackingId}&e=click&url=${encodeURIComponent(e.ctaUrl)}`:e.ctaUrl,i=e.ctaText&&o?`<div style="text-align:center;margin:28px 0">${P(e.ctaText,o)}</div>`:"",r=e.trackingId?`<img src="${x}/api/track/email?id=${e.trackingId}&e=open" width="1" height="1" style="display:none;width:1px;height:1px;border:0" alt="" />`:"",n="",s=[];if(e.orderItems?.length){let{attachments:t,cidMap:o}=await k(e.orderItems.map(e=>({name:e.name,imageUrl:e.imageUrl})));s=t;let i=e.orderItems.map(e=>{let t=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,i=t?`<img src="${t}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${m}" />`:`<div style="width:64px;height:64px;background:${g};border:1px solid ${m};border-radius:10px"></div>`,r=e.id?`${x}/shop/${e.id}`:`${x}/shop`;return`
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${m};width:76px;vertical-align:middle">
          <a href="${r}">${i}</a>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid ${m};vertical-align:middle">
          <a href="${r}" style="text-decoration:none">
            <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
            <p style="margin:0;color:${f};font-size:12px">Qty: ${e.qty}</p>
          </a>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${m};text-align:right;vertical-align:middle">
          <span style="color:${p};font-size:13px;font-weight:700">${e.price}</span>
        </td>
      </tr>`}).join(""),r=e.orderRef?`<p style="margin:0 0 14px;color:${f};font-size:12px">Order ref: <span style="color:${p};font-weight:700;font-family:monospace">${e.orderRef}</span></p>`:"",a=e.restoreCartUrl?`<div style="text-align:center;margin-top:20px">${P("Complete Your Order →",e.restoreCartUrl)}</div>`:"";n=`
      ${B()}
      <p style="margin:0 0 4px;color:#e5e7eb;font-size:14px;font-weight:700">Your last order</p>
      ${r}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${i}
      </table>
      ${a}`}else if(e.featuredProducts?.length){let{attachments:t,cidMap:o}=await k(e.featuredProducts.map(e=>({name:e.name,imageUrl:e.imageUrl})));s=t;let i=e.featuredProducts.map(e=>{let t=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,i=t?`<img src="${t}" alt="${e.name}" width="200" style="width:100%;max-width:200px;height:140px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${m}" />`:`<div style="width:100%;height:140px;background:${g};border:1px solid ${m};border-radius:10px"></div>`;return`
        <td style="width:48%;vertical-align:top;padding:6px">
          <a href="${x}/shop/${e.id}" style="text-decoration:none;display:block">
            ${i}
            <p style="margin:10px 0 4px;color:#e5e7eb;font-size:13px;font-weight:600;line-height:1.3">${e.name}</p>
            <p style="margin:0;color:${p};font-size:14px;font-weight:800">${e.price}</p>
          </a>
        </td>`}),r=[];for(let e=0;e<i.length;e+=2)r.push(`<tr>${i.slice(e,e+2).join("")}</tr>`);n=`
      ${B()}
      <p style="margin:0 0 16px;color:#e5e7eb;font-size:14px;font-weight:700">Featured Products</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${r.join("")}
      </table>`}let l=`
    <h1 style="margin:0 0 20px;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em">${e.heading}</h1>
    <div style="color:#d1d5db;font-size:14px;line-height:1.75;white-space:pre-wrap">${e.body}</div>
    ${i}
    ${n}
    ${B()}
    <p style="margin:0;color:${f};font-size:12px;text-align:center">
      You are receiving this because you shared your email address with Bevanssons or placed an order.<br>
      <a href="${t}" style="color:${f};text-decoration:underline">Unsubscribe</a> from marketing and follow-up emails.
    </p>
    ${r}
  `;await w({to:e.to,subject:e.subject,html:A(l),attachments:s.length?s:void 0,headers:{"List-Unsubscribe":`<${t}>`,"List-Unsubscribe-Post":"List-Unsubscribe=One-Click"}})}e.s(["TRACKING_TEMPLATES",0,T,"sendCampaignEmail",0,Q,"sendClearCartReminder",0,Z,"sendInstallmentActive",0,M,"sendInstallmentApproval",0,Y,"sendInstallmentAwaitingPayment",0,L,"sendInstallmentCompleted",0,W,"sendInstallmentDeclined",0,q,"sendInstallmentReviewing",0,H,"sendMail",0,w,"sendOrderConfirmation",0,j,"sendQuoteReply",0,E,"sendRejectionEmail",0,_,"sendStatusUpdate",0,I,"sendTrackingUpdate",0,D,"sendWelcomeEmail",0,O],67010)}];

//# sourceMappingURL=lib_mailer_ts_0qdwzgv._.js.map