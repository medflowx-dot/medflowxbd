import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Major pharma medicines data from MedEx research (Square, Renata, ACI)
const MAJOR_PHARMA_MEDICINES = [
  // Square Pharmaceuticals - Additional medicines
  { name: "Seclo 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Seclo 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Azithrocin 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Azithrocin 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losectil 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losectil 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cef-3 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cef-3 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ciprocin 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ciprocin 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amdocal 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amdocal 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losartan 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losartan 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neoceptin R 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neoceptin R 300mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Monas 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Monas 4mg", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atova 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atova 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atova 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zimax 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zimax 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Napa Extra", generic_name: "Paracetamol + Caffeine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Napa Extend 665mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Aceclo Plus", generic_name: "Aceclofenac + Paracetamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sergel 20mg", generic_name: "Rabeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dexoren 0.5mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dexoren 4mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fluclox 250mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fluclox 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amoxil 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amoxil 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clavusef 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clavusef 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pantonix 20mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pantonix 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Domidon 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Vertiron 8mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Vertiron 16mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },

  // Renata Limited - Additional medicines
  { name: "Pep 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Pep 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Azit 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Azit 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Fixim 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Fixim 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Renidin 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Renidin 300mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Metacin 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Metacin 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Metacin XR 500mg", generic_name: "Metformin XR", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Renamox 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Renamox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Renaclav 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Renaclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Ciprox 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Ciprox 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Amlopin 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Amlopin 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Losium 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Losium 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Losium 100mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atorva 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atorva 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atorva 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Renova 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Rabe 20mg", generic_name: "Rabeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Montair 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Montair 4mg", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "Renata Limited" },
  { name: "Deflazacort 6mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Deflazacort 30mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Paino", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Paino Extra", generic_name: "Paracetamol + Caffeine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Histacin 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Fexo 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Fexo 180mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Renata Limited" },

  // ACI Limited - Additional medicines
  { name: "Maxpro 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Maxpro 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Azimax 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Azimax 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Cefi 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Cefi 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Cipro-A 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Cipro-A 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Glimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Glimet 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Glimet 1000mg", generic_name: "Metformin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Amlodac 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Amlodac 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Losart 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Losart 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atorvac 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atorvac 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atorvac 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Acimox 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Acimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Clavam 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clavam 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Panex 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Rabex 20mg", generic_name: "Rabeprazole", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Montex 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Cetzin 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Fexon 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Fexon 180mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ace 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ace Plus", generic_name: "Paracetamol + Caffeine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Aceclon", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Aceclon Plus", generic_name: "Aceclofenac + Paracetamol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Fluclav 250mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Fluclav 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "ACI Limited" },
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
    console.log(`Found ${existingMedicines?.length} existing medicines`);

    let insertedCount = 0;
    let skippedCount = 0;
    const missingManufacturers: string[] = [];

    const toInsert = [];
    for (const medicine of MAJOR_PHARMA_MEDICINES) {
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

    console.log(`Inserting ${toInsert.length} new medicines...`);
    const batchSize = 100;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('global_medicines')
        .insert(batch);

      if (insertError) throw insertError;
      insertedCount += batch.length;
    }

    console.log(`Import complete: ${insertedCount} inserted, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        skipped: skippedCount,
        missingManufacturers,
        message: `Successfully imported ${insertedCount} medicines from Major Pharma. Skipped ${skippedCount}.`
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
