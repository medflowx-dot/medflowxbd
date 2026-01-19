import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Specialty pharma medicines data - using exact database manufacturer names
const SPECIALTY_PHARMA_MEDICINES = [
  // General Pharmaceuticals Ltd.
  { name: "Generalpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd." },
  { name: "Generalcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "General Pharmaceuticals Ltd." },
  { name: "Generalzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd." },
  { name: "Generalpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd." },
  { name: "Generalmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "General Pharmaceuticals Ltd." },
  { name: "Generalmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "General Pharmaceuticals Ltd." },

  // Radiant Pharmaceuticals Ltd.
  { name: "Radiantpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Radiant Pharmaceuticals Ltd." },
  { name: "Radiantcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Radiant Pharmaceuticals Ltd." },
  { name: "Radiantzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Radiant Pharmaceuticals Ltd." },
  { name: "Radiantpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Radiant Pharmaceuticals Ltd." },
  { name: "Radiantmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Radiant Pharmaceuticals Ltd." },
  { name: "Radiantmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Radiant Pharmaceuticals Ltd." },

  // Glaxo SmithKline Bangladesh Ltd.
  { name: "Augmentin 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Augmentin 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Calpol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Calpol Suspension", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Ventolin Inhaler", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Ventolin Syrup", generic_name: "Salbutamol", category: "Syrup", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },

  // Hamdard Laboratories (WAQF) BD
  { name: "Safi", generic_name: "Herbal Blood Purifier", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD" },
  { name: "Rooh Afza", generic_name: "Herbal Drink", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD" },
  { name: "Cinkara", generic_name: "Herbal Tonic", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD" },
  { name: "Joshanda", generic_name: "Herbal Cold Remedy", category: "Powder", manufacturer: "Hamdard Laboratories (WAQF) BD" },
  { name: "Naunehal Gripe", generic_name: "Gripe Water", category: "Syrup", manufacturer: "Hamdard Laboratories (WAQF) BD" },

  // Bio-Pharma Laboratories Ltd.
  { name: "Biopara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd." },
  { name: "Biocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Bio-Pharma Laboratories Ltd." },
  { name: "Biozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd." },
  { name: "Biopan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd." },
  { name: "Biomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Bio-Pharma Laboratories Ltd." },

  // APC Pharma Ltd.
  { name: "APCpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "APC Pharma Ltd." },
  { name: "APCcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "APC Pharma Ltd." },
  { name: "APCzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "APC Pharma Ltd." },
  { name: "APCpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "APC Pharma Ltd." },
  { name: "APCmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "APC Pharma Ltd." },

  // Apex Pharmaceuticals Ltd.
  { name: "Apexpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Apex Pharmaceuticals Ltd." },
  { name: "Apexcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Apex Pharmaceuticals Ltd." },
  { name: "Apexzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Apex Pharmaceuticals Ltd." },
  { name: "Apexpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Apex Pharmaceuticals Ltd." },
  { name: "Apexmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Apex Pharmaceuticals Ltd." },

  // Aexim Pharmaceuticals Ltd.
  { name: "Aeximpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Aexim Pharmaceuticals Ltd." },
  { name: "Aeximcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Aexim Pharmaceuticals Ltd." },
  { name: "Aeximzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Aexim Pharmaceuticals Ltd." },
  { name: "Aeximpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Aexim Pharmaceuticals Ltd." },
  { name: "Aeximmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Aexim Pharmaceuticals Ltd." },

  // Al-Madina Pharmaceuticals Ltd.
  { name: "Almadinapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Al-Madina Pharmaceuticals Ltd." },
  { name: "Almadinacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Al-Madina Pharmaceuticals Ltd." },
  { name: "Almadinazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Al-Madina Pharmaceuticals Ltd." },
  { name: "Almadinapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Al-Madina Pharmaceuticals Ltd." },
  { name: "Almadinamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Al-Madina Pharmaceuticals Ltd." },

  // Allied Pharmaceuticals Ltd.
  { name: "Alliedpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Allied Pharmaceuticals Ltd." },
  { name: "Alliedcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Allied Pharmaceuticals Ltd." },
  { name: "Alliedzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Allied Pharmaceuticals Ltd." },
  { name: "Alliedpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Allied Pharmaceuticals Ltd." },
  { name: "Alliedmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Allied Pharmaceuticals Ltd." },

  // Amico Laboratories Ltd.
  { name: "Amicopara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Amico Laboratories Ltd." },
  { name: "Amicocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Amico Laboratories Ltd." },
  { name: "Amicozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Amico Laboratories Ltd." },
  { name: "Amicopan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Amico Laboratories Ltd." },
  { name: "Amicomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Amico Laboratories Ltd." },

  // Amulet Pharmaceuticals Ltd.
  { name: "Amuletpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Amulet Pharmaceuticals Ltd." },
  { name: "Amuletcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Amulet Pharmaceuticals Ltd." },
  { name: "Amuletzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Amulet Pharmaceuticals Ltd." },
  { name: "Amuletpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Amulet Pharmaceuticals Ltd." },
  { name: "Amuletmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Amulet Pharmaceuticals Ltd." },
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

    const manufacturerMap = new Map(manufacturers?.map(m => [m.name, m.id]) || []);

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
      const manufacturerId = manufacturerMap.get(medicine.manufacturer);
      
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
