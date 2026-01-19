import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardcoded list of Bangladesh pharmaceutical manufacturers from MedEx
const MEDEX_MANUFACTURERS = [
  "ACI Limited",
  "ACME Laboratories Ltd.",
  "Ad-din Pharmaceuticals Ltd.",
  "Aexim Pharmaceuticals Ltd.",
  "Al-Madina Pharmaceuticals Ltd.",
  "Albion Laboratories Limited",
  "Albion Specialized Pharma Limited",
  "Alco Pharma Ltd.",
  "Alien Pharma",
  "Alkad Laboratories",
  "Allied Pharmaceuticals Ltd.",
  "Ambee Pharmaceuticals Ltd.",
  "Amico Laboratories Ltd.",
  "Amulet Pharmaceuticals Ltd.",
  "APC Pharma Ltd.",
  "Apex Pharmaceuticals Ltd.",
  "Apollo Pharmaceutical Ltd.",
  "AqVida Bangladesh",
  "Arges Life Science Limited",
  "Aristopharma Ltd.",
  "Army Pharma Limited",
  "Asiatic Laboratories Ltd.",
  "Astra Biopharmaceuticals Ltd.",
  "Avarox Pharmaceuticals Ltd.",
  "Aztec Pharmaceuticals Ltd.",
  "Beacon Pharmaceuticals PLC",
  "Beauty Formulas",
  "Belsen Pharmaceuticals Ltd.",
  "Bengal Drugs Ltd.",
  "Benham Pharmaceuticals Ltd.",
  "Beximco Pharmaceuticals Ltd.",
  "Bio-Pharma Laboratories Ltd.",
  "Chemist Laboratories Ltd.",
  "Corona Remedies Ltd.",
  "Delta Pharma Ltd.",
  "Drug International Ltd.",
  "Edruc Ltd.",
  "Eskayef Pharmaceuticals Ltd.",
  "Euro Pharma Ltd.",
  "Everest Pharmaceuticals Ltd.",
  "Farmasia",
  "Flora Pharmaceuticals Ltd.",
  "General Pharmaceuticals Ltd.",
  "Globe Pharmaceuticals Ltd.",
  "Glaxo SmithKline Bangladesh Ltd.",
  "Gonoshasthaya Pharmaceuticals Ltd.",
  "Green Laboratories (Unani)",
  "Hamdard Laboratories (WAQF) BD",
  "Healthcare Pharmaceuticals Ltd.",
  "Ibn Sina Pharmaceuticals Ltd.",
  "Incepta Pharmaceuticals Ltd.",
  "Jayson Pharmaceuticals Ltd.",
  "Julphar Bangladesh Ltd.",
  "Kemiko Pharmaceuticals Ltd.",
  "Labaid Pharmaceuticals Ltd.",
  "Libra Pharmaceuticals Ltd.",
  "Medicure Pharmaceuticals Ltd.",
  "Meditech Pharmaceuticals Ltd.",
  "Millat Pharmaceuticals Ltd.",
  "Modern Pharmaceuticals Ltd.",
  "Navana Pharmaceuticals Ltd.",
  "Nipro JMI Pharma Ltd.",
  "Nuvista Pharma Ltd.",
  "Opsonin Pharma Ltd.",
  "Opsonin Herbal & Nutraceuticals Ltd.",
  "Orion Pharma Ltd.",
  "Pacific Pharmaceuticals Ltd.",
  "Pharmix Laboratories Ltd.",
  "Popular Pharmaceuticals Ltd.",
  "Purnava Limited",
  "Radiant Nutraceuticals Ltd.",
  "Radiant Pharmaceuticals Ltd.",
  "Rangs Pharmaceuticals Ltd.",
  "Renata Limited",
  "Rephco Pharmaceuticals Ltd.",
  "Saad Pharmaceutical Ltd.",
  "Sanofi Bangladesh Ltd.",
  "Sharif Pharmaceuticals Ltd.",
  "Silva Pharmaceuticals Ltd.",
  "Social Islami Bank Pharma",
  "Square Pharmaceuticals PLC",
  "Supreme Pharmaceuticals Ltd.",
  "TC Herbal Limited",
  "The ACME Laboratories Ltd.",
  "Total Natural Company (Unani)",
  "Unihealth And Unimax Ltd.",
  "Unimed & Unihealth Pharmaceuticals Ltd.",
  "UniMed UniHealth Pharmaceuticals Ltd.",
  "Veritas Pharmaceuticals Ltd.",
  "White Horse Pharmaceuticals Ltd.",
  "Zenith Pharmaceuticals Ltd.",
  "Ziska Pharmaceuticals Ltd.",
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Importing MedEx manufacturers...');
    console.log(`Total manufacturers to import: ${MEDEX_MANUFACTURERS.length}`);

    // Get existing manufacturers to avoid duplicates
    const { data: existingManufacturers, error: fetchError } = await supabase
      .from('global_manufacturers')
      .select('name')
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching existing manufacturers:', fetchError);
      throw fetchError;
    }

    const existingNames = new Set(
      (existingManufacturers || []).map(m => m.name.toLowerCase())
    );

    // Filter out duplicates
    const newManufacturers = MEDEX_MANUFACTURERS.filter(
      name => !existingNames.has(name.toLowerCase())
    );

    console.log(`New manufacturers to add: ${newManufacturers.length}`);
    console.log(`Skipping ${MEDEX_MANUFACTURERS.length - newManufacturers.length} existing manufacturers`);

    let inserted = 0;
    const skipped = MEDEX_MANUFACTURERS.length - newManufacturers.length;

    if (newManufacturers.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('global_manufacturers')
        .insert(newManufacturers.map(name => ({ name, is_active: true })))
        .select();

      if (insertError) {
        console.error('Error inserting manufacturers:', insertError);
        throw insertError;
      }

      inserted = insertedData?.length || 0;
      console.log(`Successfully inserted ${inserted} manufacturers`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        total: MEDEX_MANUFACTURERS.length,
        message: `${inserted} manufacturers imported, ${skipped} already existed`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error importing manufacturers:', error);
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
