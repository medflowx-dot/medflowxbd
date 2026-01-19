import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Remaining manufacturers medicines data - using exact database manufacturer names
const REMAINING_PHARMA_MEDICINES = [
  // AqVida Bangladesh
  { name: "Aqulyte ORS", generic_name: "Oral Rehydration Salt", category: "Powder", manufacturer: "AqVida Bangladesh" },
  { name: "Aqucal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "AqVida Bangladesh" },
  { name: "Aquzinc 20mg", generic_name: "Zinc Sulfate", category: "Tablet", manufacturer: "AqVida Bangladesh" },
  { name: "Aquvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "AqVida Bangladesh" },
  { name: "Aqupara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "AqVida Bangladesh" },

  // Apollo Pharmaceutical Ltd.
  { name: "Apollomol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Apollo Pharmaceutical Ltd." },
  { name: "Apollocip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Apollo Pharmaceutical Ltd." },
  { name: "Apollomox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Apollo Pharmaceutical Ltd." },
  { name: "Apolloprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Apollo Pharmaceutical Ltd." },
  { name: "Apollofen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Apollo Pharmaceutical Ltd." },

  // Asiatic Laboratories Ltd.
  { name: "Asipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Asiatic Laboratories Ltd." },
  { name: "Asimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Asiatic Laboratories Ltd." },
  { name: "Asimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Asiatic Laboratories Ltd." },
  { name: "Asicef 500mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Asiatic Laboratories Ltd." },
  { name: "Asipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Asiatic Laboratories Ltd." },

  // Astra Biopharmaceuticals Ltd.
  { name: "Astrapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Astra Biopharmaceuticals Ltd." },
  { name: "Astramet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Astra Biopharmaceuticals Ltd." },
  { name: "Astracip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Astra Biopharmaceuticals Ltd." },
  { name: "Astrazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Astra Biopharmaceuticals Ltd." },
  { name: "Astravit C", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Astra Biopharmaceuticals Ltd." },

  // Avarox Pharmaceuticals Ltd.
  { name: "Avaromol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Avarox Pharmaceuticals Ltd." },
  { name: "Avarofen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Avarox Pharmaceuticals Ltd." },
  { name: "Avarocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Avarox Pharmaceuticals Ltd." },
  { name: "Avarolax", generic_name: "Lactulose", category: "Syrup", manufacturer: "Avarox Pharmaceuticals Ltd." },
  { name: "Avarozinc 20mg", generic_name: "Zinc Sulfate", category: "Tablet", manufacturer: "Avarox Pharmaceuticals Ltd." },

  // Aztec Pharmaceuticals Ltd.
  { name: "Aztecmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Aztec Pharmaceuticals Ltd." },
  { name: "Aztecprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Aztec Pharmaceuticals Ltd." },
  { name: "Azteccip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Aztec Pharmaceuticals Ltd." },
  { name: "Aztecmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Aztec Pharmaceuticals Ltd." },
  { name: "Aztecvit D", generic_name: "Cholecalciferol", category: "Capsule", manufacturer: "Aztec Pharmaceuticals Ltd." },

  // Bengal Drugs Ltd.
  { name: "Bengalmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Bengal Drugs Ltd." },
  { name: "Bengalmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Bengal Drugs Ltd." },
  { name: "Bengalmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Bengal Drugs Ltd." },
  { name: "Bengalpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Bengal Drugs Ltd." },
  { name: "Bengalcal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Bengal Drugs Ltd." },

  // Benham Pharmaceuticals Ltd.
  { name: "Benhammol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Benham Pharmaceuticals Ltd." },
  { name: "Benhamcip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Benham Pharmaceuticals Ltd." },
  { name: "Benhamprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Benham Pharmaceuticals Ltd." },
  { name: "Benhamfen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Benham Pharmaceuticals Ltd." },
  { name: "Benhamvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Benham Pharmaceuticals Ltd." },

  // Chemist Laboratories Ltd.
  { name: "Chemipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Chemist Laboratories Ltd." },
  { name: "Chemimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Chemist Laboratories Ltd." },
  { name: "Chemicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Chemist Laboratories Ltd." },
  { name: "Chemizole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Chemist Laboratories Ltd." },
  { name: "Chemilax", generic_name: "Lactulose", category: "Syrup", manufacturer: "Chemist Laboratories Ltd." },

  // Corona Remedies Ltd.
  { name: "Coronamol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Corona Remedies Ltd." },
  { name: "Coronacip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Corona Remedies Ltd." },
  { name: "Coronamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Corona Remedies Ltd." },
  { name: "Coronapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Corona Remedies Ltd." },
  { name: "Coronacal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Corona Remedies Ltd." },

  // Edruc Ltd.
  { name: "Edrucmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Edruc Ltd." },
  { name: "Edrucmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Edruc Ltd." },
  { name: "Edrucmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Edruc Ltd." },
  { name: "Edrucprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Edruc Ltd." },
  { name: "Edrucfen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Edruc Ltd." },

  // Farmasia
  { name: "Farmapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Farmasia" },
  { name: "Farmacip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Farmasia" },
  { name: "Farmacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Farmasia" },
  { name: "Farmazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Farmasia" },
  { name: "Farmamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Farmasia" },

  // Flora Pharmaceuticals Ltd.
  { name: "Florapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Flora Pharmaceuticals Ltd." },
  { name: "Floracef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Flora Pharmaceuticals Ltd." },
  { name: "Florazith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Flora Pharmaceuticals Ltd." },
  { name: "Florapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Flora Pharmaceuticals Ltd." },
  { name: "Floramet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Flora Pharmaceuticals Ltd." },

  // Arges Life Science Limited
  { name: "Argesmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Arges Life Science Limited" },
  { name: "Argescip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Arges Life Science Limited" },
  { name: "Argesmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Arges Life Science Limited" },
  { name: "Argesprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Arges Life Science Limited" },
  { name: "Argesvit C", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Arges Life Science Limited" },

  // Alien Pharma
  { name: "Alienmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Alien Pharma" },
  { name: "Alienmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Alien Pharma" },
  { name: "Alienmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Alien Pharma" },
  { name: "Alienpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Alien Pharma" },
  { name: "Aliencal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Alien Pharma" },

  // Alkad Laboratories
  { name: "Alkadmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Alkad Laboratories" },
  { name: "Alkadcip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Alkad Laboratories" },
  { name: "Alkadmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Alkad Laboratories" },
  { name: "Alkadprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Alkad Laboratories" },
  { name: "Alkadvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Alkad Laboratories" },

  // Belsen Pharmaceuticals Ltd.
  { name: "Belsenmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Belsen Pharmaceuticals Ltd." },
  { name: "Belsenmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Belsen Pharmaceuticals Ltd." },
  { name: "Belsenmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Belsen Pharmaceuticals Ltd." },
  { name: "Belsenpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Belsen Pharmaceuticals Ltd." },
  { name: "Belsencef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Belsen Pharmaceuticals Ltd." },

  // Alco Pharma Ltd.
  { name: "Alcomol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Alco Pharma Ltd." },
  { name: "Alcocip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Alco Pharma Ltd." },
  { name: "Alcomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Alco Pharma Ltd." },
  { name: "Alcoprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Alco Pharma Ltd." },
  { name: "Alcovit C", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Alco Pharma Ltd." },

  // Ad-din Pharmaceuticals Ltd.
  { name: "Addinmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Ad-din Pharmaceuticals Ltd." },
  { name: "Addinmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Ad-din Pharmaceuticals Ltd." },
  { name: "Addinmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Ad-din Pharmaceuticals Ltd." },
  { name: "Addinpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Ad-din Pharmaceuticals Ltd." },
  { name: "Addincal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Ad-din Pharmaceuticals Ltd." },

  // Ambee Pharmaceuticals Ltd.
  { name: "Ambeemol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Ambee Pharmaceuticals Ltd." },
  { name: "Ambeecip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Ambee Pharmaceuticals Ltd." },
  { name: "Ambeemet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Ambee Pharmaceuticals Ltd." },
  { name: "Ambeeprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Ambee Pharmaceuticals Ltd." },
  { name: "Ambeevit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Ambee Pharmaceuticals Ltd." },

  // Army Pharma Limited
  { name: "Armymol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Army Pharma Limited" },
  { name: "Armycef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Army Pharma Limited" },
  { name: "Armyzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Army Pharma Limited" },
  { name: "Armypan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Army Pharma Limited" },
  { name: "Armymet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Army Pharma Limited" },

  // Albion Specialized Pharma Limited
  { name: "AlbionSPpara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Albion Specialized Pharma Limited" },
  { name: "AlbionSPcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Albion Specialized Pharma Limited" },
  { name: "AlbionSPzith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Albion Specialized Pharma Limited" },
  { name: "AlbionSPpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Albion Specialized Pharma Limited" },
  { name: "AlbionSPmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Albion Specialized Pharma Limited" },
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
    for (const medicine of REMAINING_PHARMA_MEDICINES) {
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
        message: `Successfully imported ${insertedCount} medicines from Remaining Pharma. Skipped ${skippedCount}.`
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
