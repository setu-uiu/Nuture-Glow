# Role Permissions Matrix

## Overview
This document defines the exact permissions for each role in the Nurture Glow platform. Every data access is governed by these rules.

---

## Permission Levels

| Level | Description |
|-------|-------------|
| **NONE** | No access whatsoever |
| **READ** | View-only access |
| **WRITE** | Create and update |
| **DELETE** | Remove data |
| **GRANT** | Can grant access to others |
| **AUDIT** | Can view access logs |

---

## Data Access Matrix

### Mother's Personal Data

| Data Type | Mother | Doctor | Medical Admin | Ops Admin | System Admin |
|-----------|--------|--------|---------------|-----------|--------------|
| Full Name | FULL | READ (with consent) | NONE | READ (status only) | READ (anonymized) |
| Age | FULL | READ | NONE | NONE | NONE |
| Contact Info | FULL | READ (with consent) | NONE | READ (for support) | NONE |
| Address | FULL | NONE | NONE | READ (for delivery) | NONE |
| Emergency Contacts | FULL | READ (emergency only) | READ (emergency) | NONE | NONE |

### Medical Data

| Data Type | Mother | Doctor | Medical Admin | Ops Admin | System Admin |
|-----------|--------|--------|---------------|-----------|--------------|
| Pregnancy Week | FULL | READ (with consent) | READ (anonymized) | NONE | NONE |
| Medical History | FULL | READ (consent + time-bound) | READ (anonymized) | NONE | NONE |
| Uploaded Reports | FULL | READ (with consent) | NONE | NONE | NONE |
| Prescriptions | FULL | WRITE (own only) | AUDIT | NONE | NONE |
| Consultation Notes | READ | WRITE (own only) | AUDIT | NONE | NONE |
| Vital Signs | FULL | READ (with consent) | READ (anonymized) | NONE | NONE |
| Mental Health Data | FULL | READ (with consent) | READ (high-risk only) | NONE | NONE |

### Financial Data

| Data Type | Mother | Doctor | Medical Admin | Ops Admin | System Admin |
|-----------|--------|--------|---------------|-----------|--------------|
| Payment History | FULL | NONE | NONE | READ (aggregated) | NONE |
| Insurance Details | FULL | NONE | NONE | READ (for claims) | NONE |
| Doctor Earnings | NONE | READ (own only) | NONE | READ (aggregated) | NONE |
| Subscription Status | FULL | NONE | NONE | READ | READ (system level) |
| CSR Sponsorship | FULL | NONE | NONE | FULL | NONE |

### Operational Data

| Data Type | Mother | Doctor | Medical Admin | Ops Admin | System Admin |
|-----------|--------|--------|---------------|-----------|--------------|
| Card Status | FULL | NONE | NONE | FULL | READ |
| Hospital Network | READ | READ | READ | FULL | READ |
| Service Usage | FULL | READ (own patients) | READ (quality) | READ (analytics) | READ (system) |
| Appointment Logs | FULL | READ (own only) | AUDIT | READ (aggregated) | READ (system) |

### System Data

| Data Type | Mother | Doctor | Medical Admin | Ops Admin | System Admin |
|-----------|--------|--------|---------------|-----------|--------------|
| User Roles | NONE | NONE | NONE | NONE | FULL |
| Audit Logs | READ (own only) | NONE | READ (medical) | READ (operational) | FULL |
| System Health | NONE | NONE | NONE | NONE | FULL |
| Security Alerts | NONE | NONE | NONE | NONE | FULL |
| API Keys | NONE | NONE | NONE | NONE | FULL |

---

## Feature Permissions

### Mother Features

| Feature | Allowed Actions |
|---------|----------------|
| Profile Management | View, Update, Delete Own Data |
| Pregnancy Tracking | View, Add, Update Own Records |
| Appointments | Book, Cancel, Reschedule |
| Medical Reports | Upload, View, Hide, Share (with consent) |
| Prescriptions | View Own Prescriptions |
| Access Control | Grant/Revoke Doctor Access, Set Visibility |
| Emergency Override Review | View Emergency Access Logs |
| Donor/CSR Access | Request, Accept, Reject |

### Doctor Features

| Feature | Allowed Actions | Restrictions |
|---------|----------------|--------------|
| Patient List | View (consent-based) | Only assigned patients |
| Medical History | Read (with consent) | Time-bound access |
| Consultation | Create, Update Own Notes | Cannot see other doctors' notes |
| Prescriptions | Create, Send | For own patients only |
| Schedule Management | View, Update Own Schedule | - |
| Earnings Dashboard | View Own Earnings | Cannot see other doctors' earnings |
| Video Consultation | Initiate, Join | Time-limited session |

### Medical Admin Features

| Feature | Allowed Actions | Restrictions |
|---------|----------------|--------------|
| Doctor Verification | Approve, Reject, Revoke | BMDC verification required |
| High-Risk Cases | Flag, Monitor, Escalate | Anonymized patient data |
| Quality Review | Audit Consultations | Cannot modify prescriptions |
| Emergency Escalation | Grant Emergency Access | Fully logged and reviewed |
| Medical Alerts | Create, Send | Medical context only |
| Medical Audit Logs | View, Export | Medical data only |

### Operations Admin Features

| Feature | Allowed Actions | Restrictions |
|---------|----------------|--------------|
| Card Management | Create, Activate, Deactivate | No medical data access |
| Hospital Onboarding | Add, Update, Remove | Cannot access medical records |
| CSR Program Management | Create, Update, Monitor | Aggregated data only |
| Service Analytics | View, Export | Non-clinical metrics only |
| Mother Account Status | View, Update (status) | Cannot access medical content |
| Support Dashboard | View Tickets | Non-medical queries |

### System Admin Features

| Feature | Allowed Actions | Restrictions |
|---------|----------------|--------------|
| User Role Management | Assign, Update, Revoke Roles | Cannot access medical records by default |
| Audit Log Management | View, Export All Logs | Anonymized identifiers |
| System Monitoring | View Health, Performance | System-level only |
| Security Management | View Alerts, Manage Keys | No access to encrypted medical data |
| Backup & Recovery | Create, Restore Backups | Encrypted data remains encrypted |

---

## Consent-Based Access

### Doctor Access to Mother's Data

**Default**: No Access

**With Mother's Consent**:
- ✅ View age and gestational week
- ✅ View pregnancy-related medical history
- ✅ View uploaded reports (if shared)
- ✅ View previous consultation notes (own sessions only)

**Time-Bound Access**:
- Access granted for consultation duration + 7 days
- Mother can revoke at any time
- Auto-expires after consultation period

**Example Flow**:
```
1. Mother books appointment with Doctor A
2. System prompts: "Allow Doctor A to access your medical history?"
3. Mother approves → Doctor A gains READ access
4. Consultation happens
5. After 7 days, access auto-expires
6. Mother can revoke earlier if needed
```

---

## Emergency Override Protocol

### Trigger Conditions
- Life-threatening situation reported
- Emergency contact activated
- High-risk pregnancy alert triggered

### Emergency Access Rules

**Who Can Activate**:
- Medical Admin
- Emergency doctor on duty
- Mother (via panic button)

**What Emergency Doctor Gets**:
- ✅ Full medical history (READ)
- ✅ Current medications
- ✅ Allergies and risk factors
- ✅ Emergency contacts
- ❌ Financial data
- ❌ Non-medical personal data

**Duration**: Limited to emergency duration (max 24 hours)

**Audit Trail**:
```json
{
  "event": "emergency_override",
  "activated_by": "medical_admin_id",
  "doctor_id": "emergency_doctor_id",
  "mother_id": "mother_id",
  "reason": "Severe bleeding reported",
  "timestamp": "2026-01-20T02:30:00Z",
  "duration": "24h",
  "data_accessed": ["medical_history", "medications", "allergies"],
  "reviewed_by": "medical_admin_id",
  "mother_notified": true
}
```

**Post-Emergency Review**:
- Medical Admin reviews all access
- Mother receives notification
- Access log made available to Mother
- Incident report generated

---

## Access Denial Rules

### Automatic Denial Triggers

1. **No Active Consent**: Doctor tries to access patient without approval
2. **Expired Session**: Time-bound access has expired
3. **Revoked Access**: Mother has explicitly revoked permission
4. **Role Mismatch**: User tries to access data outside role permissions
5. **Suspicious Activity**: Multiple failed access attempts

### Audit Log Entry on Denial
```json
{
  "event": "access_denied",
  "user_id": "doctor_123",
  "attempted_resource": "mother_456_medical_history",
  "reason": "no_active_consent",
  "timestamp": "2026-01-20T03:00:00Z",
  "ip_address": "192.168.1.100"
}
```

---

## Mother's Control Panel

### Access Management Dashboard

**Mother Can**:
1. View all active access grants
2. See who accessed what and when
3. Revoke any active access immediately
4. Set default privacy levels
5. Hide specific reports from all doctors
6. Review emergency access logs
7. Set family member visibility rules

**Example Access Control UI**:
```
┌─────────────────────────────────────────┐
│ Your Data Access Control                │
├─────────────────────────────────────────┤
│ Active Permissions:                     │
│                                          │
│ ✅ Dr. Ahmed Khan                       │
│    Access: Medical History              │
│    Expires: Jan 27, 2026                │
│    [Revoke] [Extend]                    │
│                                          │
│ ✅ Dr. Sarah Begum                      │
│    Access: Ultrasound Reports           │
│    Expires: Jan 25, 2026                │
│    [Revoke] [Extend]                    │
├─────────────────────────────────────────┤
│ Hidden Reports:                         │
│ • Mental Health Assessment (Private)    │
│ • Family Medical History (Hidden)       │
└─────────────────────────────────────────┘
```

---

## Audit Trail Standards

### What Gets Logged

Every data access logs:
- **User ID**: Who accessed
- **Resource**: What was accessed
- **Action**: READ, WRITE, DELETE
- **Timestamp**: When it happened
- **IP Address**: From where
- **Session ID**: Context
- **Consent Status**: Was consent active?
- **Result**: Success or Denied

### Retention Policy
- Medical audit logs: 7 years
- Operational logs: 3 years
- System logs: 1 year
- Emergency logs: Permanent

---

## Compliance Notes

### GDPR Compliance
- Mother can request full data export
- Mother can request data deletion (with exceptions for medical records)
- All third-party access requires explicit consent

### Medical Ethics Compliance
- Doctor-patient confidentiality maintained
- Medical data separated from operational data
- Emergency access strictly logged and reviewed

### Security Standards
- All medical data encrypted at rest and in transit
- Role-based access control enforced at API level
- Multi-factor authentication required for admin roles
- Regular security audits conducted

---

## Summary Table

| Role | Primary Access | Cannot Access | Special Rules |
|------|----------------|---------------|---------------|
| **Mother** | Own data (full) | Other mothers' data | Can grant/revoke access |
| **Doctor** | Assigned patients (consent) | Financial, other doctors' data | Time-bound access |
| **Medical Admin** | Anonymized medical data | Full financials, personal identifiers | Emergency override authority |
| **Ops Admin** | Operational data, aggregated stats | Medical records, prescriptions | Process management only |
| **System Admin** | System logs, user roles | Medical records by default | Maintains platform security |

---

**Last Updated**: January 20, 2026  
**Version**: 1.0  
**Status**: Active
