-- ============================================================
-- NURTURE GLOW - COMPLETE TEST DATA SEED
-- Fills ALL 54 empty tables + NULL fields in populated tables
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. FIX NULL FIELDS IN ALREADY-POPULATED TABLES
-- ============================================================

-- doctors: fill NULL rating
UPDATE doctors SET rating = 4.80 WHERE full_name = 'Dr. Arifa Begum';
UPDATE doctors SET rating = 4.65 WHERE full_name = 'Dr. Nusrat Jahan';
UPDATE doctors SET rating = 4.90 WHERE full_name = 'Dr. Mahbub Rahman';

-- users: fill health_id_verified fields, hospital_id
UPDATE users SET health_id_verified_by_hospital_id = '48b1b64f-fe94-4efa-b196-94c80a91de83', health_id_verified_at = '2026-01-20 10:00:00', hospital_id = '48b1b64f-fe94-4efa-b196-94c80a91de83' WHERE email = 'setumeherunnesa59@gmail.com';
UPDATE users SET health_id_verified_by_hospital_id = 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', health_id_verified_at = '2026-01-22 11:30:00', hospital_id = 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31' WHERE email = 'rieshuvo@gmail.com';
UPDATE users SET health_id_verified_by_hospital_id = 'd8ed5c33-e45a-4000-8f43-4804d238ef25', health_id_verified_at = '2026-02-01 09:00:00', hospital_id = 'd8ed5c33-e45a-4000-8f43-4804d238ef25' WHERE email = 'awadhe12302@gmail.com';
UPDATE users SET health_id_verified_by_hospital_id = '48b1b64f-fe94-4efa-b196-94c80a91de83', health_id_verified_at = '2026-02-05 14:00:00', hospital_id = '48b1b64f-fe94-4efa-b196-94c80a91de83' WHERE email = 'meherunnesasetu7@gmail.com';
UPDATE users SET health_id_verified_by_hospital_id = 'd8ed5c33-e45a-4000-8f43-4804d238ef25', health_id_verified_at = '2026-02-10 10:30:00', hospital_id = 'd8ed5c33-e45a-4000-8f43-4804d238ef25' WHERE email = 'amiparama1234@gtmail.com';
UPDATE users SET hospital_id = 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31' WHERE email = 'iamrabbiislamemon@gmail.com';
UPDATE users SET hospital_id = '48b1b64f-fe94-4efa-b196-94c80a91de83' WHERE email = 'rabbiislamemon639@gmail.com';

-- Fill health_id for users missing it
UPDATE users SET health_id = CONCAT('HID-', UPPER(SUBSTRING(MD5(RAND()), 1, 8))) WHERE health_id IS NULL OR health_id = '';

-- user_profiles: fill date_of_birth and gender
UPDATE user_profiles up JOIN users u ON u.id = up.user_id SET up.date_of_birth = '1995-03-15', up.gender = 'female' WHERE u.role = 'mother' AND up.date_of_birth IS NULL;
UPDATE user_profiles up JOIN users u ON u.id = up.user_id SET up.date_of_birth = '1988-07-22', up.gender = 'male' WHERE u.role = 'doctor' AND up.date_of_birth IS NULL;
UPDATE user_profiles up JOIN users u ON u.id = up.user_id SET up.date_of_birth = '1990-11-10', up.gender = 'male' WHERE u.role = 'patient' AND up.date_of_birth IS NULL;
UPDATE user_profiles up JOIN users u ON u.id = up.user_id SET up.date_of_birth = '1985-06-01', up.gender = 'male' WHERE u.role IN ('system_admin','ops_admin','medical_admin','operations_admin') AND up.date_of_birth IS NULL;

-- doctor_specialties: fill description
UPDATE doctor_specialties SET description = 'Specializes in female reproductive health, pregnancy care, and childbirth management' WHERE name = 'Gynecologist';
UPDATE doctor_specialties SET description = 'Specializes in medical care of infants, children, and adolescents' WHERE name = 'Pediatrician';
UPDATE doctor_specialties SET description = 'Expert in diet planning, maternal nutrition, and prenatal dietary requirements' WHERE name = 'Nutritionist';
UPDATE doctor_specialties SET description = 'Provides mental health support including perinatal depression and anxiety counseling' WHERE name = 'Psychologist';

-- product_categories: fill description and image_url
UPDATE product_categories SET description = 'Essential products for maternal health and wellness during pregnancy', image_url = '/images/categories/mother-care.jpg' WHERE name = 'Mother Care';
UPDATE product_categories SET description = 'Safe and gentle products for newborns and infants', image_url = '/images/categories/baby-care.jpg' WHERE name = 'Baby Care';
UPDATE product_categories SET description = 'Vitamins, supplements, and nutritional products for mother and baby', image_url = '/images/categories/nutrition.jpg' WHERE name = 'Nutrition';
UPDATE product_categories SET description = 'Blood pressure monitors, thermometers, and health tracking devices', image_url = '/images/categories/medical-devices.jpg' WHERE name = 'Medical Devices';

-- products: fill description
UPDATE products SET description = 'High-quality folic acid supplement essential for neural tube development. 400mcg per tablet, 90-day supply.' WHERE name = 'Folic Acid';
UPDATE products SET description = 'Complete prenatal multivitamin with Iron, DHA, Calcium, and 20+ essential nutrients. Doctor recommended formula.' WHERE name = 'Prenatal Vitamins';
UPDATE products SET description = 'Hypoallergenic, fragrance-free baby lotion with natural shea butter and vitamin E. Dermatologist tested.' WHERE name = 'Baby Lotion';

-- hospitals: fill website
UPDATE hospitals SET website = 'https://www.evercarebd.com' WHERE name = 'Evercare Hospital';
UPDATE hospitals SET website = 'https://www.dmc.gov.bd' WHERE name = 'Dhaka Medical College';
UPDATE hospitals SET website = 'https://www.squarehospital.com' WHERE name = 'Square Hospital';

-- admin_actions: fill metadata and ip_address
UPDATE admin_actions SET metadata = '{"source": "admin_panel", "browser": "Chrome"}', ip_address = '192.168.1.100' WHERE metadata IS NULL;

-- system_metrics: fill metadata
UPDATE system_metrics SET metadata = '{"region": "ap-south-1", "instance": "prod-1"}' WHERE metadata IS NULL;

-- notifications: fill is_read
UPDATE notifications SET is_read = 0 WHERE is_read IS NULL;

-- system_messages: fill target_role and target_user_id
UPDATE system_messages SET target_role = 'mother', target_user_id = '4768b0a8-d480-4ebe-a281-eeae43c9c50d' WHERE target_role IS NULL LIMIT 1;
UPDATE system_messages SET target_role = 'doctor', target_user_id = '98a1fb6b-a74f-431a-899b-809253e85254' WHERE target_role IS NULL LIMIT 1;

-- admin_notifications: fill action_type and metadata
UPDATE admin_notifications SET action_type = 'SYSTEM_ALERT', metadata = '{"triggered_by": "system_monitor", "severity": "info"}' WHERE action_type IS NULL;

-- nutrition_goals: set user_id to a real mother
UPDATE nutrition_goals SET user_id = '4768b0a8-d480-4ebe-a281-eeae43c9c50d' WHERE user_id IS NULL LIMIT 1;

-- doctor_verification_requests: fill all empty fields
UPDATE doctor_verification_requests SET 
  hospital_affiliation = 'Evercare Hospital',
  bmdc_reg_number = 'BMDC-2024-001',
  bmdc_certificate_url = '/uploads/bmdc/cert-001.pdf',
  experience_years = 12,
  qualifications = 'MBBS, FCPS (Gynecology)',
  rejection_reason = NULL,
  metadata = '{"submitted_via": "web_portal"}'
WHERE id = (SELECT id FROM (SELECT id FROM doctor_verification_requests LIMIT 1) t);

UPDATE doctor_verification_requests SET 
  hospital_affiliation = 'Dhaka Medical College',
  bmdc_reg_number = 'BMDC-2024-002',
  bmdc_certificate_url = '/uploads/bmdc/cert-002.pdf',
  experience_years = 8,
  qualifications = 'MBBS, MD (Pediatrics)',
  rejection_reason = NULL,
  metadata = '{"submitted_via": "mobile_app"}'
WHERE hospital_affiliation IS NULL LIMIT 1;

UPDATE doctor_verification_requests SET 
  hospital_affiliation = 'Square Hospital',
  bmdc_reg_number = 'BMDC-2024-003',
  bmdc_certificate_url = '/uploads/bmdc/cert-003.pdf',
  experience_years = 15,
  qualifications = 'MBBS, FCPS (Obstetrics)',
  rejection_reason = NULL,
  metadata = '{"submitted_via": "web_portal"}'
WHERE hospital_affiliation IS NULL LIMIT 1;

-- subscription_plans: fill is_featured
UPDATE subscription_plans SET is_featured = 0 WHERE is_featured IS NULL;

-- system_backups: fill storage_path and checksum
UPDATE system_backups SET storage_path = '/backups/neonest_backup.sql.gz', checksum = 'sha256:a1b2c3d4e5f6' WHERE storage_path IS NULL LIMIT 1;
UPDATE system_backups SET storage_path = '/backups/neonest_backup_v2.sql.gz', checksum = 'sha256:b2c3d4e5f6a1' WHERE storage_path IS NULL LIMIT 1;


-- ============================================================
-- 2. FILL ALL 54 EMPTY TABLES WITH TEST DATA
-- ============================================================

-- ─── MOTHERS ────────────────────────────────────────────────
INSERT INTO mothers (id, user_id, blood_group, health_conditions) VALUES
('mom-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'A+', 'Mild anemia, managed with iron supplements'),
('mom-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'B+', 'Gestational diabetes - diet controlled'),
('mom-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 'O+', 'No known conditions'),
('mom-004', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'AB+', 'Hypothyroidism - on medication'),
('mom-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'A-', 'Previous C-section, monitoring required');

-- ─── PREGNANCIES ────────────────────────────────────────────
INSERT INTO pregnancies (id, mother_id, expected_due_date, gestational_age_weeks, status) VALUES
('preg-001', 'mom-001', '2026-06-15', 24, 'active'),
('preg-002', 'mom-002', '2026-05-20', 28, 'active'),
('preg-003', 'mom-003', '2026-07-10', 20, 'active'),
('preg-004', 'mom-004', '2026-04-05', 34, 'active'),
('preg-005', 'mom-005', '2026-08-22', 14, 'active');

-- ─── PREGNANCY CHECK-INS ─────────────────────────────────
INSERT INTO pregnancy_checkins (id, pregnancy_id, weight_kg, blood_pressure, glucose_level, checkin_date, notes) VALUES
('pci-001', 'preg-001', 62.50, '120/80', 95.00, '2026-02-01', 'Normal checkup. Weight gain on track. Baby heartbeat strong.'),
('pci-002', 'preg-001', 63.20, '118/78', 92.00, '2026-02-15', 'Iron levels improved. Continue supplements.'),
('pci-003', 'preg-002', 68.00, '125/82', 110.50, '2026-02-03', 'Blood sugar slightly elevated. Adjusted diet plan.'),
('pci-004', 'preg-002', 68.80, '122/80', 102.00, '2026-02-17', 'Glucose levels improving with diet changes.'),
('pci-005', 'preg-003', 58.00, '115/75', 88.00, '2026-02-10', 'Healthy progress. First ultrasound completed.'),
('pci-006', 'preg-004', 72.50, '130/85', 98.00, '2026-02-05', 'Third trimester checkup. Baby position head down.'),
('pci-007', 'preg-005', 55.00, '112/72', 85.00, '2026-02-20', 'Early second trimester. All tests normal.');

-- ─── CHILDREN ────────────────────────────────────────────
INSERT INTO children (id, mother_id, full_name, date_of_birth, gender, blood_group, weight_kg, height_cm) VALUES
('child-001', 'mom-001', 'Ayesha Rahman', '2024-08-15', 'female', 'A+', 9.50, 72.00),
('child-002', 'mom-002', 'Faysal Ahmed Chowdhury', '2025-01-20', 'male', 'B+', 7.20, 65.00),
('child-003', 'mom-003', 'Nabila Islam', '2025-06-10', 'female', 'O+', 6.80, 60.00);

-- ─── CHILD GROWTH LOGS ──────────────────────────────────
INSERT INTO child_growth_logs (id, child_id, weight_kg, height_cm, head_circumference_cm, log_date, percentile) VALUES
('cgl-001', 'child-001', 3.20, 50.00, 34.50, '2024-08-15', 55),
('cgl-002', 'child-001', 5.40, 58.00, 38.00, '2024-11-15', 60),
('cgl-003', 'child-001', 7.80, 67.00, 42.00, '2025-02-15', 58),
('cgl-004', 'child-001', 9.50, 72.00, 44.50, '2025-08-15', 62),
('cgl-005', 'child-002', 3.50, 51.00, 35.00, '2025-01-20', 65),
('cgl-006', 'child-002', 5.80, 60.00, 39.00, '2025-04-20', 63),
('cgl-007', 'child-002', 7.20, 65.00, 41.50, '2025-07-20', 60),
('cgl-008', 'child-003', 3.10, 49.50, 34.00, '2025-06-10', 50),
('cgl-009', 'child-003', 5.60, 57.00, 37.50, '2025-09-10', 52),
('cgl-010', 'child-003', 6.80, 60.00, 39.00, '2025-12-10', 55);

-- ─── ADDRESSES ────────────────────────────────────────
INSERT INTO addresses (id, user_id, address_type, street, city, state, postal_code, country, is_primary) VALUES
('addr-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'home', '45 Dhanmondi Road 8', 'Dhaka', 'Dhaka Division', '1205', 'Bangladesh', 1),
('addr-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'home', '12 Gulshan Avenue', 'Dhaka', 'Dhaka Division', '1212', 'Bangladesh', 1),
('addr-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 'home', '78 Uttara Sector 7', 'Dhaka', 'Dhaka Division', '1230', 'Bangladesh', 1),
('addr-004', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'home', '23 Mirpur DOHS', 'Dhaka', 'Dhaka Division', '1216', 'Bangladesh', 1),
('addr-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'home', '56 Bashundhara R/A', 'Dhaka', 'Dhaka Division', '1229', 'Bangladesh', 1),
('addr-006', '98a1fb6b-a74f-431a-899b-809253e85254', 'office', '100 Hospital Road, Mohakhali', 'Dhaka', 'Dhaka Division', '1212', 'Bangladesh', 1);

-- ─── EMERGENCY CONTACTS ──────────────────────────────
INSERT INTO emergency_contacts (id, user_id, contact_name, relationship, phone) VALUES
('ec-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'Karim Uddin', 'Husband', '+8801712345678'),
('ec-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'Fatema Begum', 'Mother', '+8801812345678'),
('ec-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 'Rahim Ahmed', 'Father', '+8801912345678'),
('ec-004', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'Nasir Hossain', 'Husband', '+8801612345678'),
('ec-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'Salma Khatun', 'Sister', '+8801512345678');

-- ─── ALLERGIES ────────────────────────────────────────
INSERT INTO allergies (id, user_id, child_id, allergen, severity, reaction) VALUES
('alg-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', NULL, 'Penicillin', 'severe', 'Anaphylaxis. Requires epinephrine auto-injector.'),
('alg-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', NULL, 'Shellfish', 'moderate', 'Skin rash and hives within 30 minutes of consumption.'),
('alg-003', NULL, 'child-001', 'Peanuts', 'severe', 'Throat swelling and difficulty breathing. Carry EpiPen.'),
('alg-004', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', NULL, 'Latex', 'mild', 'Contact dermatitis on hands.'),
('alg-005', NULL, 'child-002', 'Eggs', 'mild', 'Mild stomach upset. Usually resolves within hours.');

-- ─── DOCTOR AVAILABILITY SLOTS ───────────────────────
INSERT INTO doctor_availability_slots (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
('das-001', '167bb282-25af-49e3-9b1e-bd54a8316532', 'Monday', '09:00:00', '13:00:00', 30),
('das-002', '167bb282-25af-49e3-9b1e-bd54a8316532', 'Wednesday', '09:00:00', '13:00:00', 30),
('das-003', '167bb282-25af-49e3-9b1e-bd54a8316532', 'Friday', '14:00:00', '18:00:00', 30),
('das-004', 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'Tuesday', '10:00:00', '15:00:00', 30),
('das-005', 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'Thursday', '10:00:00', '15:00:00', 30),
('das-006', '67ea0685-c2dc-43fb-ac3a-4bd25fad0ca3', 'Monday', '14:00:00', '18:00:00', 30),
('das-007', '67ea0685-c2dc-43fb-ac3a-4bd25fad0ca3', 'Wednesday', '14:00:00', '18:00:00', 30),
('das-008', '67ea0685-c2dc-43fb-ac3a-4bd25fad0ca3', 'Saturday', '09:00:00', '12:00:00', 30);

-- ─── CONSULTATIONS ────────────────────────────────────
INSERT INTO consultations (id, user_id, doctor_id, consultation_type, scheduled_date, status, notes) VALUES
('con-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', '167bb282-25af-49e3-9b1e-bd54a8316532', 'video', '2026-02-25 10:00:00', 'completed', 'Routine prenatal checkup. All vitals normal. Baby heartbeat 145 bpm.'),
('con-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'in-person', '2026-02-26 11:00:00', 'completed', 'Gestational diabetes follow-up. HbA1c at 5.8%. Diet plan adjusted.'),
('con-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', '67ea0685-c2dc-43fb-ac3a-4bd25fad0ca3', 'video', '2026-03-01 14:00:00', 'scheduled', 'Nutrition counseling for second trimester.'),
('con-004', 'f80d78ef-e699-4056-8fe7-f87f689691f1', '167bb282-25af-49e3-9b1e-bd54a8316532', 'in-person', '2026-03-03 09:30:00', 'scheduled', 'Third trimester ultrasound and positioning check.'),
('con-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'video', '2026-02-20 15:00:00', 'completed', 'Early pregnancy confirmation and blood work review.'),
('con-006', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', '67ea0685-c2dc-43fb-ac3a-4bd25fad0ca3', 'video', '2026-03-05 10:30:00', 'scheduled', 'Follow-up nutrition plan for third trimester.');

-- ─── CONSULTATION MESSAGES ────────────────────────────
INSERT INTO consultation_messages (id, consultation_id, sender_user_id, sender_doctor_id, message_text) VALUES
('cm-001', 'con-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', NULL, 'Doctor, I have been feeling some mild cramps since yesterday. Is this normal at 24 weeks?'),
('cm-002', 'con-001', NULL, '167bb282-25af-49e3-9b1e-bd54a8316532', 'Mild cramping can be normal as your uterus expands. However, if cramps become severe or regular, please visit the hospital immediately.'),
('cm-003', 'con-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', NULL, 'Thank you doctor. I will monitor and let you know if anything changes.'),
('cm-004', 'con-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', NULL, 'My fasting blood sugar was 105 this morning. Should I be worried?'),
('cm-005', 'con-002', NULL, 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'Fasting of 105 is slightly above the ideal range. Please continue your low-GI diet and we will re-test next week.'),
('cm-006', 'con-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', NULL, 'Doctor, my HCG levels came back at 25,000. Is this normal for 14 weeks?'),
('cm-007', 'con-005', NULL, 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'HCG at 25,000 mIU/mL at 14 weeks is within the normal range. Your pregnancy is progressing well.');

-- ─── CONSULTATION REVIEWS ─────────────────────────────
INSERT INTO consultation_reviews (id, consultation_id, doctor_id, patient_id, review_status, quality_score, completeness_score, professionalism_score, review_notes, flagged_issues, reviewed_by, reviewed_at, metadata) VALUES
('cr-001', 'con-001', '167bb282-25af-49e3-9b1e-bd54a8316532', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'APPROVED', 9, 8, 10, 'Thorough examination and clear communication with patient.', NULL, 'admin-medical-001', '2026-02-26 09:00:00', '{"review_type": "routine"}'),
('cr-002', 'con-002', 'd92bca99-a32d-4d1b-b728-20355c945dc7', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'APPROVED', 10, 9, 9, 'Excellent follow-up on gestational diabetes management.', NULL, 'admin-medical-001', '2026-02-27 10:00:00', '{"review_type": "follow_up"}'),
('cr-003', 'con-005', 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'APPROVED', 8, 9, 9, 'Good initial consultation. All necessary tests ordered.', NULL, 'admin-medical-001', '2026-02-21 11:00:00', '{"review_type": "initial"}');

-- ─── DOCTOR REVIEWS ────────────────────────────────────
INSERT INTO doctor_reviews (id, doctor_id, user_id, rating, review_text) VALUES
('dr-001', '167bb282-25af-49e3-9b1e-bd54a8316532', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 5, 'Dr. Arifa is incredibly attentive and caring. She explained everything clearly during my prenatal visit.'),
('dr-002', '167bb282-25af-49e3-9b1e-bd54a8316532', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 4, 'Very professional. The wait time was a bit long but the consultation itself was excellent.'),
('dr-003', 'd92bca99-a32d-4d1b-b728-20355c945dc7', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 5, 'Dr. Mahbub helped me manage my gestational diabetes very effectively. Highly recommend!'),
('dr-004', 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 5, 'Compassionate and knowledgeable. Made me feel very comfortable during my first pregnancy visit.'),
('dr-005', '67ea0685-c2dc-43fb-ac3a-4bd25fad0ca3', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 4, 'Good nutritional advice. The meal plan she created was practical and easy to follow.');

-- ─── VIDEO SESSIONS ────────────────────────────────────
INSERT INTO video_sessions (id, consultation_id, session_url, start_time, end_time, status) VALUES
('vs-001', 'con-001', 'https://meet.nurtureglow.com/session/vs-001', '2026-02-25 10:00:00', '2026-02-25 10:25:00', 'completed'),
('vs-002', 'con-003', 'https://meet.nurtureglow.com/session/vs-002', '2026-03-01 14:00:00', NULL, 'scheduled'),
('vs-003', 'con-005', 'https://meet.nurtureglow.com/session/vs-003', '2026-02-20 15:00:00', '2026-02-20 15:30:00', 'completed'),
('vs-004', 'con-006', 'https://meet.nurtureglow.com/session/vs-004', '2026-03-05 10:30:00', NULL, 'scheduled');

-- ─── ORDERS ────────────────────────────────────────────
INSERT INTO orders (id, user_id, order_date, total_amount, status, shipping_address) VALUES
('ord-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', '2026-02-10 14:30:00', 1250.00, 'delivered', '45 Dhanmondi Road 8, Dhaka 1205'),
('ord-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', '2026-02-15 10:00:00', 850.00, 'delivered', '12 Gulshan Avenue, Dhaka 1212'),
('ord-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', '2026-02-20 16:45:00', 2100.00, 'shipped', '78 Uttara Sector 7, Dhaka 1230'),
('ord-004', 'f80d78ef-e699-4056-8fe7-f87f689691f1', '2026-02-25 09:15:00', 450.00, 'pending', '23 Mirpur DOHS, Dhaka 1216'),
('ord-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', '2026-02-22 11:00:00', 1800.00, 'processing', '56 Bashundhara R/A, Dhaka 1229');

-- ─── ORDER ITEMS ────────────────────────────────────────
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
('oi-001', 'ord-001', '8ba9a063-592b-4ac1-97b6-0e717e6fd25a', 2, 250.00),
('oi-002', 'ord-001', '8ec4ea00-0576-4b1f-9b31-3525b569808f', 1, 750.00),
('oi-003', 'ord-002', '8ec4ea00-0576-4b1f-9b31-3525b569808f', 1, 750.00),
('oi-004', 'ord-002', 'a7142f7e-555e-41cc-87ae-6a934bffaecf', 1, 100.00),
('oi-005', 'ord-003', '8ba9a063-592b-4ac1-97b6-0e717e6fd25a', 3, 250.00),
('oi-006', 'ord-003', '8ec4ea00-0576-4b1f-9b31-3525b569808f', 2, 750.00),
('oi-007', 'ord-004', 'a7142f7e-555e-41cc-87ae-6a934bffaecf', 3, 100.00),
('oi-008', 'ord-004', '8ba9a063-592b-4ac1-97b6-0e717e6fd25a', 1, 150.00),
('oi-009', 'ord-005', '8ec4ea00-0576-4b1f-9b31-3525b569808f', 2, 750.00),
('oi-010', 'ord-005', 'a7142f7e-555e-41cc-87ae-6a934bffaecf', 3, 100.00);

-- ─── PAYMENTS ────────────────────────────────────────────
INSERT INTO payments (id, order_id, consultation_id, amount, payment_method, payment_status, transaction_id) VALUES
('pay-001', 'ord-001', NULL, 1250.00, 'bKash', 'completed', 'TXN-BK-20260210-001'),
('pay-002', 'ord-002', NULL, 850.00, 'Nagad', 'completed', 'TXN-NG-20260215-002'),
('pay-003', 'ord-003', NULL, 2100.00, 'Credit Card', 'completed', 'TXN-CC-20260220-003'),
('pay-004', 'ord-004', NULL, 450.00, 'bKash', 'pending', 'TXN-BK-20260225-004'),
('pay-005', NULL, 'con-001', 1000.00, 'Nagad', 'completed', 'TXN-NG-20260225-005'),
('pay-006', NULL, 'con-002', 1200.00, 'bKash', 'completed', 'TXN-BK-20260226-006'),
('pay-007', 'ord-005', NULL, 1800.00, 'Credit Card', 'processing', 'TXN-CC-20260222-007'),
('pay-008', NULL, 'con-005', 800.00, 'bKash', 'completed', 'TXN-BK-20260220-008');

-- ─── PRODUCT REVIEWS ────────────────────────────────────
INSERT INTO product_reviews (id, product_id, user_id, rating, review_text) VALUES
('prvw-001', '8ba9a063-592b-4ac1-97b6-0e717e6fd25a', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 5, 'Essential for pregnancy! Easy to swallow and no side effects.'),
('prvw-002', '8ec4ea00-0576-4b1f-9b31-3525b569808f', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 4, 'Good quality prenatal vitamins. Wish the bottle was bigger.'),
('prvw-003', 'a7142f7e-555e-41cc-87ae-6a934bffaecf', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 5, 'So gentle on baby skin! No rash or irritation at all.'),
('prvw-004', '8ec4ea00-0576-4b1f-9b31-3525b569808f', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 5, 'My doctor recommended these. Feeling much more energetic since starting.'),
('prvw-005', '8ba9a063-592b-4ac1-97b6-0e717e6fd25a', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 4, 'Affordable and effective. Taste is a bit metallic but bearable.');

-- ─── VENDORS ────────────────────────────────────────────
INSERT INTO vendors (id, name, phone, email, verified) VALUES
('vnd-001', 'Lazz Pharma', '+8801755000001', 'info@lazzpharma.com.bd', 1),
('vnd-002', 'Arogga Healthcare', '+8801755000002', 'support@arogga.com', 1),
('vnd-003', 'Shishu Sheba Store', '+8801755000003', 'order@shishusheba.com.bd', 1),
('vnd-004', 'Ibn Sina Pharmaceutical', '+8801755000004', 'sales@ibnsinapharma.com.bd', 0);

-- ─── AMBULANCES ─────────────────────────────────────────
INSERT INTO ambulances (id, hospital_id, vehicle_number, driver_name, driver_phone, status) VALUES
('amb-001', '48b1b64f-fe94-4efa-b196-94c80a91de83', 'DHK-MET-1234', 'Rafiq Mia', '+8801700000001', 'available'),
('amb-002', '48b1b64f-fe94-4efa-b196-94c80a91de83', 'DHK-MET-1235', 'Jamal Hossain', '+8801700000002', 'on_duty'),
('amb-003', 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', 'DHK-MET-2001', 'Sohel Ahmed', '+8801700000003', 'available'),
('amb-004', 'd8ed5c33-e45a-4000-8f43-4804d238ef25', 'DHK-MET-3001', 'Kamal Uddin', '+8801700000004', 'available'),
('amb-005', 'd8ed5c33-e45a-4000-8f43-4804d238ef25', 'DHK-MET-3002', 'Hanif Rahman', '+8801700000005', 'maintenance');

-- ─── EMERGENCY REQUESTS ─────────────────────────────────
INSERT INTO emergency_requests (id, user_id, location_lat, location_lng, destination_hospital_id, ambulance_id, status) VALUES
('emr-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 23.74510000, 90.37560000, '48b1b64f-fe94-4efa-b196-94c80a91de83', 'amb-001', 'completed'),
('emr-002', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 23.78010000, 90.41320000, 'd8ed5c33-e45a-4000-8f43-4804d238ef25', 'amb-004', 'completed'),
('emr-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 23.87500000, 90.39800000, 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', 'amb-003', 'in_transit');

-- ─── EMERGENCY STATUS EVENTS ────────────────────────────
INSERT INTO emergency_status_events (id, emergency_request_id, status, timestamp) VALUES
('ese-001', 'emr-001', 'requested', '2026-02-10 03:15:00'),
('ese-002', 'emr-001', 'dispatched', '2026-02-10 03:18:00'),
('ese-003', 'emr-001', 'arrived', '2026-02-10 03:35:00'),
('ese-004', 'emr-001', 'completed', '2026-02-10 04:10:00'),
('ese-005', 'emr-002', 'requested', '2026-02-18 22:30:00'),
('ese-006', 'emr-002', 'dispatched', '2026-02-18 22:33:00'),
('ese-007', 'emr-002', 'arrived', '2026-02-18 22:50:00'),
('ese-008', 'emr-002', 'completed', '2026-02-18 23:45:00'),
('ese-009', 'emr-003', 'requested', '2026-02-27 14:00:00'),
('ese-010', 'emr-003', 'dispatched', '2026-02-27 14:03:00');

-- ─── BLOOD DONORS ────────────────────────────────────────
INSERT INTO blood_donors (id, user_id, name, blood_group, location, phone, verified, available, last_donation_date) VALUES
('bd-001', '98a1fb6b-a74f-431a-899b-809253e85254', 'Rabbi Islam Emon', 'O+', 'Dhanmondi, Dhaka', '+8801769454544', 1, 1, '2025-12-15'),
('bd-002', '6abf7e97-9653-4905-ab9b-bee5692676f5', 'Nasir Ahmed', 'A+', 'Gulshan, Dhaka', '+8801711111111', 1, 1, '2025-11-20'),
('bd-003', NULL, 'Fatema Khatun', 'B+', 'Uttara, Dhaka', '+8801722222222', 1, 1, '2026-01-05'),
('bd-004', NULL, 'Rahim Uddin', 'AB-', 'Mirpur, Dhaka', '+8801733333333', 1, 0, '2026-02-01'),
('bd-005', NULL, 'Salma Begum', 'O-', 'Mohammadpur, Dhaka', '+8801744444444', 0, 1, NULL),
('bd-006', NULL, 'Karim Hossain', 'A-', 'Banani, Dhaka', '+8801755555555', 1, 1, '2025-10-10');

-- ─── BLOOD REQUESTS ──────────────────────────────────────
INSERT INTO blood_requests (id, donor_id, requester_user_id, requester_phone, blood_group, area, message, urgency_level, status) VALUES
('br-001', 'bd-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', '+8801769454544', 'O+', 'Dhanmondi, Dhaka', 'Need 2 bags of O+ blood for delivery at Evercare Hospital. Patient is 34 weeks pregnant.', 'urgent', 'accepted'),
('br-002', 'bd-003', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', '+8801722222222', 'B+', 'Uttara, Dhaka', 'Scheduled C-section at Square Hospital. Need 1 bag of B+ blood as precaution.', 'normal', 'completed'),
('br-003', 'bd-002', 'f80d78ef-e699-4056-8fe7-f87f689691f1', '+8801711111111', 'A+', 'Gulshan, Dhaka', 'Postpartum hemorrhage. Urgently need A+ blood at Dhaka Medical College.', 'emergency', 'completed');

-- ─── HEALTH RECORDS ──────────────────────────────────────
INSERT INTO health_records (id, user_id, child_id, record_type, description, recorded_date) VALUES
('hr-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', NULL, 'lab_test', 'Complete Blood Count (CBC): Hemoglobin 11.2 g/dL, WBC 8,500. Mild anemia noted.', '2026-01-15 10:00:00'),
('hr-002', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', NULL, 'ultrasound', '20-week anomaly scan: Normal fetal anatomy. Estimated weight 350g. Anterior placenta.', '2026-01-20 14:00:00'),
('hr-003', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', NULL, 'lab_test', 'Glucose Tolerance Test: Fasting 95mg/dL, 1hr 180mg/dL, 2hr 155mg/dL. Gestational diabetes confirmed.', '2026-01-10 09:00:00'),
('hr-004', NULL, 'child-001', 'vaccination', 'BCG + OPV-0 + Hepatitis B administered at birth. No adverse reactions.', '2024-08-15 12:00:00'),
('hr-005', NULL, 'child-001', 'checkup', '6-month well-baby visit: Weight 7.8kg (50th percentile), Height 67cm. Milestones on track.', '2025-02-15 10:00:00'),
('hr-006', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', NULL, 'prescription', 'Prenatal vitamins: Folic Acid 5mg daily, Iron 60mg daily, Calcium 500mg twice daily.', '2026-02-10 11:00:00'),
('hr-007', 'f80d78ef-e699-4056-8fe7-f87f689691f1', NULL, 'lab_test', 'Thyroid Function Test: TSH 4.2 mIU/L (elevated), Free T4 0.9 ng/dL. Levothyroxine dose adjusted.', '2026-02-05 09:30:00');

-- ─── HEALTH RECORD FILES ─────────────────────────────────
INSERT INTO health_record_files (id, health_record_id, file_url, file_type) VALUES
('hrf-001', 'hr-001', '/uploads/records/cbc-report-001.pdf', 'pdf'),
('hrf-002', 'hr-002', '/uploads/records/ultrasound-20wk-001.jpg', 'image'),
('hrf-003', 'hr-003', '/uploads/records/gtt-report-002.pdf', 'pdf'),
('hrf-004', 'hr-004', '/uploads/records/vaccination-card-child001.pdf', 'pdf'),
('hrf-005', 'hr-007', '/uploads/records/thyroid-test-004.pdf', 'pdf');

-- ─── FILES ────────────────────────────────────────────────
INSERT INTO files (id, file_name, file_size, file_url, mime_type, uploaded_by_user_id) VALUES
('file-001', 'cbc-report-001.pdf', 245000, '/uploads/records/cbc-report-001.pdf', 'application/pdf', '4768b0a8-d480-4ebe-a281-eeae43c9c50d'),
('file-002', 'ultrasound-20wk-001.jpg', 1250000, '/uploads/records/ultrasound-20wk-001.jpg', 'image/jpeg', '4768b0a8-d480-4ebe-a281-eeae43c9c50d'),
('file-003', 'gtt-report-002.pdf', 198000, '/uploads/records/gtt-report-002.pdf', 'application/pdf', '4d1576ee-97fb-42f6-a7cb-beadf200b67a'),
('file-004', 'vaccination-card-child001.pdf', 320000, '/uploads/records/vaccination-card-child001.pdf', 'application/pdf', '4768b0a8-d480-4ebe-a281-eeae43c9c50d'),
('file-005', 'bmdc-cert-arifa.pdf', 450000, '/uploads/bmdc/cert-001.pdf', 'application/pdf', '98a1fb6b-a74f-431a-899b-809253e85254');

-- ─── FILE LINKS ────────────────────────────────────────────
INSERT INTO file_links (id, file_id, linked_entity_type, linked_entity_id) VALUES
('fl-001', 'file-001', 'health_record', 'hr-001'),
('fl-002', 'file-002', 'health_record', 'hr-002'),
('fl-003', 'file-003', 'health_record', 'hr-003'),
('fl-004', 'file-004', 'health_record', 'hr-004'),
('fl-005', 'file-005', 'doctor_verification', '167bb282-25af-49e3-9b1e-bd54a8316532');

-- ─── CERTIFICATES ──────────────────────────────────────────
INSERT INTO certificates (id, child_id, certificate_type, issue_date, certificate_url) VALUES
('cert-001', 'child-001', 'birth_certificate', '2024-08-20', '/uploads/certificates/birth-cert-child001.pdf'),
('cert-002', 'child-002', 'birth_certificate', '2025-01-25', '/uploads/certificates/birth-cert-child002.pdf'),
('cert-003', 'child-001', 'vaccination_completion', '2025-08-15', '/uploads/certificates/vacc-complete-child001.pdf');

-- ─── VACCINATION EVENTS ────────────────────────────────────
INSERT INTO vaccination_events (id, child_id, vaccine_name, vaccine_date, nurse_name, reaction) VALUES
('ve-001', 'child-001', 'BCG (Tuberculosis)', '2024-08-15', 'Shahida Khatun', 'Small blister at injection site - normal response'),
('ve-002', 'child-001', 'Oral Polio Vaccine (OPV)', '2024-08-15', 'Shahida Khatun', 'No reaction'),
('ve-003', 'child-001', 'Hepatitis B', '2024-08-15', 'Shahida Khatun', 'No reaction'),
('ve-004', 'child-001', 'Pentavalent (DTP, HepB, Hib)', '2024-10-10', 'Rima Sultana', 'Mild fever for 24 hours - managed with paracetamol'),
('ve-005', 'child-002', 'BCG (Tuberculosis)', '2025-01-20', 'Fatema Akter', 'No reaction'),
('ve-006', 'child-002', 'Oral Polio Vaccine (OPV)', '2025-01-20', 'Fatema Akter', 'No reaction'),
('ve-007', 'child-002', 'Pentavalent (DTP, HepB, Hib)', '2025-03-17', 'Rima Sultana', 'Slight redness at injection site'),
('ve-008', 'child-003', 'BCG (Tuberculosis)', '2025-06-10', 'Shahida Khatun', 'No reaction');

-- ─── VACCINE SCHEDULES ──────────────────────────────────────
INSERT INTO vaccine_schedules (id, child_id, vaccine_name, scheduled_date, status) VALUES
('vs-sch-001', 'child-001', 'MMR Booster', '2026-08-15', 'pending'),
('vs-sch-002', 'child-001', 'DPT Booster', '2026-08-15', 'pending'),
('vs-sch-003', 'child-002', 'Pentavalent - Dose 3', '2025-07-20', 'completed'),
('vs-sch-004', 'child-002', 'Measles-Rubella (MR)', '2026-01-20', 'pending'),
('vs-sch-005', 'child-003', 'Pentavalent - Dose 1', '2025-08-05', 'completed'),
('vs-sch-006', 'child-003', 'Pneumococcal Conjugate (PCV)', '2025-08-05', 'pending');

-- ─── VACCINE SCHEDULE ITEMS ─────────────────────────────────
INSERT INTO vaccine_schedule_items (id, schedule_id, vaccine_name, dose_number, scheduled_date, status) VALUES
('vsi-001', 'vs-sch-001', 'MMR Booster', 1, '2026-08-15', 'pending'),
('vsi-002', 'vs-sch-002', 'DPT Booster', 1, '2026-08-15', 'pending'),
('vsi-003', 'vs-sch-003', 'Pentavalent', 3, '2025-07-20', 'completed'),
('vsi-004', 'vs-sch-004', 'Measles-Rubella', 1, '2026-01-20', 'pending'),
('vsi-005', 'vs-sch-005', 'Pentavalent', 1, '2025-08-05', 'completed'),
('vsi-006', 'vs-sch-006', 'Pneumococcal Conjugate', 1, '2025-08-05', 'pending');

-- ─── REMINDERS ────────────────────────────────────────────
INSERT INTO reminders (id, user_id, title, description, reminder_type, reminder_date, status) VALUES
('rem-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'Prenatal Checkup', 'Schedule your 28-week prenatal checkup with Dr. Arifa Begum at Evercare Hospital.', 'appointment', '2026-03-10 09:00:00', 'active'),
('rem-002', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'Take Iron Supplement', 'Daily iron supplement reminder - take with vitamin C for better absorption.', 'medication', '2026-02-28 08:00:00', 'active'),
('rem-003', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'Blood Sugar Check', 'Check fasting blood sugar level. Target: below 95 mg/dL.', 'health_check', '2026-03-01 07:00:00', 'active'),
('rem-004', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 'Nutrition Consultation', 'Video call with Dr. Nusrat Jahan for nutrition plan review.', 'appointment', '2026-03-01 14:00:00', 'active'),
('rem-005', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'Thyroid Medication', 'Take Levothyroxine 50mcg - empty stomach, 30 min before breakfast.', 'medication', '2026-02-28 06:30:00', 'active'),
('rem-006', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'First Ultrasound', 'Book 16-week ultrasound scan at your preferred hospital.', 'appointment', '2026-03-15 10:00:00', 'active');

-- ─── REMINDER DELIVERIES ──────────────────────────────────
INSERT INTO reminder_deliveries (id, reminder_id, delivery_date, status) VALUES
('rd-001', 'rem-001', '2026-03-10 09:00:00', 'scheduled'),
('rd-002', 'rem-002', '2026-02-28 08:00:00', 'sent'),
('rd-003', 'rem-003', '2026-03-01 07:00:00', 'scheduled'),
('rd-004', 'rem-004', '2026-03-01 14:00:00', 'scheduled'),
('rd-005', 'rem-005', '2026-02-28 06:30:00', 'sent'),
('rd-006', 'rem-006', '2026-03-15 10:00:00', 'scheduled');

-- ─── REFERRALS ────────────────────────────────────────────
INSERT INTO referrals (id, user_id, referral_type, referred_to, reason, status) VALUES
('ref-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'specialist', 'Dr. Mahbub Rahman - Pediatrician', 'High-risk pregnancy monitoring. Requires specialist oversight.', 'accepted'),
('ref-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'nutritionist', 'Dr. Nusrat Jahan - Nutritionist', 'Gestational diabetes. Needs personalized meal plan.', 'completed'),
('ref-003', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'specialist', 'Dhaka Medical College - Endocrinology', 'Hypothyroidism management during pregnancy.', 'in_progress');

-- ─── MENTAL HEALTH QUESTIONS ──────────────────────────────
INSERT INTO mental_questions (id, question_text, category) VALUES
('mq-001', 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?', 'depression'),
('mq-002', 'Over the past 2 weeks, how often have you had little interest or pleasure in doing things?', 'depression'),
('mq-003', 'How often do you feel anxious or worried about your pregnancy?', 'anxiety'),
('mq-004', 'Do you have trouble falling asleep or staying asleep?', 'sleep'),
('mq-005', 'How often do you feel overwhelmed by your responsibilities?', 'stress'),
('mq-006', 'Do you have thoughts of harming yourself or your baby?', 'crisis'),
('mq-007', 'How would you rate your overall mood today on a scale of 0-3?', 'general'),
('mq-008', 'Do you feel you have adequate emotional support from family/partner?', 'support'),
('mq-009', 'How often do you experience sudden mood swings?', 'mood'),
('mq-010', 'Are you able to enjoy activities you previously found pleasurable?', 'depression');

-- ─── MENTAL ASSESSMENTS ──────────────────────────────────
INSERT INTO mental_assessments (id, user_id, assessment_date, score, status) VALUES
('ma-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', '2026-02-15', 8, 'completed'),
('ma-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', '2026-02-18', 12, 'completed'),
('ma-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', '2026-02-20', 5, 'completed'),
('ma-004', 'f80d78ef-e699-4056-8fe7-f87f689691f1', '2026-02-22', 15, 'completed'),
('ma-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', '2026-02-25', 7, 'completed');

-- ─── MENTAL ANSWERS ──────────────────────────────────────
INSERT INTO mental_answers (id, assessment_id, question_id, answer_value) VALUES
('mans-001', 'ma-001', 'mq-001', 1),
('mans-002', 'ma-001', 'mq-002', 1),
('mans-003', 'ma-001', 'mq-003', 2),
('mans-004', 'ma-001', 'mq-004', 1),
('mans-005', 'ma-001', 'mq-005', 1),
('mans-006', 'ma-001', 'mq-006', 0),
('mans-007', 'ma-001', 'mq-007', 2),
('mans-008', 'ma-002', 'mq-001', 2),
('mans-009', 'ma-002', 'mq-002', 2),
('mans-010', 'ma-002', 'mq-003', 2),
('mans-011', 'ma-002', 'mq-004', 3),
('mans-012', 'ma-002', 'mq-005', 2),
('mans-013', 'ma-002', 'mq-006', 0),
('mans-014', 'ma-002', 'mq-007', 1),
('mans-015', 'ma-003', 'mq-001', 0),
('mans-016', 'ma-003', 'mq-002', 1),
('mans-017', 'ma-003', 'mq-003', 1),
('mans-018', 'ma-003', 'mq-004', 1),
('mans-019', 'ma-003', 'mq-005', 1),
('mans-020', 'ma-003', 'mq-006', 0),
('mans-021', 'ma-003', 'mq-007', 1);

-- ─── HIGH RISK CASES ─────────────────────────────────────
INSERT INTO high_risk_cases (id, patient_user_id, risk_level, risk_factors, symptoms, current_week, assigned_doctor_id, monitoring_frequency, last_checkup, next_checkup, status, flagged_by, notes, metadata) VALUES
('hrc-001', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'HIGH', '["gestational_diabetes", "elevated_bmi"]', 'Elevated fasting blood sugar, increased thirst, frequent urination', 28, 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'weekly', '2026-02-17 11:00:00', '2026-02-24 11:00:00', 'ACTIVE', 'admin-medical-001', 'Patient on strict diet control. HbA1c trending downward.', '{"protocol": "GDM-HIGH"}'),
('hrc-002', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'MODERATE', '["hypothyroidism", "previous_csection"]', 'Fatigue, dry skin, constipation. TSH levels fluctuating.', 34, '167bb282-25af-49e3-9b1e-bd54a8316532', 'bi-weekly', '2026-02-05 14:00:00', '2026-02-19 14:00:00', 'ACTIVE', 'admin-medical-001', 'Thyroid medication adjusted. Monitoring for pre-eclampsia signs.', '{"protocol": "THYROID-MOD"}'),
('hrc-003', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'MODERATE', '["previous_csection", "rh_negative"]', 'Previous cesarean scar. RH negative blood type requires Anti-D injection.', 14, 'd92bca99-a32d-4d1b-b728-20355c945dc7', 'monthly', '2026-02-20 15:00:00', '2026-03-20 15:00:00', 'ACTIVE', 'admin-medical-001', 'Anti-D prophylaxis scheduled at 28 weeks.', '{"protocol": "RH-NEG"}');

-- ─── EMERGENCY ACCESS LOGS ────────────────────────────────
INSERT INTO emergency_access_logs (id, accessor_user_id, accessor_role, patient_user_id, access_type, reason, emergency_level, data_accessed, approved_by, approval_status, ip_address, reviewed_at, metadata) VALUES
('eal-001', '98a1fb6b-a74f-431a-899b-809253e85254', 'doctor', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'medical_records', 'Emergency bleeding episode - needed allergy info and blood type', 'HIGH', '["allergies", "blood_group", "medications"]', NULL, 'AUTO_APPROVED', '192.168.1.50', NULL, '{"emergency_id": "emr-001"}'),
('eal-002', 'admin-medical-001', 'medical_admin', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'full_profile', 'High risk case review - audit of gestational diabetes management', 'STANDARD', '["health_records", "prescriptions", "lab_results"]', 'admin-system-001', 'APPROVED', '192.168.1.100', '2026-02-18 10:00:00', '{"audit_type": "routine"}'),
('eal-003', 'efe0b731-4096-4be8-bdd4-b6d8461d7118', 'doctor', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'medical_records', 'Covering for primary physician - thyroid medication review', 'STANDARD', '["medications", "lab_results"]', NULL, 'AUTO_APPROVED', '192.168.1.55', NULL, '{"coverage_for": "167bb282-25af-49e3-9b1e-bd54a8316532"}');

-- ─── HEALTH ID VERIFICATION REQUESTS ────────────────────
INSERT INTO health_id_verification_requests (user_id, hospital_id, status, request_note, rejection_reason) VALUES
('4768b0a8-d480-4ebe-a281-eeae43c9c50d', '48b1b64f-fe94-4efa-b196-94c80a91de83', 'approved', 'Regular patient since 2024. All documents verified.', NULL),
('4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', 'approved', 'Documents verified at registration desk.', NULL),
('c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 'd8ed5c33-e45a-4000-8f43-4804d238ef25', 'approved', 'NID and passport copies verified.', NULL),
('f80d78ef-e699-4056-8fe7-f87f689691f1', '48b1b64f-fe94-4efa-b196-94c80a91de83', 'pending', 'Awaiting NID copy submission.', NULL),
('ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', 'rejected', 'Documents submitted for review.', 'NID photo does not match patient photo. Please resubmit.');

-- ─── CARD BATCHES ──────────────────────────────────────────
INSERT INTO card_batches (id, batch_number, card_type, quantity, activated_count, assigned_count, status, activation_date, expiry_date, created_by, metadata) VALUES
('cb-001', 'BATCH-2026-001', 'health_id', 500, 350, 320, 'ACTIVE', '2026-01-01 00:00:00', '2027-12-31 23:59:59', 'admin-ops-001', '{"vendor": "Pubali Print Solutions", "cost_per_unit": 50}'),
('cb-002', 'BATCH-2026-002', 'health_id', 500, 150, 140, 'ACTIVE', '2026-02-01 00:00:00', '2027-12-31 23:59:59', 'admin-ops-001', '{"vendor": "Pubali Print Solutions", "cost_per_unit": 50}'),
('cb-003', 'BATCH-2025-010', 'health_id', 1000, 1000, 980, 'DEPLETED', '2025-01-15 00:00:00', '2026-12-31 23:59:59', 'admin-ops-001', '{"vendor": "Bengal Card Technologies", "cost_per_unit": 45}');

-- ─── USER CARDS ──────────────────────────────────────────
INSERT INTO user_cards (id, user_id, batch_id, card_number, card_type, status, balance, activation_date, last_used_at, metadata) VALUES
('uc-001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'cb-001', 'NG-HID-2026-000001', 'health_id', 'ACTIVE', 0.00, '2026-01-15 10:00:00', '2026-02-25 10:00:00', '{"issued_at": "Evercare Hospital"}'),
('uc-002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'cb-001', 'NG-HID-2026-000002', 'health_id', 'ACTIVE', 0.00, '2026-01-18 11:00:00', '2026-02-26 11:00:00', '{"issued_at": "Dhaka Medical College"}'),
('uc-003', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 'cb-001', 'NG-HID-2026-000003', 'health_id', 'ACTIVE', 0.00, '2026-02-01 09:00:00', '2026-02-20 14:00:00', '{"issued_at": "Square Hospital"}'),
('uc-004', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'cb-002', 'NG-HID-2026-000501', 'health_id', 'ACTIVE', 0.00, '2026-02-10 10:00:00', '2026-02-25 09:15:00', '{"issued_at": "Evercare Hospital"}'),
('uc-005', 'ff42ff57-1296-4d30-ad6a-d27b04b42fdd', 'cb-002', 'NG-HID-2026-000502', 'health_id', 'INACTIVE', 0.00, NULL, NULL, '{"reason": "pending_verification"}');

-- ─── SUPPORT TICKETS ────────────────────────────────────────
INSERT INTO support_tickets (id, ticket_number, user_id, user_name, user_phone, category, priority, subject, description, status, assigned_to, resolved_by, resolution_notes, resolved_at) VALUES
('st-001', 'TKT-2026-0001', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', 'Setu Meherunnesa', '+8801712345678', 'TECHNICAL', 'LOW', 'Cannot upload ultrasound report', 'I tried to upload my ultrasound PDF but it shows an error saying file too large. The file is 5MB.', 'RESOLVED', 'admin-ops-001', 'admin-ops-001', 'Increased file upload limit to 10MB. User confirmed upload works now.', '2026-02-15 16:00:00'),
('st-002', 'TKT-2026-0002', '4d1576ee-97fb-42f6-a7cb-beadf200b67a', 'Rifat Shuvo Hossain', '+8801812345678', 'CARD_ISSUE', 'MEDIUM', 'Health ID card not scanning at hospital', 'When I visit Dhaka Medical College, the QR code on my health card does not scan. They have to enter my info manually.', 'IN_PROGRESS', 'admin-ops-001', NULL, NULL, NULL),
('st-003', 'TKT-2026-0003', 'f80d78ef-e699-4056-8fe7-f87f689691f1', 'Parama Akter', '+8801616345678', 'HOSPITAL_ACCESS', 'HIGH', 'Emergency room denied access to records', 'During my emergency visit, the ER staff could not access my health records through the system. They said the system was down.', 'ESCALATED', 'admin-system-001', NULL, NULL, NULL),
('st-004', 'TKT-2026-0004', 'c8b77c7f-a4e1-4ee4-b793-5e21d1901b75', 'Awadhe Sultana', '+8801912345678', 'GENERAL', 'LOW', 'How to add second child to my profile', 'I am expecting my second baby and want to know how to add another child profile to my account.', 'RESOLVED', 'admin-ops-001', 'admin-ops-001', 'Guided user through the profile settings. Child profile can be added under Dashboard > Children > Add Child.', '2026-02-20 11:00:00');

-- ─── AUDIT LOGS ──────────────────────────────────────────
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes) VALUES
('al-001', 'admin-system-001', 'UPDATE_SETTINGS', 'system_settings', 'file_upload_limit', '{"old": "5MB", "new": "10MB"}'),
('al-002', 'admin-medical-001', 'APPROVE_VERIFICATION', 'doctor_verification', '167bb282-25af-49e3-9b1e-bd54a8316532', '{"status": "approved", "verified_by": "admin-medical-001"}'),
('al-003', 'admin-ops-001', 'CREATE_BATCH', 'card_batches', 'cb-002', '{"batch_number": "BATCH-2026-002", "quantity": 500}'),
('al-004', 'admin-system-001', 'BACKUP_CREATED', 'system_backups', 'backup-001', '{"size": "245MB", "duration_seconds": 42}'),
('al-005', 'admin-medical-001', 'FLAG_HIGH_RISK', 'high_risk_cases', 'hrc-001', '{"risk_level": "HIGH", "patient": "4d1576ee-97fb-42f6-a7cb-beadf200b67a"}'),
('al-006', '98a1fb6b-a74f-431a-899b-809253e85254', 'EMERGENCY_ACCESS', 'emergency_access_logs', 'eal-001', '{"patient": "4768b0a8-d480-4ebe-a281-eeae43c9c50d", "level": "HIGH"}'),
('al-007', 'admin-ops-001', 'RESOLVE_TICKET', 'support_tickets', 'st-001', '{"resolution": "file_limit_increased"}'),
('al-008', 'admin-system-001', 'ROLE_CHANGE', 'users', '98a1fb6b-a74f-431a-899b-809253e85254', '{"old_role": "patient", "new_role": "doctor"}');

-- ─── SECURITY EVENTS ──────────────────────────────────────
INSERT INTO security_events (id, event_type, severity, user_id, ip_address, user_agent, description, metadata, resolved, resolved_by, resolved_at) VALUES
('se-001', 'FAILED_LOGIN', 'LOW', NULL, '103.45.67.89', 'Mozilla/5.0 (Windows NT 10.0)', 'Failed login attempt for nonexistent email admin@test.com', '{"email": "admin@test.com", "attempts": 3}', 1, 'admin-system-001', '2026-02-10 08:00:00'),
('se-002', 'BRUTE_FORCE', 'HIGH', NULL, '45.67.89.12', 'Python-urllib/3.8', '15 failed login attempts from same IP within 5 minutes', '{"blocked_duration": "1h", "attempts": 15}', 1, 'admin-system-001', '2026-02-12 02:30:00'),
('se-003', 'UNAUTHORIZED_ACCESS', 'MEDIUM', '6abf7e97-9653-4905-ab9b-bee5692676f5', '192.168.1.45', 'Mozilla/5.0 (iPhone)', 'Patient attempted to access admin dashboard endpoint', '{"endpoint": "/api/admin/users", "method": "GET"}', 1, 'admin-system-001', '2026-02-15 14:00:00'),
('se-004', 'PASSWORD_CHANGE', 'LOW', '4768b0a8-d480-4ebe-a281-eeae43c9c50d', '192.168.1.20', 'Mozilla/5.0 (Windows NT 10.0)', 'User changed password successfully', '{"method": "settings_page"}', 0, NULL, NULL),
('se-005', 'DATA_EXPORT', 'MEDIUM', 'admin-medical-001', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0)', 'Medical admin exported patient records for 25 users', '{"records_count": 25, "format": "csv"}', 0, NULL, NULL),
('se-006', 'SUSPICIOUS_ACTIVITY', 'HIGH', NULL, '78.90.12.34', 'curl/7.81.0', 'Repeated API scraping detected from external IP', '{"endpoints_hit": 45, "timespan_seconds": 30}', 1, 'admin-system-001', '2026-02-20 03:15:00');

-- ─── ADMIN INTERACTIONS ──────────────────────────────────
INSERT INTO admin_interactions (id, initiator_user_id, initiator_role, target_user_id, target_role, interaction_type, subject, description, entity_type, entity_id, status, response, responded_at, metadata) VALUES
('ai-001', 'admin-medical-001', 'medical_admin', 'admin-ops-001', 'ops_admin', 'APPROVAL_REQUEST', 'New hospital onboarding - Popular Medical College', 'Popular Medical College Dhaka has submitted their onboarding application. Requesting operations approval for facility setup.', 'hospital_onboarding', NULL, 'COMPLETED', 'Approved. Site inspection scheduled for March 5.', '2026-02-20 14:00:00', '{"hospital_name": "Popular Medical College Dhaka"}'),
('ai-002', 'admin-system-001', 'system_admin', 'admin-medical-001', 'medical_admin', 'ALERT', 'High risk patient needs immediate assignment', 'Patient with critical pre-eclampsia signs needs specialist assignment urgently.', 'high_risk_cases', 'hrc-002', 'COMPLETED', 'Assigned Dr. Arifa Begum. Monitoring initiated.', '2026-02-15 11:00:00', '{"urgency": "high"}'),
('ai-003', 'admin-ops-001', 'ops_admin', 'admin-system-001', 'system_admin', 'ESCALATION', 'System downtime during ER visit', 'Patient reported system unavailability during emergency hospital visit. Needs immediate investigation.', 'support_tickets', 'st-003', 'IN_PROGRESS', NULL, NULL, '{"ticket": "TKT-2026-0003"}'),
('ai-004', 'admin-medical-001', 'medical_admin', 'admin-ops-001', 'ops_admin', 'INFORMATION_REQUEST', 'Card batch status for March distribution', 'Need updated status on remaining health ID cards for March hospital distributions.', 'card_batches', 'cb-002', 'COMPLETED', 'BATCH-2026-002 has 350 remaining cards. New batch ordered for March.', '2026-02-22 16:00:00', '{"remaining": 350}');

-- ─── HOSPITAL ONBOARDING ──────────────────────────────────
INSERT INTO hospital_onboarding (id, hospital_name, hospital_type, contact_person, contact_email, contact_phone, address, city, district, bed_capacity, license_number, status, submitted_by, reviewed_by, review_notes, metadata) VALUES
('ho-001', 'Popular Medical College Dhaka', 'PRIVATE', 'Dr. Aminul Haque', 'admin@popularmedical.bd', '+8801799000001', '45 Kakrail Road', 'Dhaka', 'Dhaka', 200, 'DGHS-PVT-2025-1234', 'APPROVED', 'admin-ops-001', 'admin-medical-001', 'All documentation verified. Facility inspection passed on Feb 20.', '{"inspection_date": "2026-02-20"}'),
('ho-002', 'Chattogram Maa O Shishu Hospital', 'SPECIALIZED', 'Dr. Rehana Sultana', 'info@maoshishu-ctg.bd', '+8801799000002', '12 Agrabad Commercial Area', 'Chattogram', 'Chattogram', 80, 'DGHS-SPL-2025-5678', 'ACTIVE', 'admin-ops-001', 'admin-medical-001', 'Specialized maternal health facility. Approved and actively onboarded.', '{"specialization": "maternal_health"}'),
('ho-003', 'Rajshahi Maa Sheba Clinic', 'NGO', 'Nasreen Akter', 'contact@maasheba-raj.org', '+8801799000003', '78 Station Road', 'Rajshahi', 'Rajshahi', 30, 'DGHS-NGO-2025-9012', 'PENDING', 'admin-ops-001', NULL, NULL, '{"ngo_registration": "NSA-2024-445"}');

-- ─── HOSPITAL PERFORMANCE ────────────────────────────────
INSERT INTO hospital_performance (id, hospital_id, period_start, period_end, active_mothers_count, services_provided_count, consultations_count, average_rating, total_revenue, health_id_verifications, status, metadata) VALUES
('hp-001', '48b1b64f-fe94-4efa-b196-94c80a91de83', '2026-01-01', '2026-01-31', 145, 520, 310, 4.70, 2450000.00, 85, 'OPERATIONAL', '{"top_service": "prenatal_checkup"}'),
('hp-002', '48b1b64f-fe94-4efa-b196-94c80a91de83', '2026-02-01', '2026-02-28', 162, 580, 345, 4.75, 2780000.00, 92, 'OPERATIONAL', '{"top_service": "prenatal_checkup"}'),
('hp-003', 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', '2026-01-01', '2026-01-31', 310, 890, 520, 4.20, 1800000.00, 120, 'OPERATIONAL', '{"top_service": "delivery"}'),
('hp-004', 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', '2026-02-01', '2026-02-28', 335, 950, 560, 4.30, 1950000.00, 135, 'OPERATIONAL', '{"top_service": "delivery"}'),
('hp-005', 'd8ed5c33-e45a-4000-8f43-4804d238ef25', '2026-01-01', '2026-01-31', 98, 380, 220, 4.85, 3200000.00, 45, 'OPERATIONAL', '{"top_service": "high_risk_pregnancy"}'),
('hp-006', 'd8ed5c33-e45a-4000-8f43-4804d238ef25', '2026-02-01', '2026-02-28', 110, 420, 250, 4.88, 3500000.00, 52, 'OPERATIONAL', '{"top_service": "high_risk_pregnancy"}');

-- ─── ICU STATUS UPDATES ──────────────────────────────────
INSERT INTO icu_status_updates (id, hospital_id, available_beds, occupied_beds) VALUES
('icu-001', '48b1b64f-fe94-4efa-b196-94c80a91de83', 8, 12),
('icu-002', 'd21ff2ad-11d2-4d4c-825f-e4bc9e8d7c31', 3, 17),
('icu-003', 'd8ed5c33-e45a-4000-8f43-4804d238ef25', 5, 10);

-- ─── NGOs ────────────────────────────────────────────────
INSERT INTO ngos (id, name, description, phone, email, website, address) VALUES
('ngo-001', 'BRAC Maternal Health Program', 'Largest NGO-run maternal health program in Bangladesh. Provides free prenatal care, delivery assistance, and postnatal follow-up in rural areas.', '+8801755100001', 'maternal@brac.net', 'https://www.brac.net/maternal-health', 'BRAC Centre, 75 Mohakhali, Dhaka 1212'),
('ngo-002', 'Marie Stopes Bangladesh', 'Provides reproductive health services including antenatal care, safe delivery, and family planning across 130+ clinics.', '+8801755100002', 'info@mariestopes.org.bd', 'https://www.mariestopes.org.bd', 'Marie Stopes House, Banani, Dhaka'),
('ngo-003', 'Smiling Sun Franchise Program', 'Network of 300+ clinics providing affordable maternal and child healthcare services across Bangladesh.', '+8801755100003', 'contact@smilingsun.org', 'https://www.smilingsunbd.org', '15 Dhanmondi, Dhaka 1205');

-- ─── GOV RESOURCES ──────────────────────────────────────
INSERT INTO gov_resources (id, resource_name, resource_type, description, contact_info, website) VALUES
('gr-001', 'DGHS Maternal Health Division', 'government', 'Directorate General of Health Services - Division responsible for national maternal health policy, guidelines, and surveillance.', '+880-2-9116751, mhd@dghs.gov.bd', 'https://dghs.gov.bd/maternal-health'),
('gr-002', 'National Immunization Program', 'government', 'Expanded Programme on Immunization (EPI) providing free vaccinations for mothers and children across all districts.', '+880-2-9118421, epi@dghs.gov.bd', 'https://dghs.gov.bd/epi'),
('gr-003', 'National Nutrition Services', 'government', 'Government program providing iron-folic acid supplements, nutrition counseling, and growth monitoring for pregnant women and children.', '+880-2-9116890, nns@dghs.gov.bd', 'https://dghs.gov.bd/nutrition'),
('gr-004', '999 Emergency Service', 'emergency', 'National emergency number providing ambulance dispatch, medical emergency guidance, and hospital coordination 24/7.', '999 (toll-free), emergency@999.gov.bd', 'https://999.gov.bd');

-- ─── CSR PROGRAMS ────────────────────────────────────────
INSERT INTO csr_programs (id, program_name, sponsor_name, sponsor_contact, program_type, budget, beneficiary_count, target_beneficiaries, status, start_date, end_date, description, managed_by, metadata) VALUES
('csr-001', 'Safe Motherhood Initiative', 'Grameenphone', 'csr@grameenphone.com', 'healthcare', 5000000.00, 450, 1000, 'ACTIVE', '2026-01-01', '2026-12-31', 'Free prenatal checkups, delivery kits, and postnatal care for underprivileged mothers in rural Dhaka and Chattogram districts.', 'admin-ops-001', '{"regions": ["Dhaka", "Chattogram"], "coverage": "rural"}'),
('csr-002', 'Digital Health Cards for All', 'Robi Axiata', 'partnerships@robi.com.bd', 'technology', 2000000.00, 320, 5000, 'ACTIVE', '2026-02-01', '2026-08-31', 'Sponsoring production and distribution of NFC-enabled health ID cards for expectant mothers in government hospitals.', 'admin-ops-001', '{"card_type": "NFC", "target_hospitals": 50}'),
('csr-003', 'Nutrition for Two', 'Unilever Bangladesh', 'csr@unilever.com.bd', 'nutrition', 3000000.00, 0, 2000, 'PLANNING', '2026-04-01', '2026-12-31', 'Monthly nutrition packages with essential supplements, protein-rich foods, and educational materials for pregnant women below poverty line.', 'admin-ops-001', '{"supplements_per_pack": 5, "monthly_cost_per_beneficiary": 1500}');

-- ─── SCHEMA MIGRATIONS (tracking) ──────────────────────
INSERT INTO schema_migrations (name) VALUES
('001_initial_schema'),
('002_add_health_id_tables'),
('003_add_admin_dashboards'),
('004_add_consultation_system'),
('005_add_emergency_system'),
('006_add_dbms_seed_tables');

SET FOREIGN_KEY_CHECKS = 1;

-- Done!
SELECT 'ALL TEST DATA INSERTED SUCCESSFULLY' AS result;
