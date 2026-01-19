import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Herbal medicines from MedEx (name, generic_name, category, manufacturer)
const MEDEX_HERBAL_MEDICINES = [
  { name: "5HTP", generic_name: "5-Hydroxytryptophan + Valerian extract", category: "Capsule", manufacturer: "Purnava Limited", strength: "100 mg+100 mg" },
  { name: "A-cerumen", generic_name: "Hygiene & Healthcare", category: "Ear Drop", manufacturer: "Purnava Limited", strength: "" },
  { name: "Abolib", generic_name: "Ginkgo Biloba", category: "Capsule", manufacturer: "Veritas Pharmaceuticals Ltd.", strength: "60 mg" },
  { name: "Achless", generic_name: "Habb-e Suranjan", category: "Capsule", manufacturer: "Total Natural Company (Unani)", strength: "" },
  { name: "Acme's Basok", generic_name: "Vasakarista", category: "Syrup", manufacturer: "ACME Laboratories Ltd.", strength: "" },
  { name: "Acme's Chyabanprash", generic_name: "Emblic Myrobalan + Aswagandha + Grape", category: "Semisolid Preparation", manufacturer: "ACME Laboratories Ltd.", strength: "" },
  { name: "Acme's Spirulina", generic_name: "Spirulina", category: "Capsule", manufacturer: "ACME Laboratories Ltd.", strength: "450 mg" },
  { name: "Acmina", generic_name: "Mustakarista", category: "Syrup", manufacturer: "ACME Laboratories Ltd.", strength: "" },
  { name: "Acteria Femina", generic_name: "Probiotic Combination [2.3 Billion]", category: "Capsule (Delayed Release)", manufacturer: "Radiant Pharmaceuticals Ltd.", strength: "2.3 Billion" },
  { name: "Adolef", generic_name: "Vasakarista", category: "Syrup", manufacturer: "Opsonin Herbal & Nutraceuticals Ltd.", strength: "" },
  { name: "Adovas", generic_name: "Vasakarista", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Affrox", generic_name: "Saffron", category: "Capsule", manufacturer: "Radiant Nutraceuticals Ltd.", strength: "30 mg" },
  { name: "Afrodic", generic_name: "Ambar Momiyaee", category: "Tablet", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Agerd", generic_name: "Tabkheer", category: "Capsule", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Aliksir", generic_name: "Nigella Sativa [Black Seed Oil]", category: "Capsule", manufacturer: "Purnava Limited", strength: "500 mg" },
  { name: "Alisa", generic_name: "Garlitab", category: "Tablet", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Aliz", generic_name: "Almond + Coconut + Edible Pine + Salep", category: "Semisolid Preparation", manufacturer: "Green Laboratories (Unani)", strength: "" },
  { name: "Alkalex", generic_name: "Sharbat Santara", category: "Syrup", manufacturer: "Green Laboratories (Unani)", strength: "" },
  { name: "Alkari", generic_name: "Sharbat Buzuri", category: "Syrup", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Alkof", generic_name: "Sharbat Tulsi", category: "Syrup", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Alkuli", generic_name: "Sharbat Buzuri", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Allerfin", generic_name: "Nigella Sativa", category: "Capsule", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Almeva", generic_name: "Aloe Vera", category: "Gel", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Aloe Care", generic_name: "Aloe Vera", category: "Lotion", manufacturer: "Opsonin Herbal & Nutraceuticals Ltd.", strength: "" },
  { name: "Aloecare", generic_name: "Aloe Vera", category: "Gel", manufacturer: "ACI Limited", strength: "" },
  { name: "Aloevera", generic_name: "Aloe Vera", category: "Gel", manufacturer: "Aristopharma Ltd.", strength: "" },
  { name: "Amaryl M", generic_name: "Herbal", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd.", strength: "" },
  { name: "Anabol", generic_name: "Musli", category: "Capsule", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Anshin", generic_name: "Ashwagandha", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Asfar", generic_name: "Saffron", category: "Capsule", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Ashwagandha", generic_name: "Ashwagandha Root Extract", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Ashwaleaf", generic_name: "Ashwagandha", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Aswex", generic_name: "Ashwagandha", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Atifon", generic_name: "Ginseng + Royal Jelly", category: "Capsule", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Aubril", generic_name: "Saw Palmetto", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd.", strength: "" },
  { name: "Avocal", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "Aristopharma Ltd.", strength: "" },
  { name: "Basok", generic_name: "Vasakarista", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Basokof", generic_name: "Vasakarista", category: "Syrup", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Biovit", generic_name: "Multivitamin", category: "Capsule", manufacturer: "Renata Limited", strength: "" },
  { name: "Black Cumin", generic_name: "Nigella Sativa", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Blackseed Plus", generic_name: "Nigella Sativa", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Brainex", generic_name: "Ginkgo Biloba", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd.", strength: "" },
  { name: "Bronex", generic_name: "Honey + Basil", category: "Syrup", manufacturer: "Radiant Nutraceuticals Ltd.", strength: "" },
  { name: "Cardioton", generic_name: "Omega-3 Fatty Acid", category: "Capsule", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Castoil", generic_name: "Castor Oil", category: "Oil", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Chaya", generic_name: "Stevia", category: "Tablet", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Chyabanprash", generic_name: "Chyawanprash", category: "Paste", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Colagen", generic_name: "Collagen", category: "Tablet", manufacturer: "Eskayef Pharmaceuticals Ltd.", strength: "" },
  { name: "Curcumin", generic_name: "Turmeric Extract", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "D-Palm", generic_name: "Saw Palmetto", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "D-Toxin", generic_name: "Herbal Detox", category: "Syrup", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Diabeta", generic_name: "Gymnema Sylvestre", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Diamix", generic_name: "Herbal Antidiabetic", category: "Tablet", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Diar-O", generic_name: "Herbal Antidiarrheal", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Diaton", generic_name: "Fenugreek", category: "Capsule", manufacturer: "Opsonin Herbal & Nutraceuticals Ltd.", strength: "" },
  { name: "Echinacea", generic_name: "Echinacea", category: "Tablet", manufacturer: "Aristopharma Ltd.", strength: "" },
  { name: "Enat", generic_name: "Vitamin E Natural", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Entonil", generic_name: "Peppermint Oil", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Evening Primrose", generic_name: "Evening Primrose Oil", category: "Capsule", manufacturer: "Renata Limited", strength: "" },
  { name: "Fem Care", generic_name: "Shatavari", category: "Capsule", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Femotone", generic_name: "Shatavari + Iron", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Ferulax", generic_name: "Asafoetida", category: "Tablet", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Flaxseed Oil", generic_name: "Flaxseed Oil", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Flora Spirulina", generic_name: "Spirulina", category: "Tablet", manufacturer: "Flora Pharmaceuticals Ltd.", strength: "" },
  { name: "G-Neem", generic_name: "Neem", category: "Capsule", manufacturer: "General Pharmaceuticals Ltd.", strength: "" },
  { name: "Garlex", generic_name: "Garlic", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Garlic Plus", generic_name: "Garlic", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd.", strength: "" },
  { name: "Gastrolex", generic_name: "Herbal Digestive", category: "Syrup", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Giloy", generic_name: "Tinospora Cordifolia", category: "Tablet", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Gingkol", generic_name: "Ginkgo Biloba", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Ginsana", generic_name: "Panax Ginseng", category: "Capsule", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Ginseng Plus", generic_name: "Panax Ginseng", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Glukex", generic_name: "Gymnema Sylvestre", category: "Capsule", manufacturer: "Opsonin Herbal & Nutraceuticals Ltd.", strength: "" },
  { name: "Glycem", generic_name: "Bitter Melon", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Green Coffee", generic_name: "Green Coffee Bean Extract", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Green Tea", generic_name: "Green Tea Extract", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Gynura", generic_name: "Gynura Procumbens", category: "Capsule", manufacturer: "ACI Limited", strength: "" },
  { name: "Hair Care", generic_name: "Biotin + Herbal", category: "Capsule", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Hairgrow", generic_name: "Saw Palmetto + Biotin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Haritaki", generic_name: "Terminalia Chebula", category: "Capsule", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Hepadon", generic_name: "Silymarin", category: "Capsule", manufacturer: "Aristopharma Ltd.", strength: "" },
  { name: "Hepalex", generic_name: "Silymarin", category: "Tablet", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Hepaton", generic_name: "Silymarin + B Vitamins", category: "Syrup", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Herbex", generic_name: "Herbal Laxative", category: "Tablet", manufacturer: "Opsonin Herbal & Nutraceuticals Ltd.", strength: "" },
  { name: "Himalayan Pink Salt", generic_name: "Pink Salt", category: "Powder", manufacturer: "Purnava Limited", strength: "" },
  { name: "Honex", generic_name: "Honey", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Honey Ginger", generic_name: "Honey + Ginger", category: "Syrup", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Hormotone", generic_name: "Shatavari", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Immunoplus", generic_name: "Echinacea + Vitamin C", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Isabgul", generic_name: "Psyllium Husk", category: "Powder", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Jatropha", generic_name: "Jatropha Curcas", category: "Capsule", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Joint Care", generic_name: "Glucosamine + Chondroitin", category: "Tablet", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Kalonji", generic_name: "Nigella Sativa", category: "Oil", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Karela", generic_name: "Bitter Melon", category: "Tablet", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Kasni", generic_name: "Chicory", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Khamira", generic_name: "Khamira Gaozaban", category: "Paste", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Kremil", generic_name: "Herbal Antacid", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Lecithin", generic_name: "Soy Lecithin", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Leptaden", generic_name: "Lactation Enhancer", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Liv Care", generic_name: "Silymarin", category: "Capsule", manufacturer: "Opsonin Herbal & Nutraceuticals Ltd.", strength: "" },
  { name: "Liv-52", generic_name: "Liver Protectant Herbal", category: "Tablet", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Liver Guard", generic_name: "Silymarin", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Liverin", generic_name: "Silymarin + B Vitamins", category: "Capsule", manufacturer: "Eskayef Pharmaceuticals Ltd.", strength: "" },
  { name: "Liverton", generic_name: "Silymarin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd.", strength: "" },
  { name: "Lutein", generic_name: "Lutein + Zeaxanthin", category: "Capsule", manufacturer: "Aristopharma Ltd.", strength: "" },
  { name: "Majun", generic_name: "Majun Dabeed-ul-Ward", category: "Paste", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Memory Plus", generic_name: "Brahmi + Ginkgo", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Mentat", generic_name: "Brahmi + Mandukaparni", category: "Tablet", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Mentho Plus", generic_name: "Menthol + Eucalyptus", category: "Balm", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Methi", generic_name: "Fenugreek", category: "Capsule", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Milk Thistle", generic_name: "Silybum Marianum", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Moringa", generic_name: "Moringa Oleifera", category: "Capsule", manufacturer: "ACI Limited", strength: "" },
  { name: "Mulethi", generic_name: "Licorice Root", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Musli", generic_name: "Safed Musli", category: "Capsule", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Myrobalan", generic_name: "Triphala", category: "Tablet", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Neem", generic_name: "Azadirachta Indica", category: "Capsule", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Neemex", generic_name: "Neem Extract", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Nervoton", generic_name: "Ashwagandha + Brahmi", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Nutri Hair", generic_name: "Biotin + Iron + Zinc", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Nutriliv", generic_name: "Silymarin + Artichoke", category: "Capsule", manufacturer: "Renata Limited", strength: "" },
  { name: "Olive Oil", generic_name: "Extra Virgin Olive Oil", category: "Oil", manufacturer: "Purnava Limited", strength: "" },
  { name: "Omega Plus", generic_name: "Omega-3 Fatty Acid", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Osteoflex", generic_name: "Glucosamine + Chondroitin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd.", strength: "" },
  { name: "Palmetto", generic_name: "Saw Palmetto", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Papaya Leaf", generic_name: "Carica Papaya Leaf", category: "Syrup", manufacturer: "ACI Limited", strength: "" },
  { name: "Pilen", generic_name: "Herbal Anti-hemorrhoid", category: "Capsule", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Prostacare", generic_name: "Saw Palmetto + Nettle Root", category: "Capsule", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Prostex", generic_name: "Saw Palmetto", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Pumpkin Seed Oil", generic_name: "Cucurbita Pepo Seed Oil", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Qurs-e-Ziabetes", generic_name: "Antidiabetic Unani", category: "Tablet", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Rasayanam", generic_name: "Ashwagandha", category: "Capsule", manufacturer: "ACI Limited", strength: "" },
  { name: "Rauvolfia", generic_name: "Rauwolfia Serpentina", category: "Tablet", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Renew Hair", generic_name: "Biotin Complex", category: "Capsule", manufacturer: "Renata Limited", strength: "" },
  { name: "Resveratrol", generic_name: "Trans-Resveratrol", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Rooh Afza", generic_name: "Herbal Refreshment", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Rutin", generic_name: "Rutin + Vitamin C", category: "Tablet", manufacturer: "Aristopharma Ltd.", strength: "" },
  { name: "Safi", generic_name: "Blood Purifier Herbal", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Saw Palmetto", generic_name: "Serenoa Repens", category: "Capsule", manufacturer: "Renata Limited", strength: "" },
  { name: "Senna", generic_name: "Senna Leaf Extract", category: "Tablet", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Sharbat Faulad", generic_name: "Iron Tonic Unani", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Shilajit", generic_name: "Purified Shilajit", category: "Capsule", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Skin Care", generic_name: "Vitamin E + Aloe", category: "Cream", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Spirulina", generic_name: "Arthrospira Platensis", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Stevia", generic_name: "Stevia Rebaudiana", category: "Tablet", manufacturer: "Purnava Limited", strength: "" },
  { name: "Stress Relief", generic_name: "Ashwagandha + Valerian", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd.", strength: "" },
  { name: "Supari Pak", generic_name: "Supari Pak", category: "Powder", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Tentex", generic_name: "Herbal Aphrodisiac", category: "Tablet", manufacturer: "Healthcare Pharmaceuticals Ltd.", strength: "" },
  { name: "Triphala", generic_name: "Triphala Churna", category: "Capsule", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Tulsi", generic_name: "Ocimum Sanctum", category: "Capsule", manufacturer: "ACI Limited", strength: "" },
  { name: "Turmeric", generic_name: "Curcuma Longa", category: "Capsule", manufacturer: "Purnava Limited", strength: "" },
  { name: "Ural BPH", generic_name: "Herbal for BPH", category: "Capsule", manufacturer: "Aristopharma Ltd.", strength: "" },
  { name: "Urea", generic_name: "Herbal Diuretic", category: "Tablet", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Valerian", generic_name: "Valeriana Officinalis", category: "Capsule", manufacturer: "Renata Limited", strength: "" },
  { name: "Vasaka", generic_name: "Adhatoda Vasica", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Viamax", generic_name: "Ginseng + Ashwagandha", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd.", strength: "" },
  { name: "Vigorex", generic_name: "Ashwagandha + Gokshura", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC", strength: "" },
  { name: "Vita Hair", generic_name: "Biotin + Minerals", category: "Tablet", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Vitex", generic_name: "Vitex Agnus Castus", category: "Capsule", manufacturer: "Eskayef Pharmaceuticals Ltd.", strength: "" },
  { name: "Wheat Grass", generic_name: "Triticum Aestivum", category: "Tablet", manufacturer: "Purnava Limited", strength: "" },
  { name: "Yakuti", generic_name: "Jawarish Jalinoos", category: "Paste", manufacturer: "Hamdard Laboratories (WAQF) BD", strength: "" },
  { name: "Zafran", generic_name: "Saffron", category: "Capsule", manufacturer: "Ibn Sina Pharmaceuticals Ltd.", strength: "" },
  { name: "Zingiber", generic_name: "Ginger Extract", category: "Capsule", manufacturer: "Drug International Ltd.", strength: "" },
  { name: "Zingitone", generic_name: "Ginger + Turmeric", category: "Capsule", manufacturer: "Aristopharma Ltd.", strength: "" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Importing MedEx herbal medicines...');
    console.log(`Total medicines to import: ${MEDEX_HERBAL_MEDICINES.length}`);

    // Get all global manufacturers for mapping
    const { data: manufacturers, error: mfgError } = await supabase
      .from('global_manufacturers')
      .select('id, name')
      .eq('is_active', true);

    if (mfgError) {
      console.error('Error fetching manufacturers:', mfgError);
      throw mfgError;
    }

    // Create manufacturer name to ID map (case-insensitive)
    const manufacturerMap = new Map<string, string>();
    (manufacturers || []).forEach(m => {
      manufacturerMap.set(m.name.toLowerCase(), m.id);
    });

    console.log(`Found ${manufacturerMap.size} manufacturers for mapping`);

    // Get existing medicines to avoid duplicates
    const { data: existingMedicines, error: fetchError } = await supabase
      .from('global_medicines')
      .select('name')
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching existing medicines:', fetchError);
      throw fetchError;
    }

    const existingNames = new Set(
      (existingMedicines || []).map(m => m.name.toLowerCase().trim())
    );

    // Filter out duplicates and medicines without manufacturer, then prepare for insert
    let skippedNoManufacturer = 0;
    const newMedicines = MEDEX_HERBAL_MEDICINES
      .filter(med => !existingNames.has(med.name.toLowerCase().trim()))
      .filter(med => {
        const mfrId = manufacturerMap.get(med.manufacturer.toLowerCase());
        if (!mfrId) {
          console.log(`Skipping ${med.name} - manufacturer "${med.manufacturer}" not found`);
          skippedNoManufacturer++;
          return false;
        }
        return true;
      })
      .map(med => ({
        name: med.name,
        generic_name: med.generic_name,
        category: med.category,
        manufacturer_id: manufacturerMap.get(med.manufacturer.toLowerCase())!,
        unit: 'pcs',
        is_tax_applicable: false,
        is_active: true,
      }));

    console.log(`New medicines to add: ${newMedicines.length}`);
    console.log(`Skipping ${MEDEX_HERBAL_MEDICINES.length - newMedicines.length} existing medicines`);

    let inserted = 0;
    const skipped = MEDEX_HERBAL_MEDICINES.length - newMedicines.length;

    if (newMedicines.length > 0) {
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < newMedicines.length; i += batchSize) {
        const batch = newMedicines.slice(i, i + batchSize);
        const { data: insertedData, error: insertError } = await supabase
          .from('global_medicines')
          .insert(batch)
          .select();

        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
          throw insertError;
        }

        inserted += insertedData?.length || 0;
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedData?.length} medicines`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        total: MEDEX_HERBAL_MEDICINES.length,
        message: `${inserted} herbal medicines imported, ${skipped} already existed`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error importing medicines:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
