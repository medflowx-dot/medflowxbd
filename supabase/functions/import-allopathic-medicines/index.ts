import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common allopathic medicines from Bangladesh with strength (name, generic_name, category, manufacturer, strength)
const ALLOPATHIC_MEDICINES = [
  // Analgesics & Antipyretics - Paracetamol
  { name: "Napa 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napa 250mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napa 120mg/5ml", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napa Extra", generic_name: "Paracetamol 500mg + Caffeine 65mg", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napa Extend 665mg", generic_name: "Paracetamol", category: "Tablet (Extended Release)", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napa Rapid 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ace 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ace 250mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ace 120mg/5ml", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ace Plus", generic_name: "Paracetamol 500mg + Caffeine 65mg", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Renova 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Pyrenol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Apo 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  { name: "Reset 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Healthcare Pharmaceuticals Ltd." },
  { name: "Fast 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Eskayef Pharmaceuticals Ltd." },
  { name: "Fevral 120mg/5ml", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // NSAIDs - Ibuprofen
  { name: "Tofen 200mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tofen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tofen 600mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Inflam 200mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Inflam 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ibufen 200mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Profen 400mg", generic_name: "Ibuprofen", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // NSAIDs - Naproxen
  { name: "Napro 250mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Napro 500mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Xenapro 500mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napryn 250mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  { name: "Napryn 500mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  
  // NSAIDs - Diclofenac
  { name: "Clofenac 50mg", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clofenac 100mg SR", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Voltalin 50mg", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Diclofen 50mg", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Defnac 50mg", generic_name: "Diclofenac Sodium", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Clofenac Gel", generic_name: "Diclofenac Diethylamine 1%", category: "Gel", manufacturer: "Square Pharmaceuticals PLC" },
  
  // NSAIDs - Ketorolac
  { name: "Ketorol 10mg", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ketorol 30mg/ml", generic_name: "Ketorolac", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Toradol 10mg", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Torax 10mg", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // NSAIDs - Etoricoxib
  { name: "Etorix 60mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Etorix 90mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Etorix 120mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Coxin 60mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Coxin 90mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Torko 60mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Renata Limited" },
  
  // NSAIDs - Aceclofenac
  { name: "Acefen 100mg", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Aceclofenac 100mg", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antibiotics - Penicillins
  { name: "Moxacil 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Moxacil 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Moxacil 125mg/5ml", generic_name: "Amoxicillin", category: "Suspension", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amoxil 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Tycil 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Fimoxyl 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Moxilen 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Aristopharma Ltd." },
  
  // Amoxicillin + Clavulanic Acid
  { name: "Moxclav 375mg", generic_name: "Amoxicillin 250mg + Clavulanic Acid 125mg", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Moxclav 625mg", generic_name: "Amoxicillin 500mg + Clavulanic Acid 125mg", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Moxclav 1g", generic_name: "Amoxicillin 875mg + Clavulanic Acid 125mg", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clavulin 625mg", generic_name: "Amoxicillin 500mg + Clavulanic Acid 125mg", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fimoxyclav 625mg", generic_name: "Amoxicillin 500mg + Clavulanic Acid 125mg", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clavam 625mg", generic_name: "Amoxicillin 500mg + Clavulanic Acid 125mg", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Flucloxacillin
  { name: "Flupen 250mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Flupen 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fluclox 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Cephalosporins - Ceftriaxone
  { name: "Cef-3 250mg", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cef-3 500mg", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cef-3 1g", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cef-3 2g", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Triax 1g", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Axon 1g", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Renata Limited" },
  { name: "Traxon 1g", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Cephalosporins - Cefixime
  { name: "Cefdox 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cefdox 400mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cefdox 100mg/5ml", generic_name: "Cefixime", category: "Suspension", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cef-X 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fixim 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Cefim 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Cephalosporins - Cephradine
  { name: "Cephradine 500mg", generic_name: "Cephradine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cephradine 1g", generic_name: "Cephradine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cephin 500mg", generic_name: "Cephradine", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lebac 500mg", generic_name: "Cephradine", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Cephalosporins - Cefuroxime
  { name: "Cefurox 250mg", generic_name: "Cefuroxime", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cefurox 500mg", generic_name: "Cefuroxime", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zinacef 500mg", generic_name: "Cefuroxime", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Furoxim 500mg", generic_name: "Cefuroxime", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Cephalosporins - Cefpodoxime
  { name: "Podox 100mg", generic_name: "Cefpodoxime", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Podox 200mg", generic_name: "Cefpodoxime", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cefpodox 200mg", generic_name: "Cefpodoxime", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Macrolides - Azithromycin
  { name: "Zimax 250mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zimax 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zimax 200mg/5ml", generic_name: "Azithromycin", category: "Suspension", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Azith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Azithrocin 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Zithrin 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Azilide 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  { name: "Azicin 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Macrolides - Erythromycin & Clarithromycin
  { name: "Eromycin 250mg", generic_name: "Erythromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Eromycin 500mg", generic_name: "Erythromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clarith 250mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clarith 500mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Claricin 500mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Claritt 500mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Fluoroquinolones - Ciprofloxacin
  { name: "Ciprocin 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ciprocin 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cipro-A 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Neofloxin 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ciprox 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Fluoroquinolones - Levofloxacin
  { name: "Levoflox 250mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Levoflox 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Levoflox 750mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Levox 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Levoday 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levorin 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Fluoroquinolones - Moxifloxacin & Ofloxacin
  { name: "Moflox 400mg", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Moxibac 400mg", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Oflox 200mg", generic_name: "Ofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Oflox 400mg", generic_name: "Ofloxacin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Oflodin 400mg", generic_name: "Ofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Others - Doxycycline
  { name: "Doxy-A 100mg", generic_name: "Doxycycline", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Doxycap 100mg", generic_name: "Doxycycline", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Doxin 100mg", generic_name: "Doxycycline", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Others - Metronidazole
  { name: "Metronid 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flagyl 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Amodis 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Metryl 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Clindamycin & Nitrofurantoin
  { name: "Clinda 150mg", generic_name: "Clindamycin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clinda 300mg", generic_name: "Clindamycin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clindacin 300mg", generic_name: "Clindamycin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Nitrofur 100mg", generic_name: "Nitrofurantoin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Uro-Q 100mg", generic_name: "Nitrofurantoin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antacids & PPIs - Omeprazole
  { name: "Seclo 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Seclo 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Seclo MUPS 20mg", generic_name: "Omeprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losectil 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Omenix 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Omep 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  
  // PPIs - Esomeprazole
  { name: "Sergel 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sergel 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sergel MUPS 20mg", generic_name: "Esomeprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nexum 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Nexum 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Esoral 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Esomep 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  
  // PPIs - Pantoprazole
  { name: "Pantonix 20mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pantonix 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Panto 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Pantid 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // PPIs - Lansoprazole & Rabeprazole
  { name: "Lanso 15mg", generic_name: "Lansoprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lanso 30mg", generic_name: "Lansoprazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lansec 30mg", generic_name: "Lansoprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rabe 20mg", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rabium 20mg", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // H2 Blockers
  { name: "Ranitid 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neotac 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Famotid 20mg", generic_name: "Famotidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Famotid 40mg", generic_name: "Famotidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Famotab 20mg", generic_name: "Famotidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antacids
  { name: "Antacid Plus", generic_name: "Aluminium Hydroxide + Magnesium Hydroxide + Simethicone", category: "Suspension", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Antacil", generic_name: "Aluminium Hydroxide + Magnesium Hydroxide", category: "Suspension", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antihistamines - Cetirizine
  { name: "Histacin 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Alatrol 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cetiriz 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cetzin 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Histacin 5mg/5ml", generic_name: "Cetirizine", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Antihistamines - Fexofenadine
  { name: "Fexo 60mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fexo 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fexo 180mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Telfast 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Fexofen 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fexofast 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antihistamines - Loratadine & Levocetirizine
  { name: "Loratyn 10mg", generic_name: "Loratadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Claritin 10mg", generic_name: "Loratadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lora 10mg", generic_name: "Loratadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levorid 5mg", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lecet 5mg", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Deslorin 5mg", generic_name: "Desloratadine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Antihistamines - Others
  { name: "Adamine 4mg", generic_name: "Chlorpheniramine Maleate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Piriton 4mg", generic_name: "Chlorpheniramine Maleate", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Montelukast 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Montelukast 5mg", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Montair 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Monas 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antidiabetics - Metformin
  { name: "Glucomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Glucomet 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Glucomet 1000mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Glucomet XR 500mg", generic_name: "Metformin", category: "Tablet (Extended Release)", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Comet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Comet 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bigomet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Informet 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Antidiabetics - Gliclazide
  { name: "Gliclazide 80mg", generic_name: "Gliclazide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Gliclazide MR 30mg", generic_name: "Gliclazide", category: "Tablet (Modified Release)", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Gliclazide MR 60mg", generic_name: "Gliclazide", category: "Tablet (Modified Release)", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Glipid 80mg", generic_name: "Gliclazide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antidiabetics - Glimepiride
  { name: "Diapride 1mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Diapride 2mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Diapride 3mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Diapride 4mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Glimepin 2mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glimep 2mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antidiabetics - DPP-4 Inhibitors
  { name: "Linagliptin 5mg", generic_name: "Linagliptin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Linag 5mg", generic_name: "Linagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sitagliptin 50mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sitagliptin 100mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sitanorm 100mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vildagliptin 50mg", generic_name: "Vildagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antidiabetics - SGLT2 Inhibitors
  { name: "Dapagliflozin 5mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dapagliflozin 10mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dapaflo 10mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Empagliflozin 10mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Empagliflozin 25mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antidiabetics - Pioglitazone & Insulin
  { name: "Pioglitazone 15mg", generic_name: "Pioglitazone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pioglitazone 30mg", generic_name: "Pioglitazone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Piolit 15mg", generic_name: "Pioglitazone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Mixtard 30 100IU/ml", generic_name: "Insulin Human (Biphasic 30/70)", category: "Injection", manufacturer: "Novo Nordisk" },
  { name: "Actrapid 100IU/ml", generic_name: "Insulin Human (Regular)", category: "Injection", manufacturer: "Novo Nordisk" },
  { name: "Insulatard 100IU/ml", generic_name: "Insulin Human (NPH)", category: "Injection", manufacturer: "Novo Nordisk" },
  { name: "Lantus 100IU/ml", generic_name: "Insulin Glargine", category: "Injection", manufacturer: "Sanofi Bangladesh Ltd." },
  
  // Cardiovascular - Amlodipine
  { name: "Amdocal 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amdocal 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amlopin 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amlong 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Amlosyn 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Beta Blockers - Atenolol
  { name: "Angilock 25mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Angilock 50mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Angilock 100mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tenoloc 50mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Atenol 50mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Beta Blockers - Bisoprolol
  { name: "Bisop 2.5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Bisop 5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Bisop 10mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Biscard 5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bisolol 5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Beta Blockers - Metoprolol & Nebivolol
  { name: "Metolar 25mg", generic_name: "Metoprolol Tartrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Metolar 50mg", generic_name: "Metoprolol Tartrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Metolar XR 50mg", generic_name: "Metoprolol Succinate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Metpro 50mg", generic_name: "Metoprolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Nebilet 5mg", generic_name: "Nebivolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nebis 5mg", generic_name: "Nebivolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Carvedilol 6.25mg", generic_name: "Carvedilol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Carvedilol 12.5mg", generic_name: "Carvedilol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Carvedilol 25mg", generic_name: "Carvedilol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Carvid 6.25mg", generic_name: "Carvedilol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // ARBs - Losartan
  { name: "Losart 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losart 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losart 100mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Losar 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Losatan 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // ARBs - Olmesartan, Telmisartan, Valsartan
  { name: "Olmesan 20mg", generic_name: "Olmesartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Olmesan 40mg", generic_name: "Olmesartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Olme 20mg", generic_name: "Olmesartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Telmis 40mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Telmis 80mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Telsar 40mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Valsart 80mg", generic_name: "Valsartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Valsart 160mg", generic_name: "Valsartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Valsan 80mg", generic_name: "Valsartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // ACE Inhibitors
  { name: "Lisin 5mg", generic_name: "Lisinopril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lisin 10mg", generic_name: "Lisinopril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sinopril 10mg", generic_name: "Lisinopril", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ramip 2.5mg", generic_name: "Ramipril", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ramip 5mg", generic_name: "Ramipril", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ramip 10mg", generic_name: "Ramipril", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ramace 5mg", generic_name: "Ramipril", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Enalap 5mg", generic_name: "Enalapril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Enalap 10mg", generic_name: "Enalapril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Enapril 10mg", generic_name: "Enalapril", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Diuretics
  { name: "Lasix 40mg", generic_name: "Furosemide", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Furomax 40mg", generic_name: "Furosemide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fusid 40mg", generic_name: "Furosemide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Thiazide 12.5mg", generic_name: "Hydrochlorothiazide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Thiazide 25mg", generic_name: "Hydrochlorothiazide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Spironolactone 25mg", generic_name: "Spironolactone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Spironolactone 50mg", generic_name: "Spironolactone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Aldactone 25mg", generic_name: "Spironolactone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Indap 1.5mg", generic_name: "Indapamide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Statins
  { name: "Atova 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atova 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atova 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atorva 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Torvast 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Atorin 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Rosuva 5mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rosuva 10mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rosuva 20mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rosuvast 10mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rosustat 10mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Simva 10mg", generic_name: "Simvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Simva 20mg", generic_name: "Simvastatin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Simvatin 20mg", generic_name: "Simvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fenofib 200mg", generic_name: "Fenofibrate", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fenostat 200mg", generic_name: "Fenofibrate", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Anticoagulants & Antiplatelets
  { name: "Ecosprin 75mg", generic_name: "Aspirin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ecosprin 150mg", generic_name: "Aspirin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Disprin 300mg", generic_name: "Aspirin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clopid 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Plagril 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Plavix 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Clopilet 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Warfarin 5mg", generic_name: "Warfarin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rivarox 10mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rivarox 15mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rivarox 20mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dabigatran 110mg", generic_name: "Dabigatran", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dabigatran 150mg", generic_name: "Dabigatran", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Apixaban 2.5mg", generic_name: "Apixaban", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Apixaban 5mg", generic_name: "Apixaban", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Enoxaparin 40mg/0.4ml", generic_name: "Enoxaparin", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Enoxaparin 60mg/0.6ml", generic_name: "Enoxaparin", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Corticosteroids
  { name: "Prednil 5mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Prednil 10mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Prednil 20mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Deltasone 5mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Defcort 6mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Defcort 12mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Defcort 24mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Defcort 30mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Defnalone 6mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Decason 0.5mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Decason 4mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dexona 0.5mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Hydrocort 10mg", generic_name: "Hydrocortisone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Methylpred 4mg", generic_name: "Methylprednisolone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Methylpred 16mg", generic_name: "Methylprednisolone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Respiratory - Salbutamol
  { name: "Salbut 2mg", generic_name: "Salbutamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Salbut 4mg", generic_name: "Salbutamol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ventolin 100mcg", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Asthalin 100mcg", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Brodil 2mg", generic_name: "Salbutamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Salbut Nebulizer 5mg/ml", generic_name: "Salbutamol", category: "Solution", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Respiratory - Inhalers
  { name: "Budecort 100mcg", generic_name: "Budesonide", category: "Inhaler", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Budecort 200mcg", generic_name: "Budesonide", category: "Inhaler", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Forate 6/100mcg", generic_name: "Formoterol 6mcg + Budesonide 100mcg", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Forate 6/200mcg", generic_name: "Formoterol 6mcg + Budesonide 200mcg", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Seretide 25/50mcg", generic_name: "Salmeterol 25mcg + Fluticasone 50mcg", category: "Inhaler", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Seretide 25/250mcg", generic_name: "Salmeterol 25mcg + Fluticasone 250mcg", category: "Inhaler", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Tiotropium 18mcg", generic_name: "Tiotropium", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ipravent 20mcg", generic_name: "Ipratropium", category: "Inhaler", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Cough & Cold
  { name: "Ambex 30mg", generic_name: "Ambroxol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ambex 15mg/5ml", generic_name: "Ambroxol", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mucolex 30mg", generic_name: "Ambroxol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bromhex 8mg", generic_name: "Bromhexine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mucolyt 8mg", generic_name: "Bromhexine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tuspel Syrup", generic_name: "Dextromethorphan + Phenylephrine + Chlorpheniramine", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cofnil Syrup", generic_name: "Dextromethorphan", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Vitamins - Multivitamins
  { name: "Filwel Gold", generic_name: "Multivitamin + Minerals + Ginseng", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Filwel Silver", generic_name: "Multivitamin + Minerals", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Growel Syrup", generic_name: "Multivitamin + Minerals", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Biovit Tablet", generic_name: "Multivitamin + Minerals", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Nutrivit Syrup", generic_name: "Multivitamin", category: "Syrup", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Vitamins - B Complex
  { name: "B-Plex Forte", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Becosule", generic_name: "Vitamin B Complex + Vitamin C", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Neurobion", generic_name: "Vitamin B1 + B6 + B12", category: "Tablet", manufacturer: "Merck" },
  { name: "Neurobion Forte", generic_name: "Vitamin B1 100mg + B6 200mg + B12 200mcg", category: "Tablet", manufacturer: "Merck" },
  
  // Vitamins - Calcium & Vitamin D
  { name: "Calbo-D 500mg", generic_name: "Calcium 500mg + Vitamin D3 200IU", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Caldical D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Calci-D", generic_name: "Calcium + Vitamin D3", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "D-Rise 1000IU", generic_name: "Vitamin D3 (Cholecalciferol)", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "D-Rise 2000IU", generic_name: "Vitamin D3 (Cholecalciferol)", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "D-Rise 5000IU", generic_name: "Vitamin D3 (Cholecalciferol)", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "D-Rise 20000IU", generic_name: "Vitamin D3 (Cholecalciferol)", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "D-Rise 40000IU", generic_name: "Vitamin D3 (Cholecalciferol)", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "D-Sunny 1000IU", generic_name: "Vitamin D3 (Cholecalciferol)", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ostocare", generic_name: "Calcium + Vitamin D + Magnesium + Zinc", category: "Tablet", manufacturer: "Aristopharma Ltd." },
  
  // Vitamins - Iron
  { name: "Feroglobin B12", generic_name: "Iron + Folic Acid + Vitamin B12 + Zinc", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Feron XT", generic_name: "Iron 100mg + Folic Acid 1.5mg", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fefol", generic_name: "Iron + Folic Acid", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fefol-Z", generic_name: "Iron + Folic Acid + Zinc", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Vitamins - Others
  { name: "Zinvit-C", generic_name: "Zinc 20mg + Vitamin C 100mg", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "C-Vit 250mg", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "C-Vit 500mg", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cevit 250mg", generic_name: "Vitamin C", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Evit 200IU", generic_name: "Vitamin E", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Evit 400IU", generic_name: "Vitamin E", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zinc 20mg", generic_name: "Zinc Sulfate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zincovit", generic_name: "Zinc + Vitamin C + Vitamin D", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // GI Medications - Antiemetics
  { name: "Dometon 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Domstal 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Omidon 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dometon 5mg/5ml", generic_name: "Domperidone", category: "Suspension", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Maxolon 10mg", generic_name: "Metoclopramide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Perinorm 10mg", generic_name: "Metoclopramide", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ondansetron 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ondansetron 8mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Vomilux 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Emeset 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // GI Medications - Antidiarrheals & Laxatives
  { name: "Loperamide 2mg", generic_name: "Loperamide", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lopamide 2mg", generic_name: "Loperamide", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Imodium 2mg", generic_name: "Loperamide", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Lactulose 10g/15ml", generic_name: "Lactulose", category: "Syrup", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Duphalac", generic_name: "Lactulose 3.35g/5ml", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bisacodyl 5mg", generic_name: "Bisacodyl", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dulcolax 5mg", generic_name: "Bisacodyl", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Antifungals
  { name: "Flucon 50mg", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flucon 150mg", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flucon 200mg", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Diflucan 150mg", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Flucor 150mg", generic_name: "Fluconazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Itacon 100mg", generic_name: "Itraconazole", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Itracon 100mg", generic_name: "Itraconazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ketocon 200mg", generic_name: "Ketoconazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clotrim 1%", generic_name: "Clotrimazole", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Terbin 250mg", generic_name: "Terbinafine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lamisil 250mg", generic_name: "Terbinafine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Nystatin 100000IU/ml", generic_name: "Nystatin", category: "Suspension", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Antivirals
  { name: "Acyclovir 200mg", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Acyclovir 400mg", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Acyclovir 800mg", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zovirax 200mg", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Virux 400mg", generic_name: "Acyclovir", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Valcivir 500mg", generic_name: "Valacyclovir", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Valcivir 1000mg", generic_name: "Valacyclovir", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Oseltamivir 75mg", generic_name: "Oseltamivir", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sofosbuvir 400mg", generic_name: "Sofosbuvir", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sofovir 400mg", generic_name: "Sofosbuvir", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Psychotropic - Antidepressants
  { name: "Amitril 10mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amitril 25mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sertraline 50mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Serta 50mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Fluox 20mg", generic_name: "Fluoxetine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Escitalo 5mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Escitalo 10mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Escitalo 20mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lexapro 10mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Venlafax 37.5mg", generic_name: "Venlafaxine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Venlafax 75mg", generic_name: "Venlafaxine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mirtaz 15mg", generic_name: "Mirtazapine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Mirtaz 30mg", generic_name: "Mirtazapine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Psychotropic - Anxiolytics
  { name: "Sedil 5mg", generic_name: "Diazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sedil 10mg", generic_name: "Diazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clonazep 0.5mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clonazep 2mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rivotril 0.5mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Alprazol 0.25mg", generic_name: "Alprazolam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Alprazol 0.5mg", generic_name: "Alprazolam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Alprax 0.5mg", generic_name: "Alprazolam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lorazep 1mg", generic_name: "Lorazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lorazep 2mg", generic_name: "Lorazepam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Psychotropic - Antipsychotics
  { name: "Olanza 5mg", generic_name: "Olanzapine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Olanza 10mg", generic_name: "Olanzapine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zyprexa 5mg", generic_name: "Olanzapine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Risperid 1mg", generic_name: "Risperidone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Risperid 2mg", generic_name: "Risperidone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Risperid 4mg", generic_name: "Risperidone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Risperdal 2mg", generic_name: "Risperidone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Quetiap 25mg", generic_name: "Quetiapine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Quetiap 100mg", generic_name: "Quetiapine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Quetiap 200mg", generic_name: "Quetiapine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Aripiprazole 5mg", generic_name: "Aripiprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aripiprazole 10mg", generic_name: "Aripiprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Haloperidol 5mg", generic_name: "Haloperidol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Anticonvulsants
  { name: "Epilex 200mg", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Epilex 500mg", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Epilex CR 300mg", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Epilex CR 500mg", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Valpro 200mg", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tegral 200mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tegral 400mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Carbatol 200mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Phenytoin 100mg", generic_name: "Phenytoin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dilantin 100mg", generic_name: "Phenytoin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Gabapen 100mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Gabapen 300mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Gabapen 400mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neurontin 300mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Pregab 50mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pregab 75mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pregab 150mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lyrica 75mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levera 250mg", generic_name: "Levetiracetam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Levera 500mg", generic_name: "Levetiracetam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Levera 750mg", generic_name: "Levetiracetam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Levera 1000mg", generic_name: "Levetiracetam", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Keppra 500mg", generic_name: "Levetiracetam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lamotrig 25mg", generic_name: "Lamotrigine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lamotrig 50mg", generic_name: "Lamotrigine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lamotrig 100mg", generic_name: "Lamotrigine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Phenobarb 30mg", generic_name: "Phenobarbital", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Eye Drops
  { name: "Moxiflox Eye 0.5%", generic_name: "Moxifloxacin", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Occuflox 0.3%", generic_name: "Ofloxacin", category: "Eye Drop", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vigamox 0.5%", generic_name: "Moxifloxacin", category: "Eye Drop", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tobradex", generic_name: "Tobramycin 0.3% + Dexamethasone 0.1%", category: "Eye Drop", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Tears Plus", generic_name: "Polyvinyl Alcohol + Povidone", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Refresh Tears", generic_name: "Carboxymethylcellulose 0.5%", category: "Eye Drop", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Gentacin Eye 0.3%", generic_name: "Gentamicin", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ciproflox Eye 0.3%", generic_name: "Ciprofloxacin", category: "Eye Drop", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Predfort 1%", generic_name: "Prednisolone Acetate", category: "Eye Drop", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Otrivin 0.1%", generic_name: "Xylometazoline", category: "Nasal Drop", manufacturer: "Novartis" },
  { name: "Nasivion 0.05%", generic_name: "Oxymetazoline", category: "Nasal Drop", manufacturer: "Merck" },
  { name: "Flonase", generic_name: "Fluticasone 50mcg/spray", category: "Nasal Spray", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  
  // Dermatological
  { name: "Betnovate 0.1%", generic_name: "Betamethasone Valerate", category: "Cream", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Clobetasol 0.05%", generic_name: "Clobetasol Propionate", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dermovate 0.05%", generic_name: "Clobetasol Propionate", category: "Cream", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Hydrocort 1%", generic_name: "Hydrocortisone", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mometasone 0.1%", generic_name: "Mometasone Furoate", category: "Cream", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Fusidic 2%", generic_name: "Fusidic Acid", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fucidin 2%", generic_name: "Fusidic Acid", category: "Cream", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Mupirocin 2%", generic_name: "Mupirocin", category: "Ointment", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Bactroban 2%", generic_name: "Mupirocin", category: "Ointment", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Acne Gel 2.5%", generic_name: "Benzoyl Peroxide", category: "Gel", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tretinoin 0.025%", generic_name: "Tretinoin", category: "Cream", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tretinoin 0.05%", generic_name: "Tretinoin", category: "Cream", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Permethrin 5%", generic_name: "Permethrin", category: "Cream", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Muscle Relaxants
  { name: "Myoril 4mg", generic_name: "Thiocolchicoside", category: "Capsule", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Myoril 8mg", generic_name: "Thiocolchicoside", category: "Capsule", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Thiocol 4mg", generic_name: "Thiocolchicoside", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tizanid 2mg", generic_name: "Tizanidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tizanid 4mg", generic_name: "Tizanidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sirdalud 2mg", generic_name: "Tizanidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Baclofen 10mg", generic_name: "Baclofen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Baclofen 25mg", generic_name: "Baclofen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tolperi 150mg", generic_name: "Tolperisone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Eperison 50mg", generic_name: "Eperisone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Thyroid
  { name: "Thyrox 25mcg", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Thyrox 50mcg", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Thyrox 75mcg", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Thyrox 100mcg", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Thyrox 125mcg", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Eltroxin 50mcg", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Thyronorm 50mcg", generic_name: "Levothyroxine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Thyrocab 5mg", generic_name: "Carbimazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Thyrocab 10mg", generic_name: "Carbimazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Neomercazole 5mg", generic_name: "Carbimazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Propylthiouracil 50mg", generic_name: "Propylthiouracil", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Urologicals
  { name: "Tamsu 0.4mg", generic_name: "Tamsulosin", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flomax 0.4mg", generic_name: "Tamsulosin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Urimax 0.4mg", generic_name: "Tamsulosin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sildenafil 25mg", generic_name: "Sildenafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sildenafil 50mg", generic_name: "Sildenafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sildenafil 100mg", generic_name: "Sildenafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tadalafil 5mg", generic_name: "Tadalafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tadalafil 10mg", generic_name: "Tadalafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tadalafil 20mg", generic_name: "Tadalafil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Alfuzosin 10mg", generic_name: "Alfuzosin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Finasteride 5mg", generic_name: "Finasteride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Proscar 5mg", generic_name: "Finasteride", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dutasteride 0.5mg", generic_name: "Dutasteride", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Hormones & Contraceptives
  { name: "Provera 5mg", generic_name: "Medroxyprogesterone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Provera 10mg", generic_name: "Medroxyprogesterone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Primolut-N 5mg", generic_name: "Norethisterone", category: "Tablet", manufacturer: "Bayer" },
  { name: "Norethist 5mg", generic_name: "Norethisterone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mala-D", generic_name: "Levonorgestrel 0.15mg + Ethinyl Estradiol 0.03mg", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ovral-L", generic_name: "Levonorgestrel 0.15mg + Ethinyl Estradiol 0.03mg", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Marvelon", generic_name: "Desogestrel 0.15mg + Ethinyl Estradiol 0.03mg", category: "Tablet", manufacturer: "Organon" },
  { name: "Nordette", generic_name: "Levonorgestrel 0.15mg + Ethinyl Estradiol 0.03mg", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Postinor 0.75mg", generic_name: "Levonorgestrel", category: "Tablet", manufacturer: "Gedeon Richter" },
  { name: "I-Pill 1.5mg", generic_name: "Levonorgestrel", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clomid 50mg", generic_name: "Clomiphene Citrate", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clomifene 50mg", generic_name: "Clomiphene Citrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Anti-Gout
  { name: "Zyloric 100mg", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Zyloric 300mg", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Allop 100mg", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Allop 300mg", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Purinol 100mg", generic_name: "Allopurinol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Febuxostat 40mg", generic_name: "Febuxostat", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Febuxostat 80mg", generic_name: "Febuxostat", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Uloric 40mg", generic_name: "Febuxostat", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Colchicine 0.5mg", generic_name: "Colchicine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // Antiparasitics
  { name: "Albend 400mg", generic_name: "Albendazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Albend 200mg/5ml", generic_name: "Albendazole", category: "Suspension", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zentel 400mg", generic_name: "Albendazole", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Vermox 100mg", generic_name: "Mebendazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Mebex 100mg", generic_name: "Mebendazole", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ivermectin 6mg", generic_name: "Ivermectin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ivermectin 12mg", generic_name: "Ivermectin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Stromectol 6mg", generic_name: "Ivermectin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Praziquantel 600mg", generic_name: "Praziquantel", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // ====== SPECIALTY MEDICINES ======
  
  // CARDIOLOGY - Antiarrhythmics
  { name: "Amiodarone 100mg", generic_name: "Amiodarone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Amiodarone 200mg", generic_name: "Amiodarone", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cordarone 200mg", generic_name: "Amiodarone", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Digoxin 0.25mg", generic_name: "Digoxin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Lanoxin 0.25mg", generic_name: "Digoxin", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Procoralan 5mg", generic_name: "Ivabradine", category: "Tablet", manufacturer: "Servier Bangladesh Ltd." },
  { name: "Procoralan 7.5mg", generic_name: "Ivabradine", category: "Tablet", manufacturer: "Servier Bangladesh Ltd." },
  { name: "Ivabrad 5mg", generic_name: "Ivabradine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ivabrad 7.5mg", generic_name: "Ivabradine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Flecainide 100mg", generic_name: "Flecainide", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // CARDIOLOGY - Anticoagulants & Antiplatelets
  { name: "Warfarin 1mg", generic_name: "Warfarin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Warfarin 2mg", generic_name: "Warfarin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Warfarin 5mg", generic_name: "Warfarin", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Coumadin 5mg", generic_name: "Warfarin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rivaroxaban 10mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rivaroxaban 15mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rivaroxaban 20mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Xarelto 10mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Bayer Bangladesh" },
  { name: "Xarelto 20mg", generic_name: "Rivaroxaban", category: "Tablet", manufacturer: "Bayer Bangladesh" },
  { name: "Apixaban 2.5mg", generic_name: "Apixaban", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Apixaban 5mg", generic_name: "Apixaban", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Eliquis 5mg", generic_name: "Apixaban", category: "Tablet", manufacturer: "Pfizer Limited" },
  { name: "Dabigatran 75mg", generic_name: "Dabigatran", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dabigatran 110mg", generic_name: "Dabigatran", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Dabigatran 150mg", generic_name: "Dabigatran", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Pradaxa 110mg", generic_name: "Dabigatran", category: "Capsule", manufacturer: "Boehringer Ingelheim" },
  { name: "Heparin 5000 IU/ml", generic_name: "Heparin", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Enoxaparin 40mg", generic_name: "Enoxaparin", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Enoxaparin 60mg", generic_name: "Enoxaparin", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Clexane 40mg", generic_name: "Enoxaparin", category: "Injection", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Clexane 60mg", generic_name: "Enoxaparin", category: "Injection", manufacturer: "Sanofi Bangladesh Ltd." },
  
  // CARDIOLOGY - Antiplatelets
  { name: "Clopidogrel 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Plavix 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Copid 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clopilet 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ticagrelor 60mg", generic_name: "Ticagrelor", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ticagrelor 90mg", generic_name: "Ticagrelor", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Brilinta 90mg", generic_name: "Ticagrelor", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Prasugrel 5mg", generic_name: "Prasugrel", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Prasugrel 10mg", generic_name: "Prasugrel", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Effient 10mg", generic_name: "Prasugrel", category: "Tablet", manufacturer: "Eli Lilly" },
  
  // CARDIOLOGY - Nitrates
  { name: "Isosorbide Dinitrate 5mg", generic_name: "Isosorbide Dinitrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Isosorbide Dinitrate 10mg", generic_name: "Isosorbide Dinitrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Isordil 5mg", generic_name: "Isosorbide Dinitrate", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Isosorbide Mononitrate 20mg", generic_name: "Isosorbide Mononitrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Isosorbide Mononitrate 40mg", generic_name: "Isosorbide Mononitrate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Imdur 60mg", generic_name: "Isosorbide Mononitrate", category: "Tablet (Extended Release)", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "GTN 0.5mg", generic_name: "Glyceryl Trinitrate", category: "Tablet (Sublingual)", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nitroglycerin 0.4mg/spray", generic_name: "Glyceryl Trinitrate", category: "Spray", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // CARDIOLOGY - Heart Failure
  { name: "Sacubitril/Valsartan 50mg", generic_name: "Sacubitril/Valsartan", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Sacubitril/Valsartan 100mg", generic_name: "Sacubitril/Valsartan", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Sacubitril/Valsartan 200mg", generic_name: "Sacubitril/Valsartan", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Entresto 100mg", generic_name: "Sacubitril/Valsartan", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Entresto 200mg", generic_name: "Sacubitril/Valsartan", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Trimetazidine 20mg", generic_name: "Trimetazidine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Trimetazidine 35mg MR", generic_name: "Trimetazidine", category: "Tablet (Modified Release)", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Vastarel 35mg MR", generic_name: "Trimetazidine", category: "Tablet (Modified Release)", manufacturer: "Servier Bangladesh Ltd." },
  
  // CARDIOLOGY - ACE Inhibitors (additional)
  { name: "Perindopril 4mg", generic_name: "Perindopril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Perindopril 8mg", generic_name: "Perindopril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Coversyl 5mg", generic_name: "Perindopril", category: "Tablet", manufacturer: "Servier Bangladesh Ltd." },
  { name: "Coversyl 10mg", generic_name: "Perindopril", category: "Tablet", manufacturer: "Servier Bangladesh Ltd." },
  { name: "Trandolapril 2mg", generic_name: "Trandolapril", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Trandolapril 4mg", generic_name: "Trandolapril", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Fosinopril 10mg", generic_name: "Fosinopril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Fosinopril 20mg", generic_name: "Fosinopril", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // CARDIOLOGY - ARBs (additional)
  { name: "Candesartan 8mg", generic_name: "Candesartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Candesartan 16mg", generic_name: "Candesartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Atacand 16mg", generic_name: "Candesartan", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Irbesartan 150mg", generic_name: "Irbesartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Irbesartan 300mg", generic_name: "Irbesartan", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Aprovel 150mg", generic_name: "Irbesartan", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Azilsartan 40mg", generic_name: "Azilsartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Azilsartan 80mg", generic_name: "Azilsartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // CARDIOLOGY - Beta Blockers (additional)
  { name: "Nebivolol 2.5mg", generic_name: "Nebivolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nebivolol 5mg", generic_name: "Nebivolol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nebilet 5mg", generic_name: "Nebivolol", category: "Tablet", manufacturer: "Menarini" },
  { name: "Labetalol 100mg", generic_name: "Labetalol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Labetalol 200mg", generic_name: "Labetalol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sotalol 80mg", generic_name: "Sotalol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sotalol 160mg", generic_name: "Sotalol", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  
  // CARDIOLOGY - Calcium Channel Blockers (additional)
  { name: "Verapamil 40mg", generic_name: "Verapamil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Verapamil 80mg", generic_name: "Verapamil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Verapamil 120mg SR", generic_name: "Verapamil", category: "Tablet (Sustained Release)", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Isoptin 80mg", generic_name: "Verapamil", category: "Tablet", manufacturer: "Abbott Laboratories" },
  { name: "Felodipine 2.5mg", generic_name: "Felodipine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Felodipine 5mg", generic_name: "Felodipine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Felodipine 10mg", generic_name: "Felodipine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Nicardipine 20mg", generic_name: "Nicardipine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nicardipine 30mg", generic_name: "Nicardipine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  
  // NEPHROLOGY - Phosphate Binders
  { name: "Calcium Acetate 667mg", generic_name: "Calcium Acetate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sevelamer 400mg", generic_name: "Sevelamer Carbonate", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sevelamer 800mg", generic_name: "Sevelamer Carbonate", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Renvela 800mg", generic_name: "Sevelamer Carbonate", category: "Tablet", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Lanthanum 500mg", generic_name: "Lanthanum Carbonate", category: "Tablet (Chewable)", manufacturer: "Shire" },
  { name: "Lanthanum 750mg", generic_name: "Lanthanum Carbonate", category: "Tablet (Chewable)", manufacturer: "Shire" },
  { name: "Fosrenol 500mg", generic_name: "Lanthanum Carbonate", category: "Tablet (Chewable)", manufacturer: "Shire" },
  { name: "Sucroferric Oxyhydroxide 500mg", generic_name: "Sucroferric Oxyhydroxide", category: "Tablet (Chewable)", manufacturer: "Fresenius Medical Care" },
  
  // NEPHROLOGY - Potassium Binders
  { name: "Sodium Polystyrene Sulfonate 15g", generic_name: "Sodium Polystyrene Sulfonate", category: "Powder", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Kayexalate 15g", generic_name: "Sodium Polystyrene Sulfonate", category: "Powder", manufacturer: "Sanofi Bangladesh Ltd." },
  { name: "Patiromer 8.4g", generic_name: "Patiromer", category: "Powder", manufacturer: "Vifor Pharma" },
  { name: "Veltassa 8.4g", generic_name: "Patiromer", category: "Powder", manufacturer: "Vifor Pharma" },
  { name: "Sodium Zirconium Cyclosilicate 5g", generic_name: "Sodium Zirconium Cyclosilicate", category: "Powder", manufacturer: "AstraZeneca" },
  { name: "Lokelma 5g", generic_name: "Sodium Zirconium Cyclosilicate", category: "Powder", manufacturer: "AstraZeneca" },
  
  // NEPHROLOGY - Anemia Management
  { name: "Erythropoietin 2000 IU", generic_name: "Epoetin Alfa", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Erythropoietin 4000 IU", generic_name: "Epoetin Alfa", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Erythropoietin 10000 IU", generic_name: "Epoetin Alfa", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Eprex 4000 IU", generic_name: "Epoetin Alfa", category: "Injection", manufacturer: "Janssen" },
  { name: "Darbepoetin Alfa 25mcg", generic_name: "Darbepoetin Alfa", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Darbepoetin Alfa 40mcg", generic_name: "Darbepoetin Alfa", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Darbepoetin Alfa 60mcg", generic_name: "Darbepoetin Alfa", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Aranesp 40mcg", generic_name: "Darbepoetin Alfa", category: "Injection", manufacturer: "Amgen" },
  { name: "Iron Sucrose 100mg/5ml", generic_name: "Iron Sucrose", category: "Injection", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Venofer 100mg/5ml", generic_name: "Iron Sucrose", category: "Injection", manufacturer: "Vifor Pharma" },
  { name: "Ferric Carboxymaltose 500mg", generic_name: "Ferric Carboxymaltose", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ferinject 500mg", generic_name: "Ferric Carboxymaltose", category: "Injection", manufacturer: "Vifor Pharma" },
  
  // NEPHROLOGY - Vitamin D & Bone
  { name: "Calcitriol 0.25mcg", generic_name: "Calcitriol", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Calcitriol 0.5mcg", generic_name: "Calcitriol", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Rocaltrol 0.25mcg", generic_name: "Calcitriol", category: "Capsule", manufacturer: "Roche" },
  { name: "Alfacalcidol 0.25mcg", generic_name: "Alfacalcidol", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Alfacalcidol 0.5mcg", generic_name: "Alfacalcidol", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Alfacalcidol 1mcg", generic_name: "Alfacalcidol", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "One-Alpha 0.25mcg", generic_name: "Alfacalcidol", category: "Capsule", manufacturer: "Leo Pharma" },
  { name: "Paricalcitol 1mcg", generic_name: "Paricalcitol", category: "Capsule", manufacturer: "AbbVie" },
  { name: "Paricalcitol 2mcg", generic_name: "Paricalcitol", category: "Capsule", manufacturer: "AbbVie" },
  { name: "Zemplar 2mcg", generic_name: "Paricalcitol", category: "Capsule", manufacturer: "AbbVie" },
  { name: "Cinacalcet 30mg", generic_name: "Cinacalcet", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cinacalcet 60mg", generic_name: "Cinacalcet", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cinacalcet 90mg", generic_name: "Cinacalcet", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sensipar 30mg", generic_name: "Cinacalcet", category: "Tablet", manufacturer: "Amgen" },
  
  // NEPHROLOGY - Immunosuppressants (Transplant)
  { name: "Cyclosporine 25mg", generic_name: "Cyclosporine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cyclosporine 50mg", generic_name: "Cyclosporine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Cyclosporine 100mg", generic_name: "Cyclosporine", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Sandimmun Neoral 25mg", generic_name: "Cyclosporine", category: "Capsule", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Sandimmun Neoral 100mg", generic_name: "Cyclosporine", category: "Capsule", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Tacrolimus 0.5mg", generic_name: "Tacrolimus", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tacrolimus 1mg", generic_name: "Tacrolimus", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tacrolimus 5mg", generic_name: "Tacrolimus", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Prograf 0.5mg", generic_name: "Tacrolimus", category: "Capsule", manufacturer: "Astellas Pharma" },
  { name: "Prograf 1mg", generic_name: "Tacrolimus", category: "Capsule", manufacturer: "Astellas Pharma" },
  { name: "Mycophenolate Mofetil 250mg", generic_name: "Mycophenolate Mofetil", category: "Capsule", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Mycophenolate Mofetil 500mg", generic_name: "Mycophenolate Mofetil", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "CellCept 250mg", generic_name: "Mycophenolate Mofetil", category: "Capsule", manufacturer: "Roche" },
  { name: "CellCept 500mg", generic_name: "Mycophenolate Mofetil", category: "Tablet", manufacturer: "Roche" },
  { name: "Azathioprine 50mg", generic_name: "Azathioprine", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Imuran 50mg", generic_name: "Azathioprine", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Sirolimus 1mg", generic_name: "Sirolimus", category: "Tablet", manufacturer: "Pfizer Limited" },
  { name: "Sirolimus 2mg", generic_name: "Sirolimus", category: "Tablet", manufacturer: "Pfizer Limited" },
  { name: "Rapamune 1mg", generic_name: "Sirolimus", category: "Tablet", manufacturer: "Pfizer Limited" },
  { name: "Everolimus 0.25mg", generic_name: "Everolimus", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Everolimus 0.5mg", generic_name: "Everolimus", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Everolimus 0.75mg", generic_name: "Everolimus", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Certican 0.5mg", generic_name: "Everolimus", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  
  // ONCOLOGY - Targeted Therapies (Tyrosine Kinase Inhibitors)
  { name: "Imatinib 100mg", generic_name: "Imatinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Imatinib 400mg", generic_name: "Imatinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Glivec 100mg", generic_name: "Imatinib", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Glivec 400mg", generic_name: "Imatinib", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Nilotinib 150mg", generic_name: "Nilotinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Nilotinib 200mg", generic_name: "Nilotinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Tasigna 150mg", generic_name: "Nilotinib", category: "Capsule", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Dasatinib 50mg", generic_name: "Dasatinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Dasatinib 70mg", generic_name: "Dasatinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Dasatinib 100mg", generic_name: "Dasatinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Sprycel 50mg", generic_name: "Dasatinib", category: "Tablet", manufacturer: "Bristol-Myers Squibb" },
  { name: "Erlotinib 100mg", generic_name: "Erlotinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Erlotinib 150mg", generic_name: "Erlotinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Tarceva 150mg", generic_name: "Erlotinib", category: "Tablet", manufacturer: "Roche" },
  { name: "Gefitinib 250mg", generic_name: "Gefitinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Iressa 250mg", generic_name: "Gefitinib", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Osimertinib 40mg", generic_name: "Osimertinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Osimertinib 80mg", generic_name: "Osimertinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Tagrisso 80mg", generic_name: "Osimertinib", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Sunitinib 12.5mg", generic_name: "Sunitinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Sunitinib 25mg", generic_name: "Sunitinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Sunitinib 50mg", generic_name: "Sunitinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Sutent 25mg", generic_name: "Sunitinib", category: "Capsule", manufacturer: "Pfizer Limited" },
  { name: "Sorafenib 200mg", generic_name: "Sorafenib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Nexavar 200mg", generic_name: "Sorafenib", category: "Tablet", manufacturer: "Bayer Bangladesh" },
  { name: "Regorafenib 40mg", generic_name: "Regorafenib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Stivarga 40mg", generic_name: "Regorafenib", category: "Tablet", manufacturer: "Bayer Bangladesh" },
  { name: "Lenvatinib 4mg", generic_name: "Lenvatinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Lenvatinib 10mg", generic_name: "Lenvatinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Lenvima 10mg", generic_name: "Lenvatinib", category: "Capsule", manufacturer: "Eisai" },
  { name: "Pazopanib 200mg", generic_name: "Pazopanib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Pazopanib 400mg", generic_name: "Pazopanib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Votrient 400mg", generic_name: "Pazopanib", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Axitinib 1mg", generic_name: "Axitinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Axitinib 5mg", generic_name: "Axitinib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Inlyta 5mg", generic_name: "Axitinib", category: "Tablet", manufacturer: "Pfizer Limited" },
  
  // ONCOLOGY - CDK4/6 Inhibitors (Breast Cancer)
  { name: "Palbociclib 75mg", generic_name: "Palbociclib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Palbociclib 100mg", generic_name: "Palbociclib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Palbociclib 125mg", generic_name: "Palbociclib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Ibrance 125mg", generic_name: "Palbociclib", category: "Capsule", manufacturer: "Pfizer Limited" },
  { name: "Ribociclib 200mg", generic_name: "Ribociclib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Kisqali 200mg", generic_name: "Ribociclib", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Abemaciclib 50mg", generic_name: "Abemaciclib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Abemaciclib 100mg", generic_name: "Abemaciclib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Abemaciclib 150mg", generic_name: "Abemaciclib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Verzenio 150mg", generic_name: "Abemaciclib", category: "Tablet", manufacturer: "Eli Lilly" },
  
  // ONCOLOGY - Hormonal Therapies
  { name: "Tamoxifen 10mg", generic_name: "Tamoxifen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Tamoxifen 20mg", generic_name: "Tamoxifen", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Nolvadex 20mg", generic_name: "Tamoxifen", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Letrozole 2.5mg", generic_name: "Letrozole", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Femara 2.5mg", generic_name: "Letrozole", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Anastrozole 1mg", generic_name: "Anastrozole", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Arimidex 1mg", generic_name: "Anastrozole", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Exemestane 25mg", generic_name: "Exemestane", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Aromasin 25mg", generic_name: "Exemestane", category: "Tablet", manufacturer: "Pfizer Limited" },
  { name: "Fulvestrant 250mg/5ml", generic_name: "Fulvestrant", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Faslodex 250mg", generic_name: "Fulvestrant", category: "Injection", manufacturer: "AstraZeneca" },
  { name: "Bicalutamide 50mg", generic_name: "Bicalutamide", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Casodex 50mg", generic_name: "Bicalutamide", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Enzalutamide 40mg", generic_name: "Enzalutamide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Xtandi 40mg", generic_name: "Enzalutamide", category: "Capsule", manufacturer: "Astellas Pharma" },
  { name: "Abiraterone 250mg", generic_name: "Abiraterone", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Abiraterone 500mg", generic_name: "Abiraterone", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Zytiga 250mg", generic_name: "Abiraterone", category: "Tablet", manufacturer: "Janssen" },
  { name: "Goserelin 3.6mg", generic_name: "Goserelin", category: "Injection (Implant)", manufacturer: "AstraZeneca" },
  { name: "Goserelin 10.8mg", generic_name: "Goserelin", category: "Injection (Implant)", manufacturer: "AstraZeneca" },
  { name: "Zoladex 3.6mg", generic_name: "Goserelin", category: "Injection (Implant)", manufacturer: "AstraZeneca" },
  { name: "Leuprolide 3.75mg", generic_name: "Leuprolide", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Leuprolide 7.5mg", generic_name: "Leuprolide", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Lupron 7.5mg", generic_name: "Leuprolide", category: "Injection", manufacturer: "AbbVie" },
  
  // ONCOLOGY - PARP Inhibitors
  { name: "Olaparib 50mg", generic_name: "Olaparib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Olaparib 100mg", generic_name: "Olaparib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Olaparib 150mg", generic_name: "Olaparib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Lynparza 150mg", generic_name: "Olaparib", category: "Tablet", manufacturer: "AstraZeneca" },
  { name: "Niraparib 100mg", generic_name: "Niraparib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Zejula 100mg", generic_name: "Niraparib", category: "Capsule", manufacturer: "GSK" },
  { name: "Rucaparib 200mg", generic_name: "Rucaparib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Rucaparib 300mg", generic_name: "Rucaparib", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Rubraca 300mg", generic_name: "Rucaparib", category: "Tablet", manufacturer: "Clovis Oncology" },
  
  // ONCOLOGY - mTOR Inhibitors
  { name: "Everolimus 5mg (Oncology)", generic_name: "Everolimus", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Everolimus 10mg (Oncology)", generic_name: "Everolimus", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Afinitor 10mg", generic_name: "Everolimus", category: "Tablet", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Temsirolimus 25mg/ml", generic_name: "Temsirolimus", category: "Injection", manufacturer: "Pfizer Limited" },
  { name: "Torisel 25mg", generic_name: "Temsirolimus", category: "Injection", manufacturer: "Pfizer Limited" },
  
  // ONCOLOGY - Cytotoxic Chemotherapy (Oral)
  { name: "Capecitabine 150mg", generic_name: "Capecitabine", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Capecitabine 500mg", generic_name: "Capecitabine", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Xeloda 500mg", generic_name: "Capecitabine", category: "Tablet", manufacturer: "Roche" },
  { name: "Cyclophosphamide 50mg", generic_name: "Cyclophosphamide", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Endoxan 50mg", generic_name: "Cyclophosphamide", category: "Tablet", manufacturer: "Baxter" },
  { name: "Methotrexate 2.5mg", generic_name: "Methotrexate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Methotrexate 10mg", generic_name: "Methotrexate", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Etoposide 50mg", generic_name: "Etoposide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Etoposide 100mg", generic_name: "Etoposide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Vepesid 50mg", generic_name: "Etoposide", category: "Capsule", manufacturer: "Bristol-Myers Squibb" },
  { name: "Hydroxyurea 500mg", generic_name: "Hydroxyurea", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Hydrea 500mg", generic_name: "Hydroxyurea", category: "Capsule", manufacturer: "Bristol-Myers Squibb" },
  { name: "Mercaptopurine 50mg", generic_name: "Mercaptopurine", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Purinethol 50mg", generic_name: "Mercaptopurine", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Thioguanine 40mg", generic_name: "Thioguanine", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Vinorelbine 20mg", generic_name: "Vinorelbine", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Vinorelbine 30mg", generic_name: "Vinorelbine", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Navelbine 30mg", generic_name: "Vinorelbine", category: "Capsule", manufacturer: "Pierre Fabre" },
  
  // ONCOLOGY - Anti-emetics (Chemotherapy Support)
  { name: "Ondansetron 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Ondansetron 8mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Square Pharmaceuticals PLC" },
  { name: "Zofran 8mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Glaxo SmithKline Bangladesh Ltd." },
  { name: "Granisetron 1mg", generic_name: "Granisetron", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Granisetron 2mg", generic_name: "Granisetron", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Kytril 1mg", generic_name: "Granisetron", category: "Tablet", manufacturer: "Roche" },
  { name: "Palonosetron 0.5mg", generic_name: "Palonosetron", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Aloxi 0.5mg", generic_name: "Palonosetron", category: "Capsule", manufacturer: "Helsinn" },
  { name: "Aprepitant 80mg", generic_name: "Aprepitant", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Aprepitant 125mg", generic_name: "Aprepitant", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Emend 125mg", generic_name: "Aprepitant", category: "Capsule", manufacturer: "Merck" },
  { name: "Fosaprepitant 150mg", generic_name: "Fosaprepitant", category: "Injection", manufacturer: "Merck" },
  
  // ONCOLOGY - Bone Modifying Agents
  { name: "Zoledronic Acid 4mg/5ml", generic_name: "Zoledronic Acid", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Zometa 4mg", generic_name: "Zoledronic Acid", category: "Injection", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Denosumab 60mg/ml", generic_name: "Denosumab", category: "Injection", manufacturer: "Amgen" },
  { name: "Denosumab 120mg/1.7ml", generic_name: "Denosumab", category: "Injection", manufacturer: "Amgen" },
  { name: "Xgeva 120mg", generic_name: "Denosumab", category: "Injection", manufacturer: "Amgen" },
  { name: "Prolia 60mg", generic_name: "Denosumab", category: "Injection", manufacturer: "Amgen" },
  { name: "Pamidronate 30mg", generic_name: "Pamidronate", category: "Injection", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Pamidronate 90mg", generic_name: "Pamidronate", category: "Injection", manufacturer: "Novartis Bangladesh Ltd." },
  { name: "Aredia 90mg", generic_name: "Pamidronate", category: "Injection", manufacturer: "Novartis Bangladesh Ltd." },
  
  // ONCOLOGY - Growth Factors
  { name: "Filgrastim 300mcg", generic_name: "Filgrastim", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Filgrastim 480mcg", generic_name: "Filgrastim", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Neupogen 300mcg", generic_name: "Filgrastim", category: "Injection", manufacturer: "Amgen" },
  { name: "Pegfilgrastim 6mg", generic_name: "Pegfilgrastim", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Neulasta 6mg", generic_name: "Pegfilgrastim", category: "Injection", manufacturer: "Amgen" },
  
  // ONCOLOGY - BTK Inhibitors (Hematologic)
  { name: "Ibrutinib 140mg", generic_name: "Ibrutinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Imbruvica 140mg", generic_name: "Ibrutinib", category: "Capsule", manufacturer: "Janssen" },
  { name: "Acalabrutinib 100mg", generic_name: "Acalabrutinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Calquence 100mg", generic_name: "Acalabrutinib", category: "Capsule", manufacturer: "AstraZeneca" },
  { name: "Zanubrutinib 80mg", generic_name: "Zanubrutinib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Brukinsa 80mg", generic_name: "Zanubrutinib", category: "Capsule", manufacturer: "BeiGene" },
  
  // ONCOLOGY - BCL-2 Inhibitors
  { name: "Venetoclax 10mg", generic_name: "Venetoclax", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Venetoclax 50mg", generic_name: "Venetoclax", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Venetoclax 100mg", generic_name: "Venetoclax", category: "Tablet", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Venclexta 100mg", generic_name: "Venetoclax", category: "Tablet", manufacturer: "AbbVie" },
  
  // ONCOLOGY - Immunomodulators
  { name: "Lenalidomide 5mg", generic_name: "Lenalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Lenalidomide 10mg", generic_name: "Lenalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Lenalidomide 15mg", generic_name: "Lenalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Lenalidomide 25mg", generic_name: "Lenalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Revlimid 25mg", generic_name: "Lenalidomide", category: "Capsule", manufacturer: "Bristol-Myers Squibb" },
  { name: "Pomalidomide 1mg", generic_name: "Pomalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Pomalidomide 2mg", generic_name: "Pomalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Pomalidomide 4mg", generic_name: "Pomalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Pomalyst 4mg", generic_name: "Pomalidomide", category: "Capsule", manufacturer: "Bristol-Myers Squibb" },
  { name: "Thalidomide 50mg", generic_name: "Thalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Thalidomide 100mg", generic_name: "Thalidomide", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  
  // ONCOLOGY - Proteasome Inhibitors
  { name: "Bortezomib 2mg", generic_name: "Bortezomib", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Bortezomib 3.5mg", generic_name: "Bortezomib", category: "Injection", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Velcade 3.5mg", generic_name: "Bortezomib", category: "Injection", manufacturer: "Janssen" },
  { name: "Ixazomib 2.3mg", generic_name: "Ixazomib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Ixazomib 3mg", generic_name: "Ixazomib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Ixazomib 4mg", generic_name: "Ixazomib", category: "Capsule", manufacturer: "Beacon Pharmaceuticals Ltd." },
  { name: "Ninlaro 4mg", generic_name: "Ixazomib", category: "Capsule", manufacturer: "Takeda" },
  { name: "Carfilzomib 60mg", generic_name: "Carfilzomib", category: "Injection", manufacturer: "Amgen" },
  { name: "Kyprolis 60mg", generic_name: "Carfilzomib", category: "Injection", manufacturer: "Amgen" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Importing allopathic medicines with strength...');
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
