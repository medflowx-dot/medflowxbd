import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Midtier pharma medicines data from MedEx research
const MIDTIER_PHARMA_MEDICINES = [
  // Orion Pharma
  { name: "Orison 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Orion Pharma Ltd" },
  { name: "Orison 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Orion Pharma Ltd" },
  { name: "Orithrox 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "Orion Pharma Ltd" },
  { name: "Orithrox 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Orion Pharma Ltd" },
  { name: "Oricef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Orion Pharma Ltd" },
  { name: "Oricip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Orion Pharma Ltd" },
  { name: "Orimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Orion Pharma Ltd" },
  { name: "Orimet 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Orion Pharma Ltd" },
  { name: "Oripara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Orion Pharma Ltd" },
  { name: "Oriamlo 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Orion Pharma Ltd" },
  { name: "Oriamlo 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Orion Pharma Ltd" },

  // Delta Pharma
  { name: "Deltazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltazit 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltacip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltamol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltamox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Delta Pharma Ltd" },
  { name: "Deltastat 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Delta Pharma Ltd" },

  // Jayson Pharmaceuticals
  { name: "Jaypraz 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaythro 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaycef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaycip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaymet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaymol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaymox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaypan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd" },
  { name: "Jaylo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd" },

  // Ziska Pharmaceuticals
  { name: "Ziskacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskacef 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskamox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskacip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Ziska Pharmaceuticals Ltd" },
  { name: "Ziskalo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Ziska Pharmaceuticals Ltd" },

  // Rephco Pharmaceuticals
  { name: "Rephcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephcip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephlo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Rephco Pharmaceuticals Ltd" },
  { name: "Rephamlo 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Rephco Pharmaceuticals Ltd" },

  // Nuvista Pharma
  { name: "Nuvicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvizith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvicip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvilo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuviamlo 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },
  { name: "Nuvistat 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd" },

  // Albion Laboratories
  { name: "Albicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albizith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albicip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albilo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albiamlo 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
  { name: "Albistat 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Albion Laboratories Ltd" },
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
    console.log(`Found ${manufacturers?.length} manufacturers`);

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
    for (const medicine of MIDTIER_PHARMA_MEDICINES) {
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
        message: `Successfully imported ${insertedCount} medicines from Midtier Pharma. Skipped ${skippedCount}.`
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
