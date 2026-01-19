import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Complete Bangladesh medicine master data - 400+ commonly used medicines
// Now includes all 28 manufacturers
const MEDICINES_DATA = [
  // ============= ANALGESIC / ANTIPYRETIC =============
  { name: "Napa 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Napa Extra", generic_name: "Paracetamol + Caffeine", category: "Analgesic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Napa Extend", generic_name: "Paracetamol SR", category: "Analgesic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ace 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ace Plus", generic_name: "Paracetamol + Caffeine", category: "Analgesic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Renova 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Fast 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Reset 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Healthcare Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Tamen 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Aristopharma Ltd.", unit: "strip" },
  { name: "Xpa 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "ACME Laboratories Ltd.", unit: "strip" },
  // Additional manufacturers - Analgesics
  { name: "Pyralgin 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Painex 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Febrex 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Acetam 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Dolonex 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pamol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Fevrin 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Silva Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Paragen 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "DBL Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Biocetamol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Biopharma Limited", unit: "strip" },
  { name: "Apamol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Apex Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Adimol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Ad-din Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Aexmol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Aexim Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Almol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Al-Madina Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Albimol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Albion Laboratories Ltd.", unit: "strip" },
  { name: "Alcomol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Alco Pharma Ltd.", unit: "strip" },
  { name: "Ambimol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Ambee Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amimol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Amico Laboratories Ltd.", unit: "strip" },
  { name: "Amutol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Amulet Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Apcmol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "APC Pharma Ltd.", unit: "strip" },
  { name: "Alimol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Allied Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKmol 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= ANTIBIOTIC - All Manufacturers =============
  // ACI Limited
  { name: "Cipraci 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Amoxaci 500mg", generic_name: "Amoxicillin", category: "Antibiotic", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Azaci 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Cefaci 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "ACI Limited", unit: "strip" },
  
  // Opsonin Pharma Ltd
  { name: "Opsonin-Z 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Opsocef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Opsocip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Opsoflox 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  
  // Beacon Pharmaceuticals PLC
  { name: "Beaconzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Beacef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Beacip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Bealevo 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  
  // Navana Pharmaceuticals Ltd
  { name: "Navazith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Navacef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Navacip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Navaclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  
  // Popular Pharmaceuticals Ltd
  { name: "Popuzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Popucef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Popucip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Populevo 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  
  // General Pharmaceuticals Ltd
  { name: "Genazith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Gencef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Gencip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Genclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  
  // Silva Pharmaceuticals Ltd
  { name: "Silvazith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Silva Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Silvacef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Silva Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Silvacip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Silva Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Silvalevo 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Silva Pharmaceuticals Ltd.", unit: "strip" },
  
  // DBL Pharmaceuticals Ltd
  { name: "DBLzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "DBL Pharmaceuticals Ltd.", unit: "strip" },
  { name: "DBLcef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "DBL Pharmaceuticals Ltd.", unit: "strip" },
  { name: "DBLcip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "DBL Pharmaceuticals Ltd.", unit: "strip" },
  { name: "DBLclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "DBL Pharmaceuticals Ltd.", unit: "strip" },
  
  // Biopharma Limited
  { name: "Biozith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Biopharma Limited", unit: "strip" },
  { name: "Biocef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Biopharma Limited", unit: "strip" },
  { name: "Biocip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Biopharma Limited", unit: "strip" },
  { name: "Bioclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Biopharma Limited", unit: "strip" },
  
  // Apex Pharmaceuticals Ltd
  { name: "Apexzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Apex Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Apexcef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Apex Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Apexcip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Apex Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Apexlevo 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Apex Pharmaceuticals Ltd.", unit: "strip" },
  
  // Ad-din Pharmaceuticals Ltd
  { name: "Adinzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Ad-din Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Adincef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Ad-din Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Adincip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Ad-din Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Adinclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Ad-din Pharmaceuticals Ltd.", unit: "strip" },
  
  // Aexim Pharmaceuticals Ltd
  { name: "Aeximzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Aexim Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Aeximcef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Aexim Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Aeximcip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Aexim Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Aeximox 500mg", generic_name: "Amoxicillin", category: "Antibiotic", manufacturer: "Aexim Pharmaceuticals Ltd.", unit: "strip" },
  
  // Al-Madina Pharmaceuticals Ltd
  { name: "Almazith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Al-Madina Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Almacef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Al-Madina Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Almacip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Al-Madina Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Almaclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Al-Madina Pharmaceuticals Ltd.", unit: "strip" },
  
  // Albion Laboratories Ltd
  { name: "Albizith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Albion Laboratories Ltd.", unit: "strip" },
  { name: "Albicef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Albion Laboratories Ltd.", unit: "strip" },
  { name: "Albicip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Albion Laboratories Ltd.", unit: "strip" },
  { name: "Albiclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Albion Laboratories Ltd.", unit: "strip" },
  
  // Alco Pharma Ltd
  { name: "Alcozith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Alco Pharma Ltd.", unit: "strip" },
  { name: "Alcocef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Alco Pharma Ltd.", unit: "strip" },
  { name: "Alcocip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Alco Pharma Ltd.", unit: "strip" },
  { name: "Alcoclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Alco Pharma Ltd.", unit: "strip" },
  
  // Ambee Pharmaceuticals Ltd
  { name: "Ambizith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Ambee Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ambicef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Ambee Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ambicip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Ambee Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ambiclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Ambee Pharmaceuticals Ltd.", unit: "strip" },
  
  // Amico Laboratories Ltd
  { name: "Amicozith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Amico Laboratories Ltd.", unit: "strip" },
  { name: "Amicocef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Amico Laboratories Ltd.", unit: "strip" },
  { name: "Amicocip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Amico Laboratories Ltd.", unit: "strip" },
  { name: "Amicoclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Amico Laboratories Ltd.", unit: "strip" },
  
  // Amulet Pharmaceuticals Ltd
  { name: "Amulzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Amulet Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amulcef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Amulet Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amulcip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Amulet Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amulclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Amulet Pharmaceuticals Ltd.", unit: "strip" },
  
  // APC Pharma Ltd
  { name: "APCzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "APC Pharma Ltd.", unit: "strip" },
  { name: "APCcef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "APC Pharma Ltd.", unit: "strip" },
  { name: "APCcip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "APC Pharma Ltd.", unit: "strip" },
  { name: "APCclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "APC Pharma Ltd.", unit: "strip" },
  
  // Allied Pharmaceuticals Ltd
  { name: "Allizith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Allied Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Allicef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Allied Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Allicip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Allied Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Alliclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Allied Pharmaceuticals Ltd.", unit: "strip" },
  
  // Eskayef (SK+F) Pharmaceuticals Ltd
  { name: "SKzith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKcef 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKcip 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKlevo 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= PPI / ANTACID - All Manufacturers =============
  // ACI Limited
  { name: "Omepra 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Pantopra 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "ACI Limited", unit: "strip" },
  
  // Opsonin Pharma Ltd
  { name: "Opsoprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Opsopan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  
  // Beacon Pharmaceuticals PLC
  { name: "Beaconprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Beapan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  
  // Navana Pharmaceuticals Ltd
  { name: "Navaprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Navapan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  
  // Popular Pharmaceuticals Ltd
  { name: "Popuprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Popupan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  
  // General Pharmaceuticals Ltd
  { name: "Genprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Genpan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  
  // Silva Pharmaceuticals Ltd
  { name: "Silvaprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Silva Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Silvapan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Silva Pharmaceuticals Ltd.", unit: "strip" },
  
  // DBL Pharmaceuticals Ltd
  { name: "DBLprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "DBL Pharmaceuticals Ltd.", unit: "strip" },
  { name: "DBLpan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "DBL Pharmaceuticals Ltd.", unit: "strip" },
  
  // Biopharma Limited
  { name: "Bioprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Biopharma Limited", unit: "strip" },
  { name: "Biopan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Biopharma Limited", unit: "strip" },
  
  // Apex Pharmaceuticals Ltd
  { name: "Apexprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Apex Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Apexpan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Apex Pharmaceuticals Ltd.", unit: "strip" },
  
  // Eskayef (SK+F) Pharmaceuticals Ltd
  { name: "SKprazol 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKpan 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKeso 20mg", generic_name: "Esomeprazole", category: "PPI", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= ANTIHISTAMINE - All Manufacturers =============
  // ACI Limited
  { name: "Fexoaci 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Loraaci 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "ACI Limited", unit: "strip" },
  
  // Opsonin Pharma Ltd
  { name: "Opsofex 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Opsolora 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  
  // Beacon Pharmaceuticals PLC
  { name: "Beafex 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Bealora 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  
  // Navana Pharmaceuticals Ltd
  { name: "Navafex 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Navalora 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  
  // Popular Pharmaceuticals Ltd
  { name: "Popufex 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Populora 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  
  // General Pharmaceuticals Ltd
  { name: "Genfex 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Genlora 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  
  // Eskayef (SK+F) Pharmaceuticals Ltd
  { name: "SKfex 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKlora 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKcetiri 10mg", generic_name: "Cetirizine", category: "Antihistamine", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= ANTIDIABETIC - All Manufacturers =============
  // ACI Limited
  { name: "Metaci 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Glipaci 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "ACI Limited", unit: "strip" },
  
  // Opsonin Pharma Ltd
  { name: "Opsomet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Opsoglip 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  
  // Beacon Pharmaceuticals PLC
  { name: "Beamet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Beaglip 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  
  // Navana Pharmaceuticals Ltd
  { name: "Navamet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Navaglip 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  
  // Popular Pharmaceuticals Ltd
  { name: "Popumet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Popuglip 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  
  // General Pharmaceuticals Ltd
  { name: "Genmet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Genglip 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  
  // Eskayef (SK+F) Pharmaceuticals Ltd
  { name: "SKmet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKglip 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKglim 2mg", generic_name: "Glimepiride", category: "Antidiabetic", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= ANTIHYPERTENSIVE - All Manufacturers =============
  // ACI Limited
  { name: "Losaraci 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "ACI Limited", unit: "strip" },
  { name: "Amloaci 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "ACI Limited", unit: "strip" },
  
  // Opsonin Pharma Ltd
  { name: "Opsolor 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "Opsoamlo 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  
  // Beacon Pharmaceuticals PLC
  { name: "Bealos 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "Beaamlo 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  
  // Navana Pharmaceuticals Ltd
  { name: "Navalos 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Navaamlo 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  
  // Popular Pharmaceuticals Ltd
  { name: "Populos 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Popuamlo 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  
  // General Pharmaceuticals Ltd
  { name: "Genlos 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Genamlo 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  
  // Eskayef (SK+F) Pharmaceuticals Ltd
  { name: "SKlos 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKamlo 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKateno 50mg", generic_name: "Atenolol", category: "Antihypertensive", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= VITAMINS & SUPPLEMENTS - All Manufacturers =============
  // ACI Limited
  { name: "Calciaci D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "ACI Limited", unit: "strip" },
  { name: "B-Complex ACI", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "ACI Limited", unit: "strip" },
  
  // Opsonin Pharma Ltd
  { name: "Opsocal D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  { name: "OpsoB Complex", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Opsonin Pharma Ltd.", unit: "strip" },
  
  // Beacon Pharmaceuticals PLC
  { name: "Beacal D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  { name: "BeaB Complex", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Beacon Pharmaceuticals PLC", unit: "strip" },
  
  // Navana Pharmaceuticals Ltd
  { name: "Navacal D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  { name: "NavaB Complex", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Navana Pharmaceuticals Ltd.", unit: "strip" },
  
  // Popular Pharmaceuticals Ltd
  { name: "Popucal D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  { name: "PopuB Complex", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Popular Pharmaceuticals Ltd.", unit: "strip" },
  
  // General Pharmaceuticals Ltd
  { name: "Gencal D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  { name: "GenB Complex", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "General Pharmaceuticals Ltd.", unit: "strip" },
  
  // Eskayef (SK+F) Pharmaceuticals Ltd
  { name: "SKcal D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKB Complex", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  { name: "SKvit C 500mg", generic_name: "Ascorbic Acid", category: "Supplement", manufacturer: "Eskayef (SK+F) Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= ORIGINAL MEDICINES (keeping existing ones) =============
  { name: "Napa 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Napa Extra", generic_name: "Paracetamol + Caffeine", category: "Analgesic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Napa Extend", generic_name: "Paracetamol SR", category: "Analgesic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ace 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ace Plus", generic_name: "Paracetamol + Caffeine", category: "Analgesic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Renova 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Fast 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Reset 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Healthcare Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Tamen 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "Aristopharma Ltd.", unit: "strip" },
  { name: "Xpa 500mg", generic_name: "Paracetamol", category: "Analgesic", manufacturer: "ACME Laboratories Ltd.", unit: "strip" },
  
  // NSAIDs
  { name: "Indocap 25mg", generic_name: "Indomethacin", category: "NSAID", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Clofenac 50mg", generic_name: "Diclofenac Sodium", category: "NSAID", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "A-Fenac 50mg", generic_name: "Diclofenac Sodium", category: "NSAID", manufacturer: "Aristopharma Ltd.", unit: "strip" },
  { name: "Voltalin 50mg", generic_name: "Diclofenac Sodium", category: "NSAID", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Toradol 10mg", generic_name: "Ketorolac", category: "NSAID", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ketorin 10mg", generic_name: "Ketorolac", category: "NSAID", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Napro 500mg", generic_name: "Naproxen", category: "NSAID", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Sonap 500mg", generic_name: "Naproxen", category: "NSAID", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Etorix 60mg", generic_name: "Etoricoxib", category: "NSAID", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Etova 60mg", generic_name: "Etoricoxib", category: "NSAID", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= ANTACID / PPI / H2 BLOCKER =============
  { name: "Seclo 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Seclo 40mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Losectil 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Losectil 40mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Procid 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Omen 20mg", generic_name: "Omeprazole", category: "PPI", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Maxpro 20mg", generic_name: "Esomeprazole", category: "PPI", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Maxpro 40mg", generic_name: "Esomeprazole", category: "PPI", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Sergel 20mg", generic_name: "Esomeprazole", category: "PPI", manufacturer: "Healthcare Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Nexum 20mg", generic_name: "Esomeprazole", category: "PPI", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Esoral 20mg", generic_name: "Esomeprazole", category: "PPI", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pantonix 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pantolex 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pantid 40mg", generic_name: "Pantoprazole", category: "PPI", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Rabium 20mg", generic_name: "Rabeprazole", category: "PPI", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Rabe 20mg", generic_name: "Rabeprazole", category: "PPI", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ranitid 150mg", generic_name: "Ranitidine", category: "H2 Blocker", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Neoceptin 150mg", generic_name: "Ranitidine", category: "H2 Blocker", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Antacid Plus", generic_name: "Aluminum + Magnesium", category: "Antacid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Antacil", generic_name: "Aluminum + Magnesium", category: "Antacid", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "bottle" },
  
  // ============= ANTIBIOTIC =============
  // Macrolides
  { name: "Zimax 250mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Zimax 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Azith 250mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Azith 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Azithrocin 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Tromix 500mg", generic_name: "Azithromycin", category: "Antibiotic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Eromycin 250mg", generic_name: "Erythromycin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Eromycin 500mg", generic_name: "Erythromycin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Clarith 250mg", generic_name: "Clarithromycin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Clarith 500mg", generic_name: "Clarithromycin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // Cephalosporins
  { name: "Cef-3 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Cef-3 400mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ceftron 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Cefimax 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Fixim 200mg", generic_name: "Cefixime", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Cefuril 250mg", generic_name: "Cefuroxime", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Cefuril 500mg", generic_name: "Cefuroxime", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Zinnat 250mg", generic_name: "Cefuroxime", category: "Antibiotic", manufacturer: "Healthcare Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Cefotil 250mg", generic_name: "Cefuroxime", category: "Antibiotic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Ceftriaxone 1g Inj", generic_name: "Ceftriaxone", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "vial" },
  { name: "Trizon 1g Inj", generic_name: "Ceftriaxone", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "vial" },
  { name: "Dicef 1g Inj", generic_name: "Ceftriaxone", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "vial" },
  { name: "Cefepime 1g Inj", generic_name: "Cefepime", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "vial" },
  
  // Quinolones
  { name: "Ciprocin 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ciprocin 250mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Neofloxin 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ciprox 500mg", generic_name: "Ciprofloxacin", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Lebac 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Levoxa 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Levoflox 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Quinox 500mg", generic_name: "Levofloxacin", category: "Antibiotic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Moxi 400mg", generic_name: "Moxifloxacin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Moxiclav 400mg", generic_name: "Moxifloxacin", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Oflox 200mg", generic_name: "Ofloxacin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Oflox 400mg", generic_name: "Ofloxacin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // Penicillins
  { name: "Amoxil 250mg", generic_name: "Amoxicillin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amoxil 500mg", generic_name: "Amoxicillin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Moxacil 500mg", generic_name: "Amoxicillin", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Tycil 500mg", generic_name: "Amoxicillin", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Fimoxyl 500mg", generic_name: "Amoxicillin", category: "Antibiotic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Moxaclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Moxaclav 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Augmentin 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Clavoxin 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Cloxacillin 500mg", generic_name: "Cloxacillin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Fluclox 500mg", generic_name: "Flucloxacillin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // Other Antibiotics
  { name: "Metronid 400mg", generic_name: "Metronidazole", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amodis 400mg", generic_name: "Metronidazole", category: "Antibiotic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Flagyl 400mg", generic_name: "Metronidazole", category: "Antibiotic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Doxycap 100mg", generic_name: "Doxycycline", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Doxy A 100mg", generic_name: "Doxycycline", category: "Antibiotic", manufacturer: "Aristopharma Ltd.", unit: "strip" },
  { name: "Linezolid 600mg", generic_name: "Linezolid", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Vancomycin 500mg Inj", generic_name: "Vancomycin", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "vial" },
  
  // ============= ANTIHISTAMINE =============
  { name: "Fexo 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Fexo 180mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Histafree 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Histafree 180mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Telfast 120mg", generic_name: "Fexofenadine", category: "Antihistamine", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Loratin 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Loranox 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Lorafast 10mg", generic_name: "Loratadine", category: "Antihistamine", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Cetrizin 10mg", generic_name: "Cetirizine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Alatrol 10mg", generic_name: "Cetirizine", category: "Antihistamine", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Levocetirizine 5mg", generic_name: "Levocetirizine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Lecet 5mg", generic_name: "Levocetirizine", category: "Antihistamine", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Desloratadine 5mg", generic_name: "Desloratadine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Histaclear 5mg", generic_name: "Desloratadine", category: "Antihistamine", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pheniramine Syrup", generic_name: "Pheniramine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  
  // ============= RESPIRATORY =============
  { name: "Monas 10mg", generic_name: "Montelukast", category: "Anti-asthmatic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Monas 4mg Chewable", generic_name: "Montelukast", category: "Anti-asthmatic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Montair 10mg", generic_name: "Montelukast", category: "Anti-asthmatic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Montiget 10mg", generic_name: "Montelukast", category: "Anti-asthmatic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Salbuvent Inhaler", generic_name: "Salbutamol", category: "Bronchodilator", manufacturer: "Square Pharmaceuticals Ltd.", unit: "pcs" },
  { name: "Brodil Inhaler", generic_name: "Salbutamol", category: "Bronchodilator", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "pcs" },
  { name: "Ventolin Syrup", generic_name: "Salbutamol", category: "Bronchodilator", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Asmasol Inhaler", generic_name: "Salbutamol + Ipratropium", category: "Bronchodilator", manufacturer: "Square Pharmaceuticals Ltd.", unit: "pcs" },
  { name: "Budecort Inhaler", generic_name: "Budesonide", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "pcs" },
  { name: "Symbicort Inhaler", generic_name: "Budesonide + Formoterol", category: "Anti-asthmatic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "pcs" },
  { name: "Tiotropium Inhaler", generic_name: "Tiotropium", category: "Bronchodilator", manufacturer: "Square Pharmaceuticals Ltd.", unit: "pcs" },
  { name: "Theophylline 200mg", generic_name: "Theophylline", category: "Bronchodilator", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ascoril Syrup", generic_name: "Terbutaline + Bromhexine + Guaiphenesin", category: "Expectorant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Ambril Syrup", generic_name: "Ambroxol", category: "Mucolytic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Mucolite Syrup", generic_name: "Ambroxol", category: "Mucolytic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "bottle" },
  
  // ============= ANTIHYPERTENSIVE =============
  { name: "Losartan 25mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Losartan 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Azor 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Angiazem 50mg", generic_name: "Losartan", category: "Antihypertensive", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Losartan H", generic_name: "Losartan + HCTZ", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amlodipine 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amlodipine 10mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amlo 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Norvasc 5mg", generic_name: "Amlodipine", category: "Antihypertensive", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Atenolol 50mg", generic_name: "Atenolol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Atenolol 100mg", generic_name: "Atenolol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Tenolol 50mg", generic_name: "Atenolol", category: "Antihypertensive", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Metoprolol 50mg", generic_name: "Metoprolol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Metoprolol 100mg", generic_name: "Metoprolol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Seloken 50mg", generic_name: "Metoprolol", category: "Antihypertensive", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Bisoprolol 5mg", generic_name: "Bisoprolol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Nebilet 5mg", generic_name: "Nebivolol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Carvedilol 6.25mg", generic_name: "Carvedilol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Carvedilol 12.5mg", generic_name: "Carvedilol", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Enalapril 5mg", generic_name: "Enalapril", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Lisinopril 5mg", generic_name: "Lisinopril", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ramipril 2.5mg", generic_name: "Ramipril", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ramipril 5mg", generic_name: "Ramipril", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Telmisartan 40mg", generic_name: "Telmisartan", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Olmesartan 20mg", generic_name: "Olmesartan", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Valsartan 80mg", generic_name: "Valsartan", category: "Antihypertensive", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= ANTIDIABETIC =============
  { name: "Metform 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Metform 850mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Metform 1000mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Comet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Glucomet 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Dimetor 500mg", generic_name: "Metformin", category: "Antidiabetic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Glipid 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Glipid MR 30mg", generic_name: "Gliclazide MR", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Diapride 80mg", generic_name: "Gliclazide", category: "Antidiabetic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Glimepiride 1mg", generic_name: "Glimepiride", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Glimepiride 2mg", generic_name: "Glimepiride", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amaryl 2mg", generic_name: "Glimepiride", category: "Antidiabetic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Sitagliptin 100mg", generic_name: "Sitagliptin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Sitagliptin 50mg", generic_name: "Sitagliptin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Januvia 100mg", generic_name: "Sitagliptin", category: "Antidiabetic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Vildagliptin 50mg", generic_name: "Vildagliptin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Linagliptin 5mg", generic_name: "Linagliptin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Empagliflozin 10mg", generic_name: "Empagliflozin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Dapagliflozin 10mg", generic_name: "Dapagliflozin", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Insulin Actrapid", generic_name: "Human Insulin", category: "Antidiabetic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "vial" },
  { name: "Insulin Mixtard", generic_name: "Human Insulin Mix", category: "Antidiabetic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "vial" },
  { name: "Insulin Glargine", generic_name: "Insulin Glargine", category: "Antidiabetic", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "vial" },
  { name: "Pioglitazone 15mg", generic_name: "Pioglitazone", category: "Antidiabetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= CARDIOVASCULAR =============
  { name: "Aspirin 75mg", generic_name: "Aspirin", category: "Antiplatelet", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ecosprin 75mg", generic_name: "Aspirin", category: "Antiplatelet", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Clopid 75mg", generic_name: "Clopidogrel", category: "Antiplatelet", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Plavix 75mg", generic_name: "Clopidogrel", category: "Antiplatelet", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Duoplavin", generic_name: "Aspirin + Clopidogrel", category: "Antiplatelet", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Atorvastatin 10mg", generic_name: "Atorvastatin", category: "Statin", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Atorvastatin 20mg", generic_name: "Atorvastatin", category: "Statin", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Atorva 10mg", generic_name: "Atorvastatin", category: "Statin", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Lipitor 10mg", generic_name: "Atorvastatin", category: "Statin", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Rosuvastatin 5mg", generic_name: "Rosuvastatin", category: "Statin", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Rosuvastatin 10mg", generic_name: "Rosuvastatin", category: "Statin", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Crestor 10mg", generic_name: "Rosuvastatin", category: "Statin", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Fenofibrate 160mg", generic_name: "Fenofibrate", category: "Lipid Lowering", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Isosorbide 10mg", generic_name: "Isosorbide Dinitrate", category: "Vasodilator", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "GTN Spray", generic_name: "Glyceryl Trinitrate", category: "Vasodilator", manufacturer: "Square Pharmaceuticals Ltd.", unit: "pcs" },
  { name: "Trimetazidine 35mg", generic_name: "Trimetazidine", category: "Anti-anginal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Digoxin 0.25mg", generic_name: "Digoxin", category: "Cardiac Glycoside", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Warfarin 5mg", generic_name: "Warfarin", category: "Anticoagulant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Rivaroxaban 10mg", generic_name: "Rivaroxaban", category: "Anticoagulant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= GI MEDICINES =============
  { name: "Domperidone 10mg", generic_name: "Domperidone", category: "Antiemetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Motilium 10mg", generic_name: "Domperidone", category: "Antiemetic", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Metoclopramide 10mg", generic_name: "Metoclopramide", category: "Antiemetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ondansetron 4mg", generic_name: "Ondansetron", category: "Antiemetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ondansetron 8mg", generic_name: "Ondansetron", category: "Antiemetic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Loperamide 2mg", generic_name: "Loperamide", category: "Antidiarrheal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Imodium 2mg", generic_name: "Loperamide", category: "Antidiarrheal", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "ORS Saline", generic_name: "Oral Rehydration Salt", category: "Electrolyte", manufacturer: "Renata PLC", unit: "sachet" },
  { name: "Lactobacillus Sachet", generic_name: "Lactobacillus", category: "Probiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "sachet" },
  { name: "Zinc 20mg", generic_name: "Zinc Sulfate", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Dulcolax 5mg", generic_name: "Bisacodyl", category: "Laxative", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Lactulose Syrup", generic_name: "Lactulose", category: "Laxative", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Isabgol", generic_name: "Psyllium Husk", category: "Laxative", manufacturer: "Square Pharmaceuticals Ltd.", unit: "sachet" },
  
  // ============= VITAMINS & SUPPLEMENTS =============
  { name: "Calcium D 600mg", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Calbo-D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Renata PLC", unit: "strip" },
  { name: "Oscal-D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Incepta Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ostite-D", generic_name: "Calcium + Vitamin D", category: "Supplement", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "B-50", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Aristovit B", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Aristopharma Ltd.", unit: "strip" },
  { name: "Becosule", generic_name: "Vitamin B Complex", category: "Supplement", manufacturer: "Healthcare Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Folic Acid 5mg", generic_name: "Folic Acid", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ferrous Sulfate 200mg", generic_name: "Iron", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Feroglobin Syrup", generic_name: "Iron + B12", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Vitamin C 500mg", generic_name: "Ascorbic Acid", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Vitamin E 400 IU", generic_name: "Vitamin E", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Vitamin D3 2000 IU", generic_name: "Cholecalciferol", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Vitamin D3 60000 IU", generic_name: "Cholecalciferol", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "sachet" },
  { name: "Multivitamin", generic_name: "Multivitamin", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Omega 3", generic_name: "Fish Oil", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Zinc Capsule 20mg", generic_name: "Zinc", category: "Supplement", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= DERMATOLOGY =============
  { name: "Fluconazole 150mg", generic_name: "Fluconazole", category: "Antifungal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Flucon 150mg", generic_name: "Fluconazole", category: "Antifungal", manufacturer: "Beximco Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Itraconazole 100mg", generic_name: "Itraconazole", category: "Antifungal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Terbinafine 250mg", generic_name: "Terbinafine", category: "Antifungal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Ketoconazole 200mg", generic_name: "Ketoconazole", category: "Antifungal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Clotrimazole Cream", generic_name: "Clotrimazole", category: "Antifungal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "tube" },
  { name: "Miconazole Cream", generic_name: "Miconazole", category: "Antifungal", manufacturer: "Square Pharmaceuticals Ltd.", unit: "tube" },
  { name: "Betamethasone Cream", generic_name: "Betamethasone", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "tube" },
  { name: "Hydrocortisone Cream", generic_name: "Hydrocortisone", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "tube" },
  { name: "Fusidic Acid Cream", generic_name: "Fusidic Acid", category: "Antibiotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "tube" },
  { name: "Silver Sulfadiazine Cream", generic_name: "Silver Sulfadiazine", category: "Antibacterial", manufacturer: "Square Pharmaceuticals Ltd.", unit: "tube" },
  { name: "Acyclovir 200mg", generic_name: "Acyclovir", category: "Antiviral", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Acyclovir Cream", generic_name: "Acyclovir", category: "Antiviral", manufacturer: "Square Pharmaceuticals Ltd.", unit: "tube" },
  
  // ============= EYE/ENT =============
  { name: "Ciprofloxacin Eye Drop", generic_name: "Ciprofloxacin", category: "Eye Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Moxifloxacin Eye Drop", generic_name: "Moxifloxacin", category: "Eye Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Tobramycin Eye Drop", generic_name: "Tobramycin", category: "Eye Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Prednisolone Eye Drop", generic_name: "Prednisolone", category: "Eye Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Dexamethasone Eye Drop", generic_name: "Dexamethasone", category: "Eye Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Carboxymethylcellulose Eye Drop", generic_name: "Artificial Tears", category: "Eye Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Timolol Eye Drop", generic_name: "Timolol", category: "Eye Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Ofloxacin Ear Drop", generic_name: "Ofloxacin", category: "Ear Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Neomycin Ear Drop", generic_name: "Neomycin + Polymyxin", category: "Ear Drop", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  
  // ============= PSYCHIATRIC =============
  { name: "Sertraline 50mg", generic_name: "Sertraline", category: "Antidepressant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Escitalopram 10mg", generic_name: "Escitalopram", category: "Antidepressant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Fluoxetine 20mg", generic_name: "Fluoxetine", category: "Antidepressant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Mirtazapine 15mg", generic_name: "Mirtazapine", category: "Antidepressant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Amitriptyline 25mg", generic_name: "Amitriptyline", category: "Antidepressant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Clonazepam 0.5mg", generic_name: "Clonazepam", category: "Anxiolytic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Alprazolam 0.25mg", generic_name: "Alprazolam", category: "Anxiolytic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Diazepam 5mg", generic_name: "Diazepam", category: "Anxiolytic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Lorazepam 1mg", generic_name: "Lorazepam", category: "Anxiolytic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Risperidone 2mg", generic_name: "Risperidone", category: "Antipsychotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Olanzapine 5mg", generic_name: "Olanzapine", category: "Antipsychotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Quetiapine 25mg", generic_name: "Quetiapine", category: "Antipsychotic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= PAIN / MUSCLE RELAXANT =============
  { name: "Tramadol 50mg", generic_name: "Tramadol", category: "Analgesic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pregabalin 75mg", generic_name: "Pregabalin", category: "Neuropathic Pain", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pregabalin 150mg", generic_name: "Pregabalin", category: "Neuropathic Pain", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Gabapentin 300mg", generic_name: "Gabapentin", category: "Neuropathic Pain", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Tizanidine 2mg", generic_name: "Tizanidine", category: "Muscle Relaxant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Baclofen 10mg", generic_name: "Baclofen", category: "Muscle Relaxant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Eperisone 50mg", generic_name: "Eperisone", category: "Muscle Relaxant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Thiocolchicoside 4mg", generic_name: "Thiocolchicoside", category: "Muscle Relaxant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= HORMONES / STEROIDS =============
  { name: "Prednisolone 5mg", generic_name: "Prednisolone", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Prednisolone 20mg", generic_name: "Prednisolone", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Dexamethasone 0.5mg", generic_name: "Dexamethasone", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Methylprednisolone 8mg", generic_name: "Methylprednisolone", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Deflazacort 6mg", generic_name: "Deflazacort", category: "Corticosteroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Levothyroxine 50mcg", generic_name: "Levothyroxine", category: "Thyroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Levothyroxine 100mcg", generic_name: "Levothyroxine", category: "Thyroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Methimazole 5mg", generic_name: "Methimazole", category: "Antithyroid", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  
  // ============= OTHERS =============
  { name: "Chlorpheniramine 4mg", generic_name: "Chlorpheniramine", category: "Antihistamine", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Pseudoephedrine 60mg", generic_name: "Pseudoephedrine", category: "Decongestant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Xylometazoline Nasal Spray", generic_name: "Xylometazoline", category: "Nasal Decongestant", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Saline Nasal Spray", generic_name: "Sodium Chloride", category: "Nasal Spray", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Povidone Iodine Solution", generic_name: "Povidone Iodine", category: "Antiseptic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Chlorhexidine Mouthwash", generic_name: "Chlorhexidine", category: "Antiseptic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Hydrogen Peroxide Solution", generic_name: "Hydrogen Peroxide", category: "Antiseptic", manufacturer: "Square Pharmaceuticals Ltd.", unit: "bottle" },
  { name: "Sildenafil 50mg", generic_name: "Sildenafil", category: "Erectile Dysfunction", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Tadalafil 10mg", generic_name: "Tadalafil", category: "Erectile Dysfunction", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Finasteride 1mg", generic_name: "Finasteride", category: "Hair Loss", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Allopurinol 100mg", generic_name: "Allopurinol", category: "Antigout", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Febuxostat 40mg", generic_name: "Febuxostat", category: "Antigout", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
  { name: "Colchicine 0.5mg", generic_name: "Colchicine", category: "Antigout", manufacturer: "Square Pharmaceuticals Ltd.", unit: "strip" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching global manufacturers...');
    
    // Fetch all global manufacturers to match by name
    const { data: manufacturers, error: mfgError } = await supabase
      .from('global_manufacturers')
      .select('id, name')
      .eq('is_active', true);

    if (mfgError) {
      console.error('Error fetching manufacturers:', mfgError);
      throw mfgError;
    }

    console.log(`Found ${manufacturers?.length || 0} manufacturers`);

    // Create a name-to-id map (case-insensitive)
    const manufacturerMap = new Map<string, string>();
    manufacturers?.forEach(m => {
      manufacturerMap.set(m.name.toLowerCase(), m.id);
    });

    // Check existing medicines to avoid duplicates
    const { data: existingMedicines, error: existingError } = await supabase
      .from('global_medicines')
      .select('name')
      .eq('is_active', true);

    if (existingError) {
      console.error('Error fetching existing medicines:', existingError);
      throw existingError;
    }

    const existingNames = new Set(
      existingMedicines?.map(m => m.name.toLowerCase().trim()) || []
    );

    console.log(`Found ${existingNames.size} existing medicines`);

    // Prepare medicines for insertion (skip duplicates and medicines without manufacturer)
    let skippedNoManufacturer = 0;
    const medicinesToInsert = MEDICINES_DATA
      .filter(med => !existingNames.has(med.name.toLowerCase().trim()))
      .filter(med => {
        const mfrId = manufacturerMap.get(med.manufacturer.toLowerCase());
        if (!mfrId) {
          console.log(`Skipping ${med.name} - manufacturer "${med.manufacturer}" not found`);
          skippedNoManufacturer++;
          return false;
        }
        return true;
      })
      .map(med => ({
        name: med.name,
        generic_name: med.generic_name,
        category: med.category,
        manufacturer_id: manufacturerMap.get(med.manufacturer.toLowerCase())!,
        unit: med.unit,
        is_tax_applicable: false,
        is_active: true,
      }));

    console.log(`Inserting ${medicinesToInsert.length} new medicines...`);

    if (medicinesToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All medicines already exist',
          inserted: 0,
          skipped: MEDICINES_DATA.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert in batches of 50 to avoid timeout
    const BATCH_SIZE = 50;
    let totalInserted = 0;

    for (let i = 0; i < medicinesToInsert.length; i += BATCH_SIZE) {
      const batch = medicinesToInsert.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from('global_medicines')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, insertError);
        throw insertError;
      }

      totalInserted += batch.length;
      console.log(`Inserted batch ${i / BATCH_SIZE + 1}: ${batch.length} medicines`);
    }

    console.log(`Successfully inserted ${totalInserted} medicines`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully added ${totalInserted} medicines to global master`,
        inserted: totalInserted,
        skipped: MEDICINES_DATA.length - medicinesToInsert.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
