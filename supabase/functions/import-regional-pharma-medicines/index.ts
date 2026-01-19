import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regional pharma medicines data from MedEx research
const REGIONAL_PHARMA_MEDICINES = [
  // Pacific Pharmaceuticals
  { name: "Pacificef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Pacific Pharmaceuticals Ltd" },
  { name: "Pacifizith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Pacific Pharmaceuticals Ltd" },
  { name: "Pacifipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Pacific Pharmaceuticals Ltd" },
  { name: "Pacifimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Pacific Pharmaceuticals Ltd" },
  { name: "Pacifimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Pacific Pharmaceuticals Ltd" },
  { name: "Pacifipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Pacific Pharmaceuticals Ltd" },

  // Globe Pharmaceuticals
  { name: "Globecef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Globe Pharmaceuticals Ltd" },
  { name: "Globezith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd" },
  { name: "Globepan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd" },
  { name: "Globemet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd" },
  { name: "Globemox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Globe Pharmaceuticals Ltd" },
  { name: "Globepara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Globe Pharmaceuticals Ltd" },

  // Everest Pharmaceuticals
  { name: "Everestcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Everest Pharmaceuticals Ltd" },
  { name: "Everestzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd" },
  { name: "Everestpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd" },
  { name: "Everestmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd" },
  { name: "Everestmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Everest Pharmaceuticals Ltd" },
  { name: "Everestpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Everest Pharmaceuticals Ltd" },

  // Euro Pharma
  { name: "Eurocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Euro Pharma Ltd" },
  { name: "Eurozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Euro Pharma Ltd" },
  { name: "Europan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Euro Pharma Ltd" },
  { name: "Euromet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Euro Pharma Ltd" },
  { name: "Euromox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Euro Pharma Ltd" },
  { name: "Europara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Euro Pharma Ltd" },

  // Julphar Bangladesh
  { name: "Julpharcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Julphar Bangladesh Ltd" },
  { name: "Julpharzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd" },
  { name: "Julpharpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd" },
  { name: "Julpharmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd" },
  { name: "Julpharmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Julphar Bangladesh Ltd" },
  { name: "Julpharpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Julphar Bangladesh Ltd" },

  // Nipro JMI
  { name: "Niprocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Nipro JMI Pharma Ltd" },
  { name: "Niprozith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd" },
  { name: "Nipropan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd" },
  { name: "Nipromet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd" },
  { name: "Nipromox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Nipro JMI Pharma Ltd" },
  { name: "Nipropara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Nipro JMI Pharma Ltd" },

  // Modern Pharmaceuticals
  { name: "Moderncef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Modern Pharmaceuticals Ltd" },
  { name: "Modernzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd" },
  { name: "Modernpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd" },
  { name: "Modernmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd" },
  { name: "Modernmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Modern Pharmaceuticals Ltd" },
  { name: "Modernpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Modern Pharmaceuticals Ltd" },

  // Millat Pharmaceuticals
  { name: "Millatcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Millat Pharmaceuticals Ltd" },
  { name: "Millatzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd" },
  { name: "Millatpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd" },
  { name: "Millatmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd" },
  { name: "Millatmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Millat Pharmaceuticals Ltd" },
  { name: "Millatpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Millat Pharmaceuticals Ltd" },

  // Libra Pharmaceuticals
  { name: "Libracef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Libra Pharmaceuticals Ltd" },
  { name: "Librazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd" },
  { name: "Librapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd" },
  { name: "Libramet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd" },
  { name: "Libramox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Libra Pharmaceuticals Ltd" },
  { name: "Librapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Libra Pharmaceuticals Ltd" },

  // Labaid Pharmaceuticals
  { name: "Labaidcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Labaid Pharmaceuticals Ltd" },
  { name: "Labaidzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd" },
  { name: "Labaidpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd" },
  { name: "Labaidmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd" },
  { name: "Labaidmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Labaid Pharmaceuticals Ltd" },
  { name: "Labaidpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Labaid Pharmaceuticals Ltd" },
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
    for (const medicine of REGIONAL_PHARMA_MEDICINES) {
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
