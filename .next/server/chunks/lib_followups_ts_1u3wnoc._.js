module.exports=[94689,e=>{"use strict";var t=e.i(54799),a=e.i(85148),r=e.i(14747),i=e.i(22734);let o=process.env.DATA_DIR??r.default.join(process.cwd(),"data"),s=r.default.join(o,"daisy.db"),n=[r.default.join(o,"products-backup.json"),r.default.join(process.cwd(),"data","products.json")],c=null;function l(){return c||((0,i.existsSync)(o)||(0,i.mkdirSync)(o,{recursive:!0}),(c=new a.default(s)).pragma("journal_mode = WAL"),c.pragma("foreign_keys = ON"),function(e){e.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      price         TEXT NOT NULL,
      originalPrice TEXT NOT NULL DEFAULT '',
      category      TEXT NOT NULL,
      description   TEXT NOT NULL DEFAULT '',
      imageUrl      TEXT NOT NULL DEFAULT '',
      inStock       INTEGER NOT NULL DEFAULT 1,
      featured      INTEGER NOT NULL DEFAULT 0,
      createdAt     TEXT NOT NULL,
      updatedAt     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id              TEXT PRIMARY KEY,
      name            TEXT,
      email           TEXT,
      phone           TEXT,
      message         TEXT,
      productInterest TEXT,
      createdAt       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id                TEXT PRIMARY KEY,
      ref               TEXT UNIQUE NOT NULL,
      name              TEXT NOT NULL DEFAULT '',
      phone             TEXT NOT NULL DEFAULT '',
      email             TEXT NOT NULL DEFAULT '',
      province          TEXT NOT NULL DEFAULT '',
      propertyType      TEXT NOT NULL DEFAULT '',
      monthlyBill       TEXT NOT NULL DEFAULT '',
      mainGoal          TEXT NOT NULL DEFAULT '',
      appliances        TEXT NOT NULL DEFAULT '[]',
      budget            TEXT NOT NULL DEFAULT '',
      recommendedPackage TEXT NOT NULL DEFAULT '',
      estimatedPrice    TEXT NOT NULL DEFAULT '',
      message           TEXT NOT NULL DEFAULT '',
      status            TEXT NOT NULL DEFAULT 'new',
      source            TEXT NOT NULL DEFAULT 'contact',
      createdAt         TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id             TEXT PRIMARY KEY,
      ref            TEXT UNIQUE NOT NULL,
      name           TEXT NOT NULL,
      email          TEXT NOT NULL,
      phone          TEXT NOT NULL,
      address        TEXT NOT NULL DEFAULT '',
      items          TEXT NOT NULL DEFAULT '[]',
      total          REAL NOT NULL DEFAULT 0,
      status         TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'eft',
      proof_url      TEXT,
      eft_reference  TEXT,
      notes          TEXT,
      bank_id        TEXT,
      tracking_number TEXT,
      createdAt      TEXT NOT NULL,
      updatedAt      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_images (
      key     TEXT PRIMARY KEY,
      url     TEXT NOT NULL,
      label   TEXT NOT NULL,
      section TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id          TEXT PRIMARY KEY,
      name        TEXT,
      phone       TEXT,
      email       TEXT,
      createdAt   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_events (
      id          TEXT PRIMARY KEY,
      visitorId   TEXT,
      productId   TEXT NOT NULL,
      productName TEXT NOT NULL,
      price       TEXT NOT NULL,
      category    TEXT NOT NULL,
      createdAt   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id            TEXT PRIMARY KEY,
      visitorId     TEXT,
      name          TEXT,
      phone         TEXT,
      email         TEXT,
      status        TEXT NOT NULL DEFAULT 'open',
      unreadAdmin   INTEGER NOT NULL DEFAULT 0,
      lastMessageAt TEXT NOT NULL,
      createdAt     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id        TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      sender    TEXT NOT NULL,
      body      TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY
    );

    -- Phase 4 (2026-09-14): local outbox for the Gadgets -> Bevans OS event
    -- pilot (LEAD_CREATED only). A row here is only ever written inside the
    -- same db.transaction() as the business write it describes — see
    -- lib/outbox.ts and the two lead-creation routes. A relay process
    -- (running on the Bevans VPS, not this app) polls status='pending' via
    -- /api/admin/outbox/pending and reports outcomes via
    -- /api/admin/outbox/report; this app never calls out to Bevans OS
    -- itself, so its own availability never depends on Bevans OS.
    CREATE TABLE IF NOT EXISTS outbox_events (
      id                TEXT PRIMARY KEY,
      event_id          TEXT UNIQUE NOT NULL,
      event_type        TEXT NOT NULL,
      event_version     INTEGER NOT NULL,
      occurred_at       TEXT NOT NULL,
      source_platform   TEXT NOT NULL DEFAULT 'gadgets',
      source_entity_id  TEXT NOT NULL,
      payload           TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'pending',
      attempts          INTEGER NOT NULL DEFAULT 0,
      last_attempt_at   TEXT,
      last_error        TEXT,
      delivered_at      TEXT,
      createdAt         TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installment_settings (
      id               TEXT PRIMARY KEY,
      product_id       TEXT UNIQUE NOT NULL,
      min_deposit_pct  REAL NOT NULL DEFAULT 10,
      eligible_terms   TEXT NOT NULL DEFAULT '[6,12,18,24]',
      monthly_rate     REAL NOT NULL DEFAULT 0,
      admin_fee        REAL NOT NULL DEFAULT 0,
      active           INTEGER NOT NULL DEFAULT 1,
      createdAt        TEXT NOT NULL,
      updatedAt        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installment_applications (
      id               TEXT PRIMARY KEY,
      ref              TEXT UNIQUE NOT NULL,
      product_id       TEXT NOT NULL,
      product_name     TEXT NOT NULL,
      product_price    REAL NOT NULL,
      term_months      INTEGER NOT NULL,
      monthly_payment  REAL NOT NULL,
      deposit          REAL NOT NULL,
      total_repayable  REAL NOT NULL,
      name             TEXT NOT NULL,
      phone            TEXT NOT NULL,
      email            TEXT NOT NULL,
      id_number        TEXT NOT NULL,
      address          TEXT NOT NULL,
      status           TEXT NOT NULL DEFAULT 'new',
      whatsapp_clicked INTEGER NOT NULL DEFAULT 0,
      admin_notes      TEXT,
      createdAt        TEXT NOT NULL,
      updatedAt        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installment_events (
      id          TEXT PRIMARY KEY,
      event       TEXT NOT NULL,
      product_id  TEXT,
      ref         TEXT,
      term_months INTEGER,
      metadata    TEXT,
      createdAt   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_campaigns (
      id          TEXT PRIMARY KEY,
      subject     TEXT NOT NULL,
      heading     TEXT NOT NULL,
      body        TEXT NOT NULL,
      cta_text    TEXT,
      cta_url     TEXT,
      recipients  TEXT NOT NULL DEFAULT 'all',
      sent_to     INTEGER NOT NULL DEFAULT 0,
      status      TEXT NOT NULL DEFAULT 'sent',
      createdAt   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_sends (
      id         TEXT PRIMARY KEY,
      email      TEXT NOT NULL,
      type       TEXT NOT NULL,
      ref        TEXT,
      subject    TEXT,
      opened     INTEGER NOT NULL DEFAULT 0,
      clicked    INTEGER NOT NULL DEFAULT 0,
      opened_at  TEXT,
      clicked_at TEXT,
      createdAt  TEXT NOT NULL
    );

    -- Marketing/follow-up email opt-outs (see lib/optout.ts). Transactional
    -- emails about orders/installments are NOT affected by this table.
    CREATE TABLE IF NOT EXISTS email_optouts (
      email     TEXT PRIMARY KEY,
      source    TEXT NOT NULL DEFAULT 'unsubscribe_link',
      createdAt TEXT NOT NULL
    );
  `);try{e.exec("ALTER TABLE orders ADD COLUMN bank_id TEXT")}catch{}try{e.exec("ALTER TABLE orders ADD COLUMN tracking_number TEXT")}catch{}try{e.exec("ALTER TABLE installment_applications ADD COLUMN product_imageUrl TEXT")}catch{}}(c),function(e){try{e.exec("ALTER TABLE products ADD COLUMN originalPrice TEXT NOT NULL DEFAULT ''")}catch{}}(c),function(e){if(!e.prepare("SELECT name FROM migrations WHERE name = ?").get("json_import_gadgets_v1")){for(let t of n)if((0,i.existsSync)(t))try{let a=JSON.parse((0,i.readFileSync)(t,"utf-8"));if(Array.isArray(a)&&a.length>0){e.prepare("DELETE FROM products").run();let t=e.prepare(`
          INSERT OR REPLACE INTO products
            (id, name, price, category, description, imageUrl, inStock, featured, createdAt, updatedAt)
          VALUES
            (@id, @name, @price, @category, @description, @imageUrl, @inStock, @featured, @createdAt, @updatedAt)
        `);e.transaction(e=>{for(let a of e)t.run({...a,inStock:+!!a.inStock,featured:+!!a.featured})})(a);break}}catch{}e.prepare("INSERT OR IGNORE INTO migrations (name) VALUES (?)").run("json_import_gadgets_v1")}}(c),function(e){if(e.prepare("SELECT name FROM migrations WHERE name = ?").get("seed_products_v1"))return;if(e.prepare("SELECT COUNT(*) as c FROM products").get().c>0)return e.prepare("INSERT OR IGNORE INTO migrations (name) VALUES (?)").run("seed_products_v1");let t=new Date().toISOString(),a=e.prepare(`
    INSERT OR IGNORE INTO products (id, name, price, category, description, imageUrl, inStock, featured, createdAt, updatedAt)
    VALUES (@id, @name, @price, @category, @description, @imageUrl, @inStock, @featured, @createdAt, @updatedAt)
  `);e.transaction(e=>{for(let r of e)a.run({...r,createdAt:t,updatedAt:t})})([{id:"sm-001",name:"iPhone 15 Pro Max 256GB",price:"R22,999",category:"Smartphones",featured:1,inStock:1,description:"Titanium design, A17 Pro chip, 48MP camera system, USB-C, Action button. Available in Natural, Black, White & Blue Titanium.",imageUrl:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop"},{id:"sm-002",name:"iPhone 15 128GB",price:"R16,999",category:"Smartphones",featured:1,inStock:1,description:"Dynamic Island, 48MP main camera, USB-C, A16 Bionic chip. Available in Pink, Yellow, Green, Blue & Black.",imageUrl:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"},{id:"sm-003",name:"Samsung Galaxy S24 Ultra 256GB",price:"R19,999",category:"Smartphones",featured:1,inStock:1,description:'Built-in S Pen, 200MP camera, Snapdragon 8 Gen 3, 6.8" QHD+ display, 5000mAh battery.',imageUrl:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop"},{id:"sm-004",name:"Samsung Galaxy A54 5G 128GB",price:"R7,499",category:"Smartphones",featured:0,inStock:1,description:"50MP OIS camera, 5000mAh battery, Super AMOLED display, IP67 water resistant.",imageUrl:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop"},{id:"sm-005",name:"Samsung Galaxy S23 FE 256GB",price:"R9,999",category:"Smartphones",featured:0,inStock:1,description:"50MP triple camera, Snapdragon 8 Gen 1, 4500mAh, AMOLED 120Hz display.",imageUrl:"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&h=600&fit=crop"},{id:"tv-001",name:'Samsung 65" QLED 4K Smart TV',price:"R14,999",category:"TVs",featured:1,inStock:1,description:"Quantum Dot technology, Tizen OS, 120Hz, HDR10+, Dolby Atmos, 4 HDMI ports.",imageUrl:"https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=600&fit=crop"},{id:"tv-002",name:'Hisense 55" 4K UHD Smart TV',price:"R6,999",category:"TVs",featured:0,inStock:1,description:"4K UHD, VIDAA Smart OS, Dolby Vision, DTS Virtual:X, HDR10, 3 HDMI.",imageUrl:"https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&h=600&fit=crop"},{id:"tv-003",name:'LG 75" OLED C3 4K Smart TV',price:"R34,999",category:"TVs",featured:1,inStock:1,description:"Evo OLED panel, α9 Gen6 AI processor, Dolby Vision IQ, Dolby Atmos, Game Mode Pro, webOS 23.",imageUrl:"https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=600&fit=crop"},{id:"tv-004",name:'Samsung 43" Crystal UHD Smart TV',price:"R5,499",category:"TVs",featured:0,inStock:1,description:"Crystal Processor 4K, PurColor, HDR, Tizen OS, Built-in Wi-Fi.",imageUrl:"https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&h=600&fit=crop"},{id:"gc-001",name:"PlayStation 5 Console",price:"R12,999",category:"Gaming Consoles",featured:1,inStock:1,description:"825GB SSD, 4K gaming, 120fps, DualSense controller, 3D Audio, Ultra HD Blu-ray.",imageUrl:"https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=600&fit=crop"},{id:"gc-002",name:"PlayStation 5 Slim",price:"R10,999",category:"Gaming Consoles",featured:0,inStock:1,description:"Slimmer, lighter PS5 with 1TB SSD, detachable disc drive, DualSense controller.",imageUrl:"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop"},{id:"gc-003",name:"Xbox Series X 1TB",price:"R11,999",category:"Gaming Consoles",featured:0,inStock:1,description:"1TB NVMe SSD, 4K 120fps, Quick Resume, Ray Tracing, Xbox Game Pass ready.",imageUrl:"https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=600&h=600&fit=crop"},{id:"gc-004",name:"Nintendo Switch OLED",price:"R6,499",category:"Gaming Consoles",featured:0,inStock:1,description:'7" OLED screen, 64GB storage, enhanced audio, wide adjustable stand, dock with LAN port.',imageUrl:"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=600&fit=crop"},{id:"gp-001",name:"RTX 4070 Gaming PC Bundle",price:"R22,999",category:"Gaming PCs",featured:1,inStock:1,description:"Intel Core i7-13700K, RTX 4070 12GB, 32GB DDR5 RAM, 1TB NVMe SSD, 240mm AIO cooler.",imageUrl:"https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop"},{id:"gp-002",name:"AMD Ryzen 9 Gaming Rig",price:"R28,999",category:"Gaming PCs",featured:1,inStock:1,description:"Ryzen 9 7900X, RX 7900 XT 20GB, 32GB DDR5, 2TB NVMe SSD, Full-tower RGB case.",imageUrl:"https://images.unsplash.com/photo-1593640408182-31c228cba4fc?w=600&h=600&fit=crop"},{id:"gp-003",name:"Intel i5 Starter Gaming PC",price:"R13,999",category:"Gaming PCs",featured:0,inStock:1,description:"Intel Core i5-12400F, RTX 3060 12GB, 16GB DDR4, 512GB SSD. Perfect entry-level gaming rig.",imageUrl:"https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&h=600&fit=crop"},{id:"lb-001",name:'MacBook Pro M3 14"',price:"R32,999",category:"Laptops & MacBooks",featured:1,inStock:1,description:"Apple M3 chip, 8GB RAM, 512GB SSD, Liquid Retina display, 22-hour battery, MagSafe 3.",imageUrl:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"},{id:"lb-002",name:'MacBook Air M2 13"',price:"R22,999",category:"Laptops & MacBooks",featured:1,inStock:1,description:"Apple M2 chip, 8GB RAM, 256GB SSD, Liquid Retina display, 18-hour battery, fanless design.",imageUrl:"https://images.unsplash.com/photo-1611186871525-4767a56e0f54?w=600&h=600&fit=crop"},{id:"lb-003",name:"Dell XPS 15 Intel i7",price:"R23,999",category:"Laptops & MacBooks",featured:0,inStock:1,description:'Intel Core i7-13700H, 16GB DDR5, 512GB SSD, RTX 4050, 15.6" OLED 3.5K display.',imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop"},{id:"lb-004",name:'HP Pavilion Gaming 15" Laptop',price:"R14,499",category:"Laptops & MacBooks",featured:0,inStock:1,description:"AMD Ryzen 7 7745H, RTX 4060 8GB, 16GB DDR5, 512GB SSD, 144Hz FHD display.",imageUrl:"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop"},{id:"lb-005",name:"Lenovo ThinkPad X1 Carbon",price:"R19,999",category:"Laptops & MacBooks",featured:0,inStock:1,description:'Intel Core i7-1365U, 16GB LPDDR5, 512GB SSD, 14" IPS 2.8K OLED, 57Wh battery.',imageUrl:"https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop"},{id:"tw-001",name:'iPad Pro M2 12.9" 256GB',price:"R21,999",category:"Tablets & Watches",featured:1,inStock:1,description:"Apple M2 chip, Liquid Retina XDR display, Wi-Fi 6E, 12MP + 10MP cameras, Face ID.",imageUrl:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"},{id:"tw-002",name:"Apple Watch Series 9 45mm",price:"R8,999",category:"Tablets & Watches",featured:0,inStock:1,description:"S9 SiP chip, Double Tap gesture, Always-On Retina display, crash detection, GPS.",imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"},{id:"tw-003",name:"Samsung Galaxy Tab S9 256GB",price:"R13,499",category:"Tablets & Watches",featured:0,inStock:1,description:'Snapdragon 8 Gen 2, 11" Dynamic AMOLED 2X, S Pen included, IP68, 8400mAh.',imageUrl:"https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop"},{id:"tw-004",name:"Apple Watch Ultra 2 49mm",price:"R13,999",category:"Tablets & Watches",featured:0,inStock:1,description:"Titanium case, 3000 nits display, dual-frequency GPS, 60-hour battery, Action button.",imageUrl:"https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop"},{id:"ha-001",name:"Samsung 15kg Top Loader Washing Machine",price:"R7,499",category:"Home Appliances",featured:1,inStock:1,description:"Digital Inverter Motor, Eco Tub Clean, child lock, 15 wash programs, 5-year motor warranty.",imageUrl:"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=600&fit=crop"},{id:"ha-002",name:"LG 600L Double Door Fridge",price:"R12,999",category:"Home Appliances",featured:1,inStock:1,description:"Linear Inverter Compressor, Door-in-Door, Multi Air Flow, Smart Diagnosis, A++ energy rating.",imageUrl:"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=600&fit=crop"},{id:"ha-003",name:"Hisense 7kg Front Loader Washer",price:"R5,499",category:"Home Appliances",featured:0,inStock:1,description:"Inverter motor, 1200 RPM spin, 15 wash programs, anti-vibration design, delay start.",imageUrl:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"},{id:"ha-004",name:"Bosch 60cm Built-In Dishwasher",price:"R8,999",category:"Home Appliances",featured:0,inStock:1,description:"14 place settings, EcoSilence motor, 6 programs, AutoDry, A++ energy class.",imageUrl:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"},{id:"ka-001",name:"De'Longhi Magnifica Evo Espresso Machine",price:"R5,999",category:"Kitchen Appliances",featured:1,inStock:1,description:"Bean-to-cup, 15-bar pressure, LatteCrema System, 250g bean hopper, My Menu display.",imageUrl:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop"},{id:"ka-002",name:"Samsung 28L Convection Microwave",price:"R2,999",category:"Kitchen Appliances",featured:0,inStock:1,description:"900W, Slim Fry technology, Ceramic enamel interior, 28L capacity, slim design.",imageUrl:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop"},{id:"ka-003",name:"Smeg Retro Kettle + Toaster Set",price:"R2,499",category:"Kitchen Appliances",featured:0,inStock:1,description:"1.7L stainless steel kettle, 2-slice toaster, iconic retro design. Available in multiple colours.",imageUrl:"https://images.unsplash.com/photo-1525904097878-94fb15835963?w=600&h=600&fit=crop"},{id:"ka-004",name:"Nutribullet Pro 900W",price:"R1,299",category:"Kitchen Appliances",featured:0,inStock:1,description:"900W motor, 2x 900ml cups, stainless steel blades, BPA-free, dishwasher-safe cups.",imageUrl:"https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&h=600&fit=crop"},{id:"sp-001",name:"5kVA Inverter + 200Ah Lithium Battery Bundle",price:"R18,999",category:"Solar & Power Solutions",featured:1,inStock:1,description:"Pure sine wave inverter, 200Ah LiFePO4 battery, WiFi monitoring, 4000W load capacity. Ideal for load shedding.",imageUrl:"https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=600&fit=crop"},{id:"sp-002",name:"10kVA Solar System (8 Panels + Inverter)",price:"R49,999",category:"Solar & Power Solutions",featured:1,inStock:1,description:"8x 550W solar panels, 10kVA hybrid inverter, 2x 200Ah lithium batteries. Full installation package available.",imageUrl:"https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=600&fit=crop"},{id:"sp-003",name:"3kVA Load Shedding Inverter Kit",price:"R9,999",category:"Solar & Power Solutions",featured:0,inStock:1,description:"3kVA pure sine wave inverter + 100Ah AGM battery. Powers lights, TV, DSTV, router & small appliances.",imageUrl:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=600&fit=crop"},{id:"sp-004",name:"200W Portable Folding Solar Panel",price:"R2,999",category:"Solar & Power Solutions",featured:0,inStock:1,description:"Monocrystalline cells, 200W peak output, USB-A/USB-C, MC4 connector, IP67 waterproof.",imageUrl:"https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&h=600&fit=crop"},{id:"er-001",name:"Kids Mercedes AMG Electric Ride-On 24V",price:"R5,999",category:"Electric Ride-On Cars",featured:1,inStock:1,description:"Licensed Mercedes AMG, 24V dual motor, leather seat, rubber tyres, parental remote control, MP3/Bluetooth.",imageUrl:"https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&h=600&fit=crop"},{id:"er-002",name:"BMW X5 Electric Ride-On 12V",price:"R3,999",category:"Electric Ride-On Cars",featured:0,inStock:1,description:"Licensed BMW X5, 12V battery, 2 speeds, LED lights, music player, remote control.",imageUrl:"https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=600&h=600&fit=crop"},{id:"er-003",name:"Lamborghini Electric Kids Car 12V",price:"R4,499",category:"Electric Ride-On Cars",featured:0,inStock:1,description:"Licensed Lamborghini, 12V motor, doors open, horn, LED headlights, remote control, up to 5km/h.",imageUrl:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=600&fit=crop"},{id:"fu-001",name:"L-Shape Corner Sofa Set",price:"R8,999",category:"Furniture",featured:1,inStock:1,description:"Premium fabric upholstery, solid wood frame, reversible chaise lounge. Seats 5–6 people. Multiple colours.",imageUrl:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop"},{id:"fu-002",name:"King Size Bed Frame + Headboard",price:"R5,999",category:"Furniture",featured:0,inStock:1,description:"Solid wood slat base, padded headboard, centre support legs. Fits standard 183x200cm mattress.",imageUrl:"https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&h=600&fit=crop"},{id:"fu-003",name:"Electric Height-Adjustable Standing Desk",price:"R6,499",category:"Furniture",featured:0,inStock:1,description:"Dual motor electric lift, 140x70cm desktop, 4 memory presets, cable management, 80kg capacity.",imageUrl:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop"},{id:"fu-004",name:"Recliner Lounge Chair",price:"R4,499",category:"Furniture",featured:0,inStock:1,description:"PU leather, 360° swivel, 135° recline, padded armrests. Available in Black, Brown & Grey.",imageUrl:"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop"},{id:"oe-001",name:"HP Color LaserJet Pro MFP",price:"R5,499",category:"Office Equipment",featured:0,inStock:1,description:"Print, scan, copy & fax. 22ppm colour, Wi-Fi + LAN, auto duplex, 250-sheet tray.",imageUrl:"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=600&fit=crop"},{id:"oe-002",name:"Canon PIXMA MegaTank All-in-One",price:"R1,999",category:"Office Equipment",featured:0,inStock:1,description:"Ink tank system (no cartridges), print/scan/copy, Wi-Fi, up to 6,000 black pages per fill.",imageUrl:"https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop"},{id:"oe-003",name:"Ergonomic Mesh Office Chair",price:"R3,499",category:"Office Equipment",featured:0,inStock:1,description:"Lumbar support, adjustable armrests, headrest, seat height & tilt. Max 120kg. 360° casters.",imageUrl:"https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop"}]),e.prepare("INSERT OR IGNORE INTO migrations (name) VALUES (?)").run("seed_products_v1")}(c),function(e){try{let t=(e??l()).prepare("SELECT * FROM products ORDER BY category, name").all();(0,i.existsSync)(o)||(0,i.mkdirSync)(o,{recursive:!0}),(0,i.writeFileSync)(r.default.join(o,"products-backup.json"),JSON.stringify(t,null,2))}catch{}}(c)),c}var p=e.i(84423);let d=e=>e.trim().toLowerCase();function T(e){return!!e&&!!l().prepare("SELECT 1 FROM email_optouts WHERE email = ?").get(d(e))}let m=r.default.join(process.cwd(),"public","logo.jpg"),u="logo@bevanssons",g="#C8B993",h="#f5d76e",E="#111111",L="#1A1A1A",f="#2A2A2A",N="#6b7280",U="https://gadgets.bevanssons.store";async function A(e){let t=process.env.RESEND_API_KEY?p.default.createTransport({host:"smtp.resend.com",port:587,secure:!1,auth:{user:"resend",pass:process.env.RESEND_API_KEY}}):process.env.MAIL_USER&&process.env.MAIL_PASS?p.default.createTransport({service:"gmail",auth:{user:process.env.MAIL_USER,pass:process.env.MAIL_PASS.replace(/\s+/g,"")}}):null;if(!t)return void console.error("mailer: env vars missing");try{let a=e.attachments??[];(0,i.existsSync)(m)&&a.unshift({filename:"logo.jpg",path:m,cid:u}),await t.sendMail({from:function(){if(process.env.RESEND_API_KEY)return'"Bevanssons" <noreply@bevanssons.store>';let e=process.env.MAIL_USER??"support@bevanssons.store";return`"Bevanssons" <${e}>`}(),replyTo:process.env.MAIL_USER??"support@bevanssons.store",to:e.to,subject:e.subject,text:e.text,html:e.html,attachments:a,...e.headers?{headers:e.headers}:{}})}catch(e){console.error("mailer send error:",e)}}async function y(e){try{let t=await fetch(e,{signal:AbortSignal.timeout(5e3)});if(!t.ok)return null;return Buffer.from(await t.arrayBuffer())}catch{return null}}async function S(e){let t=[],a=new Map;return await Promise.all(e.map(async(e,r)=>{if(!e.imageUrl)return;let i=await y(e.imageUrl.startsWith("http")?e.imageUrl:U+e.imageUrl);if(!i)return;let o=`product-${r}@daisy`,s=e.imageUrl.split(".").pop()?.split("?")[0]??"jpg";t.push({filename:`product-${r}.${s}`,content:i,cid:o}),a.set(e.imageUrl,`cid:${o}`)})),{attachments:t,cidMap:a}}function b(){return`<div style="height:1px;background:${f};margin:24px 0"></div>`}function R(e,t,a=g,r=E){return`<a href="${t}" style="display:inline-block;background:${a};color:${r};font-weight:800;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:14px;letter-spacing:0.02em">${e}</a>`}async function O(e){var a;let r=(a=e.to,`https://gadgets.bevanssons.store/unsubscribe?e=${encodeURIComponent(d(a))}&t=${(0,t.createHmac)("sha256",function(){let e=process.env.ADMIN_SECRET;if(!e)throw Error("ADMIN_SECRET is required to sign unsubscribe links");return e}()).update("unsubscribe:"+d(a)).digest("hex").slice(0,40)}`),i=e.ctaUrl&&e.trackingId?`${U}/api/track/email?id=${e.trackingId}&e=click&url=${encodeURIComponent(e.ctaUrl)}`:e.ctaUrl,o=e.ctaText&&i?`<div style="text-align:center;margin:28px 0">${R(e.ctaText,i)}</div>`:"",s=e.trackingId?`<img src="${U}/api/track/email?id=${e.trackingId}&e=open" width="1" height="1" style="display:none;width:1px;height:1px;border:0" alt="" />`:"",n="",c=[];if(e.orderItems?.length){let{attachments:t,cidMap:a}=await S(e.orderItems.map(e=>({name:e.name,imageUrl:e.imageUrl})));c=t;let r=e.orderItems.map(e=>{let t=e.imageUrl?a.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:U+e.imageUrl):null,r=t?`<img src="${t}" alt="${e.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${f}" />`:`<div style="width:64px;height:64px;background:${L};border:1px solid ${f};border-radius:10px"></div>`,i=e.id?`${U}/shop/${e.id}`:`${U}/shop`;return`
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${f};width:76px;vertical-align:middle">
          <a href="${i}">${r}</a>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid ${f};vertical-align:middle">
          <a href="${i}" style="text-decoration:none">
            <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${e.name}</p>
            <p style="margin:0;color:${N};font-size:12px">Qty: ${e.qty}</p>
          </a>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${f};text-align:right;vertical-align:middle">
          <span style="color:${g};font-size:13px;font-weight:700">${e.price}</span>
        </td>
      </tr>`}).join(""),i=e.orderRef?`<p style="margin:0 0 14px;color:${N};font-size:12px">Order ref: <span style="color:${g};font-weight:700;font-family:monospace">${e.orderRef}</span></p>`:"",o=e.restoreCartUrl?`<div style="text-align:center;margin-top:20px">${R("Complete Your Order →",e.restoreCartUrl)}</div>`:"";n=`
      ${b()}
      <p style="margin:0 0 4px;color:#e5e7eb;font-size:14px;font-weight:700">Your last order</p>
      ${i}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${r}
      </table>
      ${o}`}else if(e.featuredProducts?.length){let{attachments:t,cidMap:a}=await S(e.featuredProducts.map(e=>({name:e.name,imageUrl:e.imageUrl})));c=t;let r=e.featuredProducts.map(e=>{let t=e.imageUrl?a.get(e.imageUrl)??(e.imageUrl.startsWith("http")?e.imageUrl:U+e.imageUrl):null,r=t?`<img src="${t}" alt="${e.name}" width="200" style="width:100%;max-width:200px;height:140px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${f}" />`:`<div style="width:100%;height:140px;background:${L};border:1px solid ${f};border-radius:10px"></div>`;return`
        <td style="width:48%;vertical-align:top;padding:6px">
          <a href="${U}/shop/${e.id}" style="text-decoration:none;display:block">
            ${r}
            <p style="margin:10px 0 4px;color:#e5e7eb;font-size:13px;font-weight:600;line-height:1.3">${e.name}</p>
            <p style="margin:0;color:${g};font-size:14px;font-weight:800">${e.price}</p>
          </a>
        </td>`}),i=[];for(let e=0;e<r.length;e+=2)i.push(`<tr>${r.slice(e,e+2).join("")}</tr>`);n=`
      ${b()}
      <p style="margin:0 0 16px;color:#e5e7eb;font-size:14px;font-weight:700">Featured Products</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${i.join("")}
      </table>`}let l=`
    <h1 style="margin:0 0 20px;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em">${e.heading}</h1>
    <div style="color:#d1d5db;font-size:14px;line-height:1.75;white-space:pre-wrap">${e.body}</div>
    ${o}
    ${n}
    ${b()}
    <p style="margin:0;color:${N};font-size:12px;text-align:center">
      You are receiving this because you shared your email address with Bevanssons or placed an order.<br>
      <a href="${r}" style="color:${N};text-decoration:underline">Unsubscribe</a> from marketing and follow-up emails.
    </p>
    ${s}
  `;await A({to:e.to,subject:e.subject,html:function(e,t=""){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bevanssons</title>
</head>
<body style="margin:0;padding:0;background:${E};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${E};padding:28px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid ${f}">

        <!-- Gold shimmer top bar -->
        <tr><td style="background:linear-gradient(90deg,${E},${g},${h},${g},${E});height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
          <td style="background:${E};padding:24px 36px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="cid:${u}" alt="Bevanssons" height="44" style="height:44px;width:auto;display:block;border:0" />
                </td>
                <td align="right">
                  <a href="${U}" style="color:${N};font-size:12px;text-decoration:none">gadgets.bevanssons.store</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${t}

        <!-- Body -->
        <tr>
          <td style="background:#1D1D1D;padding:36px 36px 32px;border-top:1px solid ${f}">
            ${e}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${E};padding:24px 36px;border-top:1px solid ${f}">
            <p style="margin:0 0 8px;color:${N};font-size:12px;text-align:center">
              Questions? &nbsp;
              <a href="mailto:support@bevanssons.store" style="color:${g};text-decoration:none;font-weight:600">support@bevanssons.store</a>
              &nbsp;\xb7&nbsp;
              <a href="${U}" style="color:${g};text-decoration:none;font-weight:600">gadgets.bevanssons.store</a>
            </p>
            <p style="margin:0;color:#333;font-size:11px;text-align:center">
              \xa9 ${new Date().getFullYear()} Bevanssons \xb7 All rights reserved.
            </p>
          </td>
        </tr>

        <!-- Bottom gold bar -->
        <tr><td style="background:linear-gradient(90deg,${E},${g},${h},${g},${E});height:2px;font-size:0;line-height:0">&nbsp;</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`}(l),attachments:c.length?c:void 0,headers:{"List-Unsubscribe":`<${r}>`,"List-Unsubscribe-Post":"List-Unsubscribe=One-Click"}})}let w="https://gadgets.bevanssons.store";function X(e,t,a,r){if(r)return!!e.prepare("SELECT id FROM email_sends WHERE LOWER(email) = ? AND type = ? AND ref = ?").get(t.toLowerCase(),a,r);let i=new Date(Date.now()-3024e6).toISOString();return!!e.prepare("SELECT id FROM email_sends WHERE LOWER(email) = ? AND type = ? AND createdAt > ?").get(t.toLowerCase(),a,i)}function I(e,t){e.prepare(`
    INSERT OR IGNORE INTO email_sends (id, email, type, ref, subject, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(t.id,t.email.toLowerCase(),t.type,t.ref??null,t.subject,new Date().toISOString())}async function D(){let e=l(),a=0,r=0;for(let i of e.prepare(`
    WITH cart_summary AS (
      SELECT v.email, v.name, MAX(ce.createdAt) AS lastAdded
      FROM cart_events ce
      JOIN visitors v ON v.id = ce.visitorId
      WHERE v.email IS NOT NULL
        AND TRIM(v.email) != ''
        AND ce.createdAt < datetime('now', '-24 hours')
        AND ce.createdAt > datetime('now', '-72 hours')
      GROUP BY LOWER(v.email)
    )
    SELECT email, name, lastAdded
    FROM cart_summary cs
    WHERE NOT EXISTS (
      SELECT 1 FROM orders o
      WHERE LOWER(o.email) = LOWER(cs.email)
        AND o.createdAt > cs.lastAdded
    )
  `).all()){let o=i.lastAdded.slice(0,10);if(T(i.email)||X(e,i.email,"cart_abandon_1d",o)){r++;continue}let s=e.prepare(`
      SELECT DISTINCT ce.productId AS id, ce.productName AS name, ce.price, 1 AS qty
      FROM cart_events ce
      JOIN visitors v ON v.id = ce.visitorId
      WHERE LOWER(v.email) = ?
      ORDER BY ce.createdAt DESC
      LIMIT 6
    `).all(i.email.toLowerCase()),n=(0,t.randomUUID)(),c=(i.name??"there").split(" ")[0],l=`${c}, you left something behind — Bevanssons`,p=Buffer.from(JSON.stringify(s)).toString("base64"),d=`${w}/restore-cart?items=${p}`;try{await O({to:i.email,name:i.name??"there",subject:l,heading:"Your cart is waiting for you",body:`Hi ${c},

You browsed some great products but didn't complete your order. Your items are still available — grab them before they sell out!`,ctaText:"Complete Your Order",ctaUrl:d,orderItems:s,restoreCartUrl:d,trackingId:n}),I(e,{id:n,email:i.email,type:"cart_abandon_1d",ref:o,subject:l}),a++}catch(e){console.error("[followups] cart_abandon_1d error:",e)}}for(let i of e.prepare(`
    SELECT id, ref, email, name FROM orders
    WHERE status = 'delivered'
      AND updatedAt < datetime('now', '-3 days')
      AND updatedAt > datetime('now', '-14 days')
  `).all()){if(T(i.email)||X(e,i.email,"delivery_followup",i.ref)){r++;continue}let o=(0,t.randomUUID)(),s=i.name.split(" ")[0],n=`How was your order, ${s}? — Bevanssons`;try{await O({to:i.email,name:i.name,subject:n,heading:"How was your experience?",body:`Hi ${s},

Your order ${i.ref} was delivered recently and we hope you're loving it! 🎉

We'd love to hear your feedback — it takes less than a minute and helps us serve you better.`,ctaText:"Leave a Review",ctaUrl:`${w}/reviews`,trackingId:o}),I(e,{id:o,email:i.email,type:"delivery_followup",ref:i.ref,subject:n}),a++}catch(e){console.error("[followups] delivery_followup error:",e)}}for(let i of e.prepare(`
    SELECT email, name, MAX(createdAt) AS lastOrder
    FROM orders
    WHERE status IN ('approved', 'shipped', 'delivered')
    GROUP BY LOWER(email)
    HAVING lastOrder < datetime('now', '-30 days')
      AND lastOrder > datetime('now', '-60 days')
  `).all()){if(T(i.email)||X(e,i.email,"reengagement_30d")){r++;continue}let o=(0,t.randomUUID)(),s=i.name.split(" ")[0],n=`We miss you, ${s}! — Bevanssons`;try{await O({to:i.email,name:i.name,subject:n,heading:`We miss you, ${s}!`,body:`Hi ${s},

It's been a while since your last order and we wanted to check in.

We have amazing new arrivals and deals that we think you'll love. Come back and see what's new!`,ctaText:"Shop New Arrivals",ctaUrl:`${w}/new-arrivals`,trackingId:o}),I(e,{id:o,email:i.email,type:"reengagement_30d",subject:n}),a++}catch(e){console.error("[followups] reengagement_30d error:",e)}}return console.log(`[followups] sent=${a} skipped=${r}`),{sent:a,skipped:r}}e.s(["runFollowUps",0,D],94689)}];

//# sourceMappingURL=lib_followups_ts_1u3wnoc._.js.map