import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Remaining manufacturers medicines data from MedEx research
const REMAINING_PHARMA_MEDICINES = [
  // AqVida Pharmaceuticals
  { name: "Aqulyte ORS", generic_name: "Oral Rehydration Salt", category: "Powder", manufacturer: "AqVida Pharmaceuticals" },
  { name: "Aqucal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "AqVida Pharmaceuticals" },
  { name: "Aquzinc 20mg", generic_name: "Zinc Sulfate", category: "Tablet", manufacturer: "AqVida Pharmaceuticals" },
  { name: "Aquvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "AqVida Pharmaceuticals" },
  { name: "Aqupara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "AqVida Pharmaceuticals" },

  // Apollo Pharmaceuticals
  { name: "Apollomol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Apollo Pharmaceuticals" },
  { name: "Apollocip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Apollo Pharmaceuticals" },
  { name: "Apollomox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Apollo Pharmaceuticals" },
  { name: "Apolloprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Apollo Pharmaceuticals" },
  { name: "Apollofen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Apollo Pharmaceuticals" },

  // Asiatic Laboratories
  { name: "Asipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Asiatic Laboratories" },
  { name: "Asimox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Asiatic Laboratories" },
  { name: "Asimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Asiatic Laboratories" },
  { name: "Asicef 500mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Asiatic Laboratories" },
  { name: "Asipan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Asiatic Laboratories" },

  // Astra Bioscience
  { name: "Astrapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Astra Bioscience" },
  { name: "Astramet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Astra Bioscience" },
  { name: "Astracip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Astra Bioscience" },
  { name: "Astrazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Astra Bioscience" },
  { name: "Astravit C", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Astra Bioscience" },

  // Avarox Pharma
  { name: "Avaromol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Avarox Pharma" },
  { name: "Avarofen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Avarox Pharma" },
  { name: "Avarocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Avarox Pharma" },
  { name: "Avarolax", generic_name: "Lactulose", category: "Syrup", manufacturer: "Avarox Pharma" },
  { name: "Avarozinc 20mg", generic_name: "Zinc Sulfate", category: "Tablet", manufacturer: "Avarox Pharma" },

  // Aztec Pharmaceuticals
  { name: "Aztecmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Aztec Pharmaceuticals" },
  { name: "Aztecprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Aztec Pharmaceuticals" },
  { name: "Azteccip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Aztec Pharmaceuticals" },
  { name: "Aztecmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Aztec Pharmaceuticals" },
  { name: "Aztecvit D", generic_name: "Cholecalciferol", category: "Capsule", manufacturer: "Aztec Pharmaceuticals" },

  // Bengal Drugs
  { name: "Bengalmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Bengal Drugs" },
  { name: "Bengalmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Bengal Drugs" },
  { name: "Bengalmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Bengal Drugs" },
  { name: "Bengalpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Bengal Drugs" },
  { name: "Bengalcal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Bengal Drugs" },

  // Benham Pharmaceuticals
  { name: "Benhammol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Benham Pharmaceuticals" },
  { name: "Benhamcip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Benham Pharmaceuticals" },
  { name: "Benhamprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Benham Pharmaceuticals" },
  { name: "Benhamfen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Benham Pharmaceuticals" },
  { name: "Benhamvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Benham Pharmaceuticals" },

  // Chemist Laboratories
  { name: "Chemipara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Chemist Laboratories" },
  { name: "Chemimet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Chemist Laboratories" },
  { name: "Chemicef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Chemist Laboratories" },
  { name: "Chemizole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Chemist Laboratories" },
  { name: "Chemilax", generic_name: "Lactulose", category: "Syrup", manufacturer: "Chemist Laboratories" },

  // Corona Remedies
  { name: "Coronamol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Corona Remedies" },
  { name: "Coronacip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Corona Remedies" },
  { name: "Coronamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Corona Remedies" },
  { name: "Coronapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Corona Remedies" },
  { name: "Coronacal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Corona Remedies" },

  // Edruc Limited
  { name: "Edrucmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Edruc Limited" },
  { name: "Edrucmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Edruc Limited" },
  { name: "Edrucmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Edruc Limited" },
  { name: "Edrucprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Edruc Limited" },
  { name: "Edrucfen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Edruc Limited" },

  // Farmasia Limited
  { name: "Farmapara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Farmasia Limited" },
  { name: "Farmacip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Farmasia Limited" },
  { name: "Farmacef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Farmasia Limited" },
  { name: "Farmazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Farmasia Limited" },
  { name: "Farmamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Farmasia Limited" },

  // Saad Pharma
  { name: "Saadmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Saad Pharma" },
  { name: "Saadmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Saad Pharma" },
  { name: "Saadmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Saad Pharma" },
  { name: "Saadpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Saad Pharma" },
  { name: "Saadvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Saad Pharma" },

  // Sharif Pharmaceuticals
  { name: "Sharifmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Sharif Pharmaceuticals" },
  { name: "Sharifcip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Sharif Pharmaceuticals" },
  { name: "Sharifmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Sharif Pharmaceuticals" },
  { name: "Sharifprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Sharif Pharmaceuticals" },
  { name: "Sharifcal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Sharif Pharmaceuticals" },

  // Supreme Pharmaceuticals
  { name: "Suprememol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Supreme Pharmaceuticals" },
  { name: "Suprememox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Supreme Pharmaceuticals" },
  { name: "Supremecef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Supreme Pharmaceuticals" },
  { name: "Suprememet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Supreme Pharmaceuticals" },
  { name: "Supremepan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Supreme Pharmaceuticals" },

  // Unihealth Manufacturing
  { name: "Unihealthmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Unihealth Manufacturing" },
  { name: "Unihealthcip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Unihealth Manufacturing" },
  { name: "Unihealthmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Unihealth Manufacturing" },
  { name: "Unihealthprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Unihealth Manufacturing" },
  { name: "Unihealthvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Unihealth Manufacturing" },

  // Unimed & Unihealth
  { name: "Unimedmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Unimed & Unihealth" },
  { name: "Unimedmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Unimed & Unihealth" },
  { name: "Unimedmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Unimed & Unihealth" },
  { name: "Unimedpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Unimed & Unihealth" },
  { name: "Unimedcal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Unimed & Unihealth" },

  // White Horse Pharmaceuticals
  { name: "Whitepara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "White Horse Pharmaceuticals" },
  { name: "Whitecip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "White Horse Pharmaceuticals" },
  { name: "Whitemet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "White Horse Pharmaceuticals" },
  { name: "Whiteprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "White Horse Pharmaceuticals" },
  { name: "Whitevit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "White Horse Pharmaceuticals" },

  // Zenith Pharmaceuticals
  { name: "Zenithmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Zenith Pharmaceuticals" },
  { name: "Zenithmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Zenith Pharmaceuticals" },
  { name: "Zenithmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Zenith Pharmaceuticals" },
  { name: "Zenithpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Zenith Pharmaceuticals" },
  { name: "Zenithcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Zenith Pharmaceuticals" },

  // Arges Life Science
  { name: "Argesmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Arges Life Science" },
  { name: "Argescip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Arges Life Science" },
  { name: "Argesmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Arges Life Science" },
  { name: "Argesprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Arges Life Science" },
  { name: "Argesvit C", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Arges Life Science" },

  // Alien Pharma
  { name: "Alienmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Alien Pharma" },
  { name: "Alienmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Alien Pharma" },
  { name: "Alienmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Alien Pharma" },
  { name: "Alienpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Alien Pharma" },
  { name: "Aliencal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Alien Pharma" },

  // Alkad Pharmaceuticals
  { name: "Alkadmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Alkad Pharmaceuticals" },
  { name: "Alkadcip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Alkad Pharmaceuticals" },
  { name: "Alkadmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Alkad Pharmaceuticals" },
  { name: "Alkadprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Alkad Pharmaceuticals" },
  { name: "Alkadvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Alkad Pharmaceuticals" },

  // Belsen Pharmaceuticals
  { name: "Belsenmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Belsen Pharmaceuticals" },
  { name: "Belsenmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Belsen Pharmaceuticals" },
  { name: "Belsenmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Belsen Pharmaceuticals" },
  { name: "Belsenpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Belsen Pharmaceuticals" },
  { name: "Belsencef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Belsen Pharmaceuticals" },

  // Alco Pharma
  { name: "Alcomol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Alco Pharma" },
  { name: "Alcocip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Alco Pharma" },
  { name: "Alcomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Alco Pharma" },
  { name: "Alcoprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Alco Pharma" },
  { name: "Alcovit C", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Alco Pharma" },

  // Ad-Din Pharmaceuticals
  { name: "Addinmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Ad-Din Pharmaceuticals" },
  { name: "Addinmox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Ad-Din Pharmaceuticals" },
  { name: "Addinmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Ad-Din Pharmaceuticals" },
  { name: "Addinpan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Ad-Din Pharmaceuticals" },
  { name: "Addincal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Ad-Din Pharmaceuticals" },

  // Ambee Pharmaceuticals
  { name: "Ambeemol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Ambee Pharmaceuticals" },
  { name: "Ambeecip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Ambee Pharmaceuticals" },
  { name: "Ambeemet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Ambee Pharmaceuticals" },
  { name: "Ambeeprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Ambee Pharmaceuticals" },
  { name: "Ambeevit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Ambee Pharmaceuticals" },

  // Biopharma Limited
  { name: "Biopara 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Biopharma Limited" },
  { name: "Biomox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Biopharma Limited" },
  { name: "Biomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Biopharma Limited" },
  { name: "Biopan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Biopharma Limited" },
  { name: "Biocef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Biopharma Limited" },

  // Mission Pharma
  { name: "Missionmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Mission Pharma" },
  { name: "Missioncip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Mission Pharma" },
  { name: "Missionmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Mission Pharma" },
  { name: "Missionprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Mission Pharma" },
  { name: "Missionvit C", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Mission Pharma" },

  // Novelta Bestway Pharma
  { name: "Noveltamol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Novelta Bestway Pharma" },
  { name: "Noveltamox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Novelta Bestway Pharma" },
  { name: "Noveltamet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Novelta Bestway Pharma" },
  { name: "Noveltapan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Novelta Bestway Pharma" },
  { name: "Noveltacal D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Novelta Bestway Pharma" },

  // Somatec Pharmaceuticals
  { name: "Somatecmol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Somatec Pharmaceuticals" },
  { name: "Somateccip 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Somatec Pharmaceuticals" },
  { name: "Somatecmet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Somatec Pharmaceuticals" },
  { name: "Somatecprazole 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Somatec Pharmaceuticals" },
  { name: "Somatecvit B", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Somatec Pharmaceuticals" },

  // Team Pharmaceuticals
  { name: "Teammol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Team Pharmaceuticals" },
  { name: "Teammox 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Team Pharmaceuticals" },
  { name: "Teammet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Team Pharmaceuticals" },
  { name: "Teampan 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Team Pharmaceuticals" },
  { name: "Teamcef 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Team Pharmaceuticals" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing manufacturers
    const { data: manufacturers, error: mfgError } = await supabase
      .from('global_manufacturers')
      .select('id, name')
      .eq('is_active', true);

    if (mfgError) throw mfgError;

    const manufacturerMap = new Map(manufacturers?.map(m => [m.name.toLowerCase(), m.id]) || []);

    // Fetch existing medicines to avoid duplicates
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
    let missingManufacturers: string[] = [];

    const toInsert = [];
    for (const medicine of REMAINING_PHARMA_MEDICINES) {
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

    // Insert in batches
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
        message: `Successfully imported ${insertedCount} medicines from remaining manufacturers. Skipped ${skippedCount} (duplicates or missing manufacturers).`
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
