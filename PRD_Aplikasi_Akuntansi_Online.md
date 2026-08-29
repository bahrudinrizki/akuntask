# Product Requirements Document (PRD)
## Aplikasi Akuntansi & Manajemen Bisnis Online
### Versi: 1.0 | Tanggal: 29 Agustus 2026

---

## 1. Executive Summary

### 1.1 Latar Belakang
Berdasarkan analisis kompetitor (Accurate Online), terdapat peluang besar dalam pasar aplikasi akuntansi cloud-based di Indonesia. Kebutuhan UMKM dan perusahaan menengah akan solusi pembukuan yang terintegrasi, real-time, dan mudah digunakan semakin meningkat. Dokumen ini merinci spesifikasi produk untuk platform akuntansi online yang komprehensif.

### 1.2 Tujuan Produk
Membangun platform Software as a Service (SaaS) akuntansi dan manajemen bisnis yang:
- Menyederhanakan pembukuan untuk UMKM hingga perusahaan menengah
- Menyediakan laporan keuangan real-time (200+ jenis laporan)
- Mengintegrasikan modul penjualan, pembelian, inventory, dan keuangan dalam satu sistem
- Mendukung multi-cabang dan multi-user dengan kontrol akses berbasis peran
- Menyediakan asisten AI untuk analisis performa keuangan bisnis

### 1.3 Ruang Lingkup
Produk mencakup modul-modul utama: Akuntansi, Penjualan, Pembelian, Inventory/Gudang, POS (Point of Sale), Laporan & Analitik, serta AI Assistant.

---

## 2. Product Vision & Goals

### 2.1 Vision Statement
> *"Menjadi platform akuntansi cloud-based terdepan di Indonesia yang membuat manajemen keuangan bisnis menjadi sederhana, cerdas, dan terintegrasi penuh — untuk segala jenis bisnis, dari UMKM hingga enterprise."*

### 2.2 Strategic Goals
| No | Goal | KPI Target |
|----|------|------------|
| 1 | Mencapai 10,000 pengguna aktif bulanan (MAU) dalam 12 bulan | MAU ≥ 10,000 |
| 2 | Mencapai NPS (Net Promoter Score) ≥ 50 | NPS ≥ 50 |
| 3 | Waktu pembuatan laporan laba rugi < 5 detik | Response Time < 5s |
| 4 | Uptime sistem ≥ 99.9% | Uptime ≥ 99.9% |
| 5 | Tingkat retensi pengguna bulanan ≥ 85% | Retention ≥ 85% |

---

## 3. Target Market & User Personas

### 3.1 Target Market Segmentation

| Segmen | Karakteristik | Kebutuhan Utama |
|--------|--------------|-----------------|
| **UMKM** | 1-10 karyawan, omset < 5M/tahun | Pembukuan sederhana, invoice, stok dasar |
| **Bisnis Menengah** | 11-50 karyawan, multi-cabang | Laporan lengkap, multi-gudang, integrasi POS |
| **Enterprise** | >50 karyawan, kompleks | API, kustomisasi, audit trail, compliance |

### 3.2 User Personas

#### Persona 1: "Budi — Pemilik UMKM F&B"
- **Usia:** 32 tahun
- **Peran:** Owner & Operator
- **Pain Point:** Sulit melacak arus kas harian, sering lupa mencatat transaksi
- **Goals:** Lihat laba rugi real-time tanpa harus paham akuntansi
- **Tech Savviness:** Medium (terbiasa aplikasi mobile)

#### Persona 2: "Sari — Finance Manager PT Daimatu"
- **Usia:** 38 tahun
- **Peran:** Head of Accounting
- **Pain Point:** Butuh waktu lama untuk menyusun laporan keuangan bulanan
- **Goals:** Generate laporan neraca & arus kas secara instan, multi-cabang
- **Tech Savviness:** High (terbiasa ERP & software akuntansi)

#### Persona 3: "Andi — Staff Gudang"
- **Usia:** 27 tahun
- **Peran:** Warehouse Staff
- **Pain Point:** Stok sering tidak sesuai fisik vs sistem
- **Goals:** Stok opname mudah, notifikasi stok minimum
- **Tech Savviness:** Low-Medium (butuh UI yang sangat intuitif)

---

## 4. Functional Requirements

### 4.1 Modul Akuntansi (Core Accounting)

#### 4.1.1 Jurnal Umum (General Journal)
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| ACC-001 | Input jurnal manual dengan debit/kredit | Must Have | Input minimal 2 baris (D/K), balance check otomatis |
| ACC-002 | Template jurnal berulang (recurring) | Must Have | Bisa set frekuensi harian/mingguan/bulanan/tahunan |
| ACC-003 | Import jurnal dari Excel/CSV | Should Have | Validasi format otomatis, error report |
| ACC-004 | Auto-reverse jurnal penyesuaian | Should Have | Jurnal adjustment otomatis dibalik periode berikutnya |

#### 4.1.2 Buku Besar (General Ledger)
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| ACC-005 | Daftar akun (Chart of Accounts) multi-level | Must Have | Minimal 3 level (Header, Sub-header, Detail) |
| ACC-006 | Buku besar per akun dengan filter periode | Must Have | Filter: hari, minggu, bulan, kuartal, tahun, custom range |
| ACC-007 | Saldo awal & saldo akhir per akun | Must Have | Auto-calculate opening & closing balance |
| ACC-008 | Jurnal penutup (closing entries) otomatis | Must Have | Generate jurnal penutup periode akuntansi |

#### 4.1.3 Akun Perkiraan (Chart of Accounts)
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| ACC-009 | COA default berbasis PSAK | Must Have | Template COA sesuai standar akuntansi Indonesia |
| ACC-010 | Kustomisasi COA (tambah/edit/hapus) | Must Have | Drag-drop untuk reorder, validasi kode unik |
| ACC-011 | Mapping COA untuk laporan pajak | Must Have | Mapping otomatis ke format SPT PPh & PPN |

### 4.2 Modul Penjualan (Sales)

#### 4.2.1 Sales Cycle
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| SAL-001 | Penawaran harga (Quotation) | Must Have | Generate PDF quotation, approval workflow |
| SAL-002 | Sales Order (SO) | Must Have | Konversi dari quotation, partial delivery support |
| SAL-003 | Faktur Penjualan (Invoice) | Must Have | Auto-numbering, multi-currency, PPN otomatis |
| SAL-004 | Surat Jalan (Delivery Order) | Must Have | Link ke SO, print DO, tracking pengiriman |
| SAL-005 | Retur Penjualan | Must Have | Retur partial/full, auto-update stok & AR |

#### 4.2.2 Piutang (Accounts Receivable)
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| SAL-006 | Aging analysis piutang | Must Have | 0-30, 31-60, 61-90, >90 hari |
| SAL-007 | Penerimaan pembayaran | Must Have | Partial payment, multi-payment method |
| SAL-008 | Pengingat jatuh tempo otomatis | Should Have | Email/WhatsApp reminder 3 hari & 1 hari sebelum jatuh tempo |
| SAL-009 | Diskon pembayaran awal (early payment discount) | Could Have | Auto-calculate diskon jika bayar sebelum tanggal tertentu |

### 4.3 Modul Pembelian (Purchasing)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| PUR-001 | Purchase Requisition (PR) | Should Have | Approval workflow multi-level |
| PUR-002 | Purchase Order (PO) | Must Have | Generate PDF PO, email ke vendor otomatis |
| PUR-003 | Penerimaan barang (GRN) | Must Have | Partial receipt, quality check notes |
| PUR-004 | Faktur Pembelian | Must Have | Match dengan PO & GRN (3-way matching) |
| PUR-005 | Hutang (AP) & pembayaran vendor | Must Have | Aging analysis, partial payment |
| PUR-006 | Retur Pembelian | Must Have | Auto-update stok & AP |

### 4.4 Modul Inventory / Gudang

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| INV-001 | Master data barang (SKU) | Must Have | Kategori, satuan, barcode, gambar, min/max stok |
| INV-002 | Multi-gudang & multi-lokasi | Must Have | Transfer antar-gudang, stok per lokasi real-time |
| INV-003 | Metode penilaian stok | Must Have | FIFO, Average, LIFO (konfigurasi per item) |
| INV-004 | Stok opname (Stock Opname) | Must Have | Mobile-friendly, variance report, auto-adjustment |
| INV-005 | Bill of Materials (BOM) | Should Have | Assembly/disassembly, raw material → finished good |
| INV-006 | Inventory valuation report | Must Have | HPP, nilai stok, stok fisik vs sistem |
| INV-007 | Notifikasi stok minimum | Should Have | Email/in-app notifikasi saat stok ≤ reorder point |

### 4.5 Modul POS (Point of Sale)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| POS-001 | Interface kasir touchscreen-friendly | Must Have | Responsive, shortcut keyboard, barcode scanner support |
| POS-002 | Multi-payment method | Must Have | Tunai, transfer, QRIS, debit/kredit, e-wallet |
| POS-003 | Split bill & split payment | Should Have | Bisa bagi bill & bayar dengan kombinasi metode |
| POS-004 | Diskon & promo (per item/per transaksi) | Must Have | Persentase & nominal, auto-apply promo rules |
| POS-005 | Shift management (buka/tutup kasir) | Must Have | Reconciliation uang fisik vs sistem per shift |
| POS-006 | Print struk & nota | Must Have | Thermal printer support, custom template |
| POS-007 | Offline mode | Should Have | Simpan transaksi lokal, sync saat online |

### 4.6 Modul Laporan & Analitik (200+ Reports)

#### 4.6.1 Laporan Keuangan
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RPT-001 | Laba Rugi (Income Statement) | Must Have | Periode: MTD, YTD, komparasi periode, drill-down |
| RPT-002 | Neraca (Balance Sheet) | Must Have | Format standar PSAK, aset, liabilitas, ekuitas |
| RPT-003 | Arus Kas (Cash Flow) | Must Have | Direct & indirect method |
| RPT-004 | Perubahan Ekuitas | Must Have | Auto-calculate dari laba ditahan & transaksi ekuitas |
| RPT-005 | Buku Besar | Must Have | General ledger dengan detail transaksi |
| RPT-006 | Trial Balance | Must Have | Adjusted & unadjusted |

#### 4.6.2 Laporan Operasional
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RPT-007 | Laporan penjualan per periode/item/pelanggan | Must Have | Filter multi-dimensi, export Excel/PDF |
| RPT-008 | Laporan pembelian per vendor/periode | Must Have | Trend analysis, top vendor |
| RPT-009 | Laporan stok (kartu stok, stok minimum, stok aging) | Must Have | Real-time, multi-gudang |
| RPT-010 | Laporan piutang & hutang aging | Must Have | 30-60-90-120+ hari |
| RPT-011 | Dashboard KPI (widget customizable) | Must Have | Drag-drop widget, real-time update |

#### 4.6.3 Export & Sharing
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| RPT-012 | Export ke Excel, PDF, CSV | Must Have | Format rapi, bisa print |
| RPT-013 | Schedule email laporan otomatis | Should Have | Daily/weekly/monthly, multi-recipient |
| RPT-014 | Custom report builder | Should Have | Drag-drop fields, filter, group by, formula custom |

### 4.7 Modul AI Assistant (AIlita)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AI-001 | Analisis performa keuangan antar-periode | Must Have | Bandingkan pendapatan, biaya, profitabilitas |
| AI-002 | Deteksi anomali transaksi | Should Have | Flag transaksi tidak wajar berdasarkan pattern |
| AI-003 | Rekomendasi optimasi cash flow | Should Have | Saran berdasarkan AR aging & stok |
| AI-004 | Natural language query ("Berapa laba bulan lalu?") | Should Have | Chat interface, understand Bahasa Indonesia |
| AI-005 | Prediksi trend penjualan | Could Have | Forecasting berdasarkan historical data |
| AI-006 | Auto-categorize transaksi bank | Should Have | ML-based classification dari upload bank statement |

### 4.8 Modul Integrasi

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| INT-001 | Integrasi e-payment (QRIS, GoPay, OVO, DANA, LinkAja) | Must Have | Auto-reconcile transaksi masuk |
| INT-002 | Integrasi bank (virtual account, auto-debit) | Should Have | Fetch mutasi rekening, auto-matching |
| INT-003 | Integrasi e-commerce (Tokopedia, Shopee, TikTok Shop) | Should Have | Sync order & stok, auto-generate invoice |
| INT-004 | Integrasi e-Faktur & e-SPT (DJP Online) | Must Have | Generate e-Faktur PPN, export CSV SPT |
| INT-005 | API publik untuk third-party | Should Have | REST API dengan dokumentasi (Swagger/OpenAPI) |
| INT-006 | Webhook untuk event notification | Should Have | Real-time notification ke sistem eksternal |

---

## 5. Non-Functional Requirements

### 5.1 Performance
| Requirement | Target |
|-------------|--------|
| Page load time (dashboard) | < 2 detik |
| Laporan laba rugi (1 tahun data) | < 5 detik |
| Concurrent users | ≥ 1,000 simultan |
| Database query (laporan kompleks) | < 3 detik |
| File upload (Excel/CSV) | Progress bar, < 30 detik untuk 10,000 baris |

### 5.2 Scalability
- Arsitektur microservices untuk modul independen
- Horizontal scaling dengan container orchestration (Kubernetes)
- Database sharding untuk multi-tenant
- CDN untuk asset statis

### 5.3 Security
| Requirement | Detail |
|-------------|--------|
| Authentication | OAuth 2.0 + JWT, MFA (TOTP/SMS) |
| Authorization | RBAC (Role-Based Access Control) |
| Data Encryption | AES-256 at rest, TLS 1.3 in transit |
| Audit Trail | Log semua CRUD operation (who, what, when, old vs new value) |
| Backup | Daily automated backup, point-in-time recovery (PITR) |
| Compliance | Sesuai UU PDP (Perlindungan Data Pribadi), ISO 27001 |
| Penetration Testing | Quarterly oleh pihak ketiga |

### 5.4 Availability
- Uptime SLA: 99.9%
- Maintenance window: < 4 jam/bulan, scheduled
- Disaster Recovery: RPO < 1 jam, RTO < 4 jam
- Multi-region deployment (Jakarta & Singapore)

### 5.5 Usability
- Responsive design: Desktop, tablet, mobile
- Bahasa Indonesia (default) & English
- Onboarding wizard untuk setup awal
- Contextual help & tooltips
- Keyboard shortcuts untuk power users
- Dark mode support

---

## 6. Technical Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Web App │  │ Mobile   │  │  POS App │  │  API     │  │
│  │ (React)  │  │ (PWA)    │  │(Electron)│  │ (Third)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS / WSS
┌────────────────────▼────────────────────────────────────────┐
│                      GATEWAY LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   CDN    │  │   WAF    │  │  Rate    │  │  Load    │  │
│  │(CloudFlr)│  │(AWS WAF) │  │  Limiter │  │ Balancer │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   MICROSERVICES LAYER                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Auth    │ │  Sales   │ │ Purchase │ │ Inventory│     │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │Accounting│ │  Report  │ │   POS    │ │   AI     │     │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │  Notif   │ │  Integr  │ │  Audit   │                  │
│  │ Service  │ │ Service  │ │ Service  │                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Redis   │  │Elasticsearch│  │  S3    │  │
│  │(Primary) │  │ (Cache)  │  │  (Search)  │  │(Files) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ClickHouse│  │ RabbitMQ │  │  ML      │                │
│  │(Analytics)│  │(Queue)  │  │ Pipeline │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS | Komponen reusable, type-safe, styling cepat |
| **State Management** | Zustand + React Query | Lightweight, caching server state |
| **Mobile** | React Native / PWA | Cross-platform, single codebase |
| **POS** | Electron + React | Desktop app dengan web tech |
| **Backend** | Node.js (NestJS) / Go (Gin) | High concurrency, microservices-friendly |
| **Database** | PostgreSQL 15 (primary) | ACID compliance, JSON support, mature |
| **Cache** | Redis | Session, rate limiting, real-time data |
| **Search** | Elasticsearch | Full-text search, aggregation laporan |
| **Analytics** | ClickHouse | OLAP queries cepat untuk laporan besar |
| **Queue** | RabbitMQ / Apache Kafka | Event-driven, async processing |
| **AI/ML** | Python (FastAPI) + TensorFlow/PyTorch | Model training & inference terpisah |
| **File Storage** | AWS S3 / MinIO | Object storage untuk dokumen & backup |
| **Container** | Docker + Kubernetes | Orchestration, auto-scaling |
| **Monitoring** | Prometheus + Grafana | Metrics & alerting |
| **Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) | Centralized logging |
| **CI/CD** | GitHub Actions + ArgoCD | Automated testing & deployment |

### 6.3 Database Schema (Simplified)

#### Core Tables
```sql
-- Companies / Tenants
companies (id, name, npwp, address, phone, email, created_at)

-- Users & Roles
users (id, company_id, email, password_hash, name, role, is_active)
roles (id, name, permissions[])
user_roles (user_id, role_id)

-- Chart of Accounts
coa (id, company_id, code, name, type, parent_id, level, is_active)
-- type: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE

-- Journals
journals (id, company_id, date, reference_no, description, total_debit, total_credit, status)
journal_lines (id, journal_id, coa_id, debit, credit, description)

-- Products
products (id, company_id, sku, name, category_id, unit_id, cost_method, min_stock, max_stock)
product_stocks (id, product_id, warehouse_id, quantity, avg_cost)

-- Sales
sales_orders (id, company_id, customer_id, date, total, status)
sales_order_lines (id, so_id, product_id, qty, price, discount, total)
invoices (id, so_id, invoice_no, date, due_date, total, tax, grand_total, status)
payments (id, invoice_id, date, amount, method, reference)

-- Warehouses
warehouses (id, company_id, name, location, is_active)
stock_movements (id, product_id, warehouse_id, type, qty, reference, date)
-- type: IN, OUT, TRANSFER, ADJUSTMENT

-- Audit Trail
audit_logs (id, user_id, table_name, record_id, action, old_values, new_values, timestamp)
```

---

## 7. User Flow & Wireframes

### 7.1 Onboarding Flow
```
Registrasi → Verifikasi Email → Setup Perusahaan (nama, NPWP, alamat) 
→ Pilih Template COA → Setup Gudang → Setup User & Role 
→ Tutorial Interaktif → Dashboard
```

### 7.2 Sales Transaction Flow
```
Quotation → [Approve] → Sales Order → [Approve] → Picking List 
→ Delivery Order → [Deliver] → Invoice → [Payment] → Receipt
```

### 7.3 Key Wireframes

#### Dashboard Utama
```
┌────────────────────────────────────────────────────────────┐
│ [Logo] Dashboard  Penjualan  Pembelian  Gudang  Laporan  │
│ [Notif] [User]                                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ 💰 Pendapatan │ │ 📉 Pengeluaran│ │ 📊 Laba Bersih│      │
│  │ Rp 150.000.000│ │ Rp 80.000.000 │ │ Rp 70.000.000 │      │
│  │ ▲ 12% vs bln  │ │ ▼ 5% vs bln   │ │ ▲ 8% vs bln   │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ 📈 Grafik Laba/Rugi  │  │ 🔔 Aktivitas Terbaru     │   │
│  │ [Line Chart]         │  │ • Invoice #INV-001       │   │
│  │                      │  │ • Stok minimum: Kopi     │   │
│  │                      │  │ • PO #PO-005 approved    │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 📋 Piutang Jatuh Tempo (30 hari ke depan)          │   │
│  │ [Tabel: Pelanggan | Jumlah | Jatuh Tempo | Status] │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Form Jurnal Umum
```
┌────────────────────────────────────────────────────────────┐
│ Jurnal Umum > Tambah Jurnal                                │
├────────────────────────────────────────────────────────────┤
│ Tanggal: [2026-08-29    ]  No. Ref: [JR-2026-0001]       │
│ Keterangan: [____________________________________]         │
│                                                            │
│ ┌────┬────────────────────┬──────────┬──────────┐       │
│ │ No │ Akun               │ Debit    │ Kredit   │       │
│ ├────┼────────────────────┼──────────┼──────────┤       │
│ │ 1  │ [Kas & Bank    ▼] │ 100.000  │          │       │
│ │ 2  │ [Pendapatan    ▼] │          │ 100.000  │       │
│ ├────┼────────────────────┼──────────┼──────────┤       │
│ │    │ TOTAL              │ 100.000  │ 100.000  │ ✓     │
│ └────┴────────────────────┴──────────┴──────────┘       │
│                                                            │
│ [+ Tambah Baris]                              [Simpan]    │
└────────────────────────────────────────────────────────────┘
```

---

## 8. API Requirements

### 8.1 REST API Endpoints (Core)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/auth/login` | POST | Login & get JWT | Public |
| `/api/v1/auth/refresh` | POST | Refresh token | Bearer |
| `/api/v1/companies` | GET/POST | List/Create company | Bearer |
| `/api/v1/coa` | GET/POST/PUT/DELETE | Chart of Accounts | Bearer |
| `/api/v1/journals` | GET/POST | Jurnal umum | Bearer |
| `/api/v1/invoices` | GET/POST/PUT | Faktur penjualan | Bearer |
| `/api/v1/invoices/{id}/payments` | POST | Pembayaran invoice | Bearer |
| `/api/v1/products` | GET/POST/PUT/DELETE | Master barang | Bearer |
| `/api/v1/stock-movements` | GET/POST | Mutasi stok | Bearer |
| `/api/v1/reports/profit-loss` | GET | Laporan laba rugi | Bearer |
| `/api/v1/reports/balance-sheet` | GET | Laporan neraca | Bearer |
| `/api/v1/ai/analyze` | POST | AI analysis request | Bearer |
| `/api/v1/webhooks` | POST/GET | Webhook management | Bearer + API Key |

### 8.2 API Standards
- **Format:** JSON (RFC 8259)
- **Versioning:** URL path (`/api/v1/`)
- **Pagination:** Cursor-based untuk performa
- **Rate Limiting:** 100 req/min untuk tier dasar, 1000 req/min untuk enterprise
- **Error Format:** RFC 7807 (Problem Details)

---

## 9. Security & Compliance

### 9.1 Data Protection (UU PDP)
- Enkripsi data sensitif (NPWP, rekening bank) di database
- Consent management untuk data pelanggan
- Data retention policy: 7 tahun untuk data keuangan
- Right to erasure (hapus data pribadi) dalam 30 hari

### 9.2 Financial Compliance
- Format laporan sesuai PSAK (Pernyataan Standar Akuntansi Keuangan)
- Integrasi e-Faktur sesuai PMK-9/2018
- Export SPT PPh & PPN dalam format DJP
- Audit trail immutable (tidak bisa dihapus/diedit)

---

## 10. Pricing Model

### 10.1 Subscription Tiers

| Fitur | Starter (Rp 199K/bulan) | Business (Rp 399K/bulan) | Enterprise (Custom) |
|-------|------------------------|--------------------------|---------------------|
| **User** | 1 user | 3 users | Unlimited |
| **Cabang** | 1 cabang | 3 cabang | Unlimited |
| **COA** | 100 akun | Unlimited | Unlimited |
| **Transaksi/bulan** | 500 | Unlimited | Unlimited |
| **Laporan** | 50+ | 200+ | 200+ + Custom |
| **POS** | ❌ | ✅ | ✅ |
| **Multi-gudang** | ❌ | ✅ | ✅ |
| **Integrasi e-payment** | ❌ | ✅ | ✅ |
| **Integrasi e-commerce** | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **AI Assistant** | ❌ | ✅ | ✅ + Custom Model |
| **Support** | Email | Email + Chat | Dedicated CSM |
| **SLA Uptime** | 99.5% | 99.9% | 99.99% |

### 10.2 Add-ons
| Add-on | Harga |
|--------|-------|
| Tambahan user | Rp 25.000/user/bulan |
| Tambahan cabang | Rp 99.900/cabang/bulan |
| Additional storage | Rp 50.000/100GB/bulan |
| Custom report | Rp 500.000/report (one-time) |
| Dedicated training | Rp 2.000.000/session |

### 10.3 Promo Strategy
- **Free Trial:** 14 hari full access (no credit card)
- **Annual Discount:** Hemat 20% untuk pembayaran tahunan
- **Referral:** 1 bulan gratis per referral yang berlangganan

---

## 11. Success Metrics & KPIs

### 11.1 Business Metrics
| Metric | Target Q1 | Target Q2 | Target Q3 | Target Q4 |
|--------|-----------|-----------|-----------|-----------|
| Registered Users | 2,000 | 5,000 | 8,000 | 12,000 |
| Paying Customers | 200 | 600 | 1,200 | 2,500 |
| MRR (Monthly Recurring Revenue) | Rp 40M | Rp 120M | Rp 240M | Rp 500M |
| Churn Rate | < 10% | < 8% | < 6% | < 5% |
| LTV:CAC Ratio | > 2:1 | > 2.5:1 | > 3:1 | > 3:1 |

### 11.2 Product Metrics
| Metric | Target |
|--------|--------|
| Feature Adoption Rate | > 70% pengguna aktif menggunakan > 5 fitur |
| Support Ticket Volume | < 5% dari total transaksi |
| NPS Score | > 50 |
| Time to First Value | < 30 menit (setup → transaksi pertama) |
| Daily Active Users / MAU | > 40% |

### 11.3 Technical Metrics
| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 500ms |
| Error Rate | < 0.1% |
| Uptime | > 99.9% |
| Deployment Frequency | > 2x/week |
| Mean Time to Recovery (MTTR) | < 1 jam |

---

## 12. Timeline & Milestones

### 12.1 Development Phases

| Phase | Durasi | Deliverables | Target Date |
|-------|--------|--------------|-------------|
| **Phase 1: MVP** | 3 bulan | Auth, COA, Jurnal, Laba Rugi, Neraca, Dasar | Nov 2026 |
| **Phase 2: Sales & Purchase** | 2 bulan | Quotation, SO, PO, Invoice, AR/AP | Jan 2027 |
| **Phase 3: Inventory & POS** | 2 bulan | Multi-gudang, stok opname, POS | Mar 2027 |
| **Phase 4: Reports & Integrasi** | 2 bulan | 200+ laporan, e-Faktur, e-payment | May 2027 |
| **Phase 5: AI & Advanced** | 2 bulan | AI Assistant, API, custom report | Jul 2027 |
| **Phase 6: Scale & Optimize** | Ongoing | Performance tuning, new features | Q3 2027+ |

### 12.2 Sprint Breakdown (Phase 1 - MVP)

| Sprint | Focus | Stories |
|--------|-------|---------|
| Sprint 1-2 | Foundation | Auth, user management, company setup, RBAC |
| Sprint 3-4 | COA & Jurnal | COA management, jurnal entry, balance validation |
| Sprint 5-6 | Reporting | Laba rugi, neraca, trial balance, dashboard |
| Sprint 7-8 | Polish | Onboarding, responsive, testing, bug fix |

---

## 13. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Kompetitor besar (Accurate, Jurnal, Mekari) merespons dengan price war** | Medium | High | Differentiasi via AI & UX, fokus niche UMKM F&B/retail |
| **Regulasi perpajakan berubah** | Medium | High | Tim compliance dedicated, update otomatis via rules engine |
| **Data breach / kebocoran data keuangan** | Low | Critical | Security by design, penetration testing, bug bounty |
| **Adopsi lambat karena kompleksitas akuntansi** | High | Medium | Onboarding interaktif, template bisnis per industri, video tutorial |
| **Technical debt di microservices** | Medium | Medium | Code review wajib, unit test coverage > 80%, architecture review |
| **Vendor lock-in (cloud provider)** | Low | Medium | Multi-cloud strategy, container-based, avoid proprietary services |

---

## 14. Appendix

### 14.1 Glossary
| Term | Definition |
|------|------------|
| **COA** | Chart of Accounts - Daftar akun perkiraan |
| **AR/AP** | Accounts Receivable / Accounts Payable - Piutang / Hutang |
| **BOM** | Bill of Materials - Daftar bahan baku untuk produksi |
| **GRN** | Goods Receipt Note - Penerimaan barang |
| **HPP** | Harga Pokok Penjualan - Cost of Goods Sold (COGS) |
| **PSAK** | Pernyataan Standar Akuntansi Keuangan Indonesia |
| **RBAC** | Role-Based Access Control |
| **SLA** | Service Level Agreement |

### 14.2 Reference & Inspirasi
- Accurate Online (accurate.id)
- Jurnal.id
- Mekari (mekari.com)
- QuickBooks Online
- Xero

### 14.3 Document Control
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 29 Aug 2026 | Product Team | Initial PRD draft |

---

**End of Document**
