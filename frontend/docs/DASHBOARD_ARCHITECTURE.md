# Dashboard Architecture

## Overview
Nurture Glow implements a privacy-first, role-based dashboard system where each stakeholder has access to only the data and features necessary for their role. The Mother owns all her data, and every other role operates with least-privilege access.

## Directory Structure

```
Nurture-Glow/
├── pages/
│   ├── Dashboard.tsx              # Mother Dashboard (Main User)
│   └── dashboards/
│       ├── DoctorDashboard.tsx    # Tele-Gynecologist Dashboard
│       ├── MedicalAdminDashboard.tsx  # Clinical Admin Dashboard
│       ├── OpsAdminDashboard.tsx  # Operations Admin Dashboard
│       └── SystemAdminDashboard.tsx   # System Admin Dashboard
│
├── components/
│   └── dashboards/
│       ├── doctor/
│       │   ├── ConsultationList.tsx     # Pending/active consultations
│       │   ├── PatientQueue.tsx         # Patient appointment queue
│       │   ├── ScheduleManager.tsx      # Doctor availability settings
│       │   ├── EarningsOverview.tsx     # Consultation earnings
│       │   └── PrescriptionWriter.tsx   # Prescription creation tool
│       │
│       ├── medical-admin/
│       │   ├── DoctorVerification.tsx   # Verify BMDC numbers
│       │   ├── HighRiskCases.tsx        # Flag high-risk pregnancies
│       │   ├── QualityMetrics.tsx       # Consultation quality review
│       │   └── EmergencyAlerts.tsx      # Emergency case notifications
│       │
│       ├── ops-admin/
│       │   ├── CardManagement.tsx       # Card inventory & activation
│       │   ├── HospitalManagement.tsx   # Hospital onboarding
│       │   ├── CSRPrograms.tsx          # CSR sponsor management
│       │   └── ServiceAnalytics.tsx     # Non-clinical usage stats
│       │
│       └── system-admin/
│           ├── UserRoleManager.tsx      # Role & permission management
│           ├── AuditLogs.tsx            # System-wide audit trails
│           ├── SystemHealth.tsx         # Server & API monitoring
│           └── SecurityMonitor.tsx      # Security alerts & logs
│
├── services/
│   └── dashboardService.ts        # API calls for all dashboards
│
├── types/
│   └── dashboard.ts               # TypeScript types for dashboards
│
└── docs/
    ├── DASHBOARD_ARCHITECTURE.md  # This file
    └── ROLE_PERMISSIONS.md        # Detailed permission matrix
```

## Role-Based Access Control

### 1. Mother Dashboard (Already Implemented)
**File**: `pages/Dashboard.tsx`

**Features**:
- Pregnancy tracking
- Medical report upload
- Donor and CSR support access
- Consent and access control
- Emergency contact setup

**Data Access**: Full access to own data

---

### 2. Doctor Dashboard
**File**: `pages/dashboards/DoctorDashboard.tsx`

**Permission Level**: Permission-based, time-bound access

**Can Access**:
- Mother's age and gestational week
- Pregnancy-related medical history (with consent)
- Uploaded reports (with consent)
- Own consultation notes only

**Cannot Access**:
- Payment/financial data
- Insurance pricing
- Other doctors' data
- Admin dashboards

**Components**:
- `ConsultationList`: View pending and completed consultations
- `PatientQueue`: Today's appointments
- `ScheduleManager`: Set availability and working hours
- `EarningsOverview`: Consultation-based earnings
- `PrescriptionWriter`: Create and send prescriptions

**API Endpoints**:
```
GET  /api/doctor/consultations
GET  /api/doctor/patients/:id
POST /api/doctor/prescriptions
GET  /api/doctor/schedule
PUT  /api/doctor/schedule
GET  /api/doctor/earnings
```

---

### 3. Medical Admin Dashboard
**File**: `pages/dashboards/MedicalAdminDashboard.tsx`

**Purpose**: Clinical quality, safety, and ethical compliance

**Can Access**:
- Anonymized doctor activity
- Emergency case summaries
- High-risk pregnancy indicators
- System-wide medical alerts
- Medical-only audit logs

**Cannot Access**:
- Full financial data
- Corporate contracts
- Non-medical admin tools

**Components**:
- `DoctorVerification`: Approve BMDC numbers and specializations
- `HighRiskCases`: Flag and monitor high-risk pregnancies
- `QualityMetrics`: Review consultation quality
- `EmergencyAlerts`: Handle emergency escalations

**API Endpoints**:
```
GET  /api/medical-admin/doctors/pending
POST /api/medical-admin/doctors/:id/verify
GET  /api/medical-admin/high-risk-cases
GET  /api/medical-admin/quality-metrics
GET  /api/medical-admin/emergency-alerts
```

---

### 4. Operations Admin Dashboard
**File**: `pages/dashboards/OpsAdminDashboard.tsx`

**Purpose**: Manage daily operations, CSR programs, hospitals, and cards

**Can Access**:
- Mother account status (active/inactive)
- Service usage counts (not content)
- Hospital-wise aggregated data
- Card distribution logs

**Cannot Access**:
- Medical notes
- Prescriptions
- Mental health or sensitive clinical data

**Components**:
- `CardManagement`: Inventory, activation, distribution
- `HospitalManagement`: Onboard and manage hospitals
- `CSRPrograms`: Sponsor and donor program management
- `ServiceAnalytics`: Non-clinical usage statistics

**API Endpoints**:
```
GET  /api/ops-admin/cards
POST /api/ops-admin/cards/activate
GET  /api/ops-admin/hospitals
POST /api/ops-admin/hospitals
GET  /api/ops-admin/csr-programs
GET  /api/ops-admin/analytics
```

---

### 5. System Admin Dashboard
**File**: `pages/dashboards/SystemAdminDashboard.tsx`

**Purpose**: System integrity, security, and uptime

**Can Access**:
- System and security logs
- Anonymized user identifiers
- Error and performance reports
- User role and permission management

**Cannot Access** (by default):
- Medical records
- Consultation videos
- Private messages

**Components**:
- `UserRoleManager`: Assign and manage roles
- `AuditLogs`: Full system audit trails
- `SystemHealth`: Server and API monitoring
- `SecurityMonitor`: Security alerts and threats

**API Endpoints**:
```
GET  /api/system-admin/users
PUT  /api/system-admin/users/:id/role
GET  /api/system-admin/audit-logs
GET  /api/system-admin/system-health
GET  /api/system-admin/security-alerts
```

---

## Security Principles

### 1. Least Privilege Access
Every role can access only what they need for their specific function.

### 2. Audit Trail
Every data access is logged:
- Who accessed
- What was accessed
- When it was accessed
- Why it was accessed (context)

### 3. Consent Management
Mother can:
- Grant or revoke doctor access
- Hide sensitive reports
- Control family member visibility
- Review emergency access logs

### 4. Emergency Override
In life-threatening situations:
- Temporary access granted to emergency doctor
- Strictly logged and timestamped
- Reviewed later by Medical Admin
- Mother notified after incident

### 5. Data Separation
- Medical data isolated from operational data
- Financial data never visible to medical roles
- Clinical data never visible to operational roles

---

## Routing Strategy

### Role-Based Route Protection

```typescript
// App.tsx
const roleBasedRoutes = {
  mother: '/dashboard',
  doctor: '/dashboards/doctor',
  medical_admin: '/dashboards/medical-admin',
  ops_admin: '/dashboards/ops-admin',
  system_admin: '/dashboards/system-admin'
};

// Middleware checks user role and redirects appropriately
```

### Protected Route Component
```typescript
<ProtectedRoute 
  allowedRoles={['doctor']} 
  component={DoctorDashboard} 
/>
```

---

## Scalability Considerations

### 1. Modular Components
Each dashboard component is self-contained and reusable.

### 2. Shared Design System
Common UI elements (cards, tables, charts) are shared across dashboards.

### 3. API Abstraction
All API calls go through `dashboardService.ts` for easy maintenance.

### 4. Type Safety
Full TypeScript typing ensures data consistency across roles.

### 5. Feature Flags
New features can be rolled out to specific roles without affecting others.

---

## Next Steps

1. ✅ Create directory structure
2. ⏳ Define TypeScript types (`types/dashboard.ts`)
3. ⏳ Build dashboard service layer (`services/dashboardService.ts`)
4. ⏳ Implement Doctor Dashboard
5. ⏳ Implement Medical Admin Dashboard
6. ⏳ Implement Ops Admin Dashboard
7. ⏳ Implement System Admin Dashboard
8. ⏳ Add role-based routing
9. ⏳ Write backend API endpoints
10. ⏳ Add comprehensive tests

---

## Related Documentation

- [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md) - Detailed permission matrix
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints reference
- [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md) - Security best practices
