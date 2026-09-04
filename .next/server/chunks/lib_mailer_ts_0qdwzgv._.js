module.exports=[67010,33464,e=>{"use strict";var t=e.i(84423),o=e.i(14747),i=e.i(22734);let r=[{id:"tymebank",bank:"TymeBank / GoTymeBank",accountHolder:"Daisy Gadgets Co.",accountType:"Business Account",accountNumber:"51072673949",branchCode:"678910"}];function n(e){return r.find(t=>t.id===e)??r[0]}e.s(["getBankById",0,n,"getRotatingBank",0,function(e){return r[e%r.length]}],33464);let a=o.default.join(process.cwd(),"public","logo.jpg"),l="logo@daisygadgets",p="#D4AF37",s="#f5d76e",d="#0A0A0A",c="#161616",g="#1F1F1F",m="#6b7280",x="https://daisygadgetsco.com",f="daisygadgetsco@gmail.com";async function y(e){let o=process.env.RESEND_API_KEY?t.default.createTransport({host:"smtp.resend.com",port:587,secure:!1,auth:{user:"resend",pass:process.env.RESEND_API_KEY}}):process.env.MAIL_USER&&process.env.MAIL_PASS?t.default.createTransport({service:"gmail",auth:{user:process.env.MAIL_USER,pass:process.env.MAIL_PASS}}):null;if(!o)return void console.error("mailer: env vars missing");try{let t=e.attachments??[];(0,i.existsSync)(a)&&t.unshift({filename:"logo.jpg",path:a,cid:l}),await o.sendMail({from:process.env.RESEND_API_KEY?'"Daisy Gadgets Co." <noreply@daisygadgetsco.com>':`"Daisy Gadgets Co." <${process.env.MAIL_USER??"noreply@daisygadgetsco.com"}>`,to:e.to,subject:e.subject,html:e.html,attachments:t})}catch(e){console.error("mailer send error:",e)}}async function u(e){try{let t=await fetch(e,{signal:AbortSignal.timeout(5e3)});if(!t.ok)return null;return Buffer.from(await t.arrayBuffer())}catch{return null}}async function h(e){let t=[],o=new Map;return await Promise.all(e.map(async(e,i)=>{if(!e.imageUrl)return;let r=await u(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl);if(!r)return;let n=`product-${i}@daisy`,a=e.imageUrl.split(".").pop()?.split("?")[0]??"jpg";t.push({filename:`product-${i}.${a}`,content:r,cid:n}),o.set(e.imageUrl,`cid:${n}`)})),{attachments:t,cidMap:o}}function b(e,t=""){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Daisy Gadgets Co.</title>
</head>
<body style="margin:0;padding:0;background:${d};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${d};padding:28px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid ${g}">

        <!-- Gold shimmer top bar -->
        <tr><td style="background:linear-gradient(90deg,${d},${p},${s},${p},${d});height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
          <td style="background:${d};padding:24px 36px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="cid:${l}" alt="Daisy Gadgets Co." height="44" style="height:44px;width:auto;display:block;border:0" />
                </td>
                <td align="right">
                  <a href="${x}" style="color:${m};font-size:12px;text-decoration:none">daisygadgetsco.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${t}

        <!-- Body -->
        <tr>
          <td style="background:#111111;padding:36px 36px 32px;border-top:1px solid ${g}">
            ${e}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${d};padding:24px 36px;border-top:1px solid ${g}">
            <p style="margin:0 0 8px;color:${m};font-size:12px;text-align:center">
              Questions? &nbsp;
              <a href="mailto:daisygadgetsco@gmail.com" style="color:${p};text-decoration:none;font-weight:600">daisygadgetsco@gmail.com</a>
              &nbsp;\xb7&nbsp;
              <a href="${x}" style="color:${p};text-decoration:none;font-weight:600">daisygadgetsco.com</a>
            </p>
            <p style="margin:0;color:#333;font-size:11px;text-align:center">
              \xa9 ${new Date().getFullYear()} Daisy Gadgets Co. \xb7 All rights reserved.
            </p>
          </td>
        </tr>

        <!-- Bottom gold bar -->
        <tr><td style="background:linear-gradient(90deg,${d},${p},${s},${p},${d});height:2px;font-size:0;line-height:0">&nbsp;</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`}function $(e){return`<p style="margin:0 0 3px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em">${e}</p>`}function v(){return`<div style="height:1px;background:${g};margin:24px 0"></div>`}function w(e,t,o=p,i=d){return`<a href="${t}" style="display:inline-block;background:${o};color:${i};font-weight:800;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:14px;letter-spacing:0.02em">${e}</a>`}function z(e,t){return`<tr>
    <td style="padding:8px 0;color:${m};font-size:13px;width:150px;vertical-align:top;border-bottom:1px solid ${g}">${e}</td>
    <td style="padding:8px 0;color:#e5e7eb;font-size:13px;font-weight:600;vertical-align:top;border-bottom:1px solid ${g}">${t}</td>
  </tr>`}function k(e,t){return`<span style="display:inline-block;background:${t}22;color:${t};border:1px solid ${t}55;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.05em">${e}</span>`}async function A(e){let{attachments:t,cidMap:o}=await h(e.items),i=e.items.map(e=>{let t=(parseFloat(String(e.price).replace(/[^0-9.]/g,""))*e.qty).toLocaleString("en-ZA"),i=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,r=i?`<img src="${i}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${g}" />`:`<div style="width:64px;height:64px;background:${c};border:1px solid ${g};border-radius:10px"></div>`;return`
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${g};width:76px;vertical-align:middle">${r}</td>
      <td style="padding:12px 12px;border-bottom:1px solid ${g};vertical-align:middle">
        <p style="margin:0 0 4px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
        <p style="margin:0;color:${m};font-size:12px">Qty: ${e.qty}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${g};text-align:right;vertical-align:middle">
        <span style="color:${p};font-size:14px;font-weight:700">R ${t}</span>
      </td>
    </tr>`}).join(""),r=b(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:12px">🎊</div>
      <h1 style="margin:0 0 8px;color:#f9fafb;font-size:26px;font-weight:900">Thank you for your purchase!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${e.name.split(" ")[0]}, your payment has been verified and your order is confirmed.</p>
    </div>

    <!-- Ref pill -->
    <div style="background:${c};border:1px solid ${p}44;border-radius:10px;padding:14px 20px;margin-bottom:28px;display:flex;align-items:center">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="color:${m};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Order Reference</td>
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
        <td style="padding:6px 0;color:${m};font-size:13px">Subtotal</td>
        <td style="padding:6px 0;text-align:right;color:#d1d5db;font-size:13px">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${m};font-size:13px">Shipping</td>
        <td style="padding:6px 0;text-align:right;color:#22c55e;font-size:13px;font-weight:700">Free</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;color:#e5e7eb;font-size:16px;font-weight:800;border-top:1px solid ${g}">Total</td>
        <td style="padding:10px 0 0;text-align:right;color:${p};font-size:20px;font-weight:900;border-top:1px solid ${g}">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
    </table>

    ${v()}

    <!-- Customer info grid -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Customer Information</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="50%" style="padding:0 8px 0 0;vertical-align:top">
          <div style="background:${c};border:1px solid ${g};border-radius:10px;padding:16px 18px;margin-bottom:12px">
            <p style="margin:0 0 6px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Shipping Address</p>
            <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">${e.name}<br>${e.address||"—"}</p>
          </div>
          <div style="background:${c};border:1px solid ${g};border-radius:10px;padding:16px 18px">
            <p style="margin:0 0 6px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Billing Address</p>
            <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">${e.name}<br>${e.address||"—"}</p>
          </div>
        </td>
        <td width="50%" style="padding:0 0 0 8px;vertical-align:top">
          <div style="background:${c};border:1px solid ${g};border-radius:10px;padding:16px 18px;margin-bottom:12px">
            <p style="margin:0 0 6px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Shipping Method</p>
            <p style="margin:0;color:#d1d5db;font-size:13px">📦 Standard Delivery<br><span style="color:${m};font-size:12px">2–5 business days</span></p>
          </div>
          <div style="background:${c};border:1px solid ${g};border-radius:10px;padding:16px 18px">
            <p style="margin:0 0 6px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Payment Method</p>
            <p style="margin:0;color:#d1d5db;font-size:13px">🏦 EFT Bank Transfer<br><span style="color:#22c55e;font-size:12px;font-weight:700">✔ Payment Verified</span></p>
          </div>
        </td>
      </tr>
    </table>

    <div style="text-align:center">
      ${w("✉️ Email Us",`mailto:${f}?subject=Order%20${e.ref}`,p,d)}
    </div>
  `);await y({to:e.email,subject:`Order Confirmed ✨ — ${e.ref} | Daisy Gadgets Co.`,html:r,attachments:t})}async function D(e){let t=b(`
    ${$("Payment Received")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">✅ We got your proof!</h1>
    <p style="margin:0 0 24px;color:#9ca3af;font-size:15px;line-height:1.6">
      Hi ${e.name.split(" ")[0]}, we received your proof of payment for order <strong style="color:${p}">${e.ref}</strong>.
    </p>

    <div style="background:${c};border:1px solid #22c55e44;border-left:3px solid #22c55e;border-radius:0 12px 12px 0;padding:18px 20px;margin-bottom:28px">
      <p style="margin:0;color:#86efac;font-size:14px;line-height:1.7">
        Your proof is under review. We will verify and confirm your order within <strong>24 hours</strong>. You will receive another email as soon as it is approved.
      </p>
    </div>

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Need help or want to check in?</p>
    ${w("Email Us",`mailto:${f}?subject=Order%20${e.ref}`,p,d)}
  `);await y({to:e.email,subject:`Payment Proof Received — ${e.ref} | Daisy Gadgets Co.`,html:t})}async function C(e){let t=e.bank??n("tymebank"),{attachments:o,cidMap:i}=await h(e.items),r=e.items.map(e=>{let t=(parseFloat(String(e.price).replace(/[^0-9.]/g,""))*e.qty).toLocaleString("en-ZA"),o=parseFloat(String(e.price).replace(/[^0-9.]/g,"")).toLocaleString("en-ZA"),r=e.imageUrl?i.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,n=r?`<img src="${r}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${g}" />`:`<div style="width:64px;height:64px;background:${c};border:1px solid ${g};border-radius:10px"></div>`;return`
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${g};width:76px;vertical-align:middle">${n}</td>
      <td style="padding:12px 10px;border-bottom:1px solid ${g};vertical-align:middle">
        <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
        <p style="margin:0;color:${m};font-size:12px">R ${o} \xd7 ${e.qty}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${g};text-align:right;vertical-align:middle">
        <span style="color:${p};font-size:14px;font-weight:700">R ${t}</span>
      </td>
    </tr>`}).join(""),a=e.reason?`<div style="background:${c};border-left:3px solid #ef4444;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;color:#ef4444;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Reason from our team</p>
        <p style="margin:0;color:#fca5a5;font-size:14px;line-height:1.6">${e.reason}</p>
       </div>`:"",l=b(`
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:14px">🔔</div>
      <div style="display:inline-block;background:#ef444420;color:#ef4444;border:1px solid #ef444450;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.06em;margin-bottom:14px">Action Required</div>
      <h1 style="margin:0 0 10px;color:#f9fafb;font-size:26px;font-weight:900;line-height:1.2">Payment could not be verified</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6">Hi <strong style="color:#e5e7eb">${e.name.split(" ")[0]}</strong>, we were unable to verify your proof of payment for order <strong style="color:${p};font-family:monospace">${e.ref}</strong>.</p>
    </div>

    ${a}

    <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;line-height:1.7">
      Don&apos;t worry — this happens sometimes. Please re-do your payment using the details below and upload a clear screenshot or photo of your confirmation.
    </p>

    ${v()}

    <!-- Order summary with images -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Your Order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px">
      ${r}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 28px">
      <tr>
        <td style="padding:6px 0;color:${m};font-size:13px">Subtotal</td>
        <td style="padding:6px 0;text-align:right;color:#d1d5db;font-size:13px">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${m};font-size:13px">Shipping</td>
        <td style="padding:6px 0;text-align:right;color:#22c55e;font-size:13px;font-weight:700">Free</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;color:#e5e7eb;font-size:16px;font-weight:800;border-top:1px solid ${g}">Total Due</td>
        <td style="padding:10px 0 0;text-align:right;color:${p};font-size:20px;font-weight:900;border-top:1px solid ${g}">R ${e.total.toLocaleString("en-ZA")}</td>
      </tr>
    </table>

    ${v()}

    <!-- Bank details -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Payment Details (EFT)</p>
    <div style="background:${c};border:1px solid ${g};border-radius:12px;padding:4px 20px;margin-bottom:28px">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${z("Bank",t.bank)}
        ${z("Account Holder",t.accountHolder)}
        ${z("Account Type",t.accountType)}
        ${z("Account Number",`<span style="font-family:monospace;font-size:15px;color:${p};letter-spacing:0.06em">${t.accountNumber}</span>`)}
        ${z("Branch Code",t.branchCode)}
        ${t.payshap?z("PayShap",t.payshap):""}
        ${z("Reference",`<strong style="color:${p};font-size:15px;font-family:monospace">${e.ref}</strong>`)}
        ${z("Amount",`<strong style="color:${p};font-size:15px">R ${e.total.toLocaleString("en-ZA")}</strong>`)}
      </table>
    </div>

    <p style="margin:0 0 20px;color:#9ca3af;font-size:14px">Once paid, upload your new proof of payment — or send it directly by email and we will update your order manually.</p>
    <div>
      ${w("📤 Upload New Proof",`${x}/checkout`,p,d)}
      &nbsp;&nbsp;
      ${w("✉️ Send via Email",`mailto:${f}?subject=Re-sending%20proof%20for%20order%20${e.ref}`,p,d)}
    </div>
  `);await y({to:e.email,subject:`⚠️ Action Required — ${e.ref} | Daisy Gadgets Co.`,html:l,attachments:o})}let U={approved:{pill:["Payment Approved","#22c55e"],icon:"🎊",title:"Your payment is confirmed!",body:"Great news — your payment has been verified and your order is now being packed and prepared for dispatch. We will notify you as soon as it ships.",cta:["✉️ Email Us",`mailto:${f}`]},shipped:{pill:["Shipped","#3b82f6"],icon:"📦",title:"Your order has been shipped!",body:"We are pleased to inform you that your order has been successfully packed, processed and shipped.\n\nYour parcel is now in transit to the selected delivery destination. Please keep your contact number available in case our delivery team needs to contact you regarding your order.\n\nWe will notify you again when your order moves to Out for Delivery.",cta:["✉️ Track via Email",`mailto:${f}`]},delivered:{pill:["Delivered",p],icon:"🎁",title:"Your order has been delivered!",body:"We are delighted to confirm that your Daisy Gadgets Co. order has been successfully delivered.\n\nThank you for trusting Daisy Gadgets Co. with your purchase. We hope you are completely satisfied with your order. If you experience any issue with the product or require assistance after delivery, please contact our customer support team and we will be happy to assist.\n\nWe would also appreciate your feedback about your shopping experience with us.\n\nThank you for choosing Daisy Gadgets Co. — Smart Tech. Better Living.",cta:["⭐ Leave a Review",`${x}/reviews`]}};async function R(e){let t=U[e.status];if(!t)return;let o=e.notes?`<div style="background:${c};border-left:3px solid ${p};border-radius:0 10px 10px 0;padding:14px 18px;margin:20px 0">
        <p style="margin:0 0 4px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Note from our team</p>
        <p style="margin:0;color:#d1d5db;font-size:14px;font-style:italic;line-height:1.6">"${e.notes}"</p>
       </div>`:"",i="shipped"===e.status&&e.tracking_number?`<div style="background:${c};border:1px solid #3b82f644;border-left:3px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:4px 0 20px">
        <p style="margin:0 0 4px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Your Tracking Number</p>
        <p style="margin:0;color:#93c5fd;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:0.08em">${e.tracking_number}</p>
       </div>`:"",r="delivered"===e.status?`<div style="background:${c};border:1px solid ${p}33;border-radius:12px;padding:16px 20px;margin:4px 0 20px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:${m};font-size:13px">Delivery Status</td>
            <td style="color:#10b981;font-size:13px;font-weight:700;text-align:right">Successfully Delivered</td>
          </tr>
          <tr>
            <td style="color:${m};font-size:13px;padding-top:8px">Delivery Date</td>
            <td style="color:#e5e7eb;font-size:13px;font-weight:600;text-align:right;padding-top:8px">${new Date().toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"})}</td>
          </tr>
        </table>
       </div>`:"",n={approved:`Payment Approved — ${e.ref} | Daisy Gadgets Co.`,rejected:`Action Required — ${e.ref} | Daisy Gadgets Co.`,shipped:`Your Order Has Been Shipped – #${e.ref}`,delivered:`Order Successfully Delivered – #${e.ref}`},a=b(`
    <div style="margin-bottom:16px">${k(...t.pill)}</div>
    <div style="font-size:36px;margin-bottom:12px;line-height:1">${t.icon}</div>
    <h1 style="margin:0 0 6px;color:#f9fafb;font-size:26px;font-weight:900">${t.title}</h1>
    <p style="margin:0 0 4px;color:${m};font-size:13px">Order: <strong style="color:${p}">${e.ref}</strong></p>
    ${v()}
    <p style="margin:0 0 14px;color:#9ca3af;font-size:15px">Dear ${e.name.split(" ")[0]},</p>
    ${r}
    ${i}
    ${t.body.split("\n\n").map(e=>`<p style="margin:0 0 14px;color:#9ca3af;font-size:15px;line-height:1.7">${e}</p>`).join("")}
    ${o}
    ${t.cta?`<div style="margin-top:24px">${w(t.cta[0],t.cta[1])}&nbsp;&nbsp;${w("✉️ Email Us",`mailto:${f}?subject=Order%20${e.ref}`,p,d)}</div>`:""}
  `);await y({to:e.email,subject:n[e.status]??`Order Update — ${e.ref}`,html:a})}let j={processing:{icon:"⚙️",pillText:"Being Prepared",pillColor:"#8b5cf6",title:"Your order is being prepared",subject:"Your Order Is Being Prepared – Daisy Gadgets Co.",defaultMessage:"We are pleased to confirm that your order has been successfully confirmed and is now being prepared by our fulfilment team.\n\nOur team is carefully preparing your order to ensure everything is correct before it moves to the next stage.\n\nWe will notify you as soon as your order is ready for packing.",stage:2},packed:{icon:"📦",pillText:"Being Packed",pillColor:"#3b82f6",title:"Your order is being packed",subject:"Your Order Is Being Packed – Daisy Gadgets Co.",defaultMessage:"Your order has successfully moved to the packing stage.\n\nOur fulfilment team is currently checking and securely packaging your order to ensure that it is properly prepared for transportation.\n\nOnce packing and final quality checks are completed, your order will proceed to shipping. You will receive another notification when your order has been dispatched.",stage:3},out_for_delivery:{icon:"🏠",pillText:"Out for Delivery",pillColor:"#10b981",title:"Your order is out for delivery today!",subject:"Your Order Is Out for Delivery Today",defaultMessage:"Great news. Your Daisy Gadgets Co. order is now out for delivery.\n\nYour assigned delivery driver is currently completing the delivery route and will contact you directly when they are approaching your location.\n\nKindly keep your phone available and ensure that someone is available to receive the order.\n\nPlease note: Delivery times may vary depending on the driver's route, traffic and other scheduled deliveries.\n\nWe appreciate your patience and look forward to completing your delivery successfully.",stage:5},delayed:{icon:"⏳",pillText:"Slight Delay",pillColor:"#f59e0b",title:"A small update on your order",subject:"Update on Your Order – Daisy Gadgets Co.",defaultMessage:"We would like to inform you that there has been a slight delay with your order. We sincerely apologise for any inconvenience this may cause.\n\nOur team is working to resolve this as quickly as possible and your order will be on its way shortly. We will keep you updated with any further changes.",stage:-1},custom:{icon:"📬",pillText:"Update",pillColor:p,title:"An update on your order",subject:"Update on Your Order – Daisy Gadgets Co.",defaultMessage:"",stage:-1}};async function P(e){var t;let o,i,r,n=j[e.templateId]??j.custom,a=e.message?e.message.split("\n\n").map(e=>`<p style="margin:0 0 14px;color:#9ca3af;font-size:15px;line-height:1.7">${e}</p>`).join(""):"",l=e.tracking_number?`<div style="background:${c};border:1px solid #3b82f644;border-left:3px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:16px 0 20px">
        <p style="margin:0 0 4px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Your Tracking Number</p>
        <p style="margin:0;color:#93c5fd;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:0.08em">${e.tracking_number}</p>
       </div>`:"",s=b(`
    <div style="margin-bottom:16px">${k(n.pillText,n.pillColor)}</div>
    <div style="font-size:36px;margin-bottom:12px;line-height:1">${n.icon}</div>
    <h1 style="margin:0 0 6px;color:#f9fafb;font-size:26px;font-weight:900">${n.title}</h1>
    <p style="margin:0 0 4px;color:${m};font-size:13px">Order: <strong style="color:${p}">${e.ref}</strong></p>
    ${v()}
    <p style="margin:0 0 14px;color:#9ca3af;font-size:15px">Dear ${e.name.split(" ")[0]},</p>
    ${n.stage>0?(t=n.stage,i=[],r=[],(o=["Order Placed","Processing","Packed","Dispatched","Delivered"]).forEach((e,n)=>{let a=n+1,l=a<t,s=a===t,c=l?"#10b981":s?p:"#1a1a1a",g=l?"#fff":s?d:"#555";i.push(`<td align="center"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td align="center" width="28" height="28" style="width:28px;height:28px;border-radius:14px;background:${c};border:2px solid ${l?"#10b981":s?p:"#2a2a2a"};text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:${g};line-height:24px">${l?"&#10003;":a}</td></tr></table></td>`),r.push(`<td align="center" style="padding:6px 2px 0;vertical-align:top"><p style="margin:0;font-size:10px;color:${s?"#e5e7eb":l?"#9ca3af":"#4b5563"};font-weight:${s?700:400};line-height:1.4">${e}</p></td>`),n<o.length-1&&(i.push(`<td style="vertical-align:middle;padding-bottom:4px"><div style="height:2px;background:${n+1<t?"#10b981":"#2a2a2a"}"></div></td>`),r.push("<td></td>"))}),`<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px"><tr>${i.join("")}</tr><tr>${r.join("")}</tr></table>`):""}
    ${l}
    ${a}
    <div style="margin-top:8px">
      ${w("✉️ Email Us",`mailto:${f}?subject=Order%20${e.ref}`,p,d)}
    </div>
  `);await y({to:e.email,subject:n.subject,html:s})}async function S(e){let t=b(`
    ${$("Your Quote is Ready")}
    <h1 style="margin:6px 0 6px;color:#f9fafb;font-size:28px;font-weight:900">Hi ${e.name.split(" ")[0]}, here is your quote</h1>
    <p style="margin:0 0 28px;color:${m};font-size:13px">Reference: <strong style="color:#e5e7eb">${e.ref}</strong></p>

    <!-- Package card -->
    <div style="background:${c};border:1px solid ${p}44;border-radius:14px;padding:28px;margin-bottom:24px;text-align:center">
      ${$("Recommended Package")}
      <p style="margin:8px 0 20px;color:#f9fafb;font-size:22px;font-weight:900">${e.package}</p>
      <div style="height:1px;background:${g};margin:0 0 20px"></div>
      ${$("Estimated Price")}
      <p style="margin:8px 0 0;color:${p};font-size:34px;font-weight:900;letter-spacing:0.02em">${e.price}</p>
    </div>

    ${e.message?`
    <p style="margin:0 0 10px;color:#e5e7eb;font-size:15px;font-weight:700">Message from our team</p>
    <div style="background:${c};border:1px solid ${g};border-left:3px solid ${p};border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px">
      <p style="margin:0;color:#d1d5db;font-size:14px;line-height:1.8">${e.message.replace(/\n/g,"<br>")}</p>
    </div>`:""}

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Ready to proceed or have questions?</p>
    ${w("Accept Quote",`mailto:${f}?subject=Accept%20quote%20${e.ref}`,p,d)}
    &nbsp;&nbsp;
    ${w("Ask a Question",`mailto:${f}?subject=Question%20about%20quote%20${e.ref}`,p,d)}
  `);await y({to:e.email,subject:`Your Quote — ${e.ref} | Daisy Gadgets Co.`,html:t})}async function I(e){let t=b(`
    ${$("Welcome to the family")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">
      ✨ You are in${e.name?`, ${e.name.split(" ")[0]}`:""}!
    </h1>
    <p style="margin:0 0 28px;color:#9ca3af;font-size:15px;line-height:1.6">Thank you for joining the Daisy Gadgets Co. family. Here is your exclusive first-order discount code:</p>

    <!-- Code card -->
    <div style="background:${d};border:1px solid ${p}55;border-radius:14px;padding:32px;text-align:center;margin-bottom:28px">
      ${$("Your Exclusive Discount Code")}
      <p style="margin:12px 0;color:${p};font-size:40px;font-weight:900;letter-spacing:0.15em;font-family:monospace">DAISY25</p>
      <div style="height:1px;background:${g};margin:16px 0"></div>
      <p style="margin:0;color:${m};font-size:13px;line-height:1.6">💎 25% off your first order — mention this code by email<br>when placing your order. Valid for all products.</p>
    </div>

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Browse our full range of gadgets, appliances, solar solutions and more:</p>
    ${w("🛍️ Shop Now",`${x}/shop`)}
    &nbsp;&nbsp;
    ${w("✉️ Claim via Email",`mailto:${f}?subject=Discount%20code%20DAISY25`,p,d)}
  `);await y({to:e.email,subject:"✨ Your 25% Discount Code — Daisy Gadgets Co.",html:t})}async function T(e){let t=e=>`R ${e.toLocaleString("en-ZA",{minimumFractionDigits:2})}`,o=encodeURIComponent(`Hi, I received approval for my installment application ${e.ref} for the ${e.product_name}. I'm ready to pay my deposit of ${t(e.deposit)}.`),i=`
    <tr>
      <td colspan="2" style="padding:10px 0 4px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid ${g}">TymeBank / GoTymeBank</td>
    </tr>
    ${z("Account Holder","Daisy Gadgets Co.")}
    ${z("Account Type","Business Account")}
    ${z("Account Number","51072673949")}
    ${z("Branch Code","678910")}
  `,r=b(`
    <!-- Approved badge -->
    <div style="text-align:center;margin-bottom:28px">
      <div style="display:inline-block;background:#10b98122;border:1px solid #10b98155;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:12px">✅</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:900">Application Approved!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${e.name.split(" ")[0]}, your installment plan is confirmed.</p>
    </div>

    <!-- Ref + product -->
    <div style="background:${d};border:1px solid ${p}44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${$("Application Reference")}
      <p style="margin:4px 0 12px;color:${p};font-size:24px;font-weight:900;font-family:monospace;letter-spacing:0.1em">${e.ref}</p>
      ${$("Product")}
      <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:700">${e.product_name}</p>
    </div>

    ${v()}

    <!-- Payment schedule -->
    <p style="margin:0 0 12px;color:#fff;font-size:15px;font-weight:700">Your Payment Schedule</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:${m};font-size:13px">Deposit <span style="color:#f59e0b;font-size:11px;font-weight:700">(pay first)</span></td>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:#f59e0b;font-size:18px;font-weight:900;text-align:right">${t(e.deposit)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:${m};font-size:13px">Monthly Payment \xd7 ${e.term_months} months</td>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:${p};font-size:18px;font-weight:900;text-align:right">${t(e.monthly_payment)}/mo</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:${m};font-size:13px">Total Repayable</td>
        <td style="padding:10px 0;color:#e5e7eb;font-size:14px;font-weight:700;text-align:right">${t(e.total_repayable)}</td>
      </tr>
    </table>

    <!-- How to start -->
    <div style="background:#f59e0b11;border:1px solid #f59e0b44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#f59e0b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">⚡ Next Step — Pay Your Deposit</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">Transfer <strong style="color:#f59e0b">${t(e.deposit)}</strong> to one of our accounts below using <strong style="color:#fff">${e.ref}</strong> as your payment reference, then send proof of payment by email to activate your plan.</p>
    </div>

    ${v()}

    <!-- Bank details -->
    <p style="margin:0 0 12px;color:#fff;font-size:15px;font-weight:700">Payment Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${i}
    </table>

    <!-- Email CTA -->
    <div style="text-align:center;margin-bottom:8px">
      ${w("✉️ Send Proof of Payment by Email",`mailto:${f}?subject=${o}`,p,d)}
    </div>
    <p style="margin:12px 0 0;color:${m};font-size:12px;text-align:center">Always use <strong style="color:#fff">${e.ref}</strong> as your payment reference.</p>
  `);await y({to:e.email,subject:`✅ Installment Approved — ${e.ref} | Daisy Gadgets Co.`,html:r})}function _(e,t,o){return`
    <div style="text-align:center;margin-bottom:28px">
      <div style="display:inline-block;background:#ffffff0f;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:12px">${e}</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:900">${t}</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">${o}</p>
    </div>`}function Y(e,t){return`
    <div style="background:${d};border:1px solid ${p}44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${$("Application Reference")}
      <p style="margin:4px 0 12px;color:${p};font-size:24px;font-weight:900;font-family:monospace;letter-spacing:0.1em">${e}</p>
      ${$("Product")}
      <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:700">${t}</p>
    </div>`}async function E(e){let t=encodeURIComponent(`Hi, I am following up on my installment application ${e.ref} for the ${e.product_name}.`),o=b(`
    ${_("🔍","Application Under Review",`Hi ${e.name.split(" ")[0]}, we are looking into your application.`)}
    ${Y(e.ref,e.product_name)}

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
    <div style="background:${d};border:1px solid ${g};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${$("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${e.admin_notes}</p>
    </div>`:""}

    <div style="text-align:center">
      ${w("Email Us",`mailto:${f}?subject=${t}`,p,d)}
    </div>
  `);await y({to:e.email,subject:`Application Under Review — ${e.ref} | Daisy Gadgets Co.`,html:o})}async function G(e){var t,o,i,r,n;let a,l,s=encodeURIComponent(`Hi, I am sending proof of payment for my installment deposit. Application: ${e.ref} — ${e.product_name}.`),c=b(`
    ${_("💳","Deposit Payment Required",`Hi ${e.name.split(" ")[0]}, one step away from activating your plan!`)}
    ${Y(e.ref,e.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Your application has been processed. To activate your installment plan, please pay the deposit of <strong style="color:#f59e0b;font-size:16px">${(a=e.deposit,`R ${a.toLocaleString("en-ZA",{minimumFractionDigits:2})}`)}</strong> to one of our accounts below.
    </p>

    ${(t=e.deposit,o=e.monthly_payment,i=e.term_months,r=e.total_repayable,l=e=>`R ${e.toLocaleString("en-ZA",{minimumFractionDigits:2})}`,`
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:${m};font-size:13px">Deposit</td>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:#f59e0b;font-size:16px;font-weight:900;text-align:right">${l(t)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:${m};font-size:13px">Monthly x ${i} months</td>
        <td style="padding:10px 0;border-bottom:1px solid ${g};color:${p};font-size:16px;font-weight:900;text-align:right">${l(o)}/mo</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:${m};font-size:13px">Total Repayable</td>
        <td style="padding:10px 0;color:#e5e7eb;font-size:14px;font-weight:700;text-align:right">${l(r)}</td>
      </tr>
    </table>`)}
    ${(n=e.ref,`
    <div style="background:#f59e0b0d;border:1px solid #f59e0b44;border-radius:12px;padding:16px 20px;margin-bottom:20px">
      <p style="margin:0 0 6px;color:#f59e0b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Deposit Payment Details</p>
      <p style="margin:0 0 12px;color:#d1d5db;font-size:13px;line-height:1.6">Use <strong style="color:#fff">${n}</strong> as your payment reference.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td colspan="2" style="padding:6px 0 2px;color:${m};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">TymeBank / GoTymeBank</td></tr>
        ${z("Account","Daisy Gadgets Co.")}
        ${z("Account No.","51072673949")}
        ${z("Branch","678910")}
      </table>
    </div>`)}

    ${e.admin_notes?`
    <div style="background:${d};border:1px solid ${g};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${$("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${e.admin_notes}</p>
    </div>`:""}

    <div style="text-align:center">
      ${w("Send Proof of Payment",`mailto:${f}?subject=${s}`,p,d)}
    </div>
    <p style="margin:12px 0 0;color:${m};font-size:12px;text-align:center">After we confirm receipt, your plan will be activated immediately.</p>
  `);await y({to:e.email,subject:`Deposit Required — ${e.ref} | Daisy Gadgets Co.`,html:c})}async function O(e){let t=e=>`R ${e.toLocaleString("en-ZA",{minimumFractionDigits:2})}`,o=encodeURIComponent(`Hi, I would like to check on my active installment plan ${e.ref} for the ${e.product_name}.`),i=b(`
    ${_("🟢","Your Plan is Now Active!",`Hi ${e.name.split(" ")[0]}, welcome to your installment plan.`)}
    ${Y(e.ref,e.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Your deposit has been received and your installment plan is now <strong style="color:#10b981">active</strong>. Here is your monthly payment schedule:
    </p>

    <div style="background:#10b98111;border:1px solid #10b98144;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
      ${$("Your Monthly Payment")}
      <p style="margin:8px 0 4px;color:#10b981;font-size:36px;font-weight:900">${t(e.monthly_payment)}<span style="font-size:16px;color:#9ca3af">/month</span></p>
      <p style="margin:0;color:#9ca3af;font-size:13px">x ${e.term_months} months &nbsp;&middot;&nbsp; Total: ${t(e.total_repayable)}</p>
    </div>

    <div style="background:${d};border:1px solid ${g};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 10px;color:#fff;font-size:14px;font-weight:700">Payment Instructions</p>
      <p style="margin:0 0 8px;color:#d1d5db;font-size:13px;line-height:1.6">Make your monthly payment to the same bank account using <strong style="color:${p}">${e.ref}</strong> as your reference.</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">Send proof of each monthly payment by email to keep your account in good standing.</p>
    </div>

    ${e.admin_notes?`
    <div style="background:${d};border:1px solid ${g};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${$("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${e.admin_notes}</p>
    </div>`:""}

    <div style="text-align:center">
      ${w("Contact Us by Email",`mailto:${f}?subject=${o}`,p,d)}
    </div>
  `);await y({to:e.email,subject:`Plan Activated — ${e.ref} | Daisy Gadgets Co.`,html:i})}async function B(e){let t,o=encodeURIComponent(`Hi, I would like to enquire about another product on installments. My previous plan was ${e.ref}.`),i=b(`
    ${_("🏆","Fully Paid — Congratulations!",`Hi ${e.name.split(" ")[0]}, you have completed your installment plan!`)}
    ${Y(e.ref,e.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      You have successfully completed all payments on your installment plan. Thank you for trusting Daisy Gadgets Co. — we truly appreciate your commitment.
    </p>

    <div style="background:#D4AF3711;border:1px solid #D4AF3744;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
      ${$("Total Paid")}
      <p style="margin:8px 0 4px;color:${p};font-size:36px;font-weight:900">${(t=e.total_repayable,`R ${t.toLocaleString("en-ZA",{minimumFractionDigits:2})}`)}</p>
      <p style="margin:0;color:#9ca3af;font-size:13px">${e.term_months} monthly payments &nbsp;&middot;&nbsp; Plan complete</p>
    </div>

    <div style="background:${d};border:1px solid ${g};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#fff;font-size:14px;font-weight:700">Interested in another product?</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">As a returning customer, you may be eligible for priority approval on your next installment application. Email us to get started.</p>
    </div>

    <div style="text-align:center">
      ${w("Shop Again",`${x}/shop`)}
      &nbsp;&nbsp;
      ${w("Email Us",`mailto:${f}?subject=${o}`,p,d)}
    </div>
  `);await y({to:e.email,subject:`Plan Complete — ${e.ref} | Daisy Gadgets Co.`,html:i})}async function H(e){let t=encodeURIComponent(`Hi, I would like to discuss my declined installment application ${e.ref} for the ${e.product_name} and explore other options.`),o=b(`
    ${_("📋","Application Update",`Hi ${e.name.split(" ")[0]}, regarding your application ${e.ref}.`)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Thank you for applying for an installment plan on the <strong style="color:#fff">${e.product_name}</strong>. After reviewing your application, we are unfortunately unable to approve it at this time.
    </p>

    ${e.admin_notes?`
    <div style="background:${d};border:1px solid ${g};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${$("Reason")}
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
      ${w("Discuss Options by Email",`mailto:${f}?subject=${t}`,p,d)}
      <br><br>
      ${w("Browse Other Products",`${x}/shop`)}
    </div>
  `);await y({to:e.email,subject:`Application Update — ${e.ref} | Daisy Gadgets Co.`,html:o})}async function W(e){let{attachments:t,cidMap:o}=await h(e.items),i=e.items.map(e=>{let t=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,i=t?`<img src="${t}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${g}" />`:`<div style="width:64px;height:64px;background:${c};border:1px solid ${g};border-radius:10px"></div>`;return`
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${g};width:76px;vertical-align:middle">${i}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${g};vertical-align:middle">
        <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
        <p style="margin:0;color:${m};font-size:12px">Qty: ${e.qty}</p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${g};text-align:right;vertical-align:middle">
        <span style="color:${p};font-size:13px;font-weight:700">${e.price}</span>
      </td>
    </tr>`}).join(""),r=`
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em">Order placed!</h1>
    <p style="margin:0 0 24px;color:${m};font-size:15px">Hi ${e.name.split(" ")[0]}, your order <strong style="color:${p}">${e.ref}</strong> is in — we're waiting for your proof of payment.</p>

    <!-- Items ordered -->
    <p style="margin:0 0 12px;color:#e5e7eb;font-size:14px;font-weight:700">Items in your order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${i}
    </table>

    <!-- Clear cart notice -->
    <div style="background:${c};border:1px solid #f59e0b44;border-radius:12px;padding:20px 24px;margin-bottom:28px">
      <p style="margin:0 0 8px;color:#f59e0b;font-size:14px;font-weight:700">Remove these from your cart</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">
        Your order is now in our system. To avoid placing the same order twice, please clear your cart the next time you visit our shop.
      </p>
    </div>

    <div style="text-align:center;margin-bottom:28px">
      ${w("Go to Shop",`${x}/shop`)}
    </div>

    ${v()}
    <p style="margin:0;color:${m};font-size:13px;text-align:center">
      Questions? ${w("Email Us",`mailto:${f}?subject=Order%20${encodeURIComponent(e.ref)}`,c,p)}
    </p>
  `;await y({to:e.email,subject:`Order ${e.ref} received — clear your cart | Daisy Gadgets Co.`,html:b(r),attachments:t})}async function F(e){let t=e.ctaUrl&&e.trackingId?`${x}/api/track/email?id=${e.trackingId}&e=click&url=${encodeURIComponent(e.ctaUrl)}`:e.ctaUrl,o=e.ctaText&&t?`<div style="text-align:center;margin:28px 0">${w(e.ctaText,t)}</div>`:"",i=e.trackingId?`<img src="${x}/api/track/email?id=${e.trackingId}&e=open" width="1" height="1" style="display:none;width:1px;height:1px;border:0" alt="" />`:"",r="",n=[];if(e.orderItems?.length){let{attachments:t,cidMap:o}=await h(e.orderItems.map(e=>({name:e.name,imageUrl:e.imageUrl})));n=t;let i=e.orderItems.map(e=>{let t=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,i=t?`<img src="${t}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${g}" />`:`<div style="width:64px;height:64px;background:${c};border:1px solid ${g};border-radius:10px"></div>`,r=e.id?`${x}/shop/${e.id}`:`${x}/shop`;return`
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${g};width:76px;vertical-align:middle">
          <a href="${r}">${i}</a>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid ${g};vertical-align:middle">
          <a href="${r}" style="text-decoration:none">
            <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
            <p style="margin:0;color:${m};font-size:12px">Qty: ${e.qty}</p>
          </a>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${g};text-align:right;vertical-align:middle">
          <span style="color:${p};font-size:13px;font-weight:700">${e.price}</span>
        </td>
      </tr>`}).join(""),a=e.orderRef?`<p style="margin:0 0 14px;color:${m};font-size:12px">Order ref: <span style="color:${p};font-weight:700;font-family:monospace">${e.orderRef}</span></p>`:"",l=e.restoreCartUrl?`<div style="text-align:center;margin-top:20px">${w("Complete Your Order →",e.restoreCartUrl)}</div>`:"";r=`
      ${v()}
      <p style="margin:0 0 4px;color:#e5e7eb;font-size:14px;font-weight:700">Your last order</p>
      ${a}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${i}
      </table>
      ${l}`}else if(e.featuredProducts?.length){let{attachments:t,cidMap:o}=await h(e.featuredProducts.map(e=>({name:e.name,imageUrl:e.imageUrl})));n=t;let i=e.featuredProducts.map(e=>{let t=e.imageUrl?o.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:x+e.imageUrl):null,i=t?`<img src="${t}" alt="${e.name}" width="200" style="width:100%;max-width:200px;height:140px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${g}" />`:`<div style="width:100%;height:140px;background:${c};border:1px solid ${g};border-radius:10px"></div>`;return`
        <td style="width:48%;vertical-align:top;padding:6px">
          <a href="${x}/shop/${e.id}" style="text-decoration:none;display:block">
            ${i}
            <p style="margin:10px 0 4px;color:#e5e7eb;font-size:13px;font-weight:600;line-height:1.3">${e.name}</p>
            <p style="margin:0;color:${p};font-size:14px;font-weight:800">${e.price}</p>
          </a>
        </td>`}),a=[];for(let e=0;e<i.length;e+=2)a.push(`<tr>${i.slice(e,e+2).join("")}</tr>`);r=`
      ${v()}
      <p style="margin:0 0 16px;color:#e5e7eb;font-size:14px;font-weight:700">Featured Products</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${a.join("")}
      </table>`}let a=`
    <h1 style="margin:0 0 20px;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em">${e.heading}</h1>
    <div style="color:#d1d5db;font-size:14px;line-height:1.75;white-space:pre-wrap">${e.body}</div>
    ${o}
    ${r}
    ${v()}
    <p style="margin:0;color:${m};font-size:12px;text-align:center">
      You received this because you placed an order with Daisy Gadgets Co.
    </p>
    ${i}
  `;await y({to:e.to,subject:e.subject,html:b(a),attachments:n.length?n:void 0})}e.s(["TRACKING_TEMPLATES",0,j,"sendCampaignEmail",0,F,"sendClearCartReminder",0,W,"sendInstallmentActive",0,O,"sendInstallmentApproval",0,T,"sendInstallmentAwaitingPayment",0,G,"sendInstallmentCompleted",0,B,"sendInstallmentDeclined",0,H,"sendInstallmentReviewing",0,E,"sendMail",0,y,"sendOrderConfirmation",0,A,"sendProofAcknowledgement",0,D,"sendQuoteReply",0,S,"sendRejectionEmail",0,C,"sendStatusUpdate",0,R,"sendTrackingUpdate",0,P,"sendWelcomeEmail",0,I],67010)}];

//# sourceMappingURL=lib_mailer_ts_0qdwzgv._.js.map