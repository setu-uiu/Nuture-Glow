-- ============================================================================
-- DBMS PROJECT: Seed data for SQL-backed features
-- Replaces hardcoded/mock data with proper database queries
-- ============================================================================

-- Subscription Plans
INSERT INTO subscription_plans (plan_name, price, features, is_featured, sort_order) VALUES
('Starter', 0, '["Basic Health Tracking", "Vaccine Tracker", "Weekly Tips", "Public Community"]', FALSE, 1),
('Premium', 1200, '["All Essential Features", "AI Health Assistant", "Video Consultations", "Priority Pharmacy Delivery", "Private Community"]', TRUE, 2),
('Family', 2500, '["Up to 3 Family Members", "Dedicated Support Manager", "Home Sample Collection", "Emergency Response Team"]', FALSE, 3)
ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name);

-- FAQs
INSERT INTO faqs (question, answer, category, sort_order) VALUES
('Is Nurture Glow free?', 'Yes, our Essential plan is free forever with core tracking features.', 'general', 1),
('How do premium consultations work?', 'Premium users can book unlimited instant video calls with our on-call medical staff.', 'general', 2),
('Can I cancel my subscription?', 'Yes, you can cancel any paid plan at any time through your settings.', 'general', 3)
ON DUPLICATE KEY UPDATE question = VALUES(question);

-- Default Nutrition Goals
INSERT INTO nutrition_goals (user_id, calorie_goal, protein_goal, carbs_goal, fat_goal, water_goal, is_default) VALUES
(NULL, 2200, 75, 180, 60, 10, TRUE)
ON DUPLICATE KEY UPDATE calorie_goal = VALUES(calorie_goal);

-- Pregnancy Week Info (by trimester)
INSERT INTO pregnancy_week_info (trimester, min_week, max_week, stage_name, baby_size, description, nutrients, symptoms) VALUES
(1, 1, 12, 'First Trimester', 'Poppy Seed',
  'Major organs begin to form. You might feel fatigued and experience morning sickness as your body adapts.',
  '["Folic Acid for neural tube", "Vitamin B12 for energy", "Hydration is critical"]',
  '["Fatigue and Morning sickness", "Breast tenderness", "Frequent urination"]'),
(2, 13, 26, 'Second Trimester', 'Ear of Corn',
  'Baby can hear your voice! Your bump is visible, and you might feel the first kicks (quickening) as they grow.',
  '["Calcium for bone growth", "Iron for blood supply", "Omega-3 for brain"]',
  '["Backaches and leg cramps", "Nasal congestion", "Vivid dreams"]'),
(3, 27, 42, 'Third Trimester', 'Watermelon',
  'Baby is growing rapidly and putting on fat. Preparing for the big day! You may feel short of breath as baby takes up space.',
  '["Protein for muscle growth", "Vitamin C for immunity", "Complex carbs for stamina"]',
  '["Braxton Hicks contractions", "Sleep difficulty", "Swollen ankles (Edema)"]')
ON DUPLICATE KEY UPDATE stage_name = VALUES(stage_name);

-- Pregnancy Myths (English)
INSERT INTO pregnancy_myths (locale, myth_keyword, claim, verdict, explanation, safe_advice, when_to_call_doctor, sources_label) VALUES
('en', 'coffee,caffeine,tea', 'Is caffeine safe during pregnancy?', 'Depends',
  'Moderate amounts of caffeine (less than 200mg per day) are generally considered safe. This is roughly one 12oz cup of coffee.',
  '["Stick to one small cup a day", "Try decaf alternatives", "Check caffeine in sodas and chocolate"]',
  '["Experience heart palpitations", "Have trouble sleeping despite low intake"]',
  'ACOG Guidelines'),
('en', 'spicy food,chili,spicy', 'Spicy food can cause miscarriage or induce labor.', 'False',
  'Spicy food is perfectly safe for the baby, though it might cause you significant heartburn or indigestion.',
  '["Eat small portions", "Avoid lying down immediately after eating spicy food"]',
  '["Indigestion is accompanied by severe abdominal pain"]',
  'NHS UK'),
('en', 'sleeping on back,sleep position', 'You should never sleep on your back after the first trimester.', 'True',
  'Sleeping on your back can compress the vena cava, reducing blood flow to the placenta. Left side is generally best.',
  '["Use a pregnancy pillow for support", "Do not panic if you wake up on your back, just roll over"]',
  '["Feeling dizzy or breathless when lying flat"]',
  'Mayo Clinic'),
('en', 'hair dye,coloring hair', 'Dyeing your hair is dangerous for the baby.', 'False',
  'Most research shows the chemicals in hair dye are not absorbed in large enough amounts to cause harm.',
  '["Wait until the second trimester for extra peace of mind", "Ensure the room is well-ventilated"]',
  '["Experience an allergic reaction to the dye"]',
  'WebMD Health'),
('en', 'exercise,gym,lifting', 'Exercise is dangerous during pregnancy.', 'False',
  'Regular, moderate exercise is actually highly recommended and can make labor easier and recovery faster.',
  '["Keep intensity moderate (should be able to talk)", "Avoid contact sports", "Stay hydrated"]',
  '["Dizziness", "Vaginal bleeding", "Chest pain during activity"]',
  'CDC Guidelines'),
('en', 'flying,airplane,travel', 'Flying is unsafe for pregnant women.', 'False',
  'Flying is generally safe up to 36 weeks if you have a low-risk pregnancy. Cabin pressure is not a risk.',
  '["Walk every hour to prevent blood clots", "Wear compression socks", "Keep your medical records handy"]',
  '["You have a history of blood clots", "Experiencing cramping while traveling"]',
  'IATA Medical Manual'),
('en', 'morning sickness,vomiting,nausea', 'Morning sickness only happens in the morning.', 'False',
  'Nausea and vomiting can happen at any time of the day or night due to hormonal changes.',
  '["Eat small, frequent meals", "Ginger tea or lozenges can help", "Keep crackers by your bedside"]',
  '["Cannot keep any fluids down for 24 hours", "Significant weight loss"]',
  'Healthline'),
('en', 'ultrasound,scan', 'Too many ultrasounds can harm the baby.', 'False',
  'Ultrasounds use sound waves, not radiation. There is no evidence that diagnostic scans cause harm.',
  '["Follow your doctors recommended scan schedule", "Avoid keepsake 3D/4D scans in non-medical facilities"]',
  '["You have concerns about a specific scan result"]',
  'FDA'),
('en', 'papaya,fruit', 'Eating papaya causes miscarriage.', 'Depends',
  'Ripe papaya is safe. However, unripe or semi-ripe papaya contains latex which can trigger uterine contractions.',
  '["Only eat fully yellow/orange, soft papaya", "Avoid green papaya salads during pregnancy"]',
  '["Experience cramping after consuming unripe fruit"]',
  'Nutrition Reviews'),
('en', 'heartburn,hairy baby', 'Severe heartburn means the baby will have lots of hair.', 'Mixed',
  'While often dismissed as a myth, some studies suggest a link because the same hormones that cause heartburn also influence fetal hair growth.',
  '["Eat smaller meals", "Avoid spicy/fatty foods before bed", "Sleep with your head elevated"]',
  '["Heartburn prevents eating or sleeping"]',
  'Johns Hopkins Study'),
('en', 'eating for two,double food', 'You need to eat twice as much food when pregnant.', 'False',
  'You only need about 300 extra calories per day in the 2nd trimester and 450 in the 3rd. Quality matters more than quantity.',
  '["Focus on nutrient-dense foods", "Include plenty of leafy greens and proteins"]',
  '["Rapid or no weight gain over several weeks"]',
  'Dietary Guidelines for Americans'),
('en', 'cats,litter,toxoplasmosis', 'You must get rid of your cat when you get pregnant.', 'False',
  'You do not need to lose your pet, but you must avoid the litter box. Cat feces can carry toxoplasmosis, which is dangerous.',
  '["Have someone else change the litter", "If you must do it, wear gloves and a mask", "Wash hands thoroughly after petting"]',
  '["Flu-like symptoms after contact with cat waste"]',
  'CDC'),
('en', 'hot tub,sauna,bath', 'Hot tubs and saunas are safe during pregnancy.', 'False',
  'Raising your core body temperature above 101F (38.3C) for too long can cause birth defects, especially in the first trimester.',
  '["Stick to warm (not hot) baths", "Limit time in warm water to 10-15 minutes"]',
  '["Feeling faint or overheated after a bath"]',
  'ACOG'),
('en', 'sex,intercourse', 'Sex can hurt the baby.', 'False',
  'The baby is well-protected by the amniotic sac and the strong muscles of the uterus. Sex is safe unless your doctor says otherwise.',
  '["Experiment with comfortable positions", "Talk to your partner about changes in libido"]',
  '["Bleeding or fluid leakage after intercourse", "History of preterm labor"]',
  'Planned Parenthood'),
('en', 'pineapple,bromelain', 'Pineapple can cause labor or miscarriage.', 'False',
  'You would have to eat massive, unrealistic quantities of pineapple for the bromelain (enzyme) to have any effect on the cervix.',
  '["Enjoy fresh pineapple in normal food amounts", "Great source of Vitamin C"]',
  '["Allergic reaction or severe digestive upset"]',
  'Medical News Today');

-- Pregnancy Myths (Bengali - key ones)
INSERT INTO pregnancy_myths (locale, myth_keyword, claim, verdict, explanation, safe_advice, when_to_call_doctor, sources_label) VALUES
('bn', 'গরম খাবার,ঝাল', 'গরম খাবার গর্ভপাত করায়', 'False',
  'গরম খাবার নিরাপদ। তবে হজমের সমস্যা হলে এড়িয়ে চলুন।',
  '["কম পরিমাণে খান", "শোয়ার আগে ঝাল খাবার এড়িয়ে চলুন"]',
  '["তীব্র পেটে ব্যথা হলে"]',
  'NHS UK'),
('bn', 'ব্যায়াম,জিম', 'গর্ভবতী নারীরা ব্যায়াম করতে পারেন না', 'False',
  'হালকা ব্যায়াম উপকারী। আপনার ডাক্তারের সাথে পরামর্শ করুন।',
  '["হালকা হাঁটাহাঁটি করুন", "সাঁতার ভালো", "গর্ভকালীন যোগব্যায়াম চেষ্টা করুন"]',
  '["মাথা ঘোরা হলে", "রক্তপাত হলে"]',
  'CDC Guidelines'),
('bn', 'দুই জনের জন্য খেতে হয়,বেশি খাওয়া', 'দুই জনের জন্য খেতে হয়', 'False',
  'অতিরিক্ত ৩০০-৫০০ ক্যালরি প্রয়োজন, দুটি খাবার নয়।',
  '["পুষ্টিকর খাবার খান", "শাকসবজি বেশি খান"]',
  '["ওজন দ্রুত বাড়লে বা কমলে"]',
  'Dietary Guidelines'),
('bn', 'দুধ পানের নিয়ম পরিবর্তন করতে হয়', 'দুধ এবং দুগ্ধজাত পণ্য গর্ভাবস্থায় নিরাপদ এবং ভালো', 'False',
  'দুধ এবং দুগ্ধজাত পণ্য গর্ভাবস্থায় নিরাপদ এবং ভালো।',
  '["পাস্তুরাইজড দুধ পান করুন", "ক্যালসিয়ামের ভালো উৎস"]',
  '["দুধে এলার্জি থাকলে"]',
  'Nutrition Reviews'),
('bn', 'রাত জাগা,ঘুম', 'রাত জাগা শিশুকে প্রভাবিত করে', 'False',
  'মাঝে মধ্যে রাত জাগা সমস্যা নয়। যথেষ্ট ঘুম গুরুত্বপূর্ণ।',
  '["পর্যাপ্ত বিশ্রাম নিন", "বাম পাশে ঘুমান"]',
  '["ঘুমের সমস্যা দীর্ঘদিন থাকলে"]',
  'Sleep Foundation');

SELECT 'All DBMS seed data inserted successfully' AS result;
