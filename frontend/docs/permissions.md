# Nurture Glow 2.0 Permissions Matrix

## Role Hierarchy & Access Rules

| Resource | MOTHER | DOCTOR | HOSPITAL | VENDOR | NGO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Personal Profile** | Full | Read-Only* | Read-Only* | None | Read-Only* |
| **Pregnancy Logs** | Full | Full* | Read-Only* | None | None |
| **Vitals (PHI)** | Full | Full* | Read-Only* | None | None |
| **Slots Management** | None | Full | None | None | None |
| **Products** | Read | None | None | Full | None |
| **Ambulances** | Read | None | Full | None | None |
| **Referrals** | Read | Read | None | None | Full |

### Notes on PHI Access (*)
1. **Clinical Access**: Doctors and NGOs gain access ONLY if an active consultation exists or a `DataAccessGrant` has been explicitly signed by the mother via the mobile app.
2. **Hospital Scope**: Hospital users can only see emergency requests assigned to their facility. Cross-site tracking is locked.
3. **Audit Enforcement**: Every PHI read event is recorded in `audit_logs` with the specific `actor_user_id`.
