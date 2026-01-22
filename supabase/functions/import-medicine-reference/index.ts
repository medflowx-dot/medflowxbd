import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive medicine database - 500+ medicines from Bangladesh market
const MEDICINES_DATA = [
  // ========== ANALGESICS / ANTIPYRETICS ==========
  { name: 'Napa 500mg Tablet', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10x10', indication: 'Fever, Headache, Body pain', drug_class: 'Analgesic' },
  { name: 'Napa Extra Tablet', generic_name: 'Paracetamol + Caffeine', dosage_form: 'Tablet', strength: '500mg+65mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10x10', indication: 'Migraine, Headache', drug_class: 'Analgesic' },
  { name: 'Napa Extend 665mg', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '665mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10x6', indication: 'Extended pain relief', drug_class: 'Analgesic' },
  { name: 'Napa Syrup 60ml', generic_name: 'Paracetamol', dosage_form: 'Syrup', strength: '120mg/5ml', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 35.00, strip_price: null, pack_size: '60ml', indication: 'Fever in children', drug_class: 'Analgesic' },
  { name: 'Napa Rapid 500mg', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10x10', indication: 'Fast pain relief', drug_class: 'Analgesic' },
  { name: 'Ace 500mg Tablet', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10x10', indication: 'Fever, Pain', drug_class: 'Analgesic' },
  { name: 'Ace Plus Tablet', generic_name: 'Paracetamol + Caffeine', dosage_form: 'Tablet', strength: '500mg+65mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.50, strip_price: 45.00, pack_size: '10x10', indication: 'Headache, Migraine', drug_class: 'Analgesic' },
  { name: 'Ace Syrup 60ml', generic_name: 'Paracetamol', dosage_form: 'Syrup', strength: '120mg/5ml', manufacturer_name: 'Square Pharmaceuticals', unit_price: 30.00, strip_price: null, pack_size: '60ml', indication: 'Fever in children', drug_class: 'Analgesic' },
  { name: 'Fast 500mg Tablet', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'ACI Limited', unit_price: 2.00, strip_price: 20.00, pack_size: '10x10', indication: 'Fever, Pain', drug_class: 'Analgesic' },
  { name: 'Reset 500mg Tablet', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Renata PLC', unit_price: 2.50, strip_price: 25.00, pack_size: '10x10', indication: 'Fever, Pain', drug_class: 'Analgesic' },
  { name: 'Pyrenol 500mg Tablet', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10x10', indication: 'Fever, Pain', drug_class: 'Analgesic' },
  { name: 'Renova 500mg Tablet', generic_name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Healthcare Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10x10', indication: 'Fever, Pain', drug_class: 'Analgesic' },

  // NSAIDs
  { name: 'Nurofen 400mg Tablet', generic_name: 'Ibuprofen', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Reckitt Benckiser', unit_price: 8.00, strip_price: 80.00, pack_size: '10x10', indication: 'Pain, Inflammation', drug_class: 'NSAID' },
  { name: 'Ibufen 400mg Tablet', generic_name: 'Ibuprofen', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10x10', indication: 'Pain, Inflammation', drug_class: 'NSAID' },
  { name: 'Profen 400mg Tablet', generic_name: 'Ibuprofen', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10x10', indication: 'Pain, Inflammation', drug_class: 'NSAID' },
  { name: 'Flamex 50mg Tablet', generic_name: 'Diclofenac Sodium', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10x10', indication: 'Arthritis, Pain', drug_class: 'NSAID' },
  { name: 'Diclofen 50mg Tablet', generic_name: 'Diclofenac Sodium', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10x10', indication: 'Arthritis, Pain', drug_class: 'NSAID' },
  { name: 'Voltalin 50mg Tablet', generic_name: 'Diclofenac Sodium', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Novartis', unit_price: 6.00, strip_price: 60.00, pack_size: '10x10', indication: 'Pain, Inflammation', drug_class: 'NSAID' },
  { name: 'Naprox 500mg Tablet', generic_name: 'Naproxen', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10x10', indication: 'Arthritis, Gout', drug_class: 'NSAID' },
  { name: 'Anaflex 500mg Tablet', generic_name: 'Naproxen', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 5.50, strip_price: 55.00, pack_size: '10x10', indication: 'Arthritis, Pain', drug_class: 'NSAID' },
  { name: 'Toradol 10mg Tablet', generic_name: 'Ketorolac', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Roche', unit_price: 12.00, strip_price: 120.00, pack_size: '10x10', indication: 'Severe pain', drug_class: 'NSAID' },
  { name: 'Ketor 10mg Tablet', generic_name: 'Ketorolac', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10x10', indication: 'Post-operative pain', drug_class: 'NSAID' },
  { name: 'Etorix 90mg Tablet', generic_name: 'Etoricoxib', dosage_form: 'Tablet', strength: '90mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 15.00, strip_price: 150.00, pack_size: '10x10', indication: 'Arthritis', drug_class: 'NSAID' },
  { name: 'Coxib 90mg Tablet', generic_name: 'Etoricoxib', dosage_form: 'Tablet', strength: '90mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 14.00, strip_price: 140.00, pack_size: '10x10', indication: 'Osteoarthritis', drug_class: 'NSAID' },

  // ========== GASTRIC / PPIs ==========
  { name: 'Seclo 20mg Capsule', generic_name: 'Omeprazole', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 84.00, pack_size: '14', indication: 'GERD, Peptic ulcer', drug_class: 'PPI' },
  { name: 'Seclo 40mg Capsule', generic_name: 'Omeprazole', dosage_form: 'Capsule', strength: '40mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 140.00, pack_size: '14', indication: 'Severe GERD', drug_class: 'PPI' },
  { name: 'Losectil 20mg Capsule', generic_name: 'Omeprazole', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 5.50, strip_price: 77.00, pack_size: '14', indication: 'Gastric ulcer', drug_class: 'PPI' },
  { name: 'Losectil 40mg Capsule', generic_name: 'Omeprazole', dosage_form: 'Capsule', strength: '40mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 9.00, strip_price: 126.00, pack_size: '14', indication: 'Severe GERD', drug_class: 'PPI' },
  { name: 'Omeprol 20mg Capsule', generic_name: 'Omeprazole', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 5.00, strip_price: 70.00, pack_size: '14', indication: 'Acid reflux', drug_class: 'PPI' },
  { name: 'Maxpro 20mg Capsule', generic_name: 'Esomeprazole', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Renata PLC', unit_price: 8.00, strip_price: 112.00, pack_size: '14', indication: 'GERD, Erosive esophagitis', drug_class: 'PPI' },
  { name: 'Maxpro 40mg Capsule', generic_name: 'Esomeprazole', dosage_form: 'Capsule', strength: '40mg', manufacturer_name: 'Renata PLC', unit_price: 14.00, strip_price: 196.00, pack_size: '14', indication: 'Severe GERD', drug_class: 'PPI' },
  { name: 'Sergel 20mg Capsule', generic_name: 'Esomeprazole', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Healthcare Pharmaceuticals', unit_price: 7.00, strip_price: 98.00, pack_size: '14', indication: 'Acid reflux', drug_class: 'PPI' },
  { name: 'Nexum 20mg Capsule', generic_name: 'Esomeprazole', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 7.50, strip_price: 105.00, pack_size: '14', indication: 'GERD', drug_class: 'PPI' },
  { name: 'Nexum 40mg Capsule', generic_name: 'Esomeprazole', dosage_form: 'Capsule', strength: '40mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 13.00, strip_price: 182.00, pack_size: '14', indication: 'Severe GERD', drug_class: 'PPI' },
  { name: 'Pantonix 40mg Tablet', generic_name: 'Pantoprazole', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 112.00, pack_size: '14', indication: 'GERD, Zollinger-Ellison', drug_class: 'PPI' },
  { name: 'Panoral 40mg Tablet', generic_name: 'Pantoprazole', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 7.50, strip_price: 105.00, pack_size: '14', indication: 'Peptic ulcer', drug_class: 'PPI' },
  { name: 'Pantomax 40mg Tablet', generic_name: 'Pantoprazole', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 7.00, strip_price: 98.00, pack_size: '14', indication: 'Acid reflux', drug_class: 'PPI' },
  { name: 'Rabium 20mg Tablet', generic_name: 'Rabeprazole', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 9.00, strip_price: 126.00, pack_size: '14', indication: 'GERD, Duodenal ulcer', drug_class: 'PPI' },
  { name: 'Pepcia 20mg Tablet', generic_name: 'Rabeprazole', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 8.00, strip_price: 112.00, pack_size: '14', indication: 'Peptic ulcer', drug_class: 'PPI' },

  // H2 Blockers
  { name: 'Ranidin 150mg Tablet', generic_name: 'Ranitidine', dosage_form: 'Tablet', strength: '150mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10x10', indication: 'Gastric ulcer', drug_class: 'H2 Blocker' },
  { name: 'Neotack 150mg Tablet', generic_name: 'Ranitidine', dosage_form: 'Tablet', strength: '150mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10x10', indication: 'Duodenal ulcer', drug_class: 'H2 Blocker' },
  { name: 'Famotack 20mg Tablet', generic_name: 'Famotidine', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10x10', indication: 'GERD, Ulcer', drug_class: 'H2 Blocker' },

  // Antacids
  { name: 'Gaviscon Syrup 200ml', generic_name: 'Sodium Alginate', dosage_form: 'Syrup', strength: '500mg/10ml', manufacturer_name: 'Reckitt Benckiser', unit_price: 180.00, strip_price: null, pack_size: '200ml', indication: 'Heartburn, Acid reflux', drug_class: 'Antacid' },
  { name: 'Antacid Plus Syrup', generic_name: 'Aluminium + Magnesium', dosage_form: 'Syrup', strength: '200ml', manufacturer_name: 'Square Pharmaceuticals', unit_price: 85.00, strip_price: null, pack_size: '200ml', indication: 'Acidity, Indigestion', drug_class: 'Antacid' },
  { name: 'Gaviscon Tablet', generic_name: 'Sodium Alginate', dosage_form: 'Chewable Tablet', strength: '250mg', manufacturer_name: 'Reckitt Benckiser', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Heartburn', drug_class: 'Antacid' },

  // ========== ANTIBIOTICS ==========
  // Macrolides
  { name: 'Zimax 250mg Capsule', generic_name: 'Azithromycin', dosage_form: 'Capsule', strength: '250mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 30.00, strip_price: 180.00, pack_size: '6', indication: 'Respiratory infections', drug_class: 'Antibiotic - Macrolide' },
  { name: 'Zimax 500mg Tablet', generic_name: 'Azithromycin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 50.00, strip_price: 150.00, pack_size: '3', indication: 'Severe infections', drug_class: 'Antibiotic - Macrolide' },
  { name: 'Azith 250mg Capsule', generic_name: 'Azithromycin', dosage_form: 'Capsule', strength: '250mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 28.00, strip_price: 168.00, pack_size: '6', indication: 'Respiratory infections', drug_class: 'Antibiotic - Macrolide' },
  { name: 'Azith 500mg Tablet', generic_name: 'Azithromycin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 45.00, strip_price: 135.00, pack_size: '3', indication: 'Severe infections', drug_class: 'Antibiotic - Macrolide' },
  { name: 'Azithrocin 500mg Tablet', generic_name: 'Azithromycin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 42.00, strip_price: 126.00, pack_size: '3', indication: 'Bacterial infections', drug_class: 'Antibiotic - Macrolide' },
  { name: 'Klaricid 500mg Tablet', generic_name: 'Clarithromycin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Abbott', unit_price: 45.00, strip_price: 450.00, pack_size: '10', indication: 'H. pylori, Respiratory', drug_class: 'Antibiotic - Macrolide' },
  { name: 'Claricin 500mg Tablet', generic_name: 'Clarithromycin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Respiratory infections', drug_class: 'Antibiotic - Macrolide' },
  { name: 'Erythrocin 500mg Tablet', generic_name: 'Erythromycin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Respiratory infections', drug_class: 'Antibiotic - Macrolide' },

  // Cephalosporins
  { name: 'Cef-3 200mg Capsule', generic_name: 'Cefixime', dosage_form: 'Capsule', strength: '200mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'UTI, Respiratory', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Cef-3 400mg Tablet', generic_name: 'Cefixime', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 45.00, strip_price: 450.00, pack_size: '10', indication: 'Severe infections', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Ceftron 200mg Capsule', generic_name: 'Cefixime', dosage_form: 'Capsule', strength: '200mg', manufacturer_name: 'Renata PLC', unit_price: 24.00, strip_price: 240.00, pack_size: '10', indication: 'Respiratory infections', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Cefim 200mg Capsule', generic_name: 'Cefixime', dosage_form: 'Capsule', strength: '200mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 22.00, strip_price: 220.00, pack_size: '10', indication: 'UTI, Gonorrhea', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Cefurox 500mg Tablet', generic_name: 'Cefuroxime', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Sinusitis, Bronchitis', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Starcef 500mg Tablet', generic_name: 'Cefuroxime', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 32.00, strip_price: 320.00, pack_size: '10', indication: 'Respiratory infections', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Cefpodox 200mg Tablet', generic_name: 'Cefpodoxime', dosage_form: 'Tablet', strength: '200mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 30.00, strip_price: 300.00, pack_size: '10', indication: 'Community pneumonia', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Ceftrix 1g Injection', generic_name: 'Ceftriaxone', dosage_form: 'Injection', strength: '1g', manufacturer_name: 'Square Pharmaceuticals', unit_price: 120.00, strip_price: null, pack_size: '1 vial', indication: 'Severe infections', drug_class: 'Antibiotic - Cephalosporin' },
  { name: 'Monocef 1g Injection', generic_name: 'Ceftriaxone', dosage_form: 'Injection', strength: '1g', manufacturer_name: 'Aristo Pharmaceuticals', unit_price: 150.00, strip_price: null, pack_size: '1 vial', indication: 'Meningitis, Sepsis', drug_class: 'Antibiotic - Cephalosporin' },

  // Fluoroquinolones
  { name: 'Ciprocin 500mg Tablet', generic_name: 'Ciprofloxacin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'UTI, Respiratory', drug_class: 'Antibiotic - Fluoroquinolone' },
  { name: 'Neofloxin 500mg Tablet', generic_name: 'Ciprofloxacin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 7.00, strip_price: 70.00, pack_size: '10', indication: 'Bacterial infections', drug_class: 'Antibiotic - Fluoroquinolone' },
  { name: 'Ciprox 500mg Tablet', generic_name: 'Ciprofloxacin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 7.50, strip_price: 75.00, pack_size: '10', indication: 'UTI, GI infections', drug_class: 'Antibiotic - Fluoroquinolone' },
  { name: 'Levoflox 500mg Tablet', generic_name: 'Levofloxacin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 18.00, strip_price: 180.00, pack_size: '10', indication: 'Pneumonia, Sinusitis', drug_class: 'Antibiotic - Fluoroquinolone' },
  { name: 'Levox 500mg Tablet', generic_name: 'Levofloxacin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 16.00, strip_price: 160.00, pack_size: '10', indication: 'Respiratory infections', drug_class: 'Antibiotic - Fluoroquinolone' },
  { name: 'Moxiflox 400mg Tablet', generic_name: 'Moxifloxacin', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Severe respiratory', drug_class: 'Antibiotic - Fluoroquinolone' },
  { name: 'Avelox 400mg Tablet', generic_name: 'Moxifloxacin', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Bayer', unit_price: 80.00, strip_price: 800.00, pack_size: '10', indication: 'Complicated infections', drug_class: 'Antibiotic - Fluoroquinolone' },
  { name: 'Oflox 200mg Tablet', generic_name: 'Ofloxacin', dosage_form: 'Tablet', strength: '200mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'UTI, Eye infections', drug_class: 'Antibiotic - Fluoroquinolone' },

  // Penicillins
  { name: 'Moxacil 500mg Capsule', generic_name: 'Amoxicillin', dosage_form: 'Capsule', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Respiratory, UTI', drug_class: 'Antibiotic - Penicillin' },
  { name: 'Tycil 500mg Capsule', generic_name: 'Amoxicillin', dosage_form: 'Capsule', strength: '500mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 5.50, strip_price: 55.00, pack_size: '10', indication: 'Bacterial infections', drug_class: 'Antibiotic - Penicillin' },
  { name: 'Amoxin 500mg Capsule', generic_name: 'Amoxicillin', dosage_form: 'Capsule', strength: '500mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Ear, Throat infections', drug_class: 'Antibiotic - Penicillin' },
  { name: 'Fimoxyl 625mg Tablet', generic_name: 'Amoxicillin + Clavulanic Acid', dosage_form: 'Tablet', strength: '625mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 28.00, strip_price: 280.00, pack_size: '10', indication: 'Resistant infections', drug_class: 'Antibiotic - Penicillin' },
  { name: 'Moxaclav 625mg Tablet', generic_name: 'Amoxicillin + Clavulanic Acid', dosage_form: 'Tablet', strength: '625mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 26.00, strip_price: 260.00, pack_size: '10', indication: 'Severe infections', drug_class: 'Antibiotic - Penicillin' },
  { name: 'Augmentin 625mg Tablet', generic_name: 'Amoxicillin + Clavulanic Acid', dosage_form: 'Tablet', strength: '625mg', manufacturer_name: 'GSK', unit_price: 45.00, strip_price: 450.00, pack_size: '10', indication: 'Resistant infections', drug_class: 'Antibiotic - Penicillin' },
  { name: 'Fluclox 500mg Capsule', generic_name: 'Flucloxacillin', dosage_form: 'Capsule', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Skin infections', drug_class: 'Antibiotic - Penicillin' },
  { name: 'Penin 400mg Tablet', generic_name: 'Phenoxymethylpenicillin', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Strep throat', drug_class: 'Antibiotic - Penicillin' },

  // Other Antibiotics
  { name: 'Flagyl 400mg Tablet', generic_name: 'Metronidazole', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Sanofi', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Amoebic, Anaerobic', drug_class: 'Antibiotic - Nitroimidazole' },
  { name: 'Metro 400mg Tablet', generic_name: 'Metronidazole', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'GI infections', drug_class: 'Antibiotic - Nitroimidazole' },
  { name: 'Amodis 400mg Tablet', generic_name: 'Metronidazole', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'Amoebiasis', drug_class: 'Antibiotic - Nitroimidazole' },
  { name: 'Doxin 100mg Capsule', generic_name: 'Doxycycline', dosage_form: 'Capsule', strength: '100mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Acne, Respiratory', drug_class: 'Antibiotic - Tetracycline' },
  { name: 'Doxycap 100mg Capsule', generic_name: 'Doxycycline', dosage_form: 'Capsule', strength: '100mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 3.50, strip_price: 35.00, pack_size: '10', indication: 'STD, Malaria prophylaxis', drug_class: 'Antibiotic - Tetracycline' },
  { name: 'Cotrim DS Tablet', generic_name: 'Sulfamethoxazole + Trimethoprim', dosage_form: 'Tablet', strength: '800/160mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'UTI, Respiratory', drug_class: 'Antibiotic - Sulfonamide' },
  { name: 'Bactrim DS Tablet', generic_name: 'Sulfamethoxazole + Trimethoprim', dosage_form: 'Tablet', strength: '800/160mg', manufacturer_name: 'Roche', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Bacterial infections', drug_class: 'Antibiotic - Sulfonamide' },
  { name: 'Nitrofuran 100mg Capsule', generic_name: 'Nitrofurantoin', dosage_form: 'Capsule', strength: '100mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'UTI', drug_class: 'Antibiotic - Nitrofuran' },

  // ========== ANTIHYPERTENSIVES ==========
  { name: 'Losazid 50mg Tablet', generic_name: 'Losartan', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ARB' },
  { name: 'Losazid 100mg Tablet', generic_name: 'Losartan', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ARB' },
  { name: 'Losacar 50mg Tablet', generic_name: 'Losartan', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 5.50, strip_price: 55.00, pack_size: '10', indication: 'High BP', drug_class: 'ARB' },
  { name: 'Losatan 50mg Tablet', generic_name: 'Losartan', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ARB' },
  { name: 'Valcard 80mg Tablet', generic_name: 'Valsartan', dosage_form: 'Tablet', strength: '80mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Hypertension, Heart failure', drug_class: 'ARB' },
  { name: 'Diovan 80mg Tablet', generic_name: 'Valsartan', dosage_form: 'Tablet', strength: '80mg', manufacturer_name: 'Novartis', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ARB' },
  { name: 'Olmetel 20mg Tablet', generic_name: 'Olmesartan', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ARB' },
  { name: 'Telsar 40mg Tablet', generic_name: 'Telmisartan', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ARB' },
  { name: 'Telma 40mg Tablet', generic_name: 'Telmisartan', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 7.00, strip_price: 70.00, pack_size: '10', indication: 'High BP', drug_class: 'ARB' },
  { name: 'Micardis 40mg Tablet', generic_name: 'Telmisartan', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Boehringer', unit_price: 30.00, strip_price: 300.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ARB' },

  // ACE Inhibitors
  { name: 'Prilor 5mg Tablet', generic_name: 'Lisinopril', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Hypertension, Heart failure', drug_class: 'ACE Inhibitor' },
  { name: 'Sinopril 10mg Tablet', generic_name: 'Lisinopril', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ACE Inhibitor' },
  { name: 'Enazil 5mg Tablet', generic_name: 'Enalapril', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Hypertension', drug_class: 'ACE Inhibitor' },
  { name: 'Enace 5mg Tablet', generic_name: 'Enalapril', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'High BP', drug_class: 'ACE Inhibitor' },
  { name: 'Ramace 2.5mg Tablet', generic_name: 'Ramipril', dosage_form: 'Tablet', strength: '2.5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Hypertension, Post-MI', drug_class: 'ACE Inhibitor' },
  { name: 'Ramipro 5mg Tablet', generic_name: 'Ramipril', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Heart failure', drug_class: 'ACE Inhibitor' },

  // Calcium Channel Blockers
  { name: 'Amdocal 5mg Tablet', generic_name: 'Amlodipine', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Hypertension, Angina', drug_class: 'CCB' },
  { name: 'Amdocal 10mg Tablet', generic_name: 'Amlodipine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Severe hypertension', drug_class: 'CCB' },
  { name: 'Amlodin 5mg Tablet', generic_name: 'Amlodipine', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'Hypertension', drug_class: 'CCB' },
  { name: 'Amlosun 5mg Tablet', generic_name: 'Amlodipine', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'High BP', drug_class: 'CCB' },
  { name: 'Norvasc 5mg Tablet', generic_name: 'Amlodipine', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Pfizer', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Hypertension', drug_class: 'CCB' },
  { name: 'Nifin 10mg Tablet', generic_name: 'Nifedipine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Angina, Hypertension', drug_class: 'CCB' },
  { name: 'Dilzem 30mg Tablet', generic_name: 'Diltiazem', dosage_form: 'Tablet', strength: '30mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Angina, Arrhythmia', drug_class: 'CCB' },

  // Beta Blockers
  { name: 'Bisolar 5mg Tablet', generic_name: 'Bisoprolol', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Hypertension, Heart failure', drug_class: 'Beta Blocker' },
  { name: 'Carvedil 6.25mg Tablet', generic_name: 'Carvedilol', dosage_form: 'Tablet', strength: '6.25mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Heart failure', drug_class: 'Beta Blocker' },
  { name: 'Atecard 50mg Tablet', generic_name: 'Atenolol', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Hypertension', drug_class: 'Beta Blocker' },
  { name: 'Nebicard 5mg Tablet', generic_name: 'Nebivolol', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Hypertension', drug_class: 'Beta Blocker' },
  { name: 'Metpro 50mg Tablet', generic_name: 'Metoprolol', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Angina, Arrhythmia', drug_class: 'Beta Blocker' },
  { name: 'Inderal 40mg Tablet', generic_name: 'Propranolol', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'AstraZeneca', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Migraine, Tremor', drug_class: 'Beta Blocker' },

  // Diuretics
  { name: 'Lasix 40mg Tablet', generic_name: 'Furosemide', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Sanofi', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Edema, Heart failure', drug_class: 'Diuretic' },
  { name: 'Frusix 40mg Tablet', generic_name: 'Furosemide', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Edema', drug_class: 'Diuretic' },
  { name: 'Aldactone 25mg Tablet', generic_name: 'Spironolactone', dosage_form: 'Tablet', strength: '25mg', manufacturer_name: 'Pfizer', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Heart failure, Edema', drug_class: 'Diuretic' },
  { name: 'Spiron 25mg Tablet', generic_name: 'Spironolactone', dosage_form: 'Tablet', strength: '25mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Edema, Ascites', drug_class: 'Diuretic' },
  { name: 'Hydro 12.5mg Tablet', generic_name: 'Hydrochlorothiazide', dosage_form: 'Tablet', strength: '12.5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Hypertension', drug_class: 'Diuretic' },

  // ========== ANTIDIABETICS ==========
  { name: 'Metform 500mg Tablet', generic_name: 'Metformin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'Biguanide' },
  { name: 'Metform 850mg Tablet', generic_name: 'Metformin', dosage_form: 'Tablet', strength: '850mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.50, strip_price: 35.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'Biguanide' },
  { name: 'Metform XR 500mg Tablet', generic_name: 'Metformin Extended Release', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Diabetes with GI issues', drug_class: 'Biguanide' },
  { name: 'Comet 500mg Tablet', generic_name: 'Metformin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Renata PLC', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'Biguanide' },
  { name: 'Glucomet 500mg Tablet', generic_name: 'Metformin', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Diabetes', drug_class: 'Biguanide' },
  { name: 'Glipid 80mg Tablet', generic_name: 'Gliclazide', dosage_form: 'Tablet', strength: '80mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'Sulfonylurea' },
  { name: 'Glipid MR 30mg Tablet', generic_name: 'Gliclazide MR', dosage_form: 'Tablet', strength: '30mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Diabetes', drug_class: 'Sulfonylurea' },
  { name: 'Glucored 80mg Tablet', generic_name: 'Gliclazide', dosage_form: 'Tablet', strength: '80mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 3.50, strip_price: 35.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'Sulfonylurea' },
  { name: 'Diamicron MR 60mg Tablet', generic_name: 'Gliclazide MR', dosage_form: 'Tablet', strength: '60mg', manufacturer_name: 'Servier', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Diabetes', drug_class: 'Sulfonylurea' },
  { name: 'Glimestar 2mg Tablet', generic_name: 'Glimepiride', dosage_form: 'Tablet', strength: '2mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'Sulfonylurea' },
  { name: 'Glimestar 4mg Tablet', generic_name: 'Glimepiride', dosage_form: 'Tablet', strength: '4mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Diabetes', drug_class: 'Sulfonylurea' },
  { name: 'Amaryl 2mg Tablet', generic_name: 'Glimepiride', dosage_form: 'Tablet', strength: '2mg', manufacturer_name: 'Sanofi', unit_price: 20.00, strip_price: 200.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'Sulfonylurea' },

  // DPP-4 Inhibitors
  { name: 'Galvus 50mg Tablet', generic_name: 'Vildagliptin', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Novartis', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'DPP-4 Inhibitor' },
  { name: 'Vildamet 50/500mg Tablet', generic_name: 'Vildagliptin + Metformin', dosage_form: 'Tablet', strength: '50/500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 18.00, strip_price: 180.00, pack_size: '10', indication: 'Diabetes combination', drug_class: 'DPP-4 Inhibitor' },
  { name: 'Januvia 100mg Tablet', generic_name: 'Sitagliptin', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'MSD', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'DPP-4 Inhibitor' },
  { name: 'Sitamet 50/500mg Tablet', generic_name: 'Sitagliptin + Metformin', dosage_form: 'Tablet', strength: '50/500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 20.00, strip_price: 200.00, pack_size: '10', indication: 'Combination therapy', drug_class: 'DPP-4 Inhibitor' },
  { name: 'Trajenta 5mg Tablet', generic_name: 'Linagliptin', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Boehringer', unit_price: 40.00, strip_price: 400.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'DPP-4 Inhibitor' },

  // SGLT2 Inhibitors
  { name: 'Jardiance 10mg Tablet', generic_name: 'Empagliflozin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Boehringer', unit_price: 45.00, strip_price: 450.00, pack_size: '10', indication: 'Diabetes, Heart failure', drug_class: 'SGLT2 Inhibitor' },
  { name: 'Forxiga 10mg Tablet', generic_name: 'Dapagliflozin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'AstraZeneca', unit_price: 42.00, strip_price: 420.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'SGLT2 Inhibitor' },
  { name: 'Invokana 100mg Tablet', generic_name: 'Canagliflozin', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'Janssen', unit_price: 50.00, strip_price: 500.00, pack_size: '10', indication: 'Type 2 Diabetes', drug_class: 'SGLT2 Inhibitor' },

  // Insulin
  { name: 'Humulin R 100IU/ml', generic_name: 'Human Insulin Regular', dosage_form: 'Injection', strength: '100IU/ml', manufacturer_name: 'Eli Lilly', unit_price: 450.00, strip_price: null, pack_size: '10ml', indication: 'Type 1 & 2 Diabetes', drug_class: 'Insulin' },
  { name: 'Humulin N 100IU/ml', generic_name: 'Human Insulin NPH', dosage_form: 'Injection', strength: '100IU/ml', manufacturer_name: 'Eli Lilly', unit_price: 450.00, strip_price: null, pack_size: '10ml', indication: 'Diabetes', drug_class: 'Insulin' },
  { name: 'Mixtard 30 100IU/ml', generic_name: 'Insulin Mixture 30/70', dosage_form: 'Injection', strength: '100IU/ml', manufacturer_name: 'Novo Nordisk', unit_price: 500.00, strip_price: null, pack_size: '10ml', indication: 'Diabetes', drug_class: 'Insulin' },
  { name: 'Lantus 100IU/ml', generic_name: 'Insulin Glargine', dosage_form: 'Injection', strength: '100IU/ml', manufacturer_name: 'Sanofi', unit_price: 1200.00, strip_price: null, pack_size: '10ml', indication: 'Basal insulin therapy', drug_class: 'Insulin' },

  // ========== ANTIHISTAMINES ==========
  { name: 'Fexo 120mg Tablet', generic_name: 'Fexofenadine', dosage_form: 'Tablet', strength: '120mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Allergic rhinitis, Urticaria', drug_class: 'Antihistamine' },
  { name: 'Fexo 180mg Tablet', generic_name: 'Fexofenadine', dosage_form: 'Tablet', strength: '180mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Chronic urticaria', drug_class: 'Antihistamine' },
  { name: 'Allegra 120mg Tablet', generic_name: 'Fexofenadine', dosage_form: 'Tablet', strength: '120mg', manufacturer_name: 'Sanofi', unit_price: 20.00, strip_price: 200.00, pack_size: '10', indication: 'Allergies', drug_class: 'Antihistamine' },
  { name: 'Histafree 120mg Tablet', generic_name: 'Fexofenadine', dosage_form: 'Tablet', strength: '120mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 7.00, strip_price: 70.00, pack_size: '10', indication: 'Allergic rhinitis', drug_class: 'Antihistamine' },
  { name: 'Cetiriz 10mg Tablet', generic_name: 'Cetirizine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Allergies, Hives', drug_class: 'Antihistamine' },
  { name: 'Alatrol 10mg Tablet', generic_name: 'Cetirizine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'Allergies', drug_class: 'Antihistamine' },
  { name: 'Zyrtec 10mg Tablet', generic_name: 'Cetirizine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'UCB', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Allergic rhinitis', drug_class: 'Antihistamine' },
  { name: 'Loratin 10mg Tablet', generic_name: 'Loratadine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Allergies', drug_class: 'Antihistamine' },
  { name: 'Claritin 10mg Tablet', generic_name: 'Loratadine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Bayer', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Allergic rhinitis', drug_class: 'Antihistamine' },
  { name: 'Deslo 5mg Tablet', generic_name: 'Desloratadine', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Chronic allergies', drug_class: 'Antihistamine' },
  { name: 'Levoriz 5mg Tablet', generic_name: 'Levocetirizine', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Allergies', drug_class: 'Antihistamine' },
  { name: 'Xyzal 5mg Tablet', generic_name: 'Levocetirizine', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'UCB', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Allergic rhinitis', drug_class: 'Antihistamine' },
  { name: 'Bilaxten 20mg Tablet', generic_name: 'Bilastine', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Menarini', unit_price: 18.00, strip_price: 180.00, pack_size: '10', indication: 'Allergies', drug_class: 'Antihistamine' },
  { name: 'Rupatol 10mg Tablet', generic_name: 'Rupatadine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Urticaria', drug_class: 'Antihistamine' },

  // ========== RESPIRATORY ==========
  // Anti-asthmatic
  { name: 'Monas 10mg Tablet', generic_name: 'Montelukast', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Asthma, Allergic rhinitis', drug_class: 'Leukotriene Antagonist' },
  { name: 'Montair 10mg Tablet', generic_name: 'Montelukast', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 9.00, strip_price: 90.00, pack_size: '10', indication: 'Asthma prophylaxis', drug_class: 'Leukotriene Antagonist' },
  { name: 'Singulair 10mg Tablet', generic_name: 'Montelukast', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'MSD', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'Asthma', drug_class: 'Leukotriene Antagonist' },
  { name: 'Monas 4mg Chewable', generic_name: 'Montelukast', dosage_form: 'Chewable Tablet', strength: '4mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Pediatric asthma', drug_class: 'Leukotriene Antagonist' },
  { name: 'Ventolin Inhaler', generic_name: 'Salbutamol', dosage_form: 'Inhaler', strength: '100mcg/puff', manufacturer_name: 'GSK', unit_price: 250.00, strip_price: null, pack_size: '200 doses', indication: 'Acute asthma', drug_class: 'Bronchodilator' },
  { name: 'Asthalin Inhaler', generic_name: 'Salbutamol', dosage_form: 'Inhaler', strength: '100mcg/puff', manufacturer_name: 'Cipla', unit_price: 180.00, strip_price: null, pack_size: '200 doses', indication: 'Bronchospasm', drug_class: 'Bronchodilator' },
  { name: 'Salbulin Inhaler', generic_name: 'Salbutamol', dosage_form: 'Inhaler', strength: '100mcg/puff', manufacturer_name: 'Square Pharmaceuticals', unit_price: 150.00, strip_price: null, pack_size: '200 doses', indication: 'Acute asthma', drug_class: 'Bronchodilator' },
  { name: 'Seretide 250 Inhaler', generic_name: 'Salmeterol + Fluticasone', dosage_form: 'Inhaler', strength: '25/250mcg', manufacturer_name: 'GSK', unit_price: 800.00, strip_price: null, pack_size: '120 doses', indication: 'Asthma maintenance', drug_class: 'Bronchodilator + Steroid' },
  { name: 'Symbicort 160 Inhaler', generic_name: 'Budesonide + Formoterol', dosage_form: 'Inhaler', strength: '160/4.5mcg', manufacturer_name: 'AstraZeneca', unit_price: 1200.00, strip_price: null, pack_size: '120 doses', indication: 'Asthma, COPD', drug_class: 'Bronchodilator + Steroid' },
  { name: 'Tiova Inhaler', generic_name: 'Tiotropium', dosage_form: 'Inhaler', strength: '18mcg', manufacturer_name: 'Cipla', unit_price: 450.00, strip_price: null, pack_size: '30 caps', indication: 'COPD', drug_class: 'Anticholinergic' },

  // Cough & Cold
  { name: 'Tusca Plus Syrup', generic_name: 'Dextromethorphan + Phenylephrine', dosage_form: 'Syrup', strength: '100ml', manufacturer_name: 'Square Pharmaceuticals', unit_price: 85.00, strip_price: null, pack_size: '100ml', indication: 'Cough with congestion', drug_class: 'Antitussive' },
  { name: 'Kofex DM Syrup', generic_name: 'Dextromethorphan', dosage_form: 'Syrup', strength: '100ml', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 70.00, strip_price: null, pack_size: '100ml', indication: 'Dry cough', drug_class: 'Antitussive' },
  { name: 'Ambrol 30mg Tablet', generic_name: 'Ambroxol', dosage_form: 'Tablet', strength: '30mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Productive cough', drug_class: 'Mucolytic' },
  { name: 'Mucosolvan 30mg Tablet', generic_name: 'Ambroxol', dosage_form: 'Tablet', strength: '30mg', manufacturer_name: 'Boehringer', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Mucus clearance', drug_class: 'Mucolytic' },
  { name: 'Acetyl Syrup', generic_name: 'N-Acetylcysteine', dosage_form: 'Syrup', strength: '100ml', manufacturer_name: 'Square Pharmaceuticals', unit_price: 120.00, strip_price: null, pack_size: '100ml', indication: 'Thick mucus', drug_class: 'Mucolytic' },

  // ========== LIPID LOWERING ==========
  { name: 'Atorva 10mg Tablet', generic_name: 'Atorvastatin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'High cholesterol', drug_class: 'Statin' },
  { name: 'Atorva 20mg Tablet', generic_name: 'Atorvastatin', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Hyperlipidemia', drug_class: 'Statin' },
  { name: 'Lipitor 10mg Tablet', generic_name: 'Atorvastatin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Pfizer', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'High cholesterol', drug_class: 'Statin' },
  { name: 'Tiginor 10mg Tablet', generic_name: 'Atorvastatin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Cholesterol', drug_class: 'Statin' },
  { name: 'Rozavel 10mg Tablet', generic_name: 'Rosuvastatin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'High cholesterol', drug_class: 'Statin' },
  { name: 'Rozavel 20mg Tablet', generic_name: 'Rosuvastatin', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Hyperlipidemia', drug_class: 'Statin' },
  { name: 'Crestor 10mg Tablet', generic_name: 'Rosuvastatin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'AstraZeneca', unit_price: 40.00, strip_price: 400.00, pack_size: '10', indication: 'High cholesterol', drug_class: 'Statin' },
  { name: 'Simva 10mg Tablet', generic_name: 'Simvastatin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Cholesterol', drug_class: 'Statin' },
  { name: 'Zocor 10mg Tablet', generic_name: 'Simvastatin', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'MSD', unit_price: 20.00, strip_price: 200.00, pack_size: '10', indication: 'High cholesterol', drug_class: 'Statin' },
  { name: 'Fenolip 160mg Tablet', generic_name: 'Fenofibrate', dosage_form: 'Tablet', strength: '160mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'High triglycerides', drug_class: 'Fibrate' },
  { name: 'Lipanthyl 160mg Tablet', generic_name: 'Fenofibrate', dosage_form: 'Tablet', strength: '160mg', manufacturer_name: 'Abbott', unit_price: 30.00, strip_price: 300.00, pack_size: '10', indication: 'Dyslipidemia', drug_class: 'Fibrate' },
  { name: 'Ezetrol 10mg Tablet', generic_name: 'Ezetimibe', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'MSD', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Cholesterol absorption', drug_class: 'Cholesterol Absorption Inhibitor' },

  // ========== VITAMINS & SUPPLEMENTS ==========
  { name: 'Calvit D Tablet', generic_name: 'Calcium + Vitamin D3', dosage_form: 'Tablet', strength: '500mg+400IU', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Calcium deficiency', drug_class: 'Supplement' },
  { name: 'Calbo D Tablet', generic_name: 'Calcium + Vitamin D3', dosage_form: 'Tablet', strength: '500mg+400IU', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 3.50, strip_price: 35.00, pack_size: '10', indication: 'Osteoporosis prevention', drug_class: 'Supplement' },
  { name: 'Shelcal 500 Tablet', generic_name: 'Calcium + Vitamin D3', dosage_form: 'Tablet', strength: '500mg+250IU', manufacturer_name: 'Torrent', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Bone health', drug_class: 'Supplement' },
  { name: 'Neurobion Forte Tablet', generic_name: 'Vitamin B Complex', dosage_form: 'Tablet', strength: 'B1+B6+B12', manufacturer_name: 'Merck', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Nerve health', drug_class: 'Vitamin' },
  { name: 'Nervex Forte Tablet', generic_name: 'Vitamin B Complex', dosage_form: 'Tablet', strength: 'B1+B6+B12', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Neuropathy', drug_class: 'Vitamin' },
  { name: 'Neurovit Tablet', generic_name: 'Vitamin B Complex', dosage_form: 'Tablet', strength: 'B1+B6+B12', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'B vitamin deficiency', drug_class: 'Vitamin' },
  { name: 'Folic Acid 5mg Tablet', generic_name: 'Folic Acid', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 1.00, strip_price: 10.00, pack_size: '10', indication: 'Anemia, Pregnancy', drug_class: 'Vitamin' },
  { name: 'Feroglobin Capsule', generic_name: 'Iron + Vitamins', dosage_form: 'Capsule', strength: 'Multi', manufacturer_name: 'Vitabiotics', unit_price: 15.00, strip_price: 450.00, pack_size: '30', indication: 'Iron deficiency', drug_class: 'Supplement' },
  { name: 'Hemogen Tablet', generic_name: 'Ferrous Sulfate', dosage_form: 'Tablet', strength: '200mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Iron deficiency anemia', drug_class: 'Iron Supplement' },
  { name: 'Feosol 325mg Tablet', generic_name: 'Ferrous Sulfate', dosage_form: 'Tablet', strength: '325mg', manufacturer_name: 'Beximco Pharmaceuticals', unit_price: 2.50, strip_price: 25.00, pack_size: '10', indication: 'Anemia', drug_class: 'Iron Supplement' },
  { name: 'D3 Max 2000IU Capsule', generic_name: 'Cholecalciferol', dosage_form: 'Capsule', strength: '2000IU', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Vitamin D deficiency', drug_class: 'Vitamin' },
  { name: 'Decavit Syrup', generic_name: 'Multivitamin', dosage_form: 'Syrup', strength: '200ml', manufacturer_name: 'Square Pharmaceuticals', unit_price: 120.00, strip_price: null, pack_size: '200ml', indication: 'General weakness', drug_class: 'Multivitamin' },
  { name: 'Becosules Capsule', generic_name: 'Vitamin B Complex', dosage_form: 'Capsule', strength: 'Multi', manufacturer_name: 'Pfizer', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'B vitamin deficiency', drug_class: 'Vitamin' },
  { name: 'Omega-3 Fish Oil 1000mg', generic_name: 'Omega-3 Fatty Acids', dosage_form: 'Capsule', strength: '1000mg', manufacturer_name: 'Various', unit_price: 10.00, strip_price: 300.00, pack_size: '30', indication: 'Heart health', drug_class: 'Supplement' },
  { name: 'Coenzyme Q10 100mg', generic_name: 'Ubiquinone', dosage_form: 'Capsule', strength: '100mg', manufacturer_name: 'Various', unit_price: 25.00, strip_price: 750.00, pack_size: '30', indication: 'Heart health, Energy', drug_class: 'Supplement' },

  // ========== ANTIDEPRESSANTS / ANXIOLYTICS ==========
  { name: 'Sertra 50mg Tablet', generic_name: 'Sertraline', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Depression, Anxiety', drug_class: 'SSRI' },
  { name: 'Sertral 50mg Tablet', generic_name: 'Sertraline', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Incepta Pharmaceuticals', unit_price: 7.00, strip_price: 70.00, pack_size: '10', indication: 'Depression', drug_class: 'SSRI' },
  { name: 'Zoloft 50mg Tablet', generic_name: 'Sertraline', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Pfizer', unit_price: 20.00, strip_price: 200.00, pack_size: '10', indication: 'Depression, OCD', drug_class: 'SSRI' },
  { name: 'Escita 10mg Tablet', generic_name: 'Escitalopram', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Depression, Anxiety', drug_class: 'SSRI' },
  { name: 'Lexapro 10mg Tablet', generic_name: 'Escitalopram', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Lundbeck', unit_price: 30.00, strip_price: 300.00, pack_size: '10', indication: 'Depression', drug_class: 'SSRI' },
  { name: 'Fluox 20mg Capsule', generic_name: 'Fluoxetine', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Depression, Bulimia', drug_class: 'SSRI' },
  { name: 'Prozac 20mg Capsule', generic_name: 'Fluoxetine', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Eli Lilly', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'Depression', drug_class: 'SSRI' },
  { name: 'Venla 75mg Capsule', generic_name: 'Venlafaxine', dosage_form: 'Capsule', strength: '75mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Depression, Anxiety', drug_class: 'SNRI' },
  { name: 'Clonax 0.5mg Tablet', generic_name: 'Clonazepam', dosage_form: 'Tablet', strength: '0.5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Anxiety, Seizures', drug_class: 'Benzodiazepine' },
  { name: 'Sedil 5mg Tablet', generic_name: 'Diazepam', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Anxiety, Muscle spasm', drug_class: 'Benzodiazepine' },
  { name: 'Alzolam 0.5mg Tablet', generic_name: 'Alprazolam', dosage_form: 'Tablet', strength: '0.5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Panic disorder', drug_class: 'Benzodiazepine' },

  // ========== ANTIEMETICS ==========
  { name: 'Domitil 10mg Tablet', generic_name: 'Domperidone', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Nausea, Vomiting', drug_class: 'Antiemetic' },
  { name: 'Motilium 10mg Tablet', generic_name: 'Domperidone', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Janssen', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Nausea, Gastroparesis', drug_class: 'Antiemetic' },
  { name: 'Ondas 4mg Tablet', generic_name: 'Ondansetron', dosage_form: 'Tablet', strength: '4mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Severe nausea', drug_class: 'Antiemetic' },
  { name: 'Zofran 4mg Tablet', generic_name: 'Ondansetron', dosage_form: 'Tablet', strength: '4mg', manufacturer_name: 'GSK', unit_price: 30.00, strip_price: 300.00, pack_size: '10', indication: 'Chemo-induced nausea', drug_class: 'Antiemetic' },
  { name: 'Perinorm 10mg Tablet', generic_name: 'Metoclopramide', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'IPCA', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Nausea, GERD', drug_class: 'Antiemetic' },

  // ========== SKIN / DERMATOLOGY ==========
  { name: 'Nizoral 200mg Tablet', generic_name: 'Ketoconazole', dosage_form: 'Tablet', strength: '200mg', manufacturer_name: 'Janssen', unit_price: 20.00, strip_price: 200.00, pack_size: '10', indication: 'Fungal infections', drug_class: 'Antifungal' },
  { name: 'Flucon 150mg Capsule', generic_name: 'Fluconazole', dosage_form: 'Capsule', strength: '150mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 35.00, strip_price: 70.00, pack_size: '2', indication: 'Vaginal candidiasis', drug_class: 'Antifungal' },
  { name: 'Diflucan 150mg Capsule', generic_name: 'Fluconazole', dosage_form: 'Capsule', strength: '150mg', manufacturer_name: 'Pfizer', unit_price: 80.00, strip_price: 160.00, pack_size: '2', indication: 'Fungal infections', drug_class: 'Antifungal' },
  { name: 'Itrakon 100mg Capsule', generic_name: 'Itraconazole', dosage_form: 'Capsule', strength: '100mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'Systemic fungal', drug_class: 'Antifungal' },
  { name: 'Terbicip 250mg Tablet', generic_name: 'Terbinafine', dosage_form: 'Tablet', strength: '250mg', manufacturer_name: 'Cipla', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Nail fungus', drug_class: 'Antifungal' },
  { name: 'Acned 20mg Capsule', generic_name: 'Isotretinoin', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'Severe acne', drug_class: 'Retinoid' },
  { name: 'Roaccutane 20mg Capsule', generic_name: 'Isotretinoin', dosage_form: 'Capsule', strength: '20mg', manufacturer_name: 'Roche', unit_price: 50.00, strip_price: 500.00, pack_size: '10', indication: 'Cystic acne', drug_class: 'Retinoid' },

  // ========== EYE DROPS ==========
  { name: 'Oflox Eye Drop', generic_name: 'Ofloxacin', dosage_form: 'Eye Drop', strength: '0.3%', manufacturer_name: 'Square Pharmaceuticals', unit_price: 60.00, strip_price: null, pack_size: '5ml', indication: 'Eye infections', drug_class: 'Ophthalmic Antibiotic' },
  { name: 'Ocuflox Eye Drop', generic_name: 'Ofloxacin', dosage_form: 'Eye Drop', strength: '0.3%', manufacturer_name: 'Allergan', unit_price: 120.00, strip_price: null, pack_size: '5ml', indication: 'Bacterial conjunctivitis', drug_class: 'Ophthalmic Antibiotic' },
  { name: 'Moxiflox Eye Drop', generic_name: 'Moxifloxacin', dosage_form: 'Eye Drop', strength: '0.5%', manufacturer_name: 'Square Pharmaceuticals', unit_price: 80.00, strip_price: null, pack_size: '5ml', indication: 'Eye infections', drug_class: 'Ophthalmic Antibiotic' },
  { name: 'Vigamox Eye Drop', generic_name: 'Moxifloxacin', dosage_form: 'Eye Drop', strength: '0.5%', manufacturer_name: 'Alcon', unit_price: 200.00, strip_price: null, pack_size: '5ml', indication: 'Bacterial keratitis', drug_class: 'Ophthalmic Antibiotic' },
  { name: 'Tobra Eye Drop', generic_name: 'Tobramycin', dosage_form: 'Eye Drop', strength: '0.3%', manufacturer_name: 'Square Pharmaceuticals', unit_price: 50.00, strip_price: null, pack_size: '5ml', indication: 'Eye infections', drug_class: 'Ophthalmic Antibiotic' },
  { name: 'Pred Forte Eye Drop', generic_name: 'Prednisolone', dosage_form: 'Eye Drop', strength: '1%', manufacturer_name: 'Allergan', unit_price: 250.00, strip_price: null, pack_size: '5ml', indication: 'Eye inflammation', drug_class: 'Ophthalmic Steroid' },
  { name: 'Tears Naturale Eye Drop', generic_name: 'Artificial Tears', dosage_form: 'Eye Drop', strength: '15ml', manufacturer_name: 'Alcon', unit_price: 180.00, strip_price: null, pack_size: '15ml', indication: 'Dry eyes', drug_class: 'Lubricant' },
  { name: 'Refresh Tears Eye Drop', generic_name: 'Carboxymethylcellulose', dosage_form: 'Eye Drop', strength: '0.5%', manufacturer_name: 'Allergan', unit_price: 200.00, strip_price: null, pack_size: '15ml', indication: 'Dry eyes', drug_class: 'Lubricant' },

  // ========== ANTITHROMBOTICS ==========
  { name: 'Ecosprin 75mg Tablet', generic_name: 'Aspirin', dosage_form: 'Tablet', strength: '75mg', manufacturer_name: 'USV', unit_price: 1.50, strip_price: 45.00, pack_size: '30', indication: 'Heart attack prevention', drug_class: 'Antiplatelet' },
  { name: 'Disprin CV 75mg Tablet', generic_name: 'Aspirin', dosage_form: 'Tablet', strength: '75mg', manufacturer_name: 'Reckitt Benckiser', unit_price: 2.00, strip_price: 60.00, pack_size: '30', indication: 'Cardiovascular protection', drug_class: 'Antiplatelet' },
  { name: 'Clopid 75mg Tablet', generic_name: 'Clopidogrel', dosage_form: 'Tablet', strength: '75mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Post-stent, Stroke prevention', drug_class: 'Antiplatelet' },
  { name: 'Plavix 75mg Tablet', generic_name: 'Clopidogrel', dosage_form: 'Tablet', strength: '75mg', manufacturer_name: 'Sanofi', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'ACS, Stent thrombosis', drug_class: 'Antiplatelet' },
  { name: 'Xarelto 10mg Tablet', generic_name: 'Rivaroxaban', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Bayer', unit_price: 80.00, strip_price: 800.00, pack_size: '10', indication: 'DVT prevention', drug_class: 'Anticoagulant' },
  { name: 'Eliquis 5mg Tablet', generic_name: 'Apixaban', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'BMS', unit_price: 100.00, strip_price: 1000.00, pack_size: '10', indication: 'AF, DVT', drug_class: 'Anticoagulant' },
  { name: 'Warfin 5mg Tablet', generic_name: 'Warfarin', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'DVT, PE, AF', drug_class: 'Anticoagulant' },

  // ========== THYROID ==========
  { name: 'Thyrox 50mcg Tablet', generic_name: 'Levothyroxine', dosage_form: 'Tablet', strength: '50mcg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Hypothyroidism', drug_class: 'Thyroid Hormone' },
  { name: 'Thyrox 100mcg Tablet', generic_name: 'Levothyroxine', dosage_form: 'Tablet', strength: '100mcg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Hypothyroidism', drug_class: 'Thyroid Hormone' },
  { name: 'Eltroxin 50mcg Tablet', generic_name: 'Levothyroxine', dosage_form: 'Tablet', strength: '50mcg', manufacturer_name: 'GSK', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Thyroid deficiency', drug_class: 'Thyroid Hormone' },
  { name: 'Thyronorm 50mcg Tablet', generic_name: 'Levothyroxine', dosage_form: 'Tablet', strength: '50mcg', manufacturer_name: 'Abbott', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Hypothyroidism', drug_class: 'Thyroid Hormone' },
  { name: 'Methimazol 5mg Tablet', generic_name: 'Methimazole', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Hyperthyroidism', drug_class: 'Antithyroid' },
  { name: 'Neomercazole 5mg Tablet', generic_name: 'Carbimazole', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Nicholas', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Hyperthyroidism', drug_class: 'Antithyroid' },

  // ========== GOUT ==========
  { name: 'Allopurinol 100mg Tablet', generic_name: 'Allopurinol', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Gout, Hyperuricemia', drug_class: 'Xanthine Oxidase Inhibitor' },
  { name: 'Zyloric 100mg Tablet', generic_name: 'Allopurinol', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'GSK', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Gout', drug_class: 'Xanthine Oxidase Inhibitor' },
  { name: 'Febuxostat 40mg Tablet', generic_name: 'Febuxostat', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Chronic gout', drug_class: 'Xanthine Oxidase Inhibitor' },
  { name: 'Uloric 40mg Tablet', generic_name: 'Febuxostat', dosage_form: 'Tablet', strength: '40mg', manufacturer_name: 'Takeda', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Hyperuricemia', drug_class: 'Xanthine Oxidase Inhibitor' },
  { name: 'Colchicine 0.5mg Tablet', generic_name: 'Colchicine', dosage_form: 'Tablet', strength: '0.5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Acute gout', drug_class: 'Anti-gout' },

  // ========== MUSCLE RELAXANTS ==========
  { name: 'Myoril 4mg Capsule', generic_name: 'Thiocolchicoside', dosage_form: 'Capsule', strength: '4mg', manufacturer_name: 'Sanofi', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Muscle spasm', drug_class: 'Muscle Relaxant' },
  { name: 'Relaxon 4mg Capsule', generic_name: 'Thiocolchicoside', dosage_form: 'Capsule', strength: '4mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Back pain, Spasm', drug_class: 'Muscle Relaxant' },
  { name: 'Flexura 8mg Tablet', generic_name: 'Tizanidine', dosage_form: 'Tablet', strength: '8mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 6.00, strip_price: 60.00, pack_size: '10', indication: 'Muscle spasticity', drug_class: 'Muscle Relaxant' },
  { name: 'Sirdalud 2mg Tablet', generic_name: 'Tizanidine', dosage_form: 'Tablet', strength: '2mg', manufacturer_name: 'Novartis', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Muscle spasm', drug_class: 'Muscle Relaxant' },
  { name: 'Myonal 50mg Tablet', generic_name: 'Eperisone', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Eisai', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Cervical spondylosis', drug_class: 'Muscle Relaxant' },

  // ========== ANTIEPILEPTICS ==========
  { name: 'Epival 500mg Tablet', generic_name: 'Sodium Valproate', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Abbott', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Epilepsy, Bipolar', drug_class: 'Anticonvulsant' },
  { name: 'Valpro 500mg Tablet', generic_name: 'Sodium Valproate', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Seizures', drug_class: 'Anticonvulsant' },
  { name: 'Tegretol 200mg Tablet', generic_name: 'Carbamazepine', dosage_form: 'Tablet', strength: '200mg', manufacturer_name: 'Novartis', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Epilepsy, Neuralgia', drug_class: 'Anticonvulsant' },
  { name: 'Carba 200mg Tablet', generic_name: 'Carbamazepine', dosage_form: 'Tablet', strength: '200mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 4.00, strip_price: 40.00, pack_size: '10', indication: 'Seizures', drug_class: 'Anticonvulsant' },
  { name: 'Levetra 500mg Tablet', generic_name: 'Levetiracetam', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Partial seizures', drug_class: 'Anticonvulsant' },
  { name: 'Keppra 500mg Tablet', generic_name: 'Levetiracetam', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'UCB', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Epilepsy', drug_class: 'Anticonvulsant' },
  { name: 'Phenobarb 30mg Tablet', generic_name: 'Phenobarbital', dosage_form: 'Tablet', strength: '30mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 1.00, strip_price: 10.00, pack_size: '10', indication: 'Seizures', drug_class: 'Anticonvulsant' },
  { name: 'Lamitor 100mg Tablet', generic_name: 'Lamotrigine', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'Torrent', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Epilepsy, Bipolar', drug_class: 'Anticonvulsant' },
  { name: 'Gabapin 300mg Capsule', generic_name: 'Gabapentin', dosage_form: 'Capsule', strength: '300mg', manufacturer_name: 'Intas', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Neuropathic pain', drug_class: 'Anticonvulsant' },
  { name: 'Pregabalin 75mg Capsule', generic_name: 'Pregabalin', dosage_form: 'Capsule', strength: '75mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Neuropathy, Fibromyalgia', drug_class: 'Anticonvulsant' },
  { name: 'Lyrica 75mg Capsule', generic_name: 'Pregabalin', dosage_form: 'Capsule', strength: '75mg', manufacturer_name: 'Pfizer', unit_price: 30.00, strip_price: 300.00, pack_size: '10', indication: 'Nerve pain', drug_class: 'Anticonvulsant' },

  // ========== UROLOGICAL ==========
  { name: 'Urimax 0.4mg Capsule', generic_name: 'Tamsulosin', dosage_form: 'Capsule', strength: '0.4mg', manufacturer_name: 'Cipla', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'BPH', drug_class: 'Alpha Blocker' },
  { name: 'Flomax 0.4mg Capsule', generic_name: 'Tamsulosin', dosage_form: 'Capsule', strength: '0.4mg', manufacturer_name: 'Boehringer', unit_price: 25.00, strip_price: 250.00, pack_size: '10', indication: 'Urinary obstruction', drug_class: 'Alpha Blocker' },
  { name: 'Silodosin 8mg Capsule', generic_name: 'Silodosin', dosage_form: 'Capsule', strength: '8mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 18.00, strip_price: 180.00, pack_size: '10', indication: 'BPH', drug_class: 'Alpha Blocker' },
  { name: 'Finast 5mg Tablet', generic_name: 'Finasteride', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'BPH, Hair loss', drug_class: '5-Alpha Reductase Inhibitor' },
  { name: 'Proscar 5mg Tablet', generic_name: 'Finasteride', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'MSD', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Benign prostatic hyperplasia', drug_class: '5-Alpha Reductase Inhibitor' },
  { name: 'Dutagen 0.5mg Capsule', generic_name: 'Dutasteride', dosage_form: 'Capsule', strength: '0.5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'BPH', drug_class: '5-Alpha Reductase Inhibitor' },
  { name: 'Avodart 0.5mg Capsule', generic_name: 'Dutasteride', dosage_form: 'Capsule', strength: '0.5mg', manufacturer_name: 'GSK', unit_price: 40.00, strip_price: 400.00, pack_size: '10', indication: 'Prostate enlargement', drug_class: '5-Alpha Reductase Inhibitor' },
  { name: 'Sildenafil 50mg Tablet', generic_name: 'Sildenafil', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 50.00, strip_price: 200.00, pack_size: '4', indication: 'Erectile dysfunction', drug_class: 'PDE5 Inhibitor' },
  { name: 'Viagra 50mg Tablet', generic_name: 'Sildenafil', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Pfizer', unit_price: 200.00, strip_price: 800.00, pack_size: '4', indication: 'ED', drug_class: 'PDE5 Inhibitor' },
  { name: 'Tadalafil 10mg Tablet', generic_name: 'Tadalafil', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 60.00, strip_price: 240.00, pack_size: '4', indication: 'Erectile dysfunction', drug_class: 'PDE5 Inhibitor' },
  { name: 'Cialis 10mg Tablet', generic_name: 'Tadalafil', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Eli Lilly', unit_price: 250.00, strip_price: 1000.00, pack_size: '4', indication: 'ED, BPH', drug_class: 'PDE5 Inhibitor' },

  // ========== ELECTROLYTES / ORS ==========
  { name: 'ORS Saline', generic_name: 'Oral Rehydration Salt', dosage_form: 'Powder', strength: '20.5g', manufacturer_name: 'SMC', unit_price: 10.00, strip_price: null, pack_size: '20.5g', indication: 'Dehydration', drug_class: 'Electrolyte' },
  { name: 'Pedialyte Oral Solution', generic_name: 'Electrolyte Solution', dosage_form: 'Solution', strength: '500ml', manufacturer_name: 'Abbott', unit_price: 80.00, strip_price: null, pack_size: '500ml', indication: 'Pediatric dehydration', drug_class: 'Electrolyte' },
  { name: 'Potassium Chloride 600mg', generic_name: 'Potassium Chloride', dosage_form: 'Tablet', strength: '600mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Hypokalemia', drug_class: 'Electrolyte' },

  // ========== CORTICOSTEROIDS ==========
  { name: 'Deflazacort 6mg Tablet', generic_name: 'Deflazacort', dosage_form: 'Tablet', strength: '6mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Inflammation, Allergy', drug_class: 'Corticosteroid' },
  { name: 'Prednisolone 5mg Tablet', generic_name: 'Prednisolone', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Inflammation', drug_class: 'Corticosteroid' },
  { name: 'Dexamethasone 0.5mg Tablet', generic_name: 'Dexamethasone', dosage_form: 'Tablet', strength: '0.5mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 1.50, strip_price: 15.00, pack_size: '10', indication: 'Severe inflammation', drug_class: 'Corticosteroid' },
  { name: 'Betnelan 0.5mg Tablet', generic_name: 'Betamethasone', dosage_form: 'Tablet', strength: '0.5mg', manufacturer_name: 'GSK', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Allergy, Asthma', drug_class: 'Corticosteroid' },
  { name: 'Medrol 4mg Tablet', generic_name: 'Methylprednisolone', dosage_form: 'Tablet', strength: '4mg', manufacturer_name: 'Pfizer', unit_price: 10.00, strip_price: 100.00, pack_size: '10', indication: 'Inflammation', drug_class: 'Corticosteroid' },

  // ========== ANTIVIRALS ==========
  { name: 'Acyclovir 400mg Tablet', generic_name: 'Acyclovir', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Herpes infections', drug_class: 'Antiviral' },
  { name: 'Zovirax 400mg Tablet', generic_name: 'Acyclovir', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'GSK', unit_price: 20.00, strip_price: 200.00, pack_size: '10', indication: 'Herpes zoster', drug_class: 'Antiviral' },
  { name: 'Valacyclovir 500mg Tablet', generic_name: 'Valacyclovir', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 35.00, strip_price: 350.00, pack_size: '10', indication: 'Genital herpes', drug_class: 'Antiviral' },
  { name: 'Valtrex 500mg Tablet', generic_name: 'Valacyclovir', dosage_form: 'Tablet', strength: '500mg', manufacturer_name: 'GSK', unit_price: 80.00, strip_price: 800.00, pack_size: '10', indication: 'Herpes simplex', drug_class: 'Antiviral' },
  { name: 'Oseltamivir 75mg Capsule', generic_name: 'Oseltamivir', dosage_form: 'Capsule', strength: '75mg', manufacturer_name: 'Roche', unit_price: 100.00, strip_price: 500.00, pack_size: '5', indication: 'Influenza', drug_class: 'Antiviral' },
  { name: 'Tamiflu 75mg Capsule', generic_name: 'Oseltamivir', dosage_form: 'Capsule', strength: '75mg', manufacturer_name: 'Roche', unit_price: 150.00, strip_price: 750.00, pack_size: '5', indication: 'Flu treatment', drug_class: 'Antiviral' },

  // ========== LAXATIVES ==========
  { name: 'Isabgol Powder', generic_name: 'Psyllium Husk', dosage_form: 'Powder', strength: '100g', manufacturer_name: 'Various', unit_price: 50.00, strip_price: null, pack_size: '100g', indication: 'Constipation', drug_class: 'Laxative' },
  { name: 'Duphalac Syrup 200ml', generic_name: 'Lactulose', dosage_form: 'Syrup', strength: '10g/15ml', manufacturer_name: 'Abbott', unit_price: 200.00, strip_price: null, pack_size: '200ml', indication: 'Chronic constipation', drug_class: 'Osmotic Laxative' },
  { name: 'Lactulax Syrup 200ml', generic_name: 'Lactulose', dosage_form: 'Syrup', strength: '10g/15ml', manufacturer_name: 'Square Pharmaceuticals', unit_price: 120.00, strip_price: null, pack_size: '200ml', indication: 'Constipation, Encephalopathy', drug_class: 'Osmotic Laxative' },
  { name: 'Dulcolax 5mg Tablet', generic_name: 'Bisacodyl', dosage_form: 'Tablet', strength: '5mg', manufacturer_name: 'Boehringer', unit_price: 5.00, strip_price: 50.00, pack_size: '10', indication: 'Constipation', drug_class: 'Stimulant Laxative' },
  { name: 'Softin 10mg Tablet', generic_name: 'Docusate Sodium', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Stool softener', drug_class: 'Stool Softener' },

  // ========== ANTIDIARRHEALS ==========
  { name: 'Loperamide 2mg Capsule', generic_name: 'Loperamide', dosage_form: 'Capsule', strength: '2mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 3.00, strip_price: 30.00, pack_size: '10', indication: 'Acute diarrhea', drug_class: 'Antidiarrheal' },
  { name: 'Imodium 2mg Capsule', generic_name: 'Loperamide', dosage_form: 'Capsule', strength: '2mg', manufacturer_name: 'Janssen', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Diarrhea', drug_class: 'Antidiarrheal' },
  { name: 'Racecadotril 100mg Capsule', generic_name: 'Racecadotril', dosage_form: 'Capsule', strength: '100mg', manufacturer_name: 'Abbott', unit_price: 15.00, strip_price: 150.00, pack_size: '10', indication: 'Acute diarrhea', drug_class: 'Antidiarrheal' },
  { name: 'Zinc Dispersible 20mg', generic_name: 'Zinc Sulfate', dosage_form: 'Tablet', strength: '20mg', manufacturer_name: 'Various', unit_price: 2.00, strip_price: 20.00, pack_size: '10', indication: 'Diarrhea in children', drug_class: 'Supplement' },

  // ========== ANTIPARASITICS ==========
  { name: 'Albendazole 400mg Tablet', generic_name: 'Albendazole', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 8.00, strip_price: 8.00, pack_size: '1', indication: 'Worm infestation', drug_class: 'Anthelmintic' },
  { name: 'Zentel 400mg Tablet', generic_name: 'Albendazole', dosage_form: 'Tablet', strength: '400mg', manufacturer_name: 'GSK', unit_price: 15.00, strip_price: 15.00, pack_size: '1', indication: 'Helminthiasis', drug_class: 'Anthelmintic' },
  { name: 'Mebendazole 100mg Tablet', generic_name: 'Mebendazole', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 2.00, strip_price: 12.00, pack_size: '6', indication: 'Pinworm, Hookworm', drug_class: 'Anthelmintic' },
  { name: 'Vermox 100mg Tablet', generic_name: 'Mebendazole', dosage_form: 'Tablet', strength: '100mg', manufacturer_name: 'Janssen', unit_price: 5.00, strip_price: 30.00, pack_size: '6', indication: 'Worm infections', drug_class: 'Anthelmintic' },
  { name: 'Ivermectin 12mg Tablet', generic_name: 'Ivermectin', dosage_form: 'Tablet', strength: '12mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 20.00, strip_price: 80.00, pack_size: '4', indication: 'Scabies, Strongyloides', drug_class: 'Antiparasitic' },

  // ========== LOCAL ANESTHETICS ==========
  { name: 'Xylocaine 2% Gel', generic_name: 'Lidocaine', dosage_form: 'Gel', strength: '2%', manufacturer_name: 'AstraZeneca', unit_price: 150.00, strip_price: null, pack_size: '30g', indication: 'Local anesthesia', drug_class: 'Local Anesthetic' },
  { name: 'Lidocaine 2% Injection', generic_name: 'Lidocaine', dosage_form: 'Injection', strength: '2%', manufacturer_name: 'Square Pharmaceuticals', unit_price: 25.00, strip_price: null, pack_size: '10ml', indication: 'Local anesthesia', drug_class: 'Local Anesthetic' },

  // ========== MIGRAINE ==========
  { name: 'Sumatriptan 50mg Tablet', generic_name: 'Sumatriptan', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 40.00, strip_price: 160.00, pack_size: '4', indication: 'Migraine', drug_class: 'Triptan' },
  { name: 'Imigran 50mg Tablet', generic_name: 'Sumatriptan', dosage_form: 'Tablet', strength: '50mg', manufacturer_name: 'GSK', unit_price: 80.00, strip_price: 320.00, pack_size: '4', indication: 'Acute migraine', drug_class: 'Triptan' },
  { name: 'Rizatriptan 10mg Tablet', generic_name: 'Rizatriptan', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'MSD', unit_price: 60.00, strip_price: 240.00, pack_size: '4', indication: 'Migraine with aura', drug_class: 'Triptan' },
  { name: 'Flunarizine 10mg Tablet', generic_name: 'Flunarizine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Janssen', unit_price: 8.00, strip_price: 80.00, pack_size: '10', indication: 'Migraine prevention', drug_class: 'Calcium Antagonist' },
  { name: 'Sibelium 10mg Tablet', generic_name: 'Flunarizine', dosage_form: 'Tablet', strength: '10mg', manufacturer_name: 'Janssen', unit_price: 12.00, strip_price: 120.00, pack_size: '10', indication: 'Migraine prophylaxis', drug_class: 'Calcium Antagonist' },

  // ========== OSTEOPOROSIS ==========
  { name: 'Alendronate 70mg Tablet', generic_name: 'Alendronic Acid', dosage_form: 'Tablet', strength: '70mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 50.00, strip_price: 200.00, pack_size: '4', indication: 'Osteoporosis', drug_class: 'Bisphosphonate' },
  { name: 'Fosamax 70mg Tablet', generic_name: 'Alendronic Acid', dosage_form: 'Tablet', strength: '70mg', manufacturer_name: 'MSD', unit_price: 120.00, strip_price: 480.00, pack_size: '4', indication: 'Bone loss', drug_class: 'Bisphosphonate' },
  { name: 'Risedronate 35mg Tablet', generic_name: 'Risedronic Acid', dosage_form: 'Tablet', strength: '35mg', manufacturer_name: 'Square Pharmaceuticals', unit_price: 60.00, strip_price: 240.00, pack_size: '4', indication: 'Osteoporosis', drug_class: 'Bisphosphonate' },
  { name: 'Ibandronate 150mg Tablet', generic_name: 'Ibandronic Acid', dosage_form: 'Tablet', strength: '150mg', manufacturer_name: 'Roche', unit_price: 400.00, strip_price: 400.00, pack_size: '1', indication: 'Postmenopausal osteoporosis', drug_class: 'Bisphosphonate' },
  { name: 'Calcitonin Nasal Spray', generic_name: 'Salmon Calcitonin', dosage_form: 'Nasal Spray', strength: '200IU', manufacturer_name: 'Novartis', unit_price: 800.00, strip_price: null, pack_size: '3.7ml', indication: 'Osteoporosis', drug_class: 'Calcitonin' },
];

Deno.serve(async (req) => {
  console.log('Import medicine reference function called');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Total medicines to process: ${MEDICINES_DATA.length}`);

    // Fetch existing medicines to avoid duplicates
    const { data: existingMedicines, error: fetchError } = await supabase
      .from('medicine_reference')
      .select('name');

    if (fetchError) {
      console.error('Error fetching existing medicines:', fetchError);
      throw fetchError;
    }

    // Create a set of existing medicine names (case-insensitive)
    const existingNames = new Set(
      (existingMedicines || []).map((m: { name: string }) => m.name.toLowerCase().trim())
    );

    console.log(`Existing medicines in database: ${existingNames.size}`);

    // Filter out duplicates
    const medicinesToInsert = MEDICINES_DATA
      .filter(med => !existingNames.has(med.name.toLowerCase().trim()))
      .map(med => ({
        name: med.name,
        generic_name: med.generic_name,
        dosage_form: med.dosage_form,
        strength: med.strength,
        manufacturer_name: med.manufacturer_name,
        unit_price: med.unit_price,
        strip_price: med.strip_price,
        pack_size: med.pack_size,
        indication: med.indication,
        drug_class: med.drug_class,
        is_active: true,
      }));

    console.log(`New medicines to insert: ${medicinesToInsert.length}`);

    if (medicinesToInsert.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'All medicines already exist',
          inserted: 0,
          skipped: MEDICINES_DATA.length,
          total: existingNames.size,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch insert to avoid timeout
    const BATCH_SIZE = 50;
    let totalInserted = 0;

    for (let i = 0; i < medicinesToInsert.length; i += BATCH_SIZE) {
      const batch = medicinesToInsert.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from('medicine_reference')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, insertError);
        throw insertError;
      }

      totalInserted += batch.length;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} medicines`);
    }

    const skipped = MEDICINES_DATA.length - totalInserted;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${totalInserted} medicines`,
        inserted: totalInserted,
        skipped: skipped,
        total: existingNames.size + totalInserted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error importing medicines:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to import medicines';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
