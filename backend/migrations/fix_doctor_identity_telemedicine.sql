-- ============================================================
-- Migration: Fix doctor-patient identity + telemedicine setup
-- ============================================================

-- 1. Add user_id column to doctors table (links doctors catalog to users table)
ALTER TABLE doctors ADD COLUMN user_id VARCHAR(36) NULL AFTER id;
ALTER TABLE doctors ADD INDEX idx_doctors_user_id (user_id);

-- 2. Map existing doctor users to doctor catalog entries
UPDATE doctors SET user_id = '64805c1c-9631-40a6-98e8-1f97ebfddc19'  WHERE id = '167bb282-25af-49e3-9b1e-bd54a8316532';  -- Dr. Arifa Begum
UPDATE doctors SET user_id = '98a1fb6b-a74f-431a-899b-809253e85254'  WHERE id = '67ea0685-c2dc-43fb-ac3a-4bd25fad0ca3';  -- Dr. Nusrat Jahan
UPDATE doctors SET user_id = 'efe0b731-4096-4be8-bdd4-b6d8461d7118'  WHERE id = 'd92bca99-a32d-4d1b-b728-20355c945dc7';  -- Dr. Mahbub Rahman

-- 3. Many-to-many junction table: patient_doctors
CREATE TABLE IF NOT EXISTS patient_doctors (
  id          VARCHAR(36) PRIMARY KEY,
  patient_id  VARCHAR(36) NOT NULL,
  doctor_id   VARCHAR(36) NOT NULL,
  status      ENUM('active','inactive') DEFAULT 'active',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_patient_doctor (patient_id, doctor_id),
  INDEX idx_pd_patient (patient_id),
  INDEX idx_pd_doctor  (doctor_id)
);

-- 4. Telemedicine sessions metadata table
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id              VARCHAR(36) PRIMARY KEY,
  appointment_id  VARCHAR(36) NOT NULL,
  doctor_id       VARCHAR(36) NOT NULL,
  patient_id      VARCHAR(36) NOT NULL,
  started_at      DATETIME NULL,
  ended_at        DATETIME NULL,
  duration_seconds INT DEFAULT 0,
  call_type       ENUM('video','audio') DEFAULT 'video',
  status          ENUM('waiting','active','ended','missed') DEFAULT 'waiting',
  notes           TEXT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ts_appointment (appointment_id),
  INDEX idx_ts_doctor     (doctor_id),
  INDEX idx_ts_patient    (patient_id)
);

-- 5. Fix old appointments: replace "d1" with real doctor ID
UPDATE app_entities 
SET data = JSON_SET(data, '$.doctorId', '167bb282-25af-49e3-9b1e-bd54a8316532')
WHERE type = 'appointment' AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.doctorId')) = 'd1';

UPDATE app_entities 
SET data = JSON_SET(data, '$.doctorId', 'd92bca99-a32d-4d1b-b728-20355c945dc7')
WHERE type = 'appointment' AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.doctorId')) = 'd2';

-- 6. Seed initial patient_doctors relationships from existing appointments
INSERT IGNORE INTO patient_doctors (id, patient_id, doctor_id)
SELECT 
  UUID(), 
  e.user_id, 
  JSON_UNQUOTE(JSON_EXTRACT(e.data, '$.doctorId'))
FROM app_entities e
WHERE e.type = 'appointment'
  AND e.user_id IS NOT NULL
  AND JSON_UNQUOTE(JSON_EXTRACT(e.data, '$.doctorId')) IS NOT NULL
GROUP BY e.user_id, JSON_UNQUOTE(JSON_EXTRACT(e.data, '$.doctorId'));
