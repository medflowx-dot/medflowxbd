import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MedExMedicine {
  name: string;
  generic_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  manufacturer_name: string | null;
  unit_price: number | null;
  strip_price: number | null;
  pack_size: string | null;
  indication: string | null;
  pharmacology: string | null;
  dosage_adult: string | null;
  dosage_pediatric: string | null;
  administration: string | null;
  contraindications: string | null;
  side_effects: string | null;
  precautions: string | null;
  drug_interactions: string | null;
  pregnancy_category: string | null;
  storage: string | null;
}

// Parse MedEx medicine page markdown to extract structured data
function parseMedExMarkdown(markdown: string, medicineName: string): MedExMedicine | null {
  try {
    const medicine: MedExMedicine = {
      name: medicineName,
      generic_name: null,
      dosage_form: null,
      strength: null,
      manufacturer_name: null,
      unit_price: null,
      strip_price: null,
      pack_size: null,
      indication: null,
      pharmacology: null,
      dosage_adult: null,
      dosage_pediatric: null,
      administration: null,
      contraindications: null,
      side_effects: null,
      precautions: null,
      drug_interactions: null,
      pregnancy_category: null,
      storage: null,
    };

    // Extract generic name
    const genericMatch = markdown.match(/Generic(?:\s+Name)?[:\s]+([^\n]+)/i);
    if (genericMatch) {
      medicine.generic_name = genericMatch[1].trim();
    }

    // Extract manufacturer
    const manufacturerMatch = markdown.match(/(?:Manufacturer|Company|Marketed by)[:\s]+([^\n]+)/i);
    if (manufacturerMatch) {
      medicine.manufacturer_name = manufacturerMatch[1].trim();
    }

    // Extract dosage form
    const formMatch = markdown.match(/(?:Dosage Form|Type)[:\s]+([^\n]+)/i);
    if (formMatch) {
      medicine.dosage_form = formMatch[1].trim();
    }

    // Extract strength
    const strengthMatch = markdown.match(/(?:Strength|Dose)[:\s]+([^\n]+)/i);
    if (strengthMatch) {
      medicine.strength = strengthMatch[1].trim();
    }

    // Extract price
    const priceMatch = markdown.match(/(?:Unit Price|Price per unit)[:\s]*৳?\s*([\d.]+)/i);
    if (priceMatch) {
      medicine.unit_price = parseFloat(priceMatch[1]);
    }

    const stripPriceMatch = markdown.match(/(?:Strip Price|Pack Price)[:\s]*৳?\s*([\d.]+)/i);
    if (stripPriceMatch) {
      medicine.strip_price = parseFloat(stripPriceMatch[1]);
    }

    // Extract pack size
    const packMatch = markdown.match(/(?:Pack Size|Pack)[:\s]+([^\n]+)/i);
    if (packMatch) {
      medicine.pack_size = packMatch[1].trim();
    }

    // Extract indication
    const indicationMatch = markdown.match(/(?:Indication|Indications)[:\s]*\n?([\s\S]*?)(?=\n(?:Pharmacology|Dosage|Contra|Side Effect|Precaution|Drug Interaction|Storage|Pregnancy|Administration|\n#|\n\*\*|$))/i);
    if (indicationMatch) {
      medicine.indication = indicationMatch[1].trim().slice(0, 2000);
    }

    // Extract pharmacology
    const pharmacologyMatch = markdown.match(/(?:Pharmacology|Therapeutic Class)[:\s]*\n?([\s\S]*?)(?=\n(?:Indication|Dosage|Contra|Side Effect|Precaution|Drug Interaction|Storage|Pregnancy|Administration|\n#|\n\*\*|$))/i);
    if (pharmacologyMatch) {
      medicine.pharmacology = pharmacologyMatch[1].trim().slice(0, 2000);
    }

    // Extract dosage
    const dosageMatch = markdown.match(/(?:Dosage|Dose)[:\s]*\n?([\s\S]*?)(?=\n(?:Indication|Pharmacology|Contra|Side Effect|Precaution|Drug Interaction|Storage|Pregnancy|Administration|\n#|\n\*\*|$))/i);
    if (dosageMatch) {
      const dosageText = dosageMatch[1].trim();
      // Try to separate adult and pediatric
      const adultMatch = dosageText.match(/(?:Adult)[:\s]*([\s\S]*?)(?=(?:Child|Pediatric|Paediatric|$))/i);
      const pediatricMatch = dosageText.match(/(?:Child|Pediatric|Paediatric)[:\s]*([\s\S]*?)$/i);
      
      if (adultMatch) {
        medicine.dosage_adult = adultMatch[1].trim().slice(0, 1000);
      } else {
        medicine.dosage_adult = dosageText.slice(0, 1000);
      }
      
      if (pediatricMatch) {
        medicine.dosage_pediatric = pediatricMatch[1].trim().slice(0, 1000);
      }
    }

    // Extract administration
    const adminMatch = markdown.match(/(?:Administration|Mode of Administration)[:\s]*\n?([\s\S]*?)(?=\n(?:Indication|Pharmacology|Dosage|Contra|Side Effect|Precaution|Drug Interaction|Storage|Pregnancy|\n#|\n\*\*|$))/i);
    if (adminMatch) {
      medicine.administration = adminMatch[1].trim().slice(0, 1000);
    }

    // Extract contraindications
    const contraMatch = markdown.match(/(?:Contraindication|Contra-indication)[:\s]*\n?([\s\S]*?)(?=\n(?:Indication|Pharmacology|Dosage|Side Effect|Precaution|Drug Interaction|Storage|Pregnancy|Administration|\n#|\n\*\*|$))/i);
    if (contraMatch) {
      medicine.contraindications = contraMatch[1].trim().slice(0, 1000);
    }

    // Extract side effects
    const sideEffectMatch = markdown.match(/(?:Side Effect|Adverse Effect)[:\s]*\n?([\s\S]*?)(?=\n(?:Indication|Pharmacology|Dosage|Contra|Precaution|Drug Interaction|Storage|Pregnancy|Administration|\n#|\n\*\*|$))/i);
    if (sideEffectMatch) {
      medicine.side_effects = sideEffectMatch[1].trim().slice(0, 1000);
    }

    // Extract precautions
    const precautionMatch = markdown.match(/(?:Precaution|Warning)[:\s]*\n?([\s\S]*?)(?=\n(?:Indication|Pharmacology|Dosage|Contra|Side Effect|Drug Interaction|Storage|Pregnancy|Administration|\n#|\n\*\*|$))/i);
    if (precautionMatch) {
      medicine.precautions = precautionMatch[1].trim().slice(0, 1000);
    }

    // Extract drug interactions
    const interactionMatch = markdown.match(/(?:Drug Interaction|Interaction)[:\s]*\n?([\s\S]*?)(?=\n(?:Indication|Pharmacology|Dosage|Contra|Side Effect|Precaution|Storage|Pregnancy|Administration|\n#|\n\*\*|$))/i);
    if (interactionMatch) {
      medicine.drug_interactions = interactionMatch[1].trim().slice(0, 1000);
    }

    // Extract pregnancy category
    const pregnancyMatch = markdown.match(/(?:Pregnancy Category|Pregnancy)[:\s]*([A-DX])/i);
    if (pregnancyMatch) {
      medicine.pregnancy_category = pregnancyMatch[1].toUpperCase();
    }

    // Extract storage
    const storageMatch = markdown.match(/(?:Storage|Store)[:\s]*\n?([^\n]+)/i);
    if (storageMatch) {
      medicine.storage = storageMatch[1].trim().slice(0, 500);
    }

    return medicine;
  } catch (error) {
    console.error('Error parsing MedEx markdown:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicineName } = await req.json();

    if (!medicineName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Medicine name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search MedEx for the medicine
    const searchUrl = `https://medex.com.bd/brands?search=${encodeURIComponent(medicineName)}`;
    
    console.log(`Searching MedEx for: ${medicineName}`);
    console.log(`Search URL: ${searchUrl}`);

    // First, scrape the search results page with longer wait for JS
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
        formats: ['markdown', 'links', 'html'],
        onlyMainContent: false, // Get full page to capture search results
        waitFor: 5000, // Wait longer for JS to execute
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: searchData.error || 'Failed to search MedEx',
          details: searchData 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Search successful, looking for medicine links...');

    // Get content from response
    const markdown = searchData.data?.markdown || searchData.markdown || '';
    const html = searchData.data?.html || searchData.html || '';
    const links: string[] = searchData.data?.links || searchData.links || [];
    
    const searchTermLower = medicineName.toLowerCase();
    const searchWords = medicineName.toLowerCase().split(/\s+/);
    
    // Method 1: Extract links from markdown that match medicine name
    // Look for patterns like [Napa 500 mg Tablet](https://medex.com.bd/brands/...)
    const markdownLinkRegex = /\[([^\]]*)\]\((https:\/\/medex\.com\.bd\/brands\/\d+\/[^)]+)\)/g;
    const extractedLinks: string[] = [];
    let match;
    
    while ((match = markdownLinkRegex.exec(markdown)) !== null) {
      const linkText = match[1].toLowerCase();
      const linkUrl = match[2];
      
      // Check if the link text contains the search term
      if (searchWords.some((word: string) => linkText.includes(word))) {
        extractedLinks.push(linkUrl);
      }
    }
    
    console.log(`Found ${extractedLinks.length} links from markdown matching "${medicineName}"`);
    
    // Method 2: Also check the links array
    const filteredLinks = links.filter((link: string) => {
      if (!link.includes('/brands/') || link.includes('/brands?')) return false;
      
      const linkLower = link.toLowerCase();
      // Check if the URL slug contains the first word of the search term
      return searchWords.some((word: string) => {
        const urlSlug = linkLower.split('/').pop() || '';
        return urlSlug.startsWith(word) || urlSlug.includes(`-${word}`) || urlSlug.includes(`/${word}`);
      });
    });
    
    console.log(`Found ${filteredLinks.length} links from links array matching "${medicineName}"`);
    
    // Combine and deduplicate
    const allMatchingLinks = [...new Set([...extractedLinks, ...filteredLinks])].slice(0, 10);
    
    console.log('All matching links:', allMatchingLinks);

    if (allMatchingLinks.length === 0) {
      // As a fallback, try to search directly by constructing medicine URL
      // MedEx URLs follow pattern: /brands/{id}/{name-slug}
      // Try to find any brand links and filter by name later
      const fallbackLinks = links
        .filter((l: string) => l.includes('/brands/') && !l.includes('/brands?'))
        .slice(0, 20);
      
      console.log('No direct matches found, checking fallback links for name matches...');
      
      // We'll scrape a few and check the actual medicine name
      const medicineLinks = fallbackLinks.slice(0, 5);
      
      if (medicineLinks.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `No medicines found matching "${medicineName}" on MedEx. The search might not be returning results.`,
            hint: 'Try searching with a more specific medicine name or brand.',
            debugInfo: { 
              linksFound: links.length,
              markdownPreview: markdown.slice(0, 500)
            }
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      allMatchingLinks.push(...medicineLinks);
    }

    console.log(`Found ${allMatchingLinks.length} medicine links, scraping details...`);

    // Scrape each medicine detail page
    const medicines: MedExMedicine[] = [];

    for (const link of allMatchingLinks.slice(0, 5)) { // Limit to 5 to avoid timeout
      try {
        console.log(`Scraping: ${link}`);
        
        const detailResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: link,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000,
          }),
        });

        const detailData = await detailResponse.json();

        if (detailResponse.ok && detailData.data?.markdown) {
          // Extract medicine name from URL
          const urlParts = link.split('/');
          const nameFromUrl = urlParts[urlParts.length - 1]
            .split('-')
            .filter((part: string) => isNaN(Number(part)))
            .join(' ')
            .replace(/-/g, ' ');
          
          const parsedMedicine = parseMedExMarkdown(detailData.data.markdown, nameFromUrl || medicineName);
          
          if (parsedMedicine && parsedMedicine.name) {
            medicines.push(parsedMedicine);
            console.log(`Successfully parsed: ${parsedMedicine.name}`);
          }
        }
      } catch (err) {
        console.error(`Error scraping ${link}:`, err);
      }
    }

    if (medicines.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not parse any medicine data from MedEx',
          links: allMatchingLinks
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let inserted = 0;
    let updated = 0;

    for (const medicine of medicines) {
      // Check if medicine already exists
      const { data: existing } = await supabase
        .from('medicine_reference')
        .select('id')
        .ilike('name', medicine.name)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('medicine_reference')
          .update({
            generic_name: medicine.generic_name,
            dosage_form: medicine.dosage_form,
            strength: medicine.strength,
            manufacturer_name: medicine.manufacturer_name,
            unit_price: medicine.unit_price,
            strip_price: medicine.strip_price,
            pack_size: medicine.pack_size,
            indication: medicine.indication,
            pharmacology: medicine.pharmacology,
            dosage_adult: medicine.dosage_adult,
            dosage_pediatric: medicine.dosage_pediatric,
            administration: medicine.administration,
            contraindications: medicine.contraindications,
            side_effects: medicine.side_effects,
            precautions: medicine.precautions,
            drug_interactions: medicine.drug_interactions,
            pregnancy_category: medicine.pregnancy_category,
            storage: medicine.storage,
            is_active: true,
          })
          .eq('id', existing.id);

        if (!updateError) updated++;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('medicine_reference')
          .insert({
            name: medicine.name,
            generic_name: medicine.generic_name,
            dosage_form: medicine.dosage_form,
            strength: medicine.strength,
            manufacturer_name: medicine.manufacturer_name,
            unit_price: medicine.unit_price,
            strip_price: medicine.strip_price,
            pack_size: medicine.pack_size,
            indication: medicine.indication,
            pharmacology: medicine.pharmacology,
            dosage_adult: medicine.dosage_adult,
            dosage_pediatric: medicine.dosage_pediatric,
            administration: medicine.administration,
            contraindications: medicine.contraindications,
            side_effects: medicine.side_effects,
            precautions: medicine.precautions,
            drug_interactions: medicine.drug_interactions,
            pregnancy_category: medicine.pregnancy_category,
            storage: medicine.storage,
            is_active: true,
          });

        if (!insertError) inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Found ${medicines.length} medicines from MedEx`,
        inserted,
        updated,
        medicines: medicines.map(m => ({
          name: m.name,
          generic_name: m.generic_name,
          manufacturer_name: m.manufacturer_name,
          unit_price: m.unit_price,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error scraping MedEx:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape MedEx';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
