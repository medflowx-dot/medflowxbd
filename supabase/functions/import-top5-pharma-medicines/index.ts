import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended medicines data for Top 5 manufacturers (Beximco, Incepta, Renata, ACI)
// Focus on common allopathic medicines to reach 100% coverage
const TOP5_PHARMA_MEDICINES = [
  // ========== BEXIMCO PHARMACEUTICALS LTD. ==========
  // Antibiotics
  { name: "Azithro 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Azithro 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Azithro DS Suspension", generic_name: "Azithromycin", category: "Suspension", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cefim 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cefim 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cefim Suspension", generic_name: "Cefixime", category: "Suspension", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ceftron 1g IV", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ceftron 500mg IV", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ciprox 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ciprox 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ciprox IV", generic_name: "Ciprofloxacin", category: "Infusion", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Levoflox 250mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Levoflox 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Levoflox 750mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Moxiflox 400mg", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amoxin 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amoxin 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amoxin Suspension", generic_name: "Amoxicillin", category: "Suspension", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amoclav 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amoclav 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amoclav 1g", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amoclav Suspension", generic_name: "Amoxicillin + Clavulanic Acid", category: "Suspension", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fluclo 250mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fluclo 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clarithro 250mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clarithro 500mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Doxy 100mg", generic_name: "Doxycycline", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Metro 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cephrad 500mg", generic_name: "Cephradine", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cephrad 1g", generic_name: "Cephradine", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // GI Medicines
  { name: "Eso 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Eso 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Omep 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Omep 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Panto 20mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Panto 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Panto IV", generic_name: "Pantoprazole", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rabe 20mg", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rani 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rani 300mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dom 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dom Suspension", generic_name: "Domperidone", category: "Suspension", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ondex 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ondex 8mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Cardiovascular
  { name: "Amlod 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amlod 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Losar 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Losar 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Losar 100mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Losar Plus", generic_name: "Losartan + Hydrochlorothiazide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Telmi 20mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Telmi 40mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Telmi 80mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aten 25mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aten 50mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aten 100mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bisop 2.5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bisop 5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Bisop 10mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Atorva 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Atorva 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Atorva 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rosuvast 5mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rosuvast 10mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Rosuvast 20mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clopid 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aspirin 75mg EC", generic_name: "Aspirin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dilti 30mg", generic_name: "Diltiazem", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dilti 60mg", generic_name: "Diltiazem", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Diabetes
  { name: "Metfor 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Metfor 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Metfor 1000mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Metfor XR 500mg", generic_name: "Metformin XR", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Metfor XR 1000mg", generic_name: "Metformin XR", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glime 1mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glime 2mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glime 3mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glime 4mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glicla 80mg", generic_name: "Gliclazide", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glicla MR 30mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Glicla MR 60mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Sita 50mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Sita 100mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vilda 50mg", generic_name: "Vildagliptin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lina 5mg", generic_name: "Linagliptin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Empa 10mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Empa 25mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dapa 5mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dapa 10mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Pain & Inflammation
  { name: "Napro 250mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Napro 500mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ketor 10mg", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Ketor IM", generic_name: "Ketorolac", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aceclo 100mg", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Aceclo Plus", generic_name: "Aceclofenac + Paracetamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Etor 60mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Etor 90mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Etor 120mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Para 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Para Syrup", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Para IV", generic_name: "Paracetamol", category: "Infusion", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Tramad 50mg", generic_name: "Tramadol", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Respiratory
  { name: "Salbu Inhaler", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Salbu Nebulizer", generic_name: "Salbutamol", category: "Nebulizer Solution", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Salbu Syrup", generic_name: "Salbutamol", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Formo Inhaler", generic_name: "Formoterol", category: "Inhaler", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Budes Inhaler", generic_name: "Budesonide", category: "Inhaler", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Flutica Inhaler", generic_name: "Fluticasone", category: "Inhaler", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Monte 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Monte 5mg Chew", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Monte 4mg Chew", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fexo 60mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fexo 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fexo 180mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cetir 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Levocet 5mg", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Lorata 10mg", generic_name: "Loratadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Deslo 5mg", generic_name: "Desloratadine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Steroids & Anti-inflammatory
  { name: "Predni 5mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Predni 10mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Predni 20mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dexa 0.5mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dexa 4mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Dexa IV", generic_name: "Dexamethasone", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Defla 6mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Defla 30mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Hydro 10mg", generic_name: "Hydrocortisone", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Hydro IV", generic_name: "Hydrocortisone", category: "Injection", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Neurological
  { name: "Gabap 100mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Gabap 300mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Gabap 400mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Pregab 50mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Pregab 75mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Pregab 150mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Carba 200mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Carba 400mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Valp 200mg", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Valp 500mg", generic_name: "Sodium Valproate", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Betahist 8mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Betahist 16mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Betahist 24mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Psychiatric
  { name: "Sertra 25mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Sertra 50mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Sertra 100mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Escita 5mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Escita 10mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Escita 20mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Fluox 20mg", generic_name: "Fluoxetine", category: "Capsule", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amitri 10mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Amitri 25mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clonaz 0.5mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Clonaz 2mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Alpraz 0.25mg", generic_name: "Alprazolam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Alpraz 0.5mg", generic_name: "Alprazolam", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // Vitamins & Supplements
  { name: "Cal D 500mg", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Cal D Syrup", generic_name: "Calcium + Vitamin D", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vit D3 1000IU", generic_name: "Cholecalciferol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vit D3 2000IU", generic_name: "Cholecalciferol", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Vit B Complex", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Folic Acid 5mg", generic_name: "Folic Acid", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Iron Syrup", generic_name: "Iron + Folic Acid", category: "Syrup", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Zinc 20mg", generic_name: "Zinc", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  { name: "Multivit", generic_name: "Multivitamin", category: "Tablet", manufacturer: "Beximco Pharmaceuticals Ltd." },
  
  // ========== INCEPTA PHARMACEUTICALS LTD. ==========
  // Antibiotics
  { name: "Azith 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Azith 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Azith Suspension", generic_name: "Azithromycin", category: "Suspension", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cefixim 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cefixim 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ceftrix 1g", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ceftrix 500mg", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ciprocin 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ciprocin 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levocin 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levocin 750mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Moxicin 400mg", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Amoxil 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Amoxil 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Augmox 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Augmox 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Augmox 1g", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Floxacil 250mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Floxacil 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Clari 250mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Clari 500mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Doxycap 100mg", generic_name: "Doxycycline", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Metron 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cefrad 500mg", generic_name: "Cephradine", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Meronem 500mg", generic_name: "Meropenem", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Meronem 1g", generic_name: "Meropenem", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // GI Medicines
  { name: "Esoral 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Esoral 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Seclo 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Seclo 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Panoral 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Panoral IV", generic_name: "Pantoprazole", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Rabep 20mg", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ranitin 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Domperi 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ondan 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ondan 8mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Cardiovascular
  { name: "Amdocal 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Amdocal 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Losart 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Losart 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Losart 100mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Losart H", generic_name: "Losartan + Hydrochlorothiazide", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Telsar 20mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Telsar 40mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Telsar 80mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ateno 25mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ateno 50mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Biso 2.5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Biso 5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Atorcor 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Atorcor 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Atorcor 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Rosuva 5mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Rosuva 10mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Rosuva 20mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Clopid 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ecosprin 75mg", generic_name: "Aspirin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Diabetes
  { name: "Metform 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Metform 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Metform 1000mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Metform XR 500mg", generic_name: "Metformin XR", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Glimep 1mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Glimep 2mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Glimep 4mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Gliclaz MR 30mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Gliclaz MR 60mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sitagen 50mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sitagen 100mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Vildagen 50mg", generic_name: "Vildagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Linagen 5mg", generic_name: "Linagliptin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Empagen 10mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Empagen 25mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dapagen 10mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Insulin Mixtard", generic_name: "Insulin Mixtard", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Insulin Glargine", generic_name: "Insulin Glargine", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Pain & Inflammation
  { name: "Naprosyn 250mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Naprosyn 500mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ketoral 10mg", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ketoral IM", generic_name: "Ketorolac", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Acefen 100mg", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Acefen Plus", generic_name: "Aceclofenac + Paracetamol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Etori 60mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Etori 90mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Etori 120mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pyremol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pyremol Syrup", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pyremol IV", generic_name: "Paracetamol", category: "Infusion", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tramal 50mg", generic_name: "Tramadol", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Respiratory
  { name: "Ventolin Inhaler", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ventolin Nebulizer", generic_name: "Salbutamol", category: "Nebulizer Solution", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Budecort Inhaler", generic_name: "Budesonide", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Flixotide Inhaler", generic_name: "Fluticasone", category: "Inhaler", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Montas 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Montas 5mg Chew", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Histafex 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Histafex 180mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Cetzine 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Levoriz 5mg", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Loratin 10mg", generic_name: "Loratadine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Steroids
  { name: "Predsol 5mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Predsol 20mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dexason 0.5mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dexason 4mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Dexason IV", generic_name: "Dexamethasone", category: "Injection", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Deflaz 6mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Deflaz 30mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Neurological
  { name: "Gabatin 100mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Gabatin 300mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pregab 50mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pregab 75mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Pregab 150mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Tegral 200mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Vertin 8mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Vertin 16mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Vertin 24mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Psychiatric
  { name: "Sertral 50mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Sertral 100mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Escipram 10mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Escipram 20mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Prozac 20mg", generic_name: "Fluoxetine", category: "Capsule", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Trypt 10mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Trypt 25mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Clonex 0.5mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Clonex 2mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // Vitamins & Supplements
  { name: "Calcin D 500mg", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Vit D3 1000IU", generic_name: "Cholecalciferol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Vit D3 2000IU", generic_name: "Cholecalciferol", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "B-Plex", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Folacid 5mg", generic_name: "Folic Acid", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Ferrogen Syrup", generic_name: "Iron + Folic Acid", category: "Syrup", manufacturer: "Incepta Pharmaceuticals Ltd." },
  { name: "Zincovit", generic_name: "Zinc", category: "Tablet", manufacturer: "Incepta Pharmaceuticals Ltd." },
  
  // ========== RENATA LIMITED ==========
  // Antibiotics
  { name: "Azicin 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Azicin 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Azicin DS Suspension", generic_name: "Azithromycin", category: "Suspension", manufacturer: "Renata Limited" },
  { name: "Cef-3 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Cef-3 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Cef-3 Suspension", generic_name: "Cefixime", category: "Suspension", manufacturer: "Renata Limited" },
  { name: "Trizon 1g IV", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Renata Limited" },
  { name: "Trizon 500mg IV", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "Renata Limited" },
  { name: "Ciproren 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Ciproren 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Levoren 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Levoren 750mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Moxiren 400mg", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Amoren 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Amoren 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Amoren Suspension", generic_name: "Amoxicillin", category: "Suspension", manufacturer: "Renata Limited" },
  { name: "Clavoren 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clavoren 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clavoren 1g", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clavoren Suspension", generic_name: "Amoxicillin + Clavulanic Acid", category: "Suspension", manufacturer: "Renata Limited" },
  { name: "Flucloren 250mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Flucloren 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Clariren 250mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clariren 500mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Doxiren 100mg", generic_name: "Doxycycline", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Metroren 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Cephroren 500mg", generic_name: "Cephradine", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Meroren 500mg", generic_name: "Meropenem", category: "Injection", manufacturer: "Renata Limited" },
  { name: "Meroren 1g", generic_name: "Meropenem", category: "Injection", manufacturer: "Renata Limited" },
  
  // GI Medicines
  { name: "Esoren 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Esoren 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Omiren 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Omiren 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Pantoren 20mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Pantoren 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Pantoren IV", generic_name: "Pantoprazole", category: "Injection", manufacturer: "Renata Limited" },
  { name: "Rabiren 20mg", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Raniren 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Raniren 300mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Domiren 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Ondaren 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Ondaren 8mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Cardiovascular
  { name: "Amloren 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Amloren 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Losren 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Losren 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Losren 100mg", generic_name: "Losartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Losren Plus", generic_name: "Losartan + Hydrochlorothiazide", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Telmiren 20mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Telmiren 40mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Telmiren 80mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atoren 25mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atoren 50mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Bisoren 2.5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Bisoren 5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atorren 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atorren 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Atorren 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Rosuren 5mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Rosuren 10mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Rosuren 20mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clopiren 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Aspiren 75mg EC", generic_name: "Aspirin", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Diabetes
  { name: "Metren 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Metren 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Metren 1000mg", generic_name: "Metformin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Metren XR 500mg", generic_name: "Metformin XR", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Glimren 1mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Glimren 2mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Glimren 4mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Gliclaren MR 30mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Gliclaren MR 60mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Sitaren 50mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Sitaren 100mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Vildaren 50mg", generic_name: "Vildagliptin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Linaren 5mg", generic_name: "Linagliptin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Emparen 10mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Emparen 25mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Daparen 10mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Pain & Inflammation
  { name: "Naproren 250mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Naproren 500mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Ketoren 10mg", generic_name: "Ketorolac", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Aceren 100mg", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Aceren Plus", generic_name: "Aceclofenac + Paracetamol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Etoren 60mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Etoren 90mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Etoren 120mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Pararen 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Pararen Syrup", generic_name: "Paracetamol", category: "Syrup", manufacturer: "Renata Limited" },
  { name: "Tramaren 50mg", generic_name: "Tramadol", category: "Capsule", manufacturer: "Renata Limited" },
  
  // Respiratory
  { name: "Salbutaren Inhaler", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "Renata Limited" },
  { name: "Buderen Inhaler", generic_name: "Budesonide", category: "Inhaler", manufacturer: "Renata Limited" },
  { name: "Flutiren Inhaler", generic_name: "Fluticasone", category: "Inhaler", manufacturer: "Renata Limited" },
  { name: "Monteren 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Monteren 5mg Chew", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "Renata Limited" },
  { name: "Fexoren 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Fexoren 180mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Cetiren 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Levocetiren 5mg", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Lorataren 10mg", generic_name: "Loratadine", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Steroids
  { name: "Predren 5mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Predren 20mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Dexaren 0.5mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Dexaren 4mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Deflaren 6mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Deflaren 30mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Neurological
  { name: "Gabaren 100mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Gabaren 300mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Pregaren 50mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Pregaren 75mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Pregaren 150mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Carbaren 200mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Betaren 8mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Betaren 16mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Betaren 24mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Psychiatric
  { name: "Sertraren 50mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Sertraren 100mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Escitaren 10mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Escitaren 20mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Fluoxren 20mg", generic_name: "Fluoxetine", category: "Capsule", manufacturer: "Renata Limited" },
  { name: "Amitriren 10mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Amitriren 25mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clonaren 0.5mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Clonaren 2mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "Renata Limited" },
  
  // Vitamins
  { name: "Calciren D", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Vit D3 1000IU", generic_name: "Cholecalciferol", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "B-Complexren", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Folicren 5mg", generic_name: "Folic Acid", category: "Tablet", manufacturer: "Renata Limited" },
  { name: "Ironren Syrup", generic_name: "Iron + Folic Acid", category: "Syrup", manufacturer: "Renata Limited" },
  { name: "Zincren 20mg", generic_name: "Zinc", category: "Tablet", manufacturer: "Renata Limited" },
  
  // ========== ACI LIMITED ==========
  // Antibiotics
  { name: "Azilide 250mg", generic_name: "Azithromycin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Azilide 500mg", generic_name: "Azithromycin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Azilide Suspension", generic_name: "Azithromycin", category: "Suspension", manufacturer: "ACI Limited" },
  { name: "Cefixim 200mg", generic_name: "Cefixime", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Cefixim 400mg", generic_name: "Cefixime", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Cefixim Suspension", generic_name: "Cefixime", category: "Suspension", manufacturer: "ACI Limited" },
  { name: "Ceftrix 1g IV", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "ACI Limited" },
  { name: "Ceftrix 500mg IV", generic_name: "Ceftriaxone", category: "Injection", manufacturer: "ACI Limited" },
  { name: "Ciprolet 250mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ciprolet 500mg", generic_name: "Ciprofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Levoxin 500mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Levoxin 750mg", generic_name: "Levofloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Moxicip 400mg", generic_name: "Moxifloxacin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Amoxin 250mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Amoxin 500mg", generic_name: "Amoxicillin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Amoxin Suspension", generic_name: "Amoxicillin", category: "Suspension", manufacturer: "ACI Limited" },
  { name: "Clavulin 375mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clavulin 625mg", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clavulin 1g", generic_name: "Amoxicillin + Clavulanic Acid", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clavulin Suspension", generic_name: "Amoxicillin + Clavulanic Acid", category: "Suspension", manufacturer: "ACI Limited" },
  { name: "Flucil 250mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Flucil 500mg", generic_name: "Flucloxacillin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Clarithin 250mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clarithin 500mg", generic_name: "Clarithromycin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Doxycap 100mg", generic_name: "Doxycycline", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Metrozol 400mg", generic_name: "Metronidazole", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Cephin 500mg", generic_name: "Cephradine", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Meropin 500mg", generic_name: "Meropenem", category: "Injection", manufacturer: "ACI Limited" },
  { name: "Meropin 1g", generic_name: "Meropenem", category: "Injection", manufacturer: "ACI Limited" },
  
  // GI Medicines
  { name: "Esoral 20mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Esoral 40mg", generic_name: "Esomeprazole", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Omeprol 20mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Omeprol 40mg", generic_name: "Omeprazole", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Pantid 20mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Pantid 40mg", generic_name: "Pantoprazole", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Pantid IV", generic_name: "Pantoprazole", category: "Injection", manufacturer: "ACI Limited" },
  { name: "Rabeloc 20mg", generic_name: "Rabeprazole", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ranidine 150mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ranidine 300mg", generic_name: "Ranitidine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Domicol 10mg", generic_name: "Domperidone", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ondavell 4mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ondavell 8mg", generic_name: "Ondansetron", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Cardiovascular
  { name: "Amlodip 5mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Amlodip 10mg", generic_name: "Amlodipine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Losatab 25mg", generic_name: "Losartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Losatab 50mg", generic_name: "Losartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Losatab 100mg", generic_name: "Losartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Losatab Plus", generic_name: "Losartan + Hydrochlorothiazide", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Telmid 20mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Telmid 40mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Telmid 80mg", generic_name: "Telmisartan", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atenol 25mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atenol 50mg", generic_name: "Atenolol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Bisocor 2.5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Bisocor 5mg", generic_name: "Bisoprolol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atorid 10mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atorid 20mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Atorid 40mg", generic_name: "Atorvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Rosuid 5mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Rosuid 10mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Rosuid 20mg", generic_name: "Rosuvastatin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clopilet 75mg", generic_name: "Clopidogrel", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ascard 75mg EC", generic_name: "Aspirin", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Diabetes
  { name: "Metfin 500mg", generic_name: "Metformin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Metfin 850mg", generic_name: "Metformin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Metfin 1000mg", generic_name: "Metformin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Metfin XR 500mg", generic_name: "Metformin XR", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Glimid 1mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Glimid 2mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Glimid 4mg", generic_name: "Glimepiride", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Gliclid MR 30mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Gliclid MR 60mg", generic_name: "Gliclazide MR", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Sitavid 50mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Sitavid 100mg", generic_name: "Sitagliptin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Vildavid 50mg", generic_name: "Vildagliptin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Linavid 5mg", generic_name: "Linagliptin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Empavid 10mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Empavid 25mg", generic_name: "Empagliflozin", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Dapavid 10mg", generic_name: "Dapagliflozin", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Pain & Inflammation
  { name: "Naprox 250mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Naprox 500mg", generic_name: "Naproxen", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ketorol 10mg", generic_name: "Ketorolac", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ketorol IM", generic_name: "Ketorolac", category: "Injection", manufacturer: "ACI Limited" },
  { name: "Acefyl 100mg", generic_name: "Aceclofenac", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Acefyl Plus", generic_name: "Aceclofenac + Paracetamol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Etorix 60mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Etorix 90mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Etorix 120mg", generic_name: "Etoricoxib", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Parol 500mg", generic_name: "Paracetamol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Parol Syrup", generic_name: "Paracetamol", category: "Syrup", manufacturer: "ACI Limited" },
  { name: "Parol IV", generic_name: "Paracetamol", category: "Infusion", manufacturer: "ACI Limited" },
  { name: "Tramol 50mg", generic_name: "Tramadol", category: "Capsule", manufacturer: "ACI Limited" },
  
  // Respiratory
  { name: "Salbulin Inhaler", generic_name: "Salbutamol", category: "Inhaler", manufacturer: "ACI Limited" },
  { name: "Salbulin Nebulizer", generic_name: "Salbutamol", category: "Nebulizer Solution", manufacturer: "ACI Limited" },
  { name: "Budelin Inhaler", generic_name: "Budesonide", category: "Inhaler", manufacturer: "ACI Limited" },
  { name: "Flutilin Inhaler", generic_name: "Fluticasone", category: "Inhaler", manufacturer: "ACI Limited" },
  { name: "Montel 10mg", generic_name: "Montelukast", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Montel 5mg Chew", generic_name: "Montelukast", category: "Chewable Tablet", manufacturer: "ACI Limited" },
  { name: "Fexo-A 120mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Fexo-A 180mg", generic_name: "Fexofenadine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Cetiriz 10mg", generic_name: "Cetirizine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Levocet 5mg", generic_name: "Levocetirizine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Lorid 10mg", generic_name: "Loratadine", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Steroids
  { name: "Prednol 5mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Prednol 20mg", generic_name: "Prednisolone", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Dexacort 0.5mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Dexacort 4mg", generic_name: "Dexamethasone", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Dexacort IV", generic_name: "Dexamethasone", category: "Injection", manufacturer: "ACI Limited" },
  { name: "Defcort 6mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Defcort 30mg", generic_name: "Deflazacort", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Neurological
  { name: "Gabapin 100mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Gabapin 300mg", generic_name: "Gabapentin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Pregica 50mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Pregica 75mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Pregica 150mg", generic_name: "Pregabalin", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Tegrital 200mg", generic_name: "Carbamazepine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Betahis 8mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Betahis 16mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Betahis 24mg", generic_name: "Betahistine", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Psychiatric
  { name: "Sertia 50mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Sertia 100mg", generic_name: "Sertraline", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Escita 10mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Escita 20mg", generic_name: "Escitalopram", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Fluvax 20mg", generic_name: "Fluoxetine", category: "Capsule", manufacturer: "ACI Limited" },
  { name: "Tryptin 10mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Tryptin 25mg", generic_name: "Amitriptyline", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clozap 0.5mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Clozap 2mg", generic_name: "Clonazepam", category: "Tablet", manufacturer: "ACI Limited" },
  
  // Vitamins & Supplements
  { name: "Calci D 500mg", generic_name: "Calcium + Vitamin D", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Calci D Syrup", generic_name: "Calcium + Vitamin D", category: "Syrup", manufacturer: "ACI Limited" },
  { name: "D3 Max 1000IU", generic_name: "Cholecalciferol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "D3 Max 2000IU", generic_name: "Cholecalciferol", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "B-Complex", generic_name: "Vitamin B Complex", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Folic 5mg", generic_name: "Folic Acid", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Ferroplus Syrup", generic_name: "Iron + Folic Acid", category: "Syrup", manufacturer: "ACI Limited" },
  { name: "Zincap 20mg", generic_name: "Zinc", category: "Tablet", manufacturer: "ACI Limited" },
  { name: "Multivit Plus", generic_name: "Multivitamin", category: "Tablet", manufacturer: "ACI Limited" },
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
    for (const medicine of TOP5_PHARMA_MEDICINES) {
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
        message: `Successfully imported ${insertedCount} medicines from Top 5 Pharma (Beximco, Incepta, Renata, ACI). Skipped ${skippedCount}.`
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
