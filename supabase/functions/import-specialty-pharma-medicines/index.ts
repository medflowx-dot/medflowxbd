import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Specialty pharma medicines data from MedEx research
const SPECIALTY_PHARMA_MEDICINES = [
  // Kemiko Pharmaceuticals
  { name: "Kemipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd" },
  { name: "Kemicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Kemiko Pharmaceuticals Ltd" },
  { name: "Kemizith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd" },
  { name: "Kemipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd" },
  { name: "Kemimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd" },

  // Gonoshasthaya Pharmaceuticals
  { name: "Gonopara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd" },
  { name: "Gonocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd" },
  { name: "Gonozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd" },
  { name: "Gonopan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd" },
  { name: "Gonomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd" },

  // Bio-Pharma Laboratories
  { name: "Biopara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd" },
  { name: "Biocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Bio-Pharma Laboratories Ltd" },
  { name: "Biozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd" },
  { name: "Biopan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd" },
  { name: "Biomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd" },

  // Central Pharmaceutical
  { name: "Centralpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Central Pharmaceutical Ltd" },
  { name: "Centralcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Central Pharmaceutical Ltd" },
  { name: "Centralzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Central Pharmaceutical Ltd" },
  { name: "Centralpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Central Pharmaceutical Ltd" },
  { name: "Centralmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Central Pharmaceutical Ltd" },

  // Cosmic Pharma
  { name: "Cosmicpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Cosmic Pharma Ltd" },
  { name: "Cosmiccef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Cosmic Pharma Ltd" },
  { name: "Cosmiczith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Cosmic Pharma Ltd" },
  { name: "Cosmicpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Cosmic Pharma Ltd" },
  { name: "Cosmicmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Cosmic Pharma Ltd" },

  // Essential Drugs
  { name: "Essentialpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Essential Drugs Company Ltd" },
  { name: "Essentialcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Essential Drugs Company Ltd" },
  { name: "Essentialzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Essential Drugs Company Ltd" },
  { name: "Essentialpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Essential Drugs Company Ltd" },
  { name: "Essentialmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Essential Drugs Company Ltd" },

  // General Pharmaceuticals
  { name: "Generalpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd" },
  { name: "Generalcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "General Pharmaceuticals Ltd" },
  { name: "Generalzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd" },
  { name: "Generalpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd" },
  { name: "Generalmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd" },

  // Hamdard Laboratories
  { name: "Safi", generic_name: "Herbal Blood Purifier", category: "Syrup", manufacturer: "Hamdard Laboratories (Waqf) Bangladesh" },
  { name: "Rooh Afza", generic_name: "Herbal Drink", category: "Syrup", manufacturer: "Hamdard Laboratories (Waqf) Bangladesh" },
  { name: "Cinkara", generic_name: "Herbal Tonic", category: "Syrup", manufacturer: "Hamdard Laboratories (Waqf) Bangladesh" },
  { name: "Joshanda", generic_name: "Herbal Cold Remedy", category: "Powder", manufacturer: "Hamdard Laboratories (Waqf) Bangladesh" },
  { name: "Naunehal Gripe", generic_name: "Gripe Water", category: "Syrup", manufacturer: "Hamdard Laboratories (Waqf) Bangladesh" },

  // Hudson Pharmaceuticals
  { name: "Hudsonpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Hudson Pharmaceuticals Ltd" },
  { name: "Hudsoncef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Hudson Pharmaceuticals Ltd" },
  { name: "Hudsonzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Hudson Pharmaceuticals Ltd" },
  { name: "Hudsonpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Hudson Pharmaceuticals Ltd" },
  { name: "Hudsonmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Hudson Pharmaceuticals Ltd" },

  // Navana Pharmaceuticals
  { name: "Navanapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd" },
  { name: "Navanacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Navana Pharmaceuticals Ltd" },
  { name: "Navanazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd" },
  { name: "Navanapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd" },
  { name: "Navanamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd" },

  // Pharmasia
  { name: "Pharmasiapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Pharmasia Ltd" },
  { name: "Pharmasiacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Pharmasia Ltd" },
  { name: "Pharmasiazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Pharmasia Ltd" },
  { name: "Pharmasiapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Pharmasia Ltd" },
  { name: "Pharmasiamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Pharmasia Ltd" },

  // Silva Pharmaceuticals
  { name: "Silvapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Silva Pharmaceuticals Ltd" },
  { name: "Silvacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Silva Pharmaceuticals Ltd" },
  { name: "Silvazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Silva Pharmaceuticals Ltd" },
  { name: "Silvapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Silva Pharmaceuticals Ltd" },
  { name: "Silvamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Silva Pharmaceuticals Ltd" },

  // Sun Pharmaceutical
  { name: "Sunpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Sun Pharmaceutical (Bangladesh) Ltd" },
  { name: "Suncef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Sun Pharmaceutical (Bangladesh) Ltd" },
  { name: "Sunzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Sun Pharmaceutical (Bangladesh) Ltd" },
  { name: "Sunpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Sun Pharmaceutical (Bangladesh) Ltd" },
  { name: "Sunmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Sun Pharmaceutical (Bangladesh) Ltd" },

  // Techno Drugs
  { name: "Technopara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Techno Drugs Ltd" },
  { name: "Technocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Techno Drugs Ltd" },
  { name: "Technozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Techno Drugs Ltd" },
  { name: "Technopan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Techno Drugs Ltd" },
  { name: "Technomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Techno Drugs Ltd" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching manufacturers...');
    const { data: manufacturers, error: mfgError } = await supabase
      .from('global_manufacturers')
      .select('id, name')
      .eq('is_active', true);

    if (mfgError) throw mfgError;

    const manufacturerMap = new Map(manufacturers?.map(m => [m.name.toLowerCase(), m.id]) || []);

    const { data: existingMedicines, error: existingError } = await supabase
      .from('global_medicines')
      .select('name, manufacturer_id')
      .eq('is_active', true);

    if (existingError) throw existingError;

    const existingSet = new Set(
      existingMedicines?.map(m => `${m.name.toLowerCase()}-${m.manufacturer_id}`) || []
    );

    let insertedCount = 0;
    let skippedCount = 0;
    const missingManufacturers: string[] = [];

    const toInsert = [];
    for (const medicine of SPECIALTY_PHARMA_MEDICINES) {
      const manufacturerId = manufacturerMap.get(medicine.manufacturer.toLowerCase());
      
      if (!manufacturerId) {
        if (!missingManufacturers.includes(medicine.manufacturer)) {
          missingManufacturers.push(medicine.manufacturer);
        }
        skippedCount++;
        continue;
      }

      const key = `${medicine.name.toLowerCase()}-${manufacturerId}`;
      if (existingSet.has(key)) {
        skippedCount++;
        continue;
      }

      toInsert.push({
        name: medicine.name,
        generic_name: medicine.generic_name,
        category: medicine.category,
        manufacturer_id: manufacturerId,
        is_active: true,
      });
    }

    const batchSize = 100;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('global_medicines')
        .insert(batch);

      if (insertError) throw insertError;
      insertedCount += batch.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        skipped: skippedCount,
        missingManufacturers,
        message: `Successfully imported ${insertedCount} medicines from Specialty Pharma. Skipped ${skippedCount}.`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
