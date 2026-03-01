# Database Triggers - Nurture Glow (neonest)

## Summary
**Total Triggers: 20** | **Tables Covered: 16** | **Categories: 6**

## All Triggers at a Glance

| # | Trigger Name | Table | Event | Category |
|---|---|---|---|---|
| 1 | `trg_doctor_review_rating` | doctor_reviews | AFTER INSERT | Data Integrity |
| 2 | `trg_order_item_total_recalc` | order_items | AFTER INSERT | Data Integrity |
| 3 | `trg_high_risk_case_notify` | high_risk_cases | AFTER INSERT | Auto-Notification |
| 4 | `trg_emergency_access_critical_alert` | emergency_access_logs | AFTER INSERT | Security & Audit |
| 5 | `trg_user_status_change_audit` | users | AFTER UPDATE | Audit Trail |
| 6 | `trg_hospital_onboard_notify` | hospital_onboarding | AFTER INSERT | Auto-Notification |
| 7 | `trg_mental_assessment_score_calc` | mental_answers | AFTER INSERT | Data Integrity + Risk |
| 8 | `trg_card_batch_deplete_check` | card_batches | AFTER UPDATE | Business Logic |
| 9 | `trg_emergency_status_event_log` | emergency_requests | AFTER UPDATE | Cascade Operations |
| 10 | `trg_admin_interaction_notify` | admin_interactions | AFTER INSERT | Auto-Notification |
| 11 | `trg_security_critical_alert` | security_events | AFTER INSERT | Security |
| 12 | `trg_blood_request_donor_toggle` | blood_requests | AFTER UPDATE | Business Logic |
| 13 | `trg_pregnancy_checkin_risk_detect` ⭐ | pregnancy_checkins | AFTER INSERT | Clinical Risk Detection |
| 14 | `trg_product_review_rating_update` | product_reviews | AFTER INSERT | Data Integrity |
| 15 | `trg_consultation_complete_audit` | consultations | AFTER UPDATE | Audit Trail |
| 16 | `trg_child_growth_percentile_alert` ⭐ | child_growth_logs | AFTER INSERT | Pediatric Health Intel |
| 17 | `trg_order_status_payment_sync` ⭐ | orders | AFTER UPDATE | Financial Integrity |
| 18 | `trg_vaccination_schedule_update` ⭐ | vaccination_events | AFTER INSERT | Child Healthcare Auto |
| 19 | `trg_product_stock_low_alert` ⭐ | products | AFTER UPDATE | Inventory Intelligence |
| 20 | `trg_emergency_request_audit` ⭐ | emergency_requests | AFTER INSERT | Emergency Operations |

> ⭐ = Advanced "mindblowing" triggers with multi-table cascading logic

---

## Detailed Descriptions

### Trigger 1: `trg_doctor_review_rating`
- **Table:** `doctor_reviews` → AFTER INSERT
- **Logic:** When a patient submits a review, automatically recalculates the doctor's average rating using `AVG(rating)` from all reviews and updates `doctors.rating`
- **SQL Features:** Aggregate function (AVG), UPDATE cascade

### Trigger 2: `trg_order_item_total_recalc`
- **Table:** `order_items` → AFTER INSERT
- **Logic:** When a new item is added to an order, recalculates `orders.total_amount` as `SUM(quantity * unit_price)`
- **SQL Features:** Aggregate function (SUM), arithmetic expressions, COALESCE

### Trigger 3: `trg_high_risk_case_notify`
- **Table:** `high_risk_cases` → AFTER INSERT
- **Logic:** When a high-risk pregnancy is flagged, auto-creates an admin notification with URGENT/HIGH/MEDIUM priority based on risk level (CRITICAL/HIGH/MODERATE)
- **SQL Features:** CASE expression, CONCAT, COALESCE, LEFT

### Trigger 4: `trg_emergency_access_critical_alert`
- **Table:** `emergency_access_logs` → AFTER INSERT
- **Logic:** When CRITICAL-level emergency data access occurs, creates both an URGENT admin notification AND an audit log entry. Dual-table cascade.
- **SQL Features:** IF conditional, dual INSERT, UUID(), CONCAT

### Trigger 5: `trg_user_status_change_audit`
- **Table:** `users` → AFTER UPDATE
- **Logic:** Monitors BOTH status changes (active→suspended→banned) AND role changes. Creates audit_logs entries for status changes and security_events for role changes.
- **SQL Features:** Multiple IF blocks, OLD vs NEW comparison, triple-table cascade

### Trigger 6: `trg_hospital_onboard_notify`
- **Table:** `hospital_onboarding` → AFTER INSERT
- **Logic:** When a hospital submits onboarding, creates admin notification + audit log. Shows hospital details (type, beds, location, license).
- **SQL Features:** CONCAT with multiline, COALESCE, dual INSERT

### Trigger 7: `trg_mental_assessment_score_calc`
- **Table:** `mental_answers` → AFTER INSERT
- **Logic:** Recalculates PHQ-9 depression score after each answer. Categorizes: minimal/mild/moderate/moderately_severe/severe. If score ≥20, auto-creates URGENT notification.
- **SQL Features:** SUM aggregate, CASE with multiple thresholds, conditional INSERT, variable declarations

### Trigger 8: `trg_card_batch_deplete_check`
- **Table:** `card_batches` → AFTER UPDATE
- **Logic:** When activated_count reaches total quantity, notifies admin that batch is depleted
- **SQL Features:** Comparison operators, CONCAT, conditional execution

### Trigger 9: `trg_emergency_status_event_log`
- **Table:** `emergency_requests` → AFTER UPDATE
- **Logic:** Every status change creates a timestamped event in emergency_status_events. If status is dispatched/en_route/arrived, also notifies admin.
- **SQL Features:** OLD vs NEW comparison, conditional INSERT, IN operator

### Trigger 10: `trg_admin_interaction_notify`
- **Table:** `admin_interactions` → AFTER INSERT
- **Logic:** Auto-notifies target admin when an interaction is created. Priority varies by type (ESCALATION=URGENT, ALERT=HIGH).
- **SQL Features:** CASE expression, REPLACE function, CONCAT, multiple conditionals

### Trigger 11: `trg_security_critical_alert` 
- **Table:** `security_events` → AFTER INSERT
- **Logic:** HIGH/CRITICAL severity events trigger admin notification. Also detects brute force attacks by counting failed logins per IP in last 10 minutes - if ≥5, auto-creates BRUTE_FORCE security event.
- **SQL Features:** Subquery with COUNT + date arithmetic, DATE_SUB, INTERVAL, self-referencing INSERT

### Trigger 12: `trg_blood_request_donor_toggle`
- **Table:** `blood_requests` → AFTER UPDATE
- **Logic:** On 'completed' status, marks donor unavailable + records donation date. On 'cancelled', restores availability. Creates audit log for donations.
- **SQL Features:** Multiple IF/ELSEIF, CURDATE(), UPDATE + INSERT cascade

### ⭐ Trigger 13: `trg_pregnancy_checkin_risk_detect`
- **Table:** `pregnancy_checkins` → AFTER INSERT
- **Logic:** Parses blood pressure string (e.g., "165/105"), checks for:
  - **Preeclampsia:** BP ≥ 140/90 (HIGH), ≥ 160/110 (CRITICAL)
  - **Gestational Diabetes:** Glucose > 130 (HIGH), > 180 (CRITICAL)  
  - **Abnormal Weight:** > 120kg or < 40kg
  - Auto-creates `high_risk_cases` record + admin notification with full vital details
- **SQL Features:** SUBSTRING_INDEX for string parsing, CAST, JOIN across pregnancies→mothers, variable accumulation, multi-table cascade (3 tables)

### Trigger 14: `trg_product_review_rating_update`
- **Table:** `product_reviews` → AFTER INSERT
- **Logic:** Calculates product average rating, notifies vendor of new review. If rating is 1-star, flags to admin for investigation.
- **SQL Features:** AVG + COUNT aggregates, conditional logic, cross-table lookup

### Trigger 15: `trg_consultation_complete_audit`
- **Table:** `consultations` → AFTER UPDATE
- **Logic:** All status changes are audited. On 'completed': creates a follow-up reminder (14 days out) + patient notification.
- **SQL Features:** DATE_ADD with INTERVAL, triple INSERT cascade, UPPER function

### ⭐ Trigger 16: `trg_child_growth_percentile_alert`
- **Table:** `child_growth_logs` → AFTER INSERT
- **Logic:** Compares with previous growth log to detect:
  - **Failure to Thrive:** Weight dropped from previous measurement
  - **Severely Underweight:** Percentile < 3
  - **Significantly Overweight:** Percentile > 97
  - **Abnormal Head Circumference:** < 30cm or > 52cm
  - Notifies mother + admin for severe cases
- **SQL Features:** Self-JOIN for historical comparison, ORDER BY + LIMIT 1 for latest, multi-condition accumulation, conditional dual notification

### ⭐ Trigger 17: `trg_order_status_payment_sync`
- **Table:** `orders` → AFTER UPDATE
- **Logic:** 
  - **Delivered:** Auto-confirms pending payments + notifies customer with ৳ amount
  - **Cancelled:** Auto-refunds payments + notifies customer + creates audit log
  - **Shipped:** Sends tracking notification
- **SQL Features:** Multiple UPDATE + INSERT cascades, payment status sync, Bangladeshi Taka currency

### ⭐ Trigger 18: `trg_vaccination_schedule_update`
- **Table:** `vaccination_events` → AFTER INSERT
- **Logic:** When a child receives a vaccine:
  1. Auto-marks matching schedule as 'completed'
  2. Finds next pending vaccine
  3. Notifies mother with vaccine details + reaction info
  4. Creates a reminder 3 days before next vaccine
- **SQL Features:** UPDATE + SELECT + INSERT cascade, DATE_SUB, ORDER BY for next-pending, CASE expressions

### ⭐ Trigger 19: `trg_product_stock_low_alert`
- **Table:** `products` → AFTER UPDATE
- **Logic:**
  - **Stock = 0:** Notifies vendor (URGENT) + admin notification for restocking
  - **Stock < 10 (first time):** Low stock warning to vendor
- **SQL Features:** Two-threshold detection, OLD vs NEW comparison, dual notification system

### ⭐ Trigger 20: `trg_emergency_request_audit`
- **Table:** `emergency_requests` → AFTER INSERT
- **Logic:** Complete emergency handling:
  1. Creates initial status event
  2. Sends URGENT admin notification with GPS coordinates
  3. Creates audit log for the request
  4. Sends confirmation notification to patient
- **SQL Features:** User lookup via subquery, 4-table cascade INSERT, GPS coordinate handling

---

## How to Demo for Judge Panel

### Show All Triggers
```sql
SHOW TRIGGERS;
```

### Show Specific Trigger Code
```sql
SHOW CREATE TRIGGER trg_pregnancy_checkin_risk_detect;
SHOW CREATE TRIGGER trg_child_growth_percentile_alert;
SHOW CREATE TRIGGER trg_order_status_payment_sync;
```

### Live Demo - Doctor Review Rating
```sql
-- Before: Check doctor rating
SELECT full_name, rating FROM doctors WHERE id='167bb282-25af-49e3-9b1e-bd54a8316532';

-- Insert a review (trigger fires automatically)
INSERT INTO doctor_reviews (id, doctor_id, user_id, rating, review_text) 
VALUES (UUID(), '167bb282-25af-49e3-9b1e-bd54a8316532', '6abf7e97-9653-4905-ab9b-bee5692676f5', 5, 'Excellent!');

-- After: Rating automatically recalculated!
SELECT full_name, rating FROM doctors WHERE id='167bb282-25af-49e3-9b1e-bd54a8316532';
```

### Live Demo - Pregnancy Risk Detection (MINDBLOWING)
```sql
-- Insert a check-in with dangerous vitals
SET @preg_id = (SELECT id FROM pregnancies LIMIT 1);
INSERT INTO pregnancy_checkins (id, pregnancy_id, weight_kg, blood_pressure, glucose_level, checkin_date)
VALUES (UUID(), @preg_id, 85, '170/110', 200, CURDATE());

-- The trigger automatically:
-- 1. Detected CRITICAL preeclampsia risk (BP > 160/110)
-- 2. Detected gestational diabetes risk (glucose > 180)
-- 3. Created a high_risk_cases record
-- 4. Sent URGENT admin notification

SELECT * FROM high_risk_cases ORDER BY flagged_at DESC LIMIT 1;
SELECT title, priority FROM admin_notifications ORDER BY created_at DESC LIMIT 1;
```

### Show Trigger Count
```sql
SELECT COUNT(*) AS total_triggers 
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'neonest';
-- Result: 20
```

---

## File Location
**Trigger SQL File:** `backend/triggers.sql` (1247 lines)
