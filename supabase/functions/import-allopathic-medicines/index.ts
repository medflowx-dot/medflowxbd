import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common allopathic medicines from Bangladesh (name, generic_name, category, manufacturer)
const ALLOPATHIC_MEDICINES = [
  // Analgesics & Antipyretics
  { name: "Napa", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napa Extra", generic_name: "Paracetamol + Caffeine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napa Extend", generic_name: "Paracetamol", category: "Tablet (Extended Release)", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ace", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ace Plus", generic_name: "Paracetamol + Caffeine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Renova", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Pyrenol", generic_name: "Paracetamol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Apo", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  { name: "Reset", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Healthcare Pharmaceuticals Ltd." },
  { name: "Fast", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Eskayef Pharmaceuticals Ltd." },
  { name: "Fevral", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // NSAIDs
  { name: "Tofen", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Inflam", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ibufen", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Profen", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Napro", generic_name: "Naproxen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Xenapro", generic_name: "Naproxen", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napryn", generic_name: "Naproxen", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  { name: "Clofenac", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Voltalin", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Diclofen", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Defnac", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ketorol", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Toradol", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Torax", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Etorix", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Coxin", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Torko", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Aceclofenac", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Acefen", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Antibiotics - Penicillins
  { name: "Moxacil", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amoxil", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Tycil", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Fimoxyl", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Moxilen", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Aristopharma Ltd." },
  { name: "Moxclav", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clavulin", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fimoxyclav", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clavam", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pen-V", generic_name: "Phenoxymethylpenicillin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flupen", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fluclox", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Antibiotics - Cephalosporins
  { name: "Cef-3", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Triax", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Axon", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Renata Limited" },
  { name: "Traxon", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cefdox", generic_name: "Cefixime", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cef-X", generic_name: "Cefixime", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fixim", generic_name: "Cefixime", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Cefim", generic_name: "Cefixime", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cephradine", generic_name: "Cephradine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cephin", generic_name: "Cephradine", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lebac", generic_name: "Cephradine", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cefurox", generic_name: "Cefuroxime", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zinacef", generic_name: "Cefuroxime", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Furoxim", generic_name: "Cefuroxime", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Cefpodox", generic_name: "Cefpodoxime", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Podox", generic_name: "Cefpodoxime", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Antibiotics - Macrolides
  { name: "Zimax", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Azith", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Azithrocin", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Zithrin", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Azilide", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  { name: "Azicin", generic_name: "Azithromycin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Eromycin", generic_name: "Erythromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Erythin", generic_name: "Erythromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clarith", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Claricin", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Claritt", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antibiotics - Fluoroquinolones
  { name: "Ciprocin", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cipro-A", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Neofloxin", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ciprox", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Levoflox", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Levox", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Levoday", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levorin", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Moflox", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Moxibac", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Oflox", generic_name: "Ofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Oflodin", generic_name: "Ofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antibiotics - Others
  { name: "Doxy-A", generic_name: "Doxycycline", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Doxycap", generic_name: "Doxycycline", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Doxin", generic_name: "Doxycycline", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Metronid", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flagyl", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Amodis", generic_name: "Metronidazole", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Metryl", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Linco", generic_name: "Lincomycin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clinda", generic_name: "Clindamycin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clindacin", generic_name: "Clindamycin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Nitrofur", generic_name: "Nitrofurantoin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Uro-Q", generic_name: "Nitrofurantoin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antacids & PPIs
  { name: "Seclo", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losectil", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Omenix", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Omep", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Sergel", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nexum", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Esoral", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Esomep", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Pantonix", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Panto", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Pantid", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Lanso", generic_name: "Lansoprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lansec", generic_name: "Lansoprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rabe", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rabium", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Antacid", generic_name: "Aluminium Hydroxide + Magnesium Hydroxide", category: "Suspension", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Antacil", generic_name: "Aluminium Hydroxide + Magnesium Hydroxide", category: "Suspension", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ranitid", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neotac", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Famotid", generic_name: "Famotidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Famotab", generic_name: "Famotidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antihistamines & Antiallergics
  { name: "Histacin", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Alatrol", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cetiriz", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cetzin", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Fexo", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Telfast", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Fexofen", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fexofast", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Loratyn", generic_name: "Loratadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Claritin", generic_name: "Loratadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lora", generic_name: "Loratadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levorid", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lecet", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Desloratadine", generic_name: "Desloratadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Deslorin", generic_name: "Desloratadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pheniramine", generic_name: "Pheniramine Maleate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Adamine", generic_name: "Chlorpheniramine Maleate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Piriton", generic_name: "Chlorpheniramine Maleate", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Montelukast", generic_name: "Montelukast", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Montair", generic_name: "Montelukast", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Monas", generic_name: "Montelukast", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antidiabetics
  { name: "Glucomet", generic_name: "Metformin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Comet", generic_name: "Metformin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bigomet", generic_name: "Metformin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Informet", generic_name: "Metformin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Gliclazide", generic_name: "Gliclazide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Glipid", generic_name: "Gliclazide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Diapride", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Glimepin", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glimep", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Linagliptin", generic_name: "Linagliptin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Linag", generic_name: "Linagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sitagliptin", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sitanorm", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vildagliptin", generic_name: "Vildagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dapagliflozin", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dapaflo", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Empagliflozin", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pioglitazone", generic_name: "Pioglitazone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Piolit", generic_name: "Pioglitazone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Insulin Mixtard", generic_name: "Insulin Human (Biphasic)", category: "Injection", manufacturer: "Novo Nordisk" },
  { name: "Insulin Actrapid", generic_name: "Insulin Human (Regular)", category: "Injection", manufacturer: "Novo Nordisk" },
  { name: "Insulin Glargine", generic_name: "Insulin Glargine", category: "Injection", manufacturer: "Sanofi Bangladesh Ltd." },
  
  // Cardiovascular - Antihypertensives
  { name: "Amdocal", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amlopin", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amlong", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Amlosyn", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Angilock", generic_name: "Atenolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tenoloc", generic_name: "Atenolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Atenol", generic_name: "Atenolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Bisop", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Biscard", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bisolol", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Metolar", generic_name: "Metoprolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Metpro", generic_name: "Metoprolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Nebilet", generic_name: "Nebivolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nebis", generic_name: "Nebivolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Carvedilol", generic_name: "Carvedilol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Carvid", generic_name: "Carvedilol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Losart", generic_name: "Losartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losar", generic_name: "Losartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Losatan", generic_name: "Losartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Olmesan", generic_name: "Olmesartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Olme", generic_name: "Olmesartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Telmis", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Telsar", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Valsart", generic_name: "Valsartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Valsan", generic_name: "Valsartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Lisin", generic_name: "Lisinopril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sinopril", generic_name: "Lisinopril", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ramip", generic_name: "Ramipril", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ramace", generic_name: "Ramipril", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Enalap", generic_name: "Enalapril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Enapril", generic_name: "Enalapril", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Diuretics
  { name: "Lasix", generic_name: "Furosemide", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Furomax", generic_name: "Furosemide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fusid", generic_name: "Furosemide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Thiazide", generic_name: "Hydrochlorothiazide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Spironolactone", generic_name: "Spironolactone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Aldactone", generic_name: "Spironolactone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Indap", generic_name: "Indapamide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Lipid Lowering
  { name: "Atova", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atorva", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Torvast", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Atorin", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Rosuva", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rosuvast", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rosustat", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Simva", generic_name: "Simvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Simvatin", generic_name: "Simvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fenofib", generic_name: "Fenofibrate", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fenostat", generic_name: "Fenofibrate", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Anticoagulants & Antiplatelets
  { name: "Ecosprin", generic_name: "Aspirin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Disprin", generic_name: "Aspirin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aspirin", generic_name: "Aspirin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Clopid", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Plagril", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Plavix", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Clopilet", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Warfarin", generic_name: "Warfarin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rivarox", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Xarelto", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Bayer" },
  { name: "Dabigatran", generic_name: "Dabigatran", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Apixaban", generic_name: "Apixaban", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Heparin", generic_name: "Heparin", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Enoxaparin", generic_name: "Enoxaparin", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Corticosteroids
  { name: "Prednil", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Deltasone", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Defcort", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Defnalone", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Decason", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dexona", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Hydrocort", generic_name: "Hydrocortisone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Methylpred", generic_name: "Methylprednisolone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Betnelan", generic_name: "Betamethasone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Betamet", generic_name: "Betamethasone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Respiratory
  { name: "Salbut", generic_name: "Salbutamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ventolin", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Asthalin", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Brodil", generic_name: "Salbutamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Theophyl", generic_name: "Theophylline", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Theovent", generic_name: "Theophylline", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Budecort", generic_name: "Budesonide", category: "Inhaler", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Forate", generic_name: "Formoterol + Budesonide", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Seretide", generic_name: "Salmeterol + Fluticasone", category: "Inhaler", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Symbicort", generic_name: "Formoterol + Budesonide", category: "Inhaler", manufacturer: "AstraZeneca" },
  { name: "Tiotropium", generic_name: "Tiotropium", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ipravent", generic_name: "Ipratropium", category: "Inhaler", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Cough & Cold
  { name: "Adovas", generic_name: "Vasakarista", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tuspel", generic_name: "Dextromethorphan + Phenylephrine", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cofnil", generic_name: "Dextromethorphan", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ambex", generic_name: "Ambroxol", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mucolex", generic_name: "Ambroxol", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bromhex", generic_name: "Bromhexine", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mucolyt", generic_name: "Bromhexine", category: "Syrup", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Guaifenesin", generic_name: "Guaifenesin", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Vitamins & Minerals
  { name: "Filwel", generic_name: "Multivitamin + Minerals", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Growel", generic_name: "Multivitamin + Minerals", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Biovit", generic_name: "Multivitamin + Minerals", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Nutrivit", generic_name: "Multivitamin", category: "Syrup", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "B-Plex", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Becosule", generic_name: "Vitamin B Complex", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Neurobion", generic_name: "Vitamin B1 + B6 + B12", category: "Tablet", manufacturer: "Merck" },
  { name: "Calbo-D", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Caldical", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Calci-D", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "D-Rise", generic_name: "Vitamin D3", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "D-Sunny", generic_name: "Vitamin D3", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ostocare", generic_name: "Calcium + Vitamin D + Minerals", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  { name: "Feroglobin", generic_name: "Iron + Folic Acid + B12", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Feron", generic_name: "Iron + Folic Acid", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fefol", generic_name: "Iron + Folic Acid", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Zinvit-C", generic_name: "Zinc + Vitamin C", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "C-Vit", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cevit", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Evit", generic_name: "Vitamin E", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zinc", generic_name: "Zinc Sulfate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zincovit", generic_name: "Zinc + Vitamin C + Vitamin D", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // GI Medications
  { name: "Dometon", generic_name: "Domperidone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Domstal", generic_name: "Domperidone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Omidon", generic_name: "Domperidone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Maxolon", generic_name: "Metoclopramide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Perinorm", generic_name: "Metoclopramide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ondansetron", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Vomilux", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Emeset", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Loperamide", generic_name: "Loperamide", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lopamide", generic_name: "Loperamide", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Imodium", generic_name: "Loperamide", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Lactulose", generic_name: "Lactulose", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Duphalac", generic_name: "Lactulose", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bisacodyl", generic_name: "Bisacodyl", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dulcolax", generic_name: "Bisacodyl", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antifungals
  { name: "Flucon", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Diflucan", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Flucor", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Itacon", generic_name: "Itraconazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Itracon", generic_name: "Itraconazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ketocon", generic_name: "Ketoconazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nizoral", generic_name: "Ketoconazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clotrim", generic_name: "Clotrimazole", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Canesten", generic_name: "Clotrimazole", category: "Cream", manufacturer: "Bayer" },
  { name: "Terbin", generic_name: "Terbinafine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lamisil", generic_name: "Terbinafine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Griseofulvin", generic_name: "Griseofulvin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nystatin", generic_name: "Nystatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antivirals
  { name: "Acyclovir", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zovirax", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Virux", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Valcivir", generic_name: "Valacyclovir", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Oseltamivir", generic_name: "Oseltamivir", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tamiflu", generic_name: "Oseltamivir", category: "Capsule", manufacturer: "Roche" },
  { name: "Ribavirin", generic_name: "Ribavirin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Sofosbuvir", generic_name: "Sofosbuvir", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sofovir", generic_name: "Sofosbuvir", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Psychotropic Medications
  { name: "Amitril", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Elavil", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Sertraline", generic_name: "Sertraline", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Serta", generic_name: "Sertraline", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Fluox", generic_name: "Fluoxetine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Prozac", generic_name: "Fluoxetine", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Escitalo", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lexapro", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Venlafax", generic_name: "Venlafaxine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mirtaz", generic_name: "Mirtazapine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Sedil", generic_name: "Diazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Valium", generic_name: "Diazepam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clonazep", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rivotril", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Alprazol", generic_name: "Alprazolam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Alprax", generic_name: "Alprazolam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lorazep", generic_name: "Lorazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Olanza", generic_name: "Olanzapine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zyprexa", generic_name: "Olanzapine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Risperid", generic_name: "Risperidone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Risperdal", generic_name: "Risperidone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Quetiap", generic_name: "Quetiapine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Aripiprazole", generic_name: "Aripiprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Haloperidol", generic_name: "Haloperidol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Anticonvulsants
  { name: "Epilex", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Valpro", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tegral", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Carbatol", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Phenytoin", generic_name: "Phenytoin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dilantin", generic_name: "Phenytoin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Gabapen", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neurontin", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Pregab", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lyrica", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levera", generic_name: "Levetiracetam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Keppra", generic_name: "Levetiracetam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lamotrig", generic_name: "Lamotrigine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Phenobarb", generic_name: "Phenobarbital", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Eye & Ear Drops
  { name: "Moxiflox Eye", generic_name: "Moxifloxacin", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Occuflox", generic_name: "Ofloxacin", category: "Eye Drop", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vigamox", generic_name: "Moxifloxacin", category: "Eye Drop", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tobradex", generic_name: "Tobramycin + Dexamethasone", category: "Eye Drop", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Tears Plus", generic_name: "Artificial Tears", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Refresh", generic_name: "Carboxymethylcellulose", category: "Eye Drop", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Gentacin Eye", generic_name: "Gentamicin", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ciproflox Eye", generic_name: "Ciprofloxacin", category: "Eye Drop", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Predfort", generic_name: "Prednisolone Acetate", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Otrivin", generic_name: "Xylometazoline", category: "Nasal Drop", manufacturer: "Novartis" },
  { name: "Nasivion", generic_name: "Oxymetazoline", category: "Nasal Drop", manufacturer: "Merck" },
  { name: "Flonase", generic_name: "Fluticasone", category: "Nasal Spray", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  
  // Dermatological
  { name: "Betnovate", generic_name: "Betamethasone", category: "Cream", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Clobetasol", generic_name: "Clobetasol Propionate", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dermovate", generic_name: "Clobetasol Propionate", category: "Cream", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Hydrocort Cream", generic_name: "Hydrocortisone", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mometasone", generic_name: "Mometasone Furoate", category: "Cream", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Fusidic Cream", generic_name: "Fusidic Acid", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fucidin", generic_name: "Fusidic Acid", category: "Cream", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Mupirocin", generic_name: "Mupirocin", category: "Ointment", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Bactroban", generic_name: "Mupirocin", category: "Ointment", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Acne Gel", generic_name: "Benzoyl Peroxide", category: "Gel", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tretinoin", generic_name: "Tretinoin", category: "Cream", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Permethrin", generic_name: "Permethrin", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Muscle Relaxants
  { name: "Myoril", generic_name: "Thiocolchicoside", category: "Capsule", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Thiocol", generic_name: "Thiocolchicoside", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tizanid", generic_name: "Tizanidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sirdalud", generic_name: "Tizanidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Baclofen", generic_name: "Baclofen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tolperi", generic_name: "Tolperisone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Eperison", generic_name: "Eperisone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Thyroid
  { name: "Thyrox", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Eltroxin", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Thyronorm", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Thyrocab", generic_name: "Carbimazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neomercazole", generic_name: "Carbimazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Propylthiouracil", generic_name: "Propylthiouracil", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Urologicals
  { name: "Tamsu", generic_name: "Tamsulosin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flomax", generic_name: "Tamsulosin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Urimax", generic_name: "Tamsulosin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sildenafil", generic_name: "Sildenafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Viagra", generic_name: "Sildenafil", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Tadalafil", generic_name: "Tadalafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cialis", generic_name: "Tadalafil", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Alfuzosin", generic_name: "Alfuzosin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Finasteride", generic_name: "Finasteride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Proscar", generic_name: "Finasteride", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dutasteride", generic_name: "Dutasteride", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Hormones & Contraceptives
  { name: "Provera", generic_name: "Medroxyprogesterone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Primolut-N", generic_name: "Norethisterone", category: "Tablet", manufacturer: "Bayer" },
  { name: "Norethist", generic_name: "Norethisterone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mala-D", generic_name: "Levonorgestrel + Ethinyl Estradiol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ovral-L", generic_name: "Levonorgestrel + Ethinyl Estradiol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Marvelon", generic_name: "Desogestrel + Ethinyl Estradiol", category: "Tablet", manufacturer: "Organon" },
  { name: "Nordette", generic_name: "Levonorgestrel + Ethinyl Estradiol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Diane-35", generic_name: "Cyproterone + Ethinyl Estradiol", category: "Tablet", manufacturer: "Bayer" },
  { name: "Postinor", generic_name: "Levonorgestrel", category: "Tablet", manufacturer: "Gedeon Richter" },
  { name: "I-Pill", generic_name: "Levonorgestrel", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clomid", generic_name: "Clomiphene Citrate", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clomifene", generic_name: "Clomiphene Citrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Anti-Gout
  { name: "Zyloric", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Allop", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Purinol", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Febuxostat", generic_name: "Febuxostat", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Uloric", generic_name: "Febuxostat", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Colchicine", generic_name: "Colchicine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Antiparasitics
  { name: "Albend", generic_name: "Albendazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zentel", generic_name: "Albendazole", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Vermox", generic_name: "Mebendazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Mebex", generic_name: "Mebendazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ivermectin", generic_name: "Ivermectin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Stromectol", generic_name: "Ivermectin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Praziquantel", generic_name: "Praziquantel", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Importing allopathic medicines...');
    console.log(`Total medicines to import: ${ALLOPATHIC_MEDICINES.length}`);

    // Get all global manufacturers for mapping
    const { data: manufacturers, error: mfgError } = await supabase
      .from('global_manufacturers')
      .select('id, name')
      .eq('is_active', true);

    if (mfgError) {
      console.error('Error fetching manufacturers:', mfgError);
      throw mfgError;
    }

    // Create manufacturer name to ID map (case-insensitive)
    const manufacturerMap = new Map<string, string>();
    (manufacturers || []).forEach(m => {
      manufacturerMap.set(m.name.toLowerCase(), m.id);
    });

    console.log(`Found ${manufacturerMap.size} manufacturers for mapping`);

    // Get existing medicines to avoid duplicates
    const { data: existingMedicines, error: fetchError } = await supabase
      .from('global_medicines')
      .select('name')
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching existing medicines:', fetchError);
      throw fetchError;
    }

    const existingNames = new Set(
      (existingMedicines || []).map(m => m.name.toLowerCase())
    );

    // Filter out duplicates and prepare for insert
    const newMedicines = ALLOPATHIC_MEDICINES
      .filter(med => !existingNames.has(med.name.toLowerCase()))
      .map(med => ({
        name: med.name,
        generic_name: med.generic_name,
        category: med.category,
        manufacturer_id: manufacturerMap.get(med.manufacturer.toLowerCase()) || null,
        unit: 'pcs',
        is_tax_applicable: false,
        is_active: true,
      }));

    console.log(`New medicines to add: ${newMedicines.length}`);
    console.log(`Skipping ${ALLOPATHIC_MEDICINES.length - newMedicines.length} existing medicines`);

    let inserted = 0;
    const skipped = ALLOPATHIC_MEDICINES.length - newMedicines.length;

    if (newMedicines.length > 0) {
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < newMedicines.length; i += batchSize) {
        const batch = newMedicines.slice(i, i + batchSize);
        const { data: insertedData, error: insertError } = await supabase
          .from('global_medicines')
          .insert(batch)
          .select();

        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
          throw insertError;
        }

        inserted += insertedData?.length || 0;
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedData?.length} medicines`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        total: ALLOPATHIC_MEDICINES.length,
        message: `${inserted} allopathic medicines imported, ${skipped} already existed`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error importing medicines:', error);
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
