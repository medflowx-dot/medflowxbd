import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Midtier pharma medicines data - using exact database manufacturer names
const MIDTIER_PHARMA_MEDICINES = [
  // Nuvista Pharma Ltd.
  { name: "Nuvicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvizith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvicip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvilo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuviamlo 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },
  { name: "Nuvistat 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Nuvista Pharma Ltd." },

  // Albion Laboratories Limited
  { name: "Albicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Albion Laboratories Limited" },
  { name: "Albizith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Albion Laboratories Limited" },
  { name: "Albipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Albion Laboratories Limited" },
  { name: "Albimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Albion Laboratories Limited" },
  { name: "Albimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Albion Laboratories Limited" },
  { name: "Albipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Albion Laboratories Limited" },
  { name: "Albicip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Albion Laboratories Limited" },
  { name: "Albilo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Albion Laboratories Limited" },
  { name: "Albiamlo 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Albion Laboratories Limited" },
  { name: "Albistat 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Albion Laboratories Limited" },

  // Delta Pharma Ltd.
  { name: "Deltazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltazit 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltacip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltamol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltamox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Delta Pharma Ltd." },
  { name: "Deltastat 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Delta Pharma Ltd." },

  // Jayson Pharmaceuticals Ltd.
  { name: "Jaypraz 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaythro 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaycef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaycip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaymet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaymol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaymox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaypan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd." },
  { name: "Jaylo 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Jayson Pharmaceuticals Ltd." },

  // Beacon Pharmaceuticals PLC
  { name: "Beaconcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Beaconzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Beaconpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Beaconmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Beaconmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Beaconpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Sofosbuvir 400mg", generic_name: "Sofosbuvir", category: "Tablet", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Lenvatinib 4mg", generic_name: "Lenvatinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals PLC" },
  { name: "Lenvatinib 10mg", generic_name: "Lenvatinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals PLC" },

  // Kemiko Pharmaceuticals Ltd.
  { name: "Kemipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd." },
  { name: "Kemicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Kemiko Pharmaceuticals Ltd." },
  { name: "Kemizith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd." },
  { name: "Kemipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd." },
  { name: "Kemimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Kemiko Pharmaceuticals Ltd." },

  // Labaid Pharmaceuticals Ltd.
  { name: "Labaidcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Labaid Pharmaceuticals Ltd." },
  { name: "Labaidzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd." },
  { name: "Labaidpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd." },
  { name: "Labaidmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd." },
  { name: "Labaidmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Labaid Pharmaceuticals Ltd." },
  { name: "Labaidpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd." },

  // Nipro JMI Pharma Ltd.
  { name: "Niprocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Nipro JMI Pharma Ltd." },
  { name: "Niprozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd." },
  { name: "Nipropan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd." },
  { name: "Nipromet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd." },
  { name: "Nipromox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Nipro JMI Pharma Ltd." },
  { name: "Nipropara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd." },

  // Julphar Bangladesh Ltd.
  { name: "Julpharcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Julphar Bangladesh Ltd." },
  { name: "Julpharzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd." },
  { name: "Julpharpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd." },
  { name: "Julpharmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd." },
  { name: "Julpharmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Julphar Bangladesh Ltd." },
  { name: "Julpharpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd." },
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
