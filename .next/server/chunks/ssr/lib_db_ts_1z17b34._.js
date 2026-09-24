module.exports=[66879,a=>{"use strict";var b=a.i(85148),c=a.i(14747),d=a.i(22734);let e=process.env.DATA_DIR??c.default.join(process.cwd(),"data"),f=c.default.join(e,"daisy.db"),g=[c.default.join(e,"products-backup.json"),c.default.join(process.cwd(),"data","products.json")],h=null;a.s(["getDb",0,function a(){return h||((0,d.existsSync)(e)||(0,d.mkdirSync)(e,{recursive:!0}),(h=new b.default(f)).pragma("journal_mode = WAL"),h.pragma("foreign_keys = ON"),function(a){a.exec(`
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
      quantity         INTEGER NOT NULL DEFAULT 1,
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
  `);try{a.exec("ALTER TABLE orders ADD COLUMN bank_id TEXT")}catch{}try{a.exec("ALTER TABLE orders ADD COLUMN tracking_number TEXT")}catch{}try{a.exec("ALTER TABLE installment_applications ADD COLUMN product_imageUrl TEXT")}catch{}try{a.exec("ALTER TABLE installment_applications ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1")}catch{}}(h),function(a){try{a.exec("ALTER TABLE products ADD COLUMN originalPrice TEXT NOT NULL DEFAULT ''")}catch{}}(h),function(a){if(!a.prepare("SELECT name FROM migrations WHERE name = ?").get("json_import_gadgets_v1")){for(let b of g)if((0,d.existsSync)(b))try{let c=JSON.parse((0,d.readFileSync)(b,"utf-8"));if(Array.isArray(c)&&c.length>0){a.prepare("DELETE FROM products").run();let b=a.prepare(`
          INSERT OR REPLACE INTO products
            (id, name, price, category, description, imageUrl, inStock, featured, createdAt, updatedAt)
          VALUES
            (@id, @name, @price, @category, @description, @imageUrl, @inStock, @featured, @createdAt, @updatedAt)
        `);a.transaction(a=>{for(let c of a)b.run({...c,inStock:+!!c.inStock,featured:+!!c.featured})})(c);break}}catch{}a.prepare("INSERT OR IGNORE INTO migrations (name) VALUES (?)").run("json_import_gadgets_v1")}}(h),function(a){if(a.prepare("SELECT name FROM migrations WHERE name = ?").get("seed_products_v1"))return;if(a.prepare("SELECT COUNT(*) as c FROM products").get().c>0)return a.prepare("INSERT OR IGNORE INTO migrations (name) VALUES (?)").run("seed_products_v1");let b=new Date().toISOString(),c=a.prepare(`
    INSERT OR IGNORE INTO products (id, name, price, category, description, imageUrl, inStock, featured, createdAt, updatedAt)
    VALUES (@id, @name, @price, @category, @description, @imageUrl, @inStock, @featured, @createdAt, @updatedAt)
  `);a.transaction(a=>{for(let d of a)c.run({...d,createdAt:b,updatedAt:b})})([{id:"sm-001",name:"iPhone 15 Pro Max 256GB",price:"R22,999",category:"Smartphones",featured:1,inStock:1,description:"Titanium design, A17 Pro chip, 48MP camera system, USB-C, Action button. Available in Natural, Black, White & Blue Titanium.",imageUrl:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop"},{id:"sm-002",name:"iPhone 15 128GB",price:"R16,999",category:"Smartphones",featured:1,inStock:1,description:"Dynamic Island, 48MP main camera, USB-C, A16 Bionic chip. Available in Pink, Yellow, Green, Blue & Black.",imageUrl:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"},{id:"sm-003",name:"Samsung Galaxy S24 Ultra 256GB",price:"R19,999",category:"Smartphones",featured:1,inStock:1,description:'Built-in S Pen, 200MP camera, Snapdragon 8 Gen 3, 6.8" QHD+ display, 5000mAh battery.',imageUrl:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop"},{id:"sm-004",name:"Samsung Galaxy A54 5G 128GB",price:"R7,499",category:"Smartphones",featured:0,inStock:1,description:"50MP OIS camera, 5000mAh battery, Super AMOLED display, IP67 water resistant.",imageUrl:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop"},{id:"sm-005",name:"Samsung Galaxy S23 FE 256GB",price:"R9,999",category:"Smartphones",featured:0,inStock:1,description:"50MP triple camera, Snapdragon 8 Gen 1, 4500mAh, AMOLED 120Hz display.",imageUrl:"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&h=600&fit=crop"},{id:"tv-001",name:'Samsung 65" QLED 4K Smart TV',price:"R14,999",category:"TVs",featured:1,inStock:1,description:"Quantum Dot technology, Tizen OS, 120Hz, HDR10+, Dolby Atmos, 4 HDMI ports.",imageUrl:"https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&h=600&fit=crop"},{id:"tv-002",name:'Hisense 55" 4K UHD Smart TV',price:"R6,999",category:"TVs",featured:0,inStock:1,description:"4K UHD, VIDAA Smart OS, Dolby Vision, DTS Virtual:X, HDR10, 3 HDMI.",imageUrl:"https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&h=600&fit=crop"},{id:"tv-003",name:'LG 75" OLED C3 4K Smart TV',price:"R34,999",category:"TVs",featured:1,inStock:1,description:"Evo OLED panel, α9 Gen6 AI processor, Dolby Vision IQ, Dolby Atmos, Game Mode Pro, webOS 23.",imageUrl:"https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=600&fit=crop"},{id:"tv-004",name:'Samsung 43" Crystal UHD Smart TV',price:"R5,499",category:"TVs",featured:0,inStock:1,description:"Crystal Processor 4K, PurColor, HDR, Tizen OS, Built-in Wi-Fi.",imageUrl:"https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&h=600&fit=crop"},{id:"gc-001",name:"PlayStation 5 Console",price:"R12,999",category:"Gaming Consoles",featured:1,inStock:1,description:"825GB SSD, 4K gaming, 120fps, DualSense controller, 3D Audio, Ultra HD Blu-ray.",imageUrl:"https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=600&fit=crop"},{id:"gc-002",name:"PlayStation 5 Slim",price:"R10,999",category:"Gaming Consoles",featured:0,inStock:1,description:"Slimmer, lighter PS5 with 1TB SSD, detachable disc drive, DualSense controller.",imageUrl:"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop"},{id:"gc-003",name:"Xbox Series X 1TB",price:"R11,999",category:"Gaming Consoles",featured:0,inStock:1,description:"1TB NVMe SSD, 4K 120fps, Quick Resume, Ray Tracing, Xbox Game Pass ready.",imageUrl:"https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=600&h=600&fit=crop"},{id:"gc-004",name:"Nintendo Switch OLED",price:"R6,499",category:"Gaming Consoles",featured:0,inStock:1,description:'7" OLED screen, 64GB storage, enhanced audio, wide adjustable stand, dock with LAN port.',imageUrl:"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=600&fit=crop"},{id:"gp-001",name:"RTX 4070 Gaming PC Bundle",price:"R22,999",category:"Gaming PCs",featured:1,inStock:1,description:"Intel Core i7-13700K, RTX 4070 12GB, 32GB DDR5 RAM, 1TB NVMe SSD, 240mm AIO cooler.",imageUrl:"https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop"},{id:"gp-002",name:"AMD Ryzen 9 Gaming Rig",price:"R28,999",category:"Gaming PCs",featured:1,inStock:1,description:"Ryzen 9 7900X, RX 7900 XT 20GB, 32GB DDR5, 2TB NVMe SSD, Full-tower RGB case.",imageUrl:"https://images.unsplash.com/photo-1593640408182-31c228cba4fc?w=600&h=600&fit=crop"},{id:"gp-003",name:"Intel i5 Starter Gaming PC",price:"R13,999",category:"Gaming PCs",featured:0,inStock:1,description:"Intel Core i5-12400F, RTX 3060 12GB, 16GB DDR4, 512GB SSD. Perfect entry-level gaming rig.",imageUrl:"https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&h=600&fit=crop"},{id:"lb-001",name:'MacBook Pro M3 14"',price:"R32,999",category:"Laptops & MacBooks",featured:1,inStock:1,description:"Apple M3 chip, 8GB RAM, 512GB SSD, Liquid Retina display, 22-hour battery, MagSafe 3.",imageUrl:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"},{id:"lb-002",name:'MacBook Air M2 13"',price:"R22,999",category:"Laptops & MacBooks",featured:1,inStock:1,description:"Apple M2 chip, 8GB RAM, 256GB SSD, Liquid Retina display, 18-hour battery, fanless design.",imageUrl:"https://images.unsplash.com/photo-1611186871525-4767a56e0f54?w=600&h=600&fit=crop"},{id:"lb-003",name:"Dell XPS 15 Intel i7",price:"R23,999",category:"Laptops & MacBooks",featured:0,inStock:1,description:'Intel Core i7-13700H, 16GB DDR5, 512GB SSD, RTX 4050, 15.6" OLED 3.5K display.',imageUrl:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop"},{id:"lb-004",name:'HP Pavilion Gaming 15" Laptop',price:"R14,499",category:"Laptops & MacBooks",featured:0,inStock:1,description:"AMD Ryzen 7 7745H, RTX 4060 8GB, 16GB DDR5, 512GB SSD, 144Hz FHD display.",imageUrl:"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop"},{id:"lb-005",name:"Lenovo ThinkPad X1 Carbon",price:"R19,999",category:"Laptops & MacBooks",featured:0,inStock:1,description:'Intel Core i7-1365U, 16GB LPDDR5, 512GB SSD, 14" IPS 2.8K OLED, 57Wh battery.',imageUrl:"https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop"},{id:"tw-001",name:'iPad Pro M2 12.9" 256GB',price:"R21,999",category:"Tablets & Watches",featured:1,inStock:1,description:"Apple M2 chip, Liquid Retina XDR display, Wi-Fi 6E, 12MP + 10MP cameras, Face ID.",imageUrl:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"},{id:"tw-002",name:"Apple Watch Series 9 45mm",price:"R8,999",category:"Tablets & Watches",featured:0,inStock:1,description:"S9 SiP chip, Double Tap gesture, Always-On Retina display, crash detection, GPS.",imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"},{id:"tw-003",name:"Samsung Galaxy Tab S9 256GB",price:"R13,499",category:"Tablets & Watches",featured:0,inStock:1,description:'Snapdragon 8 Gen 2, 11" Dynamic AMOLED 2X, S Pen included, IP68, 8400mAh.',imageUrl:"https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop"},{id:"tw-004",name:"Apple Watch Ultra 2 49mm",price:"R13,999",category:"Tablets & Watches",featured:0,inStock:1,description:"Titanium case, 3000 nits display, dual-frequency GPS, 60-hour battery, Action button.",imageUrl:"https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop"},{id:"ha-001",name:"Samsung 15kg Top Loader Washing Machine",price:"R7,499",category:"Home Appliances",featured:1,inStock:1,description:"Digital Inverter Motor, Eco Tub Clean, child lock, 15 wash programs, 5-year motor warranty.",imageUrl:"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=600&fit=crop"},{id:"ha-002",name:"LG 600L Double Door Fridge",price:"R12,999",category:"Home Appliances",featured:1,inStock:1,description:"Linear Inverter Compressor, Door-in-Door, Multi Air Flow, Smart Diagnosis, A++ energy rating.",imageUrl:"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=600&fit=crop"},{id:"ha-003",name:"Hisense 7kg Front Loader Washer",price:"R5,499",category:"Home Appliances",featured:0,inStock:1,description:"Inverter motor, 1200 RPM spin, 15 wash programs, anti-vibration design, delay start.",imageUrl:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"},{id:"ha-004",name:"Bosch 60cm Built-In Dishwasher",price:"R8,999",category:"Home Appliances",featured:0,inStock:1,description:"14 place settings, EcoSilence motor, 6 programs, AutoDry, A++ energy class.",imageUrl:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"},{id:"ka-001",name:"De'Longhi Magnifica Evo Espresso Machine",price:"R5,999",category:"Kitchen Appliances",featured:1,inStock:1,description:"Bean-to-cup, 15-bar pressure, LatteCrema System, 250g bean hopper, My Menu display.",imageUrl:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop"},{id:"ka-002",name:"Samsung 28L Convection Microwave",price:"R2,999",category:"Kitchen Appliances",featured:0,inStock:1,description:"900W, Slim Fry technology, Ceramic enamel interior, 28L capacity, slim design.",imageUrl:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop"},{id:"ka-003",name:"Smeg Retro Kettle + Toaster Set",price:"R2,499",category:"Kitchen Appliances",featured:0,inStock:1,description:"1.7L stainless steel kettle, 2-slice toaster, iconic retro design. Available in multiple colours.",imageUrl:"https://images.unsplash.com/photo-1525904097878-94fb15835963?w=600&h=600&fit=crop"},{id:"ka-004",name:"Nutribullet Pro 900W",price:"R1,299",category:"Kitchen Appliances",featured:0,inStock:1,description:"900W motor, 2x 900ml cups, stainless steel blades, BPA-free, dishwasher-safe cups.",imageUrl:"https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&h=600&fit=crop"},{id:"sp-001",name:"5kVA Inverter + 200Ah Lithium Battery Bundle",price:"R18,999",category:"Solar & Power Solutions",featured:1,inStock:1,description:"Pure sine wave inverter, 200Ah LiFePO4 battery, WiFi monitoring, 4000W load capacity. Ideal for load shedding.",imageUrl:"https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=600&fit=crop"},{id:"sp-002",name:"10kVA Solar System (8 Panels + Inverter)",price:"R49,999",category:"Solar & Power Solutions",featured:1,inStock:1,description:"8x 550W solar panels, 10kVA hybrid inverter, 2x 200Ah lithium batteries. Full installation package available.",imageUrl:"https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=600&fit=crop"},{id:"sp-003",name:"3kVA Load Shedding Inverter Kit",price:"R9,999",category:"Solar & Power Solutions",featured:0,inStock:1,description:"3kVA pure sine wave inverter + 100Ah AGM battery. Powers lights, TV, DSTV, router & small appliances.",imageUrl:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=600&fit=crop"},{id:"sp-004",name:"200W Portable Folding Solar Panel",price:"R2,999",category:"Solar & Power Solutions",featured:0,inStock:1,description:"Monocrystalline cells, 200W peak output, USB-A/USB-C, MC4 connector, IP67 waterproof.",imageUrl:"https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&h=600&fit=crop"},{id:"er-001",name:"Kids Mercedes AMG Electric Ride-On 24V",price:"R5,999",category:"Electric Ride-On Cars",featured:1,inStock:1,description:"Licensed Mercedes AMG, 24V dual motor, leather seat, rubber tyres, parental remote control, MP3/Bluetooth.",imageUrl:"https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&h=600&fit=crop"},{id:"er-002",name:"BMW X5 Electric Ride-On 12V",price:"R3,999",category:"Electric Ride-On Cars",featured:0,inStock:1,description:"Licensed BMW X5, 12V battery, 2 speeds, LED lights, music player, remote control.",imageUrl:"https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=600&h=600&fit=crop"},{id:"er-003",name:"Lamborghini Electric Kids Car 12V",price:"R4,499",category:"Electric Ride-On Cars",featured:0,inStock:1,description:"Licensed Lamborghini, 12V motor, doors open, horn, LED headlights, remote control, up to 5km/h.",imageUrl:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=600&fit=crop"},{id:"fu-001",name:"L-Shape Corner Sofa Set",price:"R8,999",category:"Furniture",featured:1,inStock:1,description:"Premium fabric upholstery, solid wood frame, reversible chaise lounge. Seats 5–6 people. Multiple colours.",imageUrl:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop"},{id:"fu-002",name:"King Size Bed Frame + Headboard",price:"R5,999",category:"Furniture",featured:0,inStock:1,description:"Solid wood slat base, padded headboard, centre support legs. Fits standard 183x200cm mattress.",imageUrl:"https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&h=600&fit=crop"},{id:"fu-003",name:"Electric Height-Adjustable Standing Desk",price:"R6,499",category:"Furniture",featured:0,inStock:1,description:"Dual motor electric lift, 140x70cm desktop, 4 memory presets, cable management, 80kg capacity.",imageUrl:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop"},{id:"fu-004",name:"Recliner Lounge Chair",price:"R4,499",category:"Furniture",featured:0,inStock:1,description:"PU leather, 360° swivel, 135° recline, padded armrests. Available in Black, Brown & Grey.",imageUrl:"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop"},{id:"oe-001",name:"HP Color LaserJet Pro MFP",price:"R5,499",category:"Office Equipment",featured:0,inStock:1,description:"Print, scan, copy & fax. 22ppm colour, Wi-Fi + LAN, auto duplex, 250-sheet tray.",imageUrl:"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=600&fit=crop"},{id:"oe-002",name:"Canon PIXMA MegaTank All-in-One",price:"R1,999",category:"Office Equipment",featured:0,inStock:1,description:"Ink tank system (no cartridges), print/scan/copy, Wi-Fi, up to 6,000 black pages per fill.",imageUrl:"https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop"},{id:"oe-003",name:"Ergonomic Mesh Office Chair",price:"R3,499",category:"Office Equipment",featured:0,inStock:1,description:"Lumbar support, adjustable armrests, headrest, seat height & tilt. Max 120kg. 360° casters.",imageUrl:"https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop"}]),a.prepare("INSERT OR IGNORE INTO migrations (name) VALUES (?)").run("seed_products_v1")}(h),function(b){try{let f=(b??a()).prepare("SELECT * FROM products ORDER BY category, name").all();(0,d.existsSync)(e)||(0,d.mkdirSync)(e,{recursive:!0}),(0,d.writeFileSync)(c.default.join(e,"products-backup.json"),JSON.stringify(f,null,2))}catch{}}(h)),h}])}];

//# sourceMappingURL=lib_db_ts_1z17b34._.js.map