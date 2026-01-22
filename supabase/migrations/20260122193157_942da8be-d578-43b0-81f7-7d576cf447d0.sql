-- Insert sample medicine reference data for testing
INSERT INTO public.medicine_reference (name, generic_name, dosage_form, strength, manufacturer_name, unit_price, strip_price, pack_size, indication, drug_class, is_active)
VALUES
-- Paracetamol brands
('Napa 500mg Tablet', 'Paracetamol', 'Tablet', '500mg', 'Beximco Pharmaceuticals', 2.50, 25.00, '10x10', 'Fever, Headache, Body pain, Toothache, Post-operative pain', 'Analgesic / Antipyretic', true),
('Napa Extra Tablet', 'Paracetamol + Caffeine', 'Tablet', '500mg+65mg', 'Beximco Pharmaceuticals', 5.00, 50.00, '10x10', 'Headache, Migraine, Cold symptoms with fatigue', 'Analgesic / Antipyretic', true),
('Napa Extend 665mg Tablet', 'Paracetamol', 'Tablet', '665mg', 'Beximco Pharmaceuticals', 6.00, 60.00, '10x6', 'Extended relief from pain and fever', 'Analgesic / Antipyretic', true),
('Napa Syrup 60ml', 'Paracetamol', 'Syrup', '120mg/5ml', 'Beximco Pharmaceuticals', 35.00, NULL, '60ml', 'Fever and pain in children', 'Analgesic / Antipyretic', true),
('Ace 500mg Tablet', 'Paracetamol', 'Tablet', '500mg', 'Square Pharmaceuticals', 2.00, 20.00, '10x10', 'Fever, Headache, Body pain', 'Analgesic / Antipyretic', true),
('Ace Plus Tablet', 'Paracetamol + Caffeine', 'Tablet', '500mg+65mg', 'Square Pharmaceuticals', 4.50, 45.00, '10x10', 'Headache, Migraine, Muscle pain', 'Analgesic / Antipyretic', true),
('Fast 500mg Tablet', 'Paracetamol', 'Tablet', '500mg', 'ACI Limited', 1.80, 18.00, '10x10', 'Pain and fever relief', 'Analgesic / Antipyretic', true),
('Renova 500mg Tablet', 'Paracetamol', 'Tablet', '500mg', 'Renata Limited', 2.20, 22.00, '10x10', 'Pain relief, Fever', 'Analgesic / Antipyretic', true),

-- Omeprazole brands (PPI)
('Seclo 20mg Capsule', 'Omeprazole', 'Capsule', '20mg', 'Square Pharmaceuticals', 6.00, 60.00, '10x10', 'Gastric ulcer, GERD, Acid reflux, Heartburn', 'Proton Pump Inhibitor', true),
('Seclo 40mg Capsule', 'Omeprazole', 'Capsule', '40mg', 'Square Pharmaceuticals', 10.00, 100.00, '10x6', 'Severe GERD, Zollinger-Ellison syndrome', 'Proton Pump Inhibitor', true),
('Losectil 20mg Capsule', 'Omeprazole', 'Capsule', '20mg', 'Beximco Pharmaceuticals', 5.50, 55.00, '10x10', 'Peptic ulcer, Acid reflux', 'Proton Pump Inhibitor', true),
('Omefast 20mg Capsule', 'Omeprazole', 'Capsule', '20mg', 'Incepta Pharmaceuticals', 5.00, 50.00, '10x10', 'Gastric ulcer, GERD', 'Proton Pump Inhibitor', true),

-- Esomeprazole brands
('Maxpro 20mg Tablet', 'Esomeprazole', 'Tablet', '20mg', 'Renata Limited', 8.00, 80.00, '10x10', 'GERD, Erosive esophagitis', 'Proton Pump Inhibitor', true),
('Nexium 20mg Tablet', 'Esomeprazole', 'Tablet', '20mg', 'AstraZeneca', 15.00, 150.00, '10x7', 'GERD, Peptic ulcer', 'Proton Pump Inhibitor', true),

-- Antibiotics - Azithromycin
('Zimax 500mg Tablet', 'Azithromycin', 'Tablet', '500mg', 'Square Pharmaceuticals', 50.00, 150.00, '1x3', 'Respiratory infections, Skin infections, STIs', 'Macrolide Antibiotic', true),
('Azith 500mg Tablet', 'Azithromycin', 'Tablet', '500mg', 'Beximco Pharmaceuticals', 45.00, 135.00, '1x3', 'Bacterial infections', 'Macrolide Antibiotic', true),
('Zithrin 500mg Tablet', 'Azithromycin', 'Tablet', '500mg', 'Incepta Pharmaceuticals', 42.00, 126.00, '1x3', 'Upper respiratory infections', 'Macrolide Antibiotic', true),

-- Antibiotics - Ciprofloxacin
('Ciprox 500mg Tablet', 'Ciprofloxacin', 'Tablet', '500mg', 'Square Pharmaceuticals', 8.00, 80.00, '10x10', 'UTI, Respiratory infections, GI infections', 'Fluoroquinolone Antibiotic', true),
('Ciprocin 500mg Tablet', 'Ciprofloxacin', 'Tablet', '500mg', 'Beximco Pharmaceuticals', 7.50, 75.00, '10x10', 'Bacterial infections', 'Fluoroquinolone Antibiotic', true),

-- Antibiotics - Amoxicillin
('Moxacil 500mg Capsule', 'Amoxicillin', 'Capsule', '500mg', 'Square Pharmaceuticals', 5.00, 50.00, '10x10', 'Respiratory, Ear, Dental infections', 'Penicillin Antibiotic', true),
('Tycil 500mg Capsule', 'Amoxicillin', 'Capsule', '500mg', 'Beximco Pharmaceuticals', 4.50, 45.00, '10x10', 'Bacterial infections', 'Penicillin Antibiotic', true),

-- Antihypertensives
('Losazid 50mg Tablet', 'Losartan', 'Tablet', '50mg', 'Square Pharmaceuticals', 6.00, 60.00, '10x10', 'Hypertension, Diabetic nephropathy', 'ARB Antihypertensive', true),
('Losa 50mg Tablet', 'Losartan', 'Tablet', '50mg', 'Beximco Pharmaceuticals', 5.50, 55.00, '10x10', 'High blood pressure', 'ARB Antihypertensive', true),
('Amlodipine 5mg Tablet', 'Amlodipine', 'Tablet', '5mg', 'Square Pharmaceuticals', 3.00, 30.00, '10x10', 'Hypertension, Angina', 'Calcium Channel Blocker', true),
('Amlodin 5mg Tablet', 'Amlodipine', 'Tablet', '5mg', 'Beximco Pharmaceuticals', 2.80, 28.00, '10x10', 'High blood pressure', 'Calcium Channel Blocker', true),

-- Antidiabetics
('Metform 500mg Tablet', 'Metformin', 'Tablet', '500mg', 'Square Pharmaceuticals', 2.50, 25.00, '10x10', 'Type 2 Diabetes Mellitus', 'Biguanide Antidiabetic', true),
('Comet 500mg Tablet', 'Metformin', 'Tablet', '500mg', 'Beximco Pharmaceuticals', 2.30, 23.00, '10x10', 'Diabetes management', 'Biguanide Antidiabetic', true),
('Gliclazide 80mg Tablet', 'Gliclazide', 'Tablet', '80mg', 'Square Pharmaceuticals', 4.00, 40.00, '10x10', 'Type 2 Diabetes', 'Sulfonylurea Antidiabetic', true),

-- Domperidone brands
('Omidon 10mg Tablet', 'Domperidone', 'Tablet', '10mg', 'Square Pharmaceuticals', 2.00, 20.00, '10x10', 'Nausea, Vomiting, Gastroparesis', 'Antiemetic / Prokinetic', true),
('Dompy 10mg Tablet', 'Domperidone', 'Tablet', '10mg', 'Beximco Pharmaceuticals', 1.80, 18.00, '10x10', 'Digestive disorders, Nausea', 'Antiemetic / Prokinetic', true),
('Motilium 10mg Tablet', 'Domperidone', 'Tablet', '10mg', 'Janssen', 5.00, 50.00, '10x10', 'Nausea and vomiting', 'Antiemetic / Prokinetic', true),

-- Antihistamines
('Fexo 120mg Tablet', 'Fexofenadine', 'Tablet', '120mg', 'Square Pharmaceuticals', 8.00, 80.00, '10x10', 'Allergic rhinitis, Urticaria', 'Antihistamine', true),
('Allerfex 120mg Tablet', 'Fexofenadine', 'Tablet', '120mg', 'Beximco Pharmaceuticals', 7.50, 75.00, '10x10', 'Allergies, Hay fever', 'Antihistamine', true),
('Histacin 4mg Tablet', 'Chlorpheniramine', 'Tablet', '4mg', 'Square Pharmaceuticals', 1.00, 10.00, '10x10', 'Cold, Allergies', 'Antihistamine', true),

-- Vitamins & Supplements
('Becosules Capsule', 'B-Complex + Vitamin C', 'Capsule', 'Multi', 'Pfizer', 4.00, 40.00, '10x10', 'Vitamin B deficiency, General weakness', 'Vitamin Supplement', true),
('Neurobion Forte Tablet', 'Vitamin B1, B6, B12', 'Tablet', 'Multi', 'Merck', 5.00, 50.00, '10x10', 'Nerve health, B-vitamin deficiency', 'Vitamin Supplement', true),
('Cal D Tablet', 'Calcium + Vitamin D3', 'Tablet', '500mg+200IU', 'Square Pharmaceuticals', 3.50, 35.00, '10x10', 'Calcium deficiency, Bone health', 'Calcium Supplement', true),

-- Antacids
('Antacid Plus Suspension', 'Aluminium Hydroxide + Magnesium', 'Suspension', '200ml', 'Square Pharmaceuticals', 65.00, NULL, '200ml', 'Acidity, Heartburn, Indigestion', 'Antacid', true),
('Gelusil MPS Tablet', 'Aluminium Hydroxide + Magnesium', 'Tablet', 'Multi', 'Pfizer', 2.50, 25.00, '10x10', 'Gastric acidity, Ulcer pain', 'Antacid', true),

-- NSAIDs
('Indogesic Tablet', 'Indomethacin', 'Tablet', '25mg', 'Square Pharmaceuticals', 2.00, 20.00, '10x10', 'Arthritis, Joint pain, Inflammation', 'NSAID', true),
('Napro 500mg Tablet', 'Naproxen', 'Tablet', '500mg', 'Square Pharmaceuticals', 5.00, 50.00, '10x10', 'Pain, Inflammation, Arthritis', 'NSAID', true),
('Toradol 10mg Tablet', 'Ketorolac', 'Tablet', '10mg', 'Incepta Pharmaceuticals', 8.00, 48.00, '1x6', 'Moderate to severe pain', 'NSAID', true),

-- Cough & Cold
('Brodil Syrup', 'Bromhexine', 'Syrup', '100ml', 'Square Pharmaceuticals', 45.00, NULL, '100ml', 'Cough with mucus, Bronchitis', 'Mucolytic', true),
('Ambrodil Syrup', 'Ambroxol', 'Syrup', '100ml', 'Beximco Pharmaceuticals', 50.00, NULL, '100ml', 'Productive cough, Chest congestion', 'Mucolytic', true),
('Koflet Syrup', 'Herbal', 'Syrup', '100ml', 'Himalaya', 80.00, NULL, '100ml', 'Dry and wet cough', 'Herbal Cough Remedy', true)

ON CONFLICT DO NOTHING;