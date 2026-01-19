import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional pharma medicines data - using exact database manufacturer names
const REGIONAL_PHARMA_MEDICINES = [
  // Globe Pharmaceuticals Ltd.
  { name: "Globecef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Globe Pharmaceuticals Ltd." },
  { name: "Globezith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd." },
  { name: "Globepan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd." },
  { name: "Globemet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd." },
  { name: "Globemox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Globe Pharmaceuticals Ltd." },
  { name: "Globepara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd." },

  // Everest Pharmaceuticals Ltd.
  { name: "Everestcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Everest Pharmaceuticals Ltd." },
  { name: "Everestzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd." },
  { name: "Everestpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd." },
  { name: "Everestmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd." },
  { name: "Everestmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Everest Pharmaceuticals Ltd." },
  { name: "Everestpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd." },

  // Euro Pharma Ltd.
  { name: "Eurocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Euro Pharma Ltd." },
  { name: "Eurozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Euro Pharma Ltd." },
  { name: "Europan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Euro Pharma Ltd." },
  { name: "Euromet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Euro Pharma Ltd." },
  { name: "Euromox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Euro Pharma Ltd." },
  { name: "Europara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Euro Pharma Ltd." },

  // Modern Pharmaceuticals Ltd.
  { name: "Moderncef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Modern Pharmaceuticals Ltd." },
  { name: "Modernzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd." },
  { name: "Modernpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd." },
  { name: "Modernmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd." },
  { name: "Modernmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Modern Pharmaceuticals Ltd." },
  { name: "Modernpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd." },

  // Millat Pharmaceuticals Ltd.
  { name: "Millatcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Millat Pharmaceuticals Ltd." },
  { name: "Millatzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd." },
  { name: "Millatpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd." },
  { name: "Millatmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd." },
  { name: "Millatmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Millat Pharmaceuticals Ltd." },
  { name: "Millatpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd." },

  // Libra Pharmaceuticals Ltd.
  { name: "Libracef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Libra Pharmaceuticals Ltd." },
  { name: "Librazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd." },
  { name: "Librapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd." },
  { name: "Libramet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd." },
  { name: "Libramox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Libra Pharmaceuticals Ltd." },
  { name: "Librapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd." },

  // Navana Pharmaceuticals Ltd.
  { name: "Navanapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd." },
  { name: "Navanacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Navana Pharmaceuticals Ltd." },
  { name: "Navanazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd." },
  { name: "Navanapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd." },
  { name: "Navanamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Navana Pharmaceuticals Ltd." },

  // Gonoshasthaya Pharmaceuticals Ltd.
  { name: "Gonopara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd." },
  { name: "Gonocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd." },
  { name: "Gonozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd." },
  { name: "Gonopan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd." },
  { name: "Gonomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Gonoshasthaya Pharmaceuticals Ltd." },

  // Meditech Pharmaceuticals Ltd.
  { name: "Meditechcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Meditech Pharmaceuticals Ltd." },
  { name: "Meditechzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Meditech Pharmaceuticals Ltd." },
  { name: "Meditechpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Meditech Pharmaceuticals Ltd." },
  { name: "Meditechmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Meditech Pharmaceuticals Ltd." },
  { name: "Meditechpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Meditech Pharmaceuticals Ltd." },

  // Medicure Pharmaceuticals Ltd.
  { name: "Medicurecef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Medicure Pharmaceuticals Ltd." },
  { name: "Medicurezith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Medicure Pharmaceuticals Ltd." },
  { name: "Medicurepan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Medicure Pharmaceuticals Ltd." },
  { name: "Medicuremet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Medicure Pharmaceuticals Ltd." },
  { name: "Medicurepara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Medicure Pharmaceuticals Ltd." },
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
    for (const medicine of REGIONAL_PHARMA_MEDICINES) {
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
        message: `Successfully imported ${insertedCount} medicines from Regional Pharma. Skipped ${skippedCount}.`
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
