-- Insert all remaining landing page sections for CMS

-- Statistics Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'statistics',
  'statistics',
  6,
  '{
    "title": "সংখ্যায় আমাদের সাফল্য",
    "subtitle": "বাংলাদেশের ফার্মেসি মালিকরা প্রতিদিন MedFlowx দিয়ে তাদের ব্যবসা পরিচালনা করছেন",
    "items": [
      {"icon": "Store", "value": "৫০০+", "label": "ফার্মেসি", "description": "সারা বাংলাদেশে", "color": "primary"},
      {"icon": "Package", "value": "১ লাখ+", "label": "ওষুধ ট্র্যাক", "description": "প্রতিদিন", "color": "secondary"},
      {"icon": "TrendingUp", "value": "৫ কোটি+", "label": "টাকার বিক্রয়", "description": "প্রতি মাসে রেকর্ড", "color": "success"},
      {"icon": "Users", "value": "১,২০০+", "label": "একটিভ ইউজার", "description": "প্রতিদিন", "color": "primary"}
    ],
    "cta_text": "আপনিও এই পরিবারের অংশ হতে পারেন —",
    "cta_link_text": "আজই শুরু করুন",
    "cta_link": "/signup"
  }'::jsonb
);

-- Why Choose Us Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'why_choose_us',
  'why_choose_us',
  7,
  '{
    "title": "কেন MedFlowx বেছে নেবেন?",
    "subtitle": "আমরা জানি আপনার সমস্যা কী — এবং আমাদের কাছে আছে সমাধান",
    "items": [
      {
        "problem": "খাতায় হিসাব রাখতে গিয়ে ভুল হয়ে যায়",
        "solution": "অটোমেটিক হিসাব রাখুন — কোনো ভুল নেই",
        "icon": "Calculator"
      },
      {
        "problem": "এক্সপায়ারি ওষুধ চোখে পড়ে না",
        "solution": "এক্সপায়ারি এলার্ট পান আগেই",
        "icon": "AlertTriangle"
      },
      {
        "problem": "কাস্টমার বাকি মনে রাখা কঠিন",
        "solution": "সব বাকি এক জায়গায় দেখুন",
        "icon": "Users"
      },
      {
        "problem": "দিনশেষে হিসাব মেলাতে সমস্যা",
        "solution": "ডেইলি সামারি রিপোর্ট পান",
        "icon": "FileText"
      }
    ]
  }'::jsonb
);

-- Testimonials Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'testimonials',
  'testimonials',
  8,
  '{
    "title": "আমাদের গ্রাহকদের মতামত",
    "subtitle": "বাংলাদেশের হাজারো ফার্মেসি মালিক আমাদের উপর ভরসা রাখেন",
    "items": [
      {
        "name": "মোঃ আবদুল করিম",
        "role": "মালিক",
        "location": "করিম মেডিসিন স্টোর, ঢাকা",
        "rating": 5,
        "text": "MedFlowx ব্যবহারের পর থেকে আমার এক্সপায়ারি লস প্রায় ৮০% কমে গেছে। এখন আগে থেকেই এলার্ট পাই, সময়মতো ব্যবস্থা নিতে পারি।"
      },
      {
        "name": "ফাতেমা বেগম",
        "role": "ম্যানেজার",
        "location": "গ্রীন ফার্মেসি, চট্টগ্রাম",
        "rating": 5,
        "text": "আগে সাপ্লায়ার বাকি হিসাব রাখতে অনেক সমস্যা হতো। এখন এক ক্লিকেই সব দেখতে পাই। সময় বাঁচে, ভুলও কমেছে।"
      },
      {
        "name": "হাসান মাহমুদ",
        "role": "মালিক",
        "location": "হেলথ প্লাস ফার্মেসি, রাজশাহী",
        "rating": 5,
        "text": "মোবাইল থেকেই সব কাজ করতে পারি। দোকানে না থাকলেও বিক্রয় ও স্টক মনিটর করা যায়। অসাধারণ সফটওয়্যার!"
      },
      {
        "name": "রহিমা খাতুন",
        "role": "মালিক",
        "location": "সিটি ফার্মা, সিলেট",
        "rating": 5,
        "text": "ট্রায়াল নিয়ে দেখেছিলাম, এখন পুরো টিম ব্যবহার করছে। কাস্টমার সার্ভিসও অনেক ভালো, যেকোনো সমস্যায় সাহায্য করে।"
      }
    ],
    "trust_badge_text": "৫০০+ ফার্মেসির বিশ্বস্ত সফটওয়্যার"
  }'::jsonb
);

-- How It Works Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'how_it_works',
  'how_it_works',
  9,
  '{
    "title": "মাত্র ৩টি ধাপে শুরু করুন",
    "subtitle": "কোনো টেকনিক্যাল জ্ঞান ছাড়াই আজই শুরু করুন",
    "steps": [
      {
        "number": "১",
        "icon": "UserPlus",
        "title": "ফ্রি একাউন্ট খুলুন",
        "description": "মাত্র ২ মিনিটে রেজিস্ট্রেশন করুন। কোনো ক্রেডিট কার্ড লাগবে না।"
      },
      {
        "number": "২",
        "icon": "Package",
        "title": "ওষুধ যোগ করুন",
        "description": "আপনার স্টকের ওষুধ যোগ করুন। CSV আপলোড করে বাল্ক ইমপোর্টও করতে পারবেন।"
      },
      {
        "number": "৩",
        "icon": "TrendingUp",
        "title": "ব্যবসা পরিচালনা করুন",
        "description": "বিক্রয়, স্টক, বাকি হিসাব — সবকিছু এক জায়গা থেকে পরিচালনা করুন।"
      }
    ]
  }'::jsonb
);

-- Special Features Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'special_features',
  'special_features',
  10,
  '{
    "title": "বিশেষ ফিচারসমূহ",
    "subtitle": "যা আপনার ব্যবসাকে আরও সহজ করবে",
    "items": [
      {
        "icon": "Zap",
        "title": "দ্রুত বিক্রয় এন্ট্রি",
        "description": "শুধু ওষুধের নাম টাইপ করুন, বাকি সব অটোমেটিক",
        "color": "primary"
      },
      {
        "icon": "Bell",
        "title": "স্মার্ট নোটিফিকেশন",
        "description": "এক্সপায়ারি, লো স্টক, পেমেন্ট রিমাইন্ডার",
        "color": "secondary"
      },
      {
        "icon": "Shield",
        "title": "ডাটা সিকিউরিটি",
        "description": "ব্যাংক-গ্রেড সিকিউরিটি দিয়ে আপনার ডাটা সুরক্ষিত",
        "color": "success"
      },
      {
        "icon": "Smartphone",
        "title": "মোবাইল ফ্রেন্ডলি",
        "description": "যেকোনো ডিভাইস থেকে ব্যবহার করুন",
        "color": "primary"
      }
    ]
  }'::jsonb
);

-- Mobile App Coming Soon Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'mobile_app',
  'mobile_app',
  11,
  '{
    "title": "মোবাইল অ্যাপ শীঘ্রই আসছে!",
    "subtitle": "আপনার হাতের মুঠোয় পুরো ফার্মেসি",
    "features": [
      "অফলাইন মোডে কাজ করুন",
      "বারকোড স্ক্যানার",
      "পুশ নোটিফিকেশন",
      "ভয়েস সার্চ"
    ],
    "cta_text": "নোটিফাই করুন",
    "badge_text": "শীঘ্রই আসছে"
  }'::jsonb
);

-- CTA Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'cta',
  'cta',
  12,
  '{
    "title": "আজই আপনার ফার্মেসি ব্যবসা ডিজিটাল করুন",
    "subtitle": "হাজারো ফার্মেসি মালিক ইতিমধ্যে MedFlowx ব্যবহার করছেন। আপনিও শুরু করুন আজই।",
    "cta_primary": {"text": "ফ্রি ট্রায়াল শুরু করুন", "link": "/signup"},
    "cta_secondary": {"text": "যোগাযোগ করুন", "link": "#contact"},
    "trust_items": ["ক্রেডিট কার্ড লাগবে না", "৭ দিন ফ্রি", "যেকোনো সময় বাতিল করুন"]
  }'::jsonb
);

-- Footer Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'footer',
  'footer',
  13,
  '{
    "brand": {
      "name": "MedFlowx",
      "description": "বাংলাদেশের সেরা ফার্মেসি ম্যানেজমেন্ট সফটওয়্যার। আপনার ব্যবসাকে ডিজিটাল করুন।"
    },
    "contact": {
      "email": "support@medflowx.com",
      "phone": "+880 1XXX-XXXXXX",
      "address": "ঢাকা, বাংলাদেশ"
    },
    "links": {
      "product": [
        {"text": "ফিচারসমূহ", "link": "#features"},
        {"text": "প্রাইসিং", "link": "#pricing"},
        {"text": "FAQ", "link": "#faq"}
      ],
      "company": [
        {"text": "আমাদের সম্পর্কে", "link": "/about"},
        {"text": "ব্লগ", "link": "/blog"},
        {"text": "ক্যারিয়ার", "link": "/careers"}
      ],
      "legal": [
        {"text": "প্রাইভেসি পলিসি", "link": "/privacy"},
        {"text": "টার্মস অফ সার্ভিস", "link": "/terms"},
        {"text": "রিফান্ড পলিসি", "link": "/refund"}
      ]
    },
    "social": {
      "facebook": "https://facebook.com/medflowx",
      "whatsapp": "https://wa.me/8801XXXXXXXXX"
    },
    "copyright": "© {year} MedFlowx. সর্বস্বত্ব সংরক্ষিত।"
  }'::jsonb
);

-- Manufacturers Marquee Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'manufacturers',
  'manufacturers',
  14,
  '{
    "title": "বাংলাদেশের শীর্ষ ওষুধ কোম্পানির পার্টনার",
    "subtitle": "আমরা সকল প্রধান ম্যানুফ্যাকচারারের ওষুধ সাপোর্ট করি",
    "show_marquee": true
  }'::jsonb
);

-- Navbar Section
INSERT INTO public.cms_sections (page_id, section_type, section_key, sort_order, content)
VALUES (
  'f98aac3a-718c-4b60-a2ec-6eb1c5646b37',
  'navbar',
  'navbar',
  0,
  '{
    "logo_text": "MedFlowx",
    "menu_items": [
      {"text": "ফিচারসমূহ", "link": "#features"},
      {"text": "কিভাবে কাজ করে", "link": "#how-it-works"},
      {"text": "প্রাইসিং", "link": "#pricing"},
      {"text": "FAQ", "link": "#faq"},
      {"text": "যোগাযোগ", "link": "#contact"}
    ],
    "cta": {"text": "ফ্রি ট্রায়াল", "link": "/signup"},
    "login": {"text": "লগইন", "link": "/login"}
  }'::jsonb
);