# 🏥 ShasthoSheba (স্বাস্থ্যসেবা) – Digital Healthcare Platform
## Master Architecture, Production Data & Security Implementation Guide

---

## 1. Executive Summary

**ShasthoSheba** is a production-oriented Digital Healthcare Management Platform built specifically for Bangladesh's clinical ecosystem. It addresses the critical challenges of long waiting lines, double-booking errors, paper prescription loss, and patient record tracking by connecting patients with certified medical specialists in a secure, role-isolated digital environment.

All records in this platform are **100% dynamic and live**, running directly on a cloud **MongoDB Atlas** cluster. In strict adherence to our **No-Fake-Data Policy**, all statistics, doctor listings, appointment serials, schedules, and clinical prescriptions are queried from and written to actual database collections with zero hardcoded simulation.

---

## 2. Technology Stack Architecture

- **Web Framework:** Next.js 16 (App Router with Webpack production engine)
- **Programming Language:** TypeScript 5 (Strict mode)
- **Database:** MongoDB Atlas (Replica Set Cluster)
- **Data Access & ORM:** Prisma 6 Client
- **Authentication & Security:** JWT (JSON Web Tokens) with Bcrypt.js password hashing and server-side session account-status verification
- **Styling:** Tailwind CSS v4
- **Animation System:** Framer Motion (Modal scaling, card transitions, responsive drawer animations)
- **Icons:** Lucide React

---

## 3. Strict No-Fake-Data & Doctor Profile Policy

1. **Database-Driven Reality:**
   - Every metric on the Admin, Doctor, and Patient dashboards is aggregated directly from MongoDB.
   - All appointment counts, patient lists, and prescription records are fetched from live queries.
   - When no records exist for a filter or query, realistic empty states (e.g. *"No appointments found in this category"*) are displayed rather than fake mock records.

2. **The Initial Five Doctor Profiles:**
   To adhere to professional medical standards, genuine doctor identities are never fabricated. For initial deployment and testing, five distinct profiles have been created across the five required medical departments:
   - **Cardiology:** `[DEMO] Dr. Rafiq Ahmed` (`doctor.cardio@shasthosheba.com`)
   - **Neurology:** `[DEMO] Dr. Tariq Hasan` (`doctor.neuro@shasthosheba.com`)
   - **Gynecology & Obstetrics:** `[DEMO] Dr. Nusrat Jahan` (`doctor.gynae@shasthosheba.com`)
   - **Orthopedics:** `[DEMO] Dr. Kazi Huda` (`doctor.ortho@shasthosheba.com`)
   - **Pediatrics:** `[DEMO] Dr. Shamsun Nahar` (`doctor.pedia@shasthosheba.com`)

   *Notice:* These development profiles are explicitly flagged with `isDemo: true`, `verificationStatus: "DEMO"`, and fictional BMDC demo numbers (`DEMO-BMDC-100x`). They are never misrepresented as genuine practitioners. When real certified doctors are onboarded by the hospital administrator, their genuine BMDC registration information is reviewed and verified.

---

## 4. User Roles & Security Boundaries

### 👤 PATIENT
- Public registration permitted via `/register` (with age, gender, blood group, address).
- Browse and filter verified doctors by department and BMDC number.
- View real-time chamber opening hours, visit fees, and slot duration.
- Select future dates and pick available slots (atomic protection prevents double-booking).
- Receive dynamically generated appointment serial numbers.
- View appointment status (`WAITING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
- Cancel pending appointments (only permitted when status is `WAITING`).
- View and print digital prescriptions in official BMDC prescription format.

### 🩺 DOCTOR
- **Strict Data Isolation:** Doctor A can only view their own assigned patients, appointments, and prescriptions.
- View consultation queue with serial numbers, symptoms, and patient vitals.
- Confirm patient visits.
- **Schedule & Leave Management:** Declare leave dates (which dynamically blocks patient bookings on those dates).
- **Clinical Prescription Writer:** Issue digital prescriptions (Diagnosis, structured medicines `1+0+1`, dietary advice, follow-up dates).
- Completing a prescription automatically updates the appointment to `COMPLETED`.

### 👑 ADMIN
- Comprehensive administrative dashboard with live MongoDB counters.
- **Doctor Onboarding:** Register new specialists with BMDC registration, chamber details, and schedule.
- **Credential Verification:** Review, approve, reject, suspend, or reactivate doctor profiles.
- **Audit Logs:** Complete database-backed audit trail logging every sensitive event (e.g., `CREATE_DOCTOR`, `DOCTOR_APPROVE`, `APPOINTMENT_STATUS_CONFIRMED`, `ISSUE_PRESCRIPTION`).
- System-wide appointment supervision without violating clinical privacy boundaries.

---

## 5. MongoDB Data Models & Relational Architecture

- **`User`:** Master authentication record storing `name`, `email`, `password` (bcrypt hashed), `phone`, `role` (`PATIENT`, `DOCTOR`, `ADMIN`), and `accountStatus` (`ACTIVE`, `SUSPENDED`, `PENDING`).
- **`Doctor`:** Linked to `User` via `userId`. Holds `title`, `specialization`, `qualification`, `bmdcNumber`, `isDemo`, `verificationStatus`, `accountStatus`, `fee`, `chamberName`, `chamberAddress`, `availableDays`, `startTime`, `endTime`, `appointmentDuration`, `maxDailyPatients`.
- **`DoctorLeave`:** Stores unavailable dates per doctor (`doctorId`, `date`, `reason`) with a compound unique index `@@unique([doctorId, date])`.
- **`Patient`:** Linked to `User` via `userId`. Holds `age`, `gender`, `address`, `bloodGroup`.
- **`Appointment`:** Relates `Patient` and `Doctor`. Stores `date`, `timeSlot`, `serialNo`, `status`, `symptoms`, `notes`. Protected by atomic unique compound constraint `@@unique([doctorId, date, timeSlot])`.
- **`Prescription`:** Relates `Appointment` and `Doctor` directly via `doctorId`. Stores `diagnosis`, `medicines`, `advice`, `nextVisit`.
- **`Notification`:** In-app real-time database notification records for patients and physicians.
- **`AuditLog`:** System accountability ledger capturing `actorId`, `actorRole`, `action`, `targetType`, `targetId`, and `details`.

---

## 6. End-to-End Workflow (A to Z)

```
[ Patient Signs Up ] ──► [ Browses Specialists ] ──► [ Chooses Date & Slot ] ──► [ Dynamic Serial Stored in MongoDB ]
                                                                                               │
                                                                                               ▼
[ Patient Prints Rx ] ◄── [ Doctor Issues Rx ] ◄── [ Doctor Confirms Patient ] ◄── [ Doctor Queue Updates ]
```

1. **Authentication:** Patient signs up at `/register` or logs in at `/login`. Admin or verified doctors log in with their respective credentials. The server verifies that `accountStatus === 'ACTIVE'`.
2. **Booking:** Patient selects a doctor, an available chamber date, and an open slot. The backend verifies:
   - Date is today or in the future.
   - Doctor is active and verified.
   - Doctor is not on leave on that date.
   - The date falls on the doctor's weekly available chamber days.
   - Maximum daily patient quota has not been exceeded.
   - Slot has not already been booked by another patient.
3. **Serial Generation:** Dynamic serial number (`#1`, `#2`, ...) is atomically calculated and assigned.
4. **Physician Review:** Doctor opens `/dashboard/doctor`, reviews patient symptoms, confirms the appointment, conducts the consultation, and submits the digital prescription.
5. **Prescription Archival & Print:** Patient accesses `/dashboard/patient/appointments`, views the official Rx, and can print or save as PDF.

---

## 7. Development Login Credentials (Pre-Seeded)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin@shasthosheba.com` | `admin123` | Hospital Medical Director Console |
| **🩺 DOCTOR (Cardiology)** | `doctor.cardio@shasthosheba.com` | `doctor123` | `[DEMO] Dr. Rafiq Ahmed` |
| **🩺 DOCTOR (Neurology)** | `doctor.neuro@shasthosheba.com` | `doctor123` | `[DEMO] Dr. Tariq Hasan` |
| **🩺 DOCTOR (Gynecology)** | `doctor.gynae@shasthosheba.com` | `doctor123` | `[DEMO] Dr. Nusrat Jahan` |
| **🩺 DOCTOR (Orthopedics)**| `doctor.ortho@shasthosheba.com` | `doctor123` | `[DEMO] Dr. Kazi Huda` |
| **🩺 DOCTOR (Pediatrics)** | `doctor.pedia@shasthosheba.com` | `doctor123` | `[DEMO] Dr. Shamsun Nahar` |
| **👤 PATIENT 1** | `patient@shasthosheba.com` | `patient123` | Tanvir Hasan (Dhanmondi, Dhaka) |
| **👤 PATIENT 2** | `patient2@shasthosheba.com` | `patient123` | Sadia Rahman (Uttara, Dhaka) |

*Convenience:* On the `/login` page, 1-click test badges are available to instantly populate any of these test credentials.

---

## 8. Local Setup & Execution Guide

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Push Database Schema to MongoDB
```bash
npx prisma db push
```

### Step 3: Seed Clean Realistic Database Data
```bash
npm run seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Run Production Build
```bash
npm run build
npm start
```

### Step 6: Run Comprehensive End-to-End Verification Test
```bash
npx tsx scratch/test-e2e.ts
```
*(Executes 11 automated security, isolation, atomic booking, and leave verification tests).*
