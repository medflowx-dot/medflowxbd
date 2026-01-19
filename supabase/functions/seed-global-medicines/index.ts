import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Complete Bangladesh medicine master data - 250+ commonly used medicines
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
      existingMedicines?.map(m => m.name.toLowerCase()) || []
    );

    console.log(`Found ${existingNames.size} existing medicines`);

    // Prepare medicines for insertion (skip duplicates)
    const medicinesToInsert = MEDICINES_DATA
      .filter(med => !existingNames.has(med.name.toLowerCase()))
      .map(med => ({
        name: med.name,
        generic_name: med.generic_name,
        category: med.category,
        manufacturer_id: manufacturerMap.get(med.manufacturer.toLowerCase()) || null,
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
