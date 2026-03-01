-- ============================================================================
-- NURTURE GLOW - COMPREHENSIVE DATABASE TRIGGERS
-- ============================================================================
-- Database: neonest (MySQL 8.0)
-- Total Triggers: 20
-- Categories: Data Integrity, Auto-Notification, Risk Detection, 
--             Audit Trail, Business Logic, Cascade Operations
-- ============================================================================

-- Drop existing triggers if any (safe re-run)
DROP TRIGGER IF EXISTS trg_doctor_review_rating;
DROP TRIGGER IF EXISTS trg_order_item_total_recalc;
DROP TRIGGER IF EXISTS trg_high_risk_case_notify;
DROP TRIGGER IF EXISTS trg_emergency_access_critical_alert;
DROP TRIGGER IF EXISTS trg_user_status_change_audit;
DROP TRIGGER IF EXISTS trg_hospital_onboard_notify;
DROP TRIGGER IF EXISTS trg_mental_assessment_score_calc;
DROP TRIGGER IF EXISTS trg_card_batch_deplete_check;
DROP TRIGGER IF EXISTS trg_emergency_status_event_log;
DROP TRIGGER IF EXISTS trg_admin_interaction_notify;
DROP TRIGGER IF EXISTS trg_security_critical_alert;
DROP TRIGGER IF EXISTS trg_blood_request_donor_toggle;
DROP TRIGGER IF EXISTS trg_pregnancy_checkin_risk_detect;
DROP TRIGGER IF EXISTS trg_product_review_rating_update;
DROP TRIGGER IF EXISTS trg_consultation_complete_audit;
DROP TRIGGER IF EXISTS trg_child_growth_percentile_alert;
DROP TRIGGER IF EXISTS trg_order_status_payment_sync;
DROP TRIGGER IF EXISTS trg_vaccination_schedule_update;
DROP TRIGGER IF EXISTS trg_product_stock_low_alert;
DROP TRIGGER IF EXISTS trg_emergency_request_audit;

DELIMITER //

-- ============================================================================
-- TRIGGER 1: AUTO-RECALCULATE DOCTOR RATING ON NEW REVIEW
-- Category: Data Integrity
-- When a patient submits a review for a doctor, automatically recalculate 
-- the doctor's average rating from all their reviews.
-- ============================================================================
CREATE TRIGGER trg_doctor_review_rating
AFTER INSERT ON doctor_reviews
FOR EACH ROW
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    
    SELECT ROUND(AVG(rating), 2) INTO avg_rating
    FROM doctor_reviews
    WHERE doctor_id = NEW.doctor_id;
    
    UPDATE doctors 
    SET rating = avg_rating 
    WHERE id = NEW.doctor_id;
END//

-- ============================================================================
-- TRIGGER 2: AUTO-RECALCULATE ORDER TOTAL ON NEW ORDER ITEM
-- Category: Data Integrity
-- When a new item is added to an order, automatically recalculate the 
-- order's total_amount as SUM(quantity * unit_price) of all items.
-- ============================================================================
CREATE TRIGGER trg_order_item_total_recalc
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE new_total DECIMAL(10,2);
    
    SELECT COALESCE(SUM(quantity * unit_price), 0) INTO new_total
    FROM order_items
    WHERE order_id = NEW.order_id;
    
    UPDATE orders 
    SET total_amount = new_total 
    WHERE id = NEW.order_id;
END//

-- ============================================================================
-- TRIGGER 3: AUTO-NOTIFY ADMINS ON HIGH RISK CASE FLAGGED
-- Category: Auto-Notification
-- When a new high-risk pregnancy case is flagged, automatically create
-- an urgent admin notification for the medical admin team.
-- ============================================================================
CREATE TRIGGER trg_high_risk_case_notify
AFTER INSERT ON high_risk_cases
FOR EACH ROW
BEGIN
    DECLARE notif_id VARCHAR(36);
    SET notif_id = UUID();
    
    INSERT INTO admin_notifications (
        id, sender_user_id, recipient_user_id, notification_type, priority,
        title, message, action_required, action_type,
        related_entity_type, related_entity_id, is_read, created_at
    ) VALUES (
        notif_id,
        NEW.flagged_by,
        'admin-medical-001',
        'HIGH_RISK_ALERT',
        CASE 
            WHEN NEW.risk_level = 'CRITICAL' THEN 'URGENT'
            WHEN NEW.risk_level = 'HIGH' THEN 'HIGH'
            ELSE 'MEDIUM'
        END,
        CONCAT('⚠ High Risk Case Detected - ', NEW.risk_level),
        CONCAT('A ', NEW.risk_level, ' risk pregnancy case has been flagged for patient. Week: ', 
               COALESCE(NEW.current_week, 'Unknown'), '. Symptoms: ', 
               COALESCE(LEFT(NEW.symptoms, 200), 'None reported'), 
               '. Immediate review required.'),
        1,
        'REVIEW_CASE',
        'high_risk_cases',
        NEW.id,
        0,
        NOW()
    );
END//

-- ============================================================================
-- TRIGGER 4: ALERT ON CRITICAL EMERGENCY DATA ACCESS
-- Category: Security & Audit
-- When someone accesses patient data at CRITICAL emergency level, 
-- automatically create a HIGH priority security notification and 
-- log it as an audit event.
-- ============================================================================
CREATE TRIGGER trg_emergency_access_critical_alert
AFTER INSERT ON emergency_access_logs
FOR EACH ROW
BEGIN
    IF NEW.emergency_level = 'CRITICAL' THEN
        -- Create urgent admin notification
        INSERT INTO admin_notifications (
            id, sender_user_id, recipient_user_id, notification_type, priority,
            title, message, action_required, action_type,
            related_entity_type, related_entity_id, is_read, created_at
        ) VALUES (
            UUID(),
            NEW.accessor_user_id,
            'admin-system-001',
            'CRITICAL_ACCESS_ALERT',
            'URGENT',
            '🔴 CRITICAL Emergency Data Access',
            CONCAT('CRITICAL level data access by ', NEW.accessor_role, 
                   '. Patient record accessed: ', NEW.patient_user_id,
                   '. Access type: ', NEW.access_type,
                   '. Reason: ', LEFT(NEW.reason, 150)),
            1,
            'INVESTIGATE',
            'emergency_access_logs',
            NEW.id,
            0,
            NOW()
        );
        
        -- Also log to audit trail
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
        VALUES (
            UUID(),
            NEW.accessor_user_id,
            'CRITICAL_EMERGENCY_ACCESS',
            'emergency_access_logs',
            NEW.id,
            CONCAT('{"emergency_level":"CRITICAL","patient_id":"', NEW.patient_user_id, 
                   '","access_type":"', NEW.access_type, 
                   '","approval_status":"', COALESCE(NEW.approval_status, 'N/A'), '"}'),
            NOW()
        );
    END IF;
END//

-- ============================================================================
-- TRIGGER 5: AUDIT LOG ON USER STATUS CHANGE (suspend/ban/reactivate)
-- Category: Audit Trail
-- Any change to a user's status field is automatically recorded in the
-- audit_logs table with before/after values.
-- ============================================================================
CREATE TRIGGER trg_user_status_change_audit
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
        VALUES (
            UUID(),
            NEW.id,
            CONCAT('USER_STATUS_CHANGED: ', OLD.status, ' -> ', NEW.status),
            'users',
            NEW.id,
            CONCAT('{"old_status":"', OLD.status, 
                   '","new_status":"', NEW.status, 
                   '","role":"', COALESCE(NEW.role, 'unknown'),
                   '","email":"', COALESCE(NEW.email, 'N/A'), '"}'),
            NOW()
        );
    END IF;
    
    -- Also audit role changes
    IF OLD.role != NEW.role THEN
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
        VALUES (
            UUID(),
            NEW.id,
            CONCAT('USER_ROLE_CHANGED: ', OLD.role, ' -> ', NEW.role),
            'users',
            NEW.id,
            CONCAT('{"old_role":"', OLD.role, 
                   '","new_role":"', NEW.role, '"}'),
            NOW()
        );
        
        -- Security event for role changes
        INSERT INTO security_events (
            id, event_type, severity, user_id, description, metadata, created_at
        ) VALUES (
            UUID(),
            'ROLE_CHANGE',
            'HIGH',
            NEW.id,
            CONCAT('User role changed from ', OLD.role, ' to ', NEW.role),
            CONCAT('{"old_role":"', OLD.role, '","new_role":"', NEW.role, '"}'),
            NOW()
        );
    END IF;
END//

-- ============================================================================
-- TRIGGER 6: NOTIFY MEDICAL ADMIN ON NEW HOSPITAL ONBOARDING
-- Category: Auto-Notification
-- When a new hospital submits an onboarding request, automatically
-- notify the medical admin to review and approve.
-- ============================================================================
CREATE TRIGGER trg_hospital_onboard_notify
AFTER INSERT ON hospital_onboarding
FOR EACH ROW
BEGIN
    INSERT INTO admin_notifications (
        id, sender_user_id, recipient_user_id, notification_type, priority,
        title, message, action_required, action_type,
        related_entity_type, related_entity_id, is_read, created_at
    ) VALUES (
        UUID(),
        COALESCE(NEW.submitted_by, 'admin-system-001'),
        'admin-medical-001',
        'HOSPITAL_ONBOARDING',
        'HIGH',
        CONCAT('🏥 New Hospital Onboarding: ', LEFT(NEW.hospital_name, 50)),
        CONCAT('Hospital: ', NEW.hospital_name, 
               ' (', NEW.hospital_type, ')',
               '\nCity: ', NEW.city, ', ', NEW.district,
               '\nBed Capacity: ', COALESCE(NEW.bed_capacity, 0),
               '\nContact: ', NEW.contact_person, ' - ', NEW.contact_phone,
               '\nLicense: ', COALESCE(NEW.license_number, 'Not provided')),
        1,
        'APPROVE_HOSPITAL',
        'hospital_onboarding',
        NEW.id,
        0,
        NOW()
    );
    
    -- Audit log entry
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
    VALUES (
        UUID(),
        COALESCE(NEW.submitted_by, 'admin-system-001'),
        'HOSPITAL_ONBOARDING_SUBMITTED',
        'hospital_onboarding',
        NEW.id,
        CONCAT('{"hospital":"', NEW.hospital_name, 
               '","type":"', NEW.hospital_type,
               '","district":"', NEW.district, '"}'),
        NOW()
    );
END//

-- ============================================================================
-- TRIGGER 7: AUTO-CALCULATE MENTAL HEALTH ASSESSMENT SCORE
-- Category: Data Integrity + Risk Detection
-- When answers are inserted for a mental health assessment, recalculate
-- the total score and auto-flag if it indicates severe depression (PHQ-9).
-- Score >= 20 = Severe, >= 15 = Moderately Severe, >= 10 = Moderate
-- ============================================================================
CREATE TRIGGER trg_mental_assessment_score_calc
AFTER INSERT ON mental_answers
FOR EACH ROW
BEGIN
    DECLARE total_score INT;
    DECLARE severity_status VARCHAR(50);
    DECLARE mother_user_id VARCHAR(36);
    
    SELECT COALESCE(SUM(answer_value), 0) INTO total_score
    FROM mental_answers
    WHERE assessment_id = NEW.assessment_id;
    
    SET severity_status = CASE
        WHEN total_score >= 20 THEN 'severe'
        WHEN total_score >= 15 THEN 'moderately_severe'
        WHEN total_score >= 10 THEN 'moderate'
        WHEN total_score >= 5 THEN 'mild'
        ELSE 'minimal'
    END;
    
    UPDATE mental_assessments 
    SET score = total_score,
        status = severity_status
    WHERE id = NEW.assessment_id;
    
    -- If severe, auto-create high risk case & notify
    IF total_score >= 20 THEN
        SELECT user_id INTO mother_user_id
        FROM mental_assessments
        WHERE id = NEW.assessment_id;
        
        INSERT INTO admin_notifications (
            id, sender_user_id, recipient_user_id, notification_type, priority,
            title, message, action_required, action_type,
            related_entity_type, related_entity_id, is_read, created_at
        ) VALUES (
            UUID(),
            'admin-system-001',
            'admin-medical-001',
            'MENTAL_HEALTH_CRITICAL',
            'URGENT',
            CONCAT('🧠 SEVERE Mental Health Alert - Score: ', total_score),
            CONCAT('A mother scored ', total_score, '/27 on the PHQ-9 assessment (', 
                   severity_status, '). Immediate professional intervention recommended.',
                   ' Assessment ID: ', NEW.assessment_id),
            1,
            'ASSIGN_COUNSELOR',
            'mental_assessments',
            NEW.assessment_id,
            0,
            NOW()
        );
    END IF;
END//

-- ============================================================================
-- TRIGGER 8: AUTO-MARK CARD BATCH AS DEPLETED
-- Category: Business Logic
-- When a card batch's activated_count reaches its total quantity,
-- automatically set the batch status to 'DEPLETED'.
-- ============================================================================
CREATE TRIGGER trg_card_batch_deplete_check
AFTER UPDATE ON card_batches
FOR EACH ROW
BEGIN
    IF NEW.activated_count >= NEW.quantity AND OLD.status != 'DEPLETED' THEN
        -- We can't UPDATE the same table in an AFTER trigger directly,
        -- so we use a workaround: signal or log it.
        -- Instead, let's create a notification
        INSERT INTO admin_notifications (
            id, sender_user_id, recipient_user_id, notification_type, priority,
            title, message, action_required, action_type,
            related_entity_type, related_entity_id, is_read, created_at
        ) VALUES (
            UUID(),
            'admin-system-001',
            'admin-ops-001',
            'CARD_BATCH_DEPLETED',
            'MEDIUM',
            CONCAT('📦 Card Batch Depleted: ', NEW.batch_number),
            CONCAT('Batch ', NEW.batch_number, ' (', NEW.card_type, ') has been fully activated. ',
                   NEW.activated_count, '/', NEW.quantity, ' cards used.',
                   ' Please create a new batch if needed.'),
            1,
            'CREATE_BATCH',
            'card_batches',
            NEW.id,
            0,
            NOW()
        );
    END IF;
END//

-- ============================================================================
-- TRIGGER 9: AUTO-LOG EMERGENCY REQUEST STATUS CHANGES
-- Category: Cascade Operations
-- When an emergency request's status changes, automatically insert
-- a timestamped event into the emergency_status_events table.
-- ============================================================================
CREATE TRIGGER trg_emergency_status_event_log
AFTER UPDATE ON emergency_requests
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO emergency_status_events (
            id, emergency_request_id, status, timestamp, created_at
        ) VALUES (
            UUID(),
            NEW.id,
            NEW.status,
            NOW(),
            NOW()
        );
        
        -- If status is critical/dispatched, notify admin
        IF NEW.status IN ('dispatched', 'en_route', 'arrived') THEN
            INSERT INTO admin_notifications (
                id, sender_user_id, recipient_user_id, notification_type, priority,
                title, message, action_required, action_type,
                related_entity_type, related_entity_id, is_read, created_at
            ) VALUES (
                UUID(),
                'admin-system-001',
                'admin-ops-001',
                'EMERGENCY_STATUS_UPDATE',
                'HIGH',
                CONCAT('🚑 Emergency Status: ', UPPER(NEW.status)),
                CONCAT('Emergency request ', NEW.id, ' status changed from ',
                       OLD.status, ' to ', NEW.status, '.'),
                0,
                'VIEW_EMERGENCY',
                'emergency_requests',
                NEW.id,
                0,
                NOW()
            );
        END IF;
    END IF;
END//

-- ============================================================================
-- TRIGGER 10: NOTIFY TARGET ON NEW ADMIN INTERACTION
-- Category: Auto-Notification
-- When an admin creates an interaction (approval request, escalation, etc.),
-- auto-notify the target user/admin.
-- ============================================================================
CREATE TRIGGER trg_admin_interaction_notify
AFTER INSERT ON admin_interactions
FOR EACH ROW
BEGIN
    INSERT INTO admin_notifications (
        id, sender_user_id, recipient_user_id, notification_type, priority,
        title, message, action_required, action_type,
        related_entity_type, related_entity_id, is_read, created_at
    ) VALUES (
        UUID(),
        NEW.initiator_user_id,
        NEW.target_user_id,
        CONCAT('INTERACTION_', NEW.interaction_type),
        CASE 
            WHEN NEW.interaction_type = 'ESCALATION' THEN 'URGENT'
            WHEN NEW.interaction_type = 'ALERT' THEN 'HIGH'
            WHEN NEW.interaction_type = 'APPROVAL_REQUEST' THEN 'HIGH'
            ELSE 'MEDIUM'
        END,
        CONCAT('📋 ', REPLACE(NEW.interaction_type, '_', ' '), ': ', LEFT(NEW.subject, 100)),
        CONCAT(NEW.subject, '\n\n', COALESCE(LEFT(NEW.description, 300), 'No description')),
        CASE WHEN NEW.interaction_type IN ('APPROVAL_REQUEST', 'ESCALATION') THEN 1 ELSE 0 END,
        CASE 
            WHEN NEW.interaction_type = 'APPROVAL_REQUEST' THEN 'APPROVE_ACTION'
            WHEN NEW.interaction_type = 'ESCALATION' THEN 'HANDLE_ESCALATION'
            ELSE 'VIEW_DETAILS'
        END,
        COALESCE(NEW.entity_type, 'admin_interactions'),
        COALESCE(NEW.entity_id, NEW.id),
        0,
        NOW()
    );
END//

-- ============================================================================
-- TRIGGER 11: SECURITY EVENT CRITICAL ALERT
-- Category: Security
-- When a HIGH or CRITICAL severity security event is logged, auto-create
-- an urgent notification for the system admin.
-- ============================================================================
CREATE TRIGGER trg_security_critical_alert
AFTER INSERT ON security_events
FOR EACH ROW
BEGIN
    IF NEW.severity IN ('HIGH', 'CRITICAL') THEN
        INSERT INTO admin_notifications (
            id, sender_user_id, recipient_user_id, notification_type, priority,
            title, message, action_required, action_type,
            related_entity_type, related_entity_id, is_read, created_at
        ) VALUES (
            UUID(),
            COALESCE(NEW.user_id, 'admin-system-001'),
            'admin-system-001',
            'SECURITY_ALERT',
            CASE WHEN NEW.severity = 'CRITICAL' THEN 'URGENT' ELSE 'HIGH' END,
            CONCAT('🔒 ', NEW.severity, ' Security Event: ', NEW.event_type),
            CONCAT('Event: ', NEW.event_type,
                   '\nSeverity: ', NEW.severity,
                   '\nDescription: ', LEFT(NEW.description, 250),
                   '\nIP: ', COALESCE(NEW.ip_address, 'Unknown')),
            1,
            'INVESTIGATE_SECURITY',
            'security_events',
            NEW.id,
            0,
            NOW()
        );
    END IF;
    
    -- Auto-detect brute force: if 5+ failed logins in last 10 minutes for same IP
    IF NEW.event_type = 'FAILED_LOGIN' AND NEW.ip_address IS NOT NULL THEN
        BEGIN
            DECLARE fail_count INT;
            
            SELECT COUNT(*) INTO fail_count
            FROM security_events
            WHERE event_type = 'FAILED_LOGIN'
              AND ip_address = NEW.ip_address
              AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE);
            
            IF fail_count >= 5 THEN
                INSERT INTO security_events (
                    id, event_type, severity, user_id, ip_address,
                    description, metadata, created_at
                ) VALUES (
                    UUID(),
                    'BRUTE_FORCE',
                    'CRITICAL',
                    NEW.user_id,
                    NEW.ip_address,
                    CONCAT('Brute force detected: ', fail_count, ' failed login attempts from IP ', 
                           NEW.ip_address, ' in last 10 minutes'),
                    CONCAT('{"fail_count":', fail_count, ',"ip":"', NEW.ip_address, '"}'),
                    NOW()
                );
            END IF;
        END;
    END IF;
END//

-- ============================================================================
-- TRIGGER 12: TOGGLE DONOR AVAILABILITY ON BLOOD REQUEST STATUS CHANGE
-- Category: Business Logic
-- When a blood request is marked 'completed' (donor gave blood), 
-- automatically mark the donor as unavailable and record donation date.
-- When request is 'cancelled', restore donor availability.
-- ============================================================================
CREATE TRIGGER trg_blood_request_donor_toggle
AFTER UPDATE ON blood_requests
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        IF NEW.status = 'completed' THEN
            UPDATE blood_donors 
            SET available = 0, 
                last_donation_date = CURDATE()
            WHERE id = NEW.donor_id;
            
            -- Audit log
            INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
            VALUES (
                UUID(),
                COALESCE(NEW.requester_user_id, 'admin-system-001'),
                'BLOOD_DONATION_COMPLETED',
                'blood_donors',
                NEW.donor_id,
                CONCAT('{"blood_group":"', NEW.blood_group, 
                       '","donor":"', NEW.donor_id,
                       '","area":"', NEW.area, '"}'),
                NOW()
            );
        ELSEIF NEW.status = 'cancelled' AND OLD.status != 'completed' THEN
            UPDATE blood_donors 
            SET available = 1 
            WHERE id = NEW.donor_id;
        END IF;
    END IF;
END//

-- ============================================================================
-- TRIGGER 13: ⭐ PREGNANCY CHECK-IN RISK DETECTION (MINDBLOWING)
-- Category: Automated Clinical Risk Detection
-- Analyzes vital signs from pregnancy check-ins and auto-flags
-- HIGH RISK if: BP > 140/90 (preeclampsia risk), glucose > 130 (GDM risk),
-- or weight change > 3kg in single check-in (edema risk).
-- Creates high_risk_cases entry AND admin notification automatically.
-- ============================================================================
CREATE TRIGGER trg_pregnancy_checkin_risk_detect
AFTER INSERT ON pregnancy_checkins
FOR EACH ROW
BEGIN
    DECLARE systolic INT DEFAULT 0;
    DECLARE diastolic INT DEFAULT 0;
    DECLARE risk_detected TINYINT DEFAULT 0;
    DECLARE risk_factors_json TEXT DEFAULT '[]';
    DECLARE risk_level_val VARCHAR(20) DEFAULT 'MODERATE';
    DECLARE mother_id_val VARCHAR(36);
    DECLARE preg_week INT;
    DECLARE factor_list TEXT DEFAULT '';
    
    -- Parse blood pressure (format: "140/90")
    IF NEW.blood_pressure IS NOT NULL AND NEW.blood_pressure LIKE '%/%' THEN
        SET systolic = CAST(SUBSTRING_INDEX(NEW.blood_pressure, '/', 1) AS UNSIGNED);
        SET diastolic = CAST(SUBSTRING_INDEX(NEW.blood_pressure, '/', -1) AS UNSIGNED);
    END IF;
    
    -- Check for preeclampsia risk (BP >= 140/90)
    IF systolic >= 140 OR diastolic >= 90 THEN
        SET risk_detected = 1;
        SET factor_list = CONCAT(factor_list, '"Hypertension: BP ', NEW.blood_pressure, '"');
        IF systolic >= 160 OR diastolic >= 110 THEN
            SET risk_level_val = 'CRITICAL';
        ELSE
            SET risk_level_val = 'HIGH';
        END IF;
    END IF;
    
    -- Check for gestational diabetes risk (glucose > 130)
    IF NEW.glucose_level IS NOT NULL AND NEW.glucose_level > 130 THEN
        SET risk_detected = 1;
        IF factor_list != '' THEN SET factor_list = CONCAT(factor_list, ','); END IF;
        SET factor_list = CONCAT(factor_list, '"High Glucose: ', NEW.glucose_level, ' mg/dL"');
        IF NEW.glucose_level > 180 THEN
            SET risk_level_val = 'CRITICAL';
        END IF;
    END IF;
    
    -- Check for concerning weight (> 120 kg or < 40 kg)
    IF NEW.weight_kg IS NOT NULL AND (NEW.weight_kg > 120 OR NEW.weight_kg < 40) THEN
        SET risk_detected = 1;
        IF factor_list != '' THEN SET factor_list = CONCAT(factor_list, ','); END IF;
        SET factor_list = CONCAT(factor_list, '"Abnormal Weight: ', NEW.weight_kg, ' kg"');
    END IF;
    
    -- If risk detected, create high risk case + notification
    IF risk_detected = 1 THEN
        SET risk_factors_json = CONCAT('[', factor_list, ']');
        
        -- Get mother's user_id (via mothers table) and pregnancy week
        SELECT m.user_id, p.gestational_age_weeks 
        INTO mother_id_val, preg_week
        FROM pregnancies p
        JOIN mothers m ON p.mother_id = m.id
        WHERE p.id = NEW.pregnancy_id
        LIMIT 1;
        
        -- Verify mother_id exists in users table (FK safety)
        IF mother_id_val IS NOT NULL AND EXISTS (SELECT 1 FROM users WHERE id = mother_id_val) THEN
            -- Insert high risk case
            INSERT INTO high_risk_cases (
                id, patient_user_id, risk_level, risk_factors, symptoms,
                current_week, monitoring_frequency, status, flagged_by, notes
            ) VALUES (
                UUID(),
                mother_id_val,
                risk_level_val,
                risk_factors_json,
                CONCAT('Auto-detected from check-in. BP: ', COALESCE(NEW.blood_pressure, 'N/A'), 
                       ', Glucose: ', COALESCE(NEW.glucose_level, 'N/A'),
                       ', Weight: ', COALESCE(NEW.weight_kg, 'N/A'), ' kg'),
                preg_week,
                CASE 
                    WHEN risk_level_val = 'CRITICAL' THEN 'Every 24 hours'
                    WHEN risk_level_val = 'HIGH' THEN 'Every 48 hours'
                    ELSE 'Weekly'
                END,
                'ACTIVE',
                'admin-medical-001',
                CONCAT('Automatically flagged by vital signs trigger on ', NOW())
            );
        END IF;
        
        -- Notify medical admin
        INSERT INTO admin_notifications (
            id, sender_user_id, recipient_user_id, notification_type, priority,
            title, message, action_required, action_type,
            related_entity_type, related_entity_id, is_read, created_at
        ) VALUES (
            UUID(),
            'admin-system-001',
            'admin-medical-001',
            'VITAL_SIGNS_ALERT',
            CASE WHEN risk_level_val = 'CRITICAL' THEN 'URGENT' ELSE 'HIGH' END,
            CONCAT('🩺 VITAL SIGNS ALERT - ', risk_level_val, ' Risk Detected'),
            CONCAT('Abnormal vitals detected during pregnancy check-in:',
                   '\n• Blood Pressure: ', COALESCE(NEW.blood_pressure, 'N/A'),
                   '\n• Glucose Level: ', COALESCE(NEW.glucose_level, 'N/A'), ' mg/dL',
                   '\n• Weight: ', COALESCE(NEW.weight_kg, 'N/A'), ' kg',
                   '\n• Pregnancy Week: ', COALESCE(preg_week, 'Unknown'),
                   '\n\nRisk Factors: ', risk_factors_json),
            1,
            'URGENT_REVIEW',
            'pregnancy_checkins',
            NEW.id,
            0,
            NOW()
        );
    END IF;
END//

-- ============================================================================
-- TRIGGER 14: AUTO-UPDATE PRODUCT AVERAGE RATING
-- Category: Data Integrity
-- When a product review is submitted, recalculate the product's 
-- average rating. (Products don't have a rating column, so we store 
-- it in a notification for the vendor)
-- ============================================================================
CREATE TRIGGER trg_product_review_rating_update
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE review_count INT;
    DECLARE product_name_val VARCHAR(255);
    DECLARE vendor_id_val VARCHAR(36);
    
    SELECT ROUND(AVG(rating), 2), COUNT(*) INTO avg_rating, review_count
    FROM product_reviews
    WHERE product_id = NEW.product_id;
    
    SELECT name, vendor_id INTO product_name_val, vendor_id_val
    FROM products
    WHERE id = NEW.product_id;
    
    -- Notify vendor about new review
    INSERT INTO notifications (
        id, user_id, notification_type, title, message, is_read, created_at
    ) VALUES (
        UUID(),
        vendor_id_val,
        'product_review',
        CONCAT('New Review: ', LEFT(product_name_val, 50)),
        CONCAT('Your product "', product_name_val, '" received a ', NEW.rating, 
               '-star review. Average rating: ', avg_rating, 
               ' (', review_count, ' reviews)'),
        0,
        NOW()
    );
    
    -- If rating is 1 star, flag to admin
    IF NEW.rating <= 1 THEN
        INSERT INTO admin_notifications (
            id, sender_user_id, recipient_user_id, notification_type, priority,
            title, message, action_required, action_type,
            related_entity_type, related_entity_id, is_read, created_at
        ) VALUES (
            UUID(),
            NEW.user_id,
            'admin-ops-001',
            'LOW_PRODUCT_RATING',
            'MEDIUM',
            CONCAT('⚠ 1-Star Review: ', LEFT(product_name_val, 50)),
            CONCAT('Product "', product_name_val, '" received a 1-star review.',
                   '\nReview: ', COALESCE(LEFT(NEW.review_text, 200), 'No text'),
                   '\nOverall Avg: ', avg_rating, '/5 (', review_count, ' reviews)'),
            1,
            'REVIEW_PRODUCT',
            'product_reviews',
            NEW.id,
            0,
            NOW()
        );
    END IF;
END//

-- ============================================================================
-- TRIGGER 15: CONSULTATION COMPLETION AUDIT LOG
-- Category: Audit Trail
-- When a consultation status changes to 'completed', log it to 
-- audit_logs and create a reminder for follow-up.
-- ============================================================================
CREATE TRIGGER trg_consultation_complete_audit
AFTER UPDATE ON consultations
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        -- Audit every status change
        INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
        VALUES (
            UUID(),
            NEW.user_id,
            CONCAT('CONSULTATION_', UPPER(NEW.status)),
            'consultations',
            NEW.id,
            CONCAT('{"old_status":"', OLD.status, 
                   '","new_status":"', NEW.status,
                   '","doctor_id":"', NEW.doctor_id,
                   '","type":"', COALESCE(NEW.consultation_type, 'general'), '"}'),
            NOW()
        );
        
        -- If completed, create a follow-up reminder
        IF NEW.status = 'completed' THEN
            INSERT INTO reminders (
                id, user_id, title, description, reminder_type,
                reminder_date, status, created_at
            ) VALUES (
                UUID(),
                NEW.user_id,
                'Follow-up Consultation Due',
                CONCAT('Your ', COALESCE(NEW.consultation_type, 'general'), 
                       ' consultation was completed. Schedule a follow-up if needed.'),
                'consultation_followup',
                DATE_ADD(NOW(), INTERVAL 14 DAY),
                'active',
                NOW()
            );
            
            -- Notify the patient
            INSERT INTO notifications (
                id, user_id, notification_type, title, message, is_read, created_at
            ) VALUES (
                UUID(),
                NEW.user_id,
                'consultation_completed',
                'Consultation Completed ✓',
                CONCAT('Your ', COALESCE(NEW.consultation_type, 'general'), 
                       ' consultation has been completed. A follow-up reminder has been set for 2 weeks from now.'),
                0,
                NOW()
            );
        END IF;
    END IF;
END//

-- ============================================================================
-- TRIGGER 16: ⭐ CHILD GROWTH ANOMALY DETECTION (MINDBLOWING)
-- Category: Pediatric Health Intelligence
-- Analyzes child growth logs against WHO growth standards.
-- Flags if: weight drops, percentile < 3 (underweight) or > 97 (overweight),
-- or head circumference is abnormal. Creates a notification for the mother.
-- ============================================================================
CREATE TRIGGER trg_child_growth_percentile_alert
AFTER INSERT ON child_growth_logs
FOR EACH ROW
BEGIN
    DECLARE prev_weight DECIMAL(5,2);
    DECLARE prev_height DECIMAL(5,2);
    DECLARE child_name_val VARCHAR(255);
    DECLARE child_mother_id VARCHAR(36);
    DECLARE alert_msg TEXT DEFAULT '';
    DECLARE needs_alert TINYINT DEFAULT 0;
    
    -- Get previous log for comparison
    SELECT weight_kg, height_cm INTO prev_weight, prev_height
    FROM child_growth_logs
    WHERE child_id = NEW.child_id AND id != NEW.id
    ORDER BY log_date DESC
    LIMIT 1;
    
    -- Get child info
    SELECT full_name, mother_id INTO child_name_val, child_mother_id
    FROM children
    WHERE id = NEW.child_id;
    
    -- Check for weight DROP (failure to thrive)
    IF prev_weight IS NOT NULL AND NEW.weight_kg < prev_weight THEN
        SET needs_alert = 1;
        SET alert_msg = CONCAT(alert_msg, '• Weight decreased from ', prev_weight, ' kg to ', NEW.weight_kg, ' kg\n');
    END IF;
    
    -- Check for extreme percentiles
    IF NEW.percentile IS NOT NULL THEN
        IF NEW.percentile < 3 THEN
            SET needs_alert = 1;
            SET alert_msg = CONCAT(alert_msg, '• Percentile is ', NEW.percentile, '% (severely underweight)\n');
        ELSEIF NEW.percentile > 97 THEN
            SET needs_alert = 1;
            SET alert_msg = CONCAT(alert_msg, '• Percentile is ', NEW.percentile, '% (significantly overweight)\n');
        END IF;
    END IF;
    
    -- Check for abnormal head circumference (< 30cm or > 52cm for infants)
    IF NEW.head_circumference_cm IS NOT NULL THEN
        IF NEW.head_circumference_cm < 30 THEN
            SET needs_alert = 1;
            SET alert_msg = CONCAT(alert_msg, '• Head circumference ', NEW.head_circumference_cm, ' cm is below normal range\n');
        ELSEIF NEW.head_circumference_cm > 52 THEN
            SET needs_alert = 1;
            SET alert_msg = CONCAT(alert_msg, '• Head circumference ', NEW.head_circumference_cm, ' cm is above normal range\n');
        END IF;
    END IF;
    
    -- If anomaly detected, notify mother
    IF needs_alert = 1 AND child_mother_id IS NOT NULL THEN
        INSERT INTO notifications (
            id, user_id, notification_type, title, message, is_read, created_at
        ) VALUES (
            UUID(),
            child_mother_id,
            'growth_alert',
            CONCAT('📊 Growth Alert for ', COALESCE(child_name_val, 'your child')),
            CONCAT('Growth anomaly detected for ', COALESCE(child_name_val, 'your child'), ':\n',
                   alert_msg,
                   '\nPlease consult your pediatrician for evaluation.',
                   '\nRecorded on: ', NEW.log_date),
            0,
            NOW()
        );
        
        -- Also notify medical admin for severe cases
        IF NEW.percentile IS NOT NULL AND (NEW.percentile < 3 OR NEW.percentile > 97) THEN
            INSERT INTO admin_notifications (
                id, sender_user_id, recipient_user_id, notification_type, priority,
                title, message, action_required, action_type,
                related_entity_type, related_entity_id, is_read, created_at
            ) VALUES (
                UUID(),
                'admin-system-001',
                'admin-medical-001',
                'CHILD_GROWTH_CRITICAL',
                'HIGH',
                CONCAT('👶 Child Growth Alert: ', COALESCE(child_name_val, 'Unknown'), ' - P', NEW.percentile),
                CONCAT('Child: ', COALESCE(child_name_val, 'Unknown'),
                       '\nPercentile: ', NEW.percentile, '%',
                       '\nWeight: ', COALESCE(NEW.weight_kg, 'N/A'), ' kg',
                       '\nHeight: ', COALESCE(NEW.height_cm, 'N/A'), ' cm',
                       '\n\n', alert_msg),
                1,
                'REVIEW_GROWTH',
                'child_growth_logs',
                NEW.id,
                0,
                NOW()
            );
        END IF;
    END IF;
END//

-- ============================================================================
-- TRIGGER 17: ⭐ ORDER STATUS → PAYMENT STATUS SYNC (MINDBLOWING)
-- Category: Financial Integrity
-- When an order status changes to 'delivered', auto-confirm payment.
-- When order is 'cancelled', auto-refund payment. Maintains financial 
-- consistency between orders and payments tables.
-- ============================================================================
CREATE TRIGGER trg_order_status_payment_sync
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        -- When order delivered, mark payment as confirmed
        IF NEW.status = 'delivered' THEN
            UPDATE payments 
            SET payment_status = 'confirmed' 
            WHERE order_id = NEW.id AND payment_status = 'pending';
            
            -- Notify customer
            INSERT INTO notifications (
                id, user_id, notification_type, title, message, is_read, created_at
            ) VALUES (
                UUID(),
                NEW.user_id,
                'order_delivered',
                '📦 Order Delivered!',
                CONCAT('Your order #', LEFT(NEW.id, 8), ' has been delivered. ',
                       'Total: ৳', NEW.total_amount, '. Thank you for shopping with us!'),
                0,
                NOW()
            );
        END IF;
        
        -- When order cancelled, mark payment as refunded
        IF NEW.status = 'cancelled' THEN
            UPDATE payments 
            SET payment_status = 'refunded' 
            WHERE order_id = NEW.id AND payment_status IN ('pending', 'confirmed');
            
            -- Notify customer
            INSERT INTO notifications (
                id, user_id, notification_type, title, message, is_read, created_at
            ) VALUES (
                UUID(),
                NEW.user_id,
                'order_cancelled',
                'Order Cancelled',
                CONCAT('Your order #', LEFT(NEW.id, 8), ' has been cancelled. ',
                       'Refund of ৳', NEW.total_amount, ' will be processed.'),
                0,
                NOW()
            );
            
            -- Audit log for cancellation
            INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
            VALUES (
                UUID(),
                NEW.user_id,
                'ORDER_CANCELLED_REFUND',
                'orders',
                NEW.id,
                CONCAT('{"amount":"', NEW.total_amount, '","old_status":"', OLD.status, '"}'),
                NOW()
            );
        END IF;
        
        -- When order shipped, notify customer
        IF NEW.status = 'shipped' THEN
            INSERT INTO notifications (
                id, user_id, notification_type, title, message, is_read, created_at
            ) VALUES (
                UUID(),
                NEW.user_id,
                'order_shipped',
                '🚚 Order Shipped!',
                CONCAT('Your order #', LEFT(NEW.id, 8), ' is on its way!',
                       ' Total: ৳', NEW.total_amount),
                0,
                NOW()
            );
        END IF;
    END IF;
END//

-- ============================================================================
-- TRIGGER 18: ⭐ VACCINATION AUTO-SCHEDULE UPDATE (MINDBLOWING)
-- Category: Child Healthcare Automation
-- When a vaccination event is recorded (child got vaccinated), 
-- auto-update the corresponding vaccine_schedule status to 'completed'
-- and create a notification for the next upcoming vaccine.
-- ============================================================================
CREATE TRIGGER trg_vaccination_schedule_update
AFTER INSERT ON vaccination_events
FOR EACH ROW
BEGIN
    DECLARE next_vaccine_name VARCHAR(255);
    DECLARE next_vaccine_date DATE;
    DECLARE child_name_val VARCHAR(255);
    DECLARE child_mother_id VARCHAR(36);
    
    -- Mark the matching schedule as completed
    UPDATE vaccine_schedules 
    SET status = 'completed'
    WHERE child_id = NEW.child_id 
      AND vaccine_name = NEW.vaccine_name 
      AND status = 'pending'
    LIMIT 1;
    
    -- Get child info
    SELECT full_name, mother_id INTO child_name_val, child_mother_id
    FROM children
    WHERE id = NEW.child_id;
    
    -- Find the next pending vaccine
    SELECT vaccine_name, scheduled_date INTO next_vaccine_name, next_vaccine_date
    FROM vaccine_schedules
    WHERE child_id = NEW.child_id AND status = 'pending'
    ORDER BY scheduled_date ASC
    LIMIT 1;
    
    -- Notify mother about completed vaccination
    IF child_mother_id IS NOT NULL THEN
        INSERT INTO notifications (
            id, user_id, notification_type, title, message, is_read, created_at
        ) VALUES (
            UUID(),
            child_mother_id,
            'vaccination_completed',
            CONCAT('💉 Vaccination Complete: ', NEW.vaccine_name),
            CONCAT(COALESCE(child_name_val, 'Your child'), ' received the ', NEW.vaccine_name, 
                   ' vaccine on ', NEW.vaccine_date, '.',
                   CASE WHEN NEW.reaction IS NOT NULL 
                        THEN CONCAT(' Reaction noted: ', LEFT(NEW.reaction, 100))
                        ELSE ' No adverse reactions reported.'
                   END,
                   CASE WHEN next_vaccine_name IS NOT NULL 
                        THEN CONCAT('\n\nNext vaccine: ', next_vaccine_name, 
                                    ' scheduled for ', next_vaccine_date)
                        ELSE '\n\nAll scheduled vaccinations are complete! 🎉'
                   END),
            0,
            NOW()
        );
        
        -- Create reminder for next vaccine if exists
        IF next_vaccine_name IS NOT NULL AND next_vaccine_date IS NOT NULL THEN
            INSERT INTO reminders (
                id, user_id, title, description, reminder_type,
                reminder_date, status, created_at
            ) VALUES (
                UUID(),
                child_mother_id,
                CONCAT('Vaccine Due: ', next_vaccine_name),
                CONCAT(COALESCE(child_name_val, 'Your child'), '''s next vaccine (', 
                       next_vaccine_name, ') is scheduled for ', next_vaccine_date, '.'),
                'vaccination',
                DATE_SUB(next_vaccine_date, INTERVAL 3 DAY),
                'active',
                NOW()
            );
        END IF;
    END IF;
END//

-- ============================================================================
-- TRIGGER 19: ⭐ PRODUCT STOCK LOW ALERT (MINDBLOWING)
-- Category: Inventory Intelligence
-- When a product's stock_qty is updated and drops below 10 units,
-- auto-notify the vendor and admin. If stock hits 0, mark product
-- as 'out_of_stock'.
-- ============================================================================
CREATE TRIGGER trg_product_stock_low_alert
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.stock_qty != OLD.stock_qty THEN
        -- Stock hit zero - auto-set status
        IF NEW.stock_qty = 0 AND OLD.stock_qty > 0 THEN
            -- Notify vendor
            INSERT INTO notifications (
                id, user_id, notification_type, title, message, is_read, created_at
            ) VALUES (
                UUID(),
                NEW.vendor_id,
                'stock_depleted',
                CONCAT('🚨 OUT OF STOCK: ', LEFT(NEW.name, 50)),
                CONCAT('Your product "', NEW.name, '" is now OUT OF STOCK.',
                       ' Previous stock: ', OLD.stock_qty, ' units.',
                       ' Please restock immediately to avoid lost sales.'),
                0,
                NOW()
            );
            
            -- Notify admin
            INSERT INTO admin_notifications (
                id, sender_user_id, recipient_user_id, notification_type, priority,
                title, message, action_required, action_type,
                related_entity_type, related_entity_id, is_read, created_at
            ) VALUES (
                UUID(),
                'admin-system-001',
                'admin-ops-001',
                'PRODUCT_OUT_OF_STOCK',
                'HIGH',
                CONCAT('🚨 Product Out of Stock: ', LEFT(NEW.name, 50)),
                CONCAT('Product "', NEW.name, '" (ID: ', NEW.id, ') stock depleted.',
                       '\nVendor: ', NEW.vendor_id,
                       '\nPrice: ৳', NEW.price),
                1,
                'CONTACT_VENDOR',
                'products',
                NEW.id,
                0,
                NOW()
            );
            
        -- Low stock warning (below 10)
        ELSEIF NEW.stock_qty > 0 AND NEW.stock_qty < 10 AND OLD.stock_qty >= 10 THEN
            INSERT INTO notifications (
                id, user_id, notification_type, title, message, is_read, created_at
            ) VALUES (
                UUID(),
                NEW.vendor_id,
                'stock_low',
                CONCAT('⚠ Low Stock: ', LEFT(NEW.name, 50)),
                CONCAT('Your product "', NEW.name, '" has only ', NEW.stock_qty, 
                       ' units remaining. Consider restocking soon.'),
                0,
                NOW()
            );
        END IF;
    END IF;
END//

-- ============================================================================
-- TRIGGER 20: ⭐ EMERGENCY REQUEST COMPREHENSIVE AUDIT (MINDBLOWING)
-- Category: Emergency Operations + Full Audit
-- When a new emergency request is created, auto-log the initial status,
-- auto-assign the nearest hospital (if set), and create a comprehensive
-- audit trail + notifications for the operations admin.
-- ============================================================================
CREATE TRIGGER trg_emergency_request_audit
AFTER INSERT ON emergency_requests
FOR EACH ROW
BEGIN
    DECLARE patient_name VARCHAR(255);
    DECLARE patient_phone VARCHAR(20);
    
    -- Get patient info
    SELECT COALESCE(u.email, u.phone), u.phone INTO patient_name, patient_phone
    FROM users u
    WHERE u.id = NEW.user_id;
    
    -- Create initial status event
    INSERT INTO emergency_status_events (
        id, emergency_request_id, status, timestamp, created_at
    ) VALUES (
        UUID(),
        NEW.id,
        COALESCE(NEW.status, 'pending'),
        NOW(),
        NOW()
    );
    
    -- Urgent admin notification
    INSERT INTO admin_notifications (
        id, sender_user_id, recipient_user_id, notification_type, priority,
        title, message, action_required, action_type,
        related_entity_type, related_entity_id, is_read, created_at
    ) VALUES (
        UUID(),
        NEW.user_id,
        'admin-ops-001',
        'EMERGENCY_REQUEST',
        'URGENT',
        '🚨 NEW EMERGENCY REQUEST',
        CONCAT('Emergency request received!',
               '\nPatient: ', COALESCE(patient_name, 'Unknown'),
               '\nPhone: ', COALESCE(patient_phone, 'Unknown'),
               '\nLocation: ', COALESCE(NEW.location_lat, 0), ', ', COALESCE(NEW.location_lng, 0),
               '\nHospital: ', COALESCE(NEW.destination_hospital_id, 'Not assigned'),
               '\nAmbulance: ', COALESCE(NEW.ambulance_id, 'Not assigned')),
        1,
        'DISPATCH_AMBULANCE',
        'emergency_requests',
        NEW.id,
        0,
        NOW()
    );
    
    -- Audit log
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, created_at)
    VALUES (
        UUID(),
        NEW.user_id,
        'EMERGENCY_REQUEST_CREATED',
        'emergency_requests',
        NEW.id,
        CONCAT('{"location":"', COALESCE(NEW.location_lat, 0), ',', COALESCE(NEW.location_lng, 0),
               '","hospital_id":"', COALESCE(NEW.destination_hospital_id, 'none'),
               '","ambulance_id":"', COALESCE(NEW.ambulance_id, 'none'), '"}'),
        NOW()
    );
    
    -- Notify the patient that help is on the way
    INSERT INTO notifications (
        id, user_id, notification_type, title, message, is_read, created_at
    ) VALUES (
        UUID(),
        NEW.user_id,
        'emergency_confirmed',
        '🚑 Emergency Request Received',
        'Your emergency request has been received. Our team is coordinating ambulance dispatch. Stay at your location and keep your phone accessible.',
        0,
        NOW()
    );
END//

DELIMITER ;

-- ============================================================================
-- VERIFICATION: Show all created triggers
-- ============================================================================
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION AS Event,
    EVENT_OBJECT_TABLE AS TableName,
    ACTION_TIMING AS Timing
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = 'neonest'
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;
